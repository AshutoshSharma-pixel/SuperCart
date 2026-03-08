/**
 * Calculate the effective price of a product after discount.
 * Returns both original and final price for display.
 */
function calculateDiscountedPrice(product) {
    const original = product.price;
    const now = new Date();

    const isActive =
        product.isDiscountActive &&
        product.discountType &&
        product.discountValue &&
        (product.discountExpiresAt === null || new Date(product.discountExpiresAt) > now);

    if (!isActive) {
        return {
            originalPrice: original,
            finalPrice: original,
            discountApplied: false,
            discountType: null,
            discountValue: null,
            savings: 0
        };
    }

    let finalPrice;
    if (product.discountType === 'PERCENTAGE') {
        finalPrice = original - (original * product.discountValue / 100);
    } else if (product.discountType === 'FLAT') {
        finalPrice = original - product.discountValue;
    }

    // Never let price go below 0
    finalPrice = Math.max(0, finalPrice);
    // Round to 2 decimal places
    finalPrice = Math.round(finalPrice * 100) / 100;

    return {
        originalPrice: original,
        finalPrice,
        discountApplied: true,
        discountType: product.discountType,
        discountValue: product.discountValue,
        savings: Math.round((original - finalPrice) * 100) / 100
    };
}

module.exports = { calculateDiscountedPrice };
