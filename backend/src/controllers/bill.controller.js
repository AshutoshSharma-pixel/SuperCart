const PDFDocument = require('pdfkit');
const { Session, Product, CartItem, Store } = require('../models');

exports.generateBill = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Fetch session with all details
        const session = await Session.findByPk(sessionId, {
            include: [
                {
                    model: Product,
                    through: { attributes: ['quantity', 'priceSnapshot'] }
                },
                { model: Store }
            ]
        });

        if (!session || session.status !== 'PAID') {
            return res.status(400).json({ error: 'Invalid session or payment not completed' });
        }

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bill_${sessionId}.pdf`);

        // Pipe PDF to response
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('SUPERCART', { align: 'center' });
        doc.fontSize(12).text(session.store?.name || 'SuperMart', { align: 'center' });
        doc.fontSize(10).text(session.store?.location || '', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Bill #: ${sessionId}`, { align: 'left' });
        doc.text(`Date: ${new Date(session.updatedAt).toLocaleString()}`, { align: 'left' });
        doc.moveDown();

        // Line separator
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Table header
        doc.fontSize(10).text('Item', 50, doc.y, { continued: true, width: 250 });
        doc.text('Qty', 300, doc.y, { continued: true, width: 50, align: 'center' });
        doc.text('Price', 350, doc.y, { continued: true, width: 80, align: 'right' });
        doc.text('Total', 430, doc.y, { width: 100, align: 'right' });
        doc.moveDown();

        // Line separator
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Items
        let yPosition = doc.y;
        session.products.forEach((product) => {
            const qty = product.cart_item.quantity;
            const price = product.cart_item.priceSnapshot;
            const total = qty * price;

            doc.fontSize(9).text(product.name, 50, yPosition, { width: 250 });
            doc.text(qty.toString(), 300, yPosition, { width: 50, align: 'center' });
            doc.text(`₹${price.toFixed(2)}`, 350, yPosition, { width: 80, align: 'right' });
            doc.text(`₹${total.toFixed(2)}`, 430, yPosition, { width: 100, align: 'right' });

            yPosition += 20;
            doc.y = yPosition;
        });

        doc.moveDown();

        // Line separator
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Total
        doc.fontSize(12).text('TOTAL:', 350, doc.y, { continued: true, width: 80, align: 'right' });
        doc.fontSize(14).text(`₹${session.totalAmount.toFixed(2)}`, 430, doc.y, { width: 100, align: 'right' });
        doc.moveDown(2);

        // Payment status
        doc.fontSize(10).text('Payment Status: PAID', { align: 'center' });
        doc.fontSize(8).text(`Exit Token: ${session.exitToken}`, { align: 'center' });
        doc.moveDown();

        // Footer
        doc.fontSize(8).text('Thank you for shopping with SuperCart!', { align: 'center' });
        doc.text('Please show this bill or QR code to security at exit.', { align: 'center' });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Generate Bill Error:', error);
        res.status(500).json({ error: 'Failed to generate bill' });
    }
};
