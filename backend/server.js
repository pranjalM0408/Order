const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const mongoose = require('mongoose');
const Order = require('./models/Order');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const invoiceDir = path.join(__dirname, 'invoices');
if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir);
}

app.use('invoices', express.static(invoiceDir));

console.log('Connecting to MongoDB...');

mongoose.connect('mongodb://localhost:27017/orders', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
    });

    app.get('/', (req, res) => {
        res.send('Server is running');
    });

app.post('/api/order', async (req, res) => {
    console.log('Received request to /api/order endpoint');
    const { userId, customerId, field, orderId, price } = req.body;
    const numericPrice = parseFloat(price);

    try{
        const newOrder = new Order({ userId, customerId, field, orderId, price });
        await newOrder.save();
        console.log('Order saved to MongoDB:', newOrder);

        const doc = new PDFDocument();
        const fileName = `invoice_${orderId}.pdf`;
        const outputPath = path.join(invoiceDir, fileName);

        console.log('Saving invoice to:', outputPath);

        doc.pipe(fs.createWriteStream(outputPath));

        doc.fontSize(20).text('Invoice', { align: 'center'});
        doc.fontSize(12).text(`Order ID: ${orderId}`);
        doc.text(`Customer ID: ${customerId}`);
        doc.text(`Order Date: ${newOrder.orderDate.toLocaleDateString()}`);
        doc.text(`Field: ${field}`);
        doc.text(`Price: ₹${numericPrice.toFixed(2)}`);
        doc.fontSize(10).text('\n Thank You for your Order!', { align: 'center'});

        doc.end();
        console.log('Invoice PDF generated:', outputPath);

        res.json({ message: 'Order placed and invoice generated', invoice: fileName});
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});