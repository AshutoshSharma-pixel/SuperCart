module.exports = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err);

    // Never leak stack traces in production
    if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }

    return res.status(500).json({
        error: err.message,
        stack: err.stack
    });
};
