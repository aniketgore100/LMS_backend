const transporter = require('../config/mail');
const env = require('../config/env');
const logger = require('./logger');

const sendPaymentReceiptEmail = async ({ to, memberName, month, amount, receiptPath }) => {
  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject: `Payment Receipt - ${month}`,
      html: `
        <h2>Payment Receipt</h2>
        <p>Dear ${memberName},</p>
        <p>Your payment of <strong>₹${amount}</strong> for <strong>${month}</strong> has been received.</p>
        <p>Please find your receipt attached.</p>
        <br/>
        <p>Library Management System</p>
      `,
      attachments: receiptPath
        ? [{ filename: `receipt_${month}.pdf`, path: receiptPath }]
        : [],
    });
    logger.info(`Receipt email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send receipt email: ${err.message}`);
  }
};

const sendPaymentReminderEmail = async ({ to, memberName, nextPaymentDate }) => {
  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject: 'Payment Reminder - LMS',
      html: `
        <h2>Payment Reminder</h2>
        <p>Dear ${memberName},</p>
        <p>Your payment is due on <strong>${new Date(nextPaymentDate).toDateString()}</strong>.</p>
        <p>Please make your payment to avoid interruption.</p>
        <br/>
        <p>Library Management System</p>
      `,
    });
    logger.info(`Reminder email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send reminder email: ${err.message}`);
  }
};

module.exports = { sendPaymentReceiptEmail, sendPaymentReminderEmail };
