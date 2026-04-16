const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(process.env.RAZORPAY_ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a secret text using AES-256-CBC.
 * @param {string} text - The text to encrypt.
 * @returns {string} - The encrypted string in format "iv:encryptedData".
 */
function encryptSecret(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a secret text that was encrypted using encryptSecret.
 * @param {string} encryptedText - The encrypted string in format "iv:encryptedData".
 * @returns {string} - The original decrypted text.
 */
function decryptSecret(encryptedText) {
    if (!encryptedText) return null;
    const [ivHex, encryptedDataHex] = encryptedText.split(':');
    if (!ivHex || !encryptedDataHex) {
        throw new Error('Invalid encrypted text format');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedData = Buffer.from(encryptedDataHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encryptSecret,
    decryptSecret
};
