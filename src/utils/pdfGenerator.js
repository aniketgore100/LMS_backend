const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const generateReceipt = (payment, member) => {
  return new Promise((resolve, reject) => {
    const dir = path.resolve(env.receiptsDir);
    ensureDir(dir);

    const filename = `receipt_${payment._id}.pdf`;
    const filePath = path.join(dir, filename);
    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('Library Management System', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Payment Receipt', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Details
    const addRow = (label, value) => {
      doc.fontSize(11).font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(value);
    };

    addRow('Receipt ID', payment._id.toString());
    addRow('Member Name', member.name);
    addRow('Contact', member.contactNumber);
    addRow('Month', payment.month);
    addRow('Amount Paid', `₹${payment.amount}`);
    addRow('Payment Date', new Date(payment.paidAt).toDateString());
    addRow('Status', payment.status.toUpperCase());

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text('Thank you for your payment!', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve({ filePath, filename }));
    stream.on('error', reject);
  });
};

module.exports = { generateReceipt };
