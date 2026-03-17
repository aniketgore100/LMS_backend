const fs = require('fs');
const transporter = require('../config/mail');
const env = require('../config/env');

const sendMail = async ({ to, subject, html, attachments = [] }) => {
  return transporter.sendMail({
    from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
    to,
    subject,
    html,
    attachments,
  });
};

const sendReceiptEmail = async (member, payment, receiptPath) => {
  const attachments = [];
  if (receiptPath && fs.existsSync(receiptPath.replace(/^\//, ''))) {
    attachments.push({ filename: 'receipt.pdf', path: receiptPath.replace(/^\//, '') });
  }

  return sendMail({
    to: member.email,
    subject: `Payment Receipt - ${payment.month}`,
    html: `
      <h2>Payment Confirmed</h2>
      <p>Dear ${member.name},</p>
      <p>Your payment of <strong>₹${payment.amount}</strong> for <strong>${payment.month}</strong> has been received.</p>
      <p>Please find your receipt attached.</p>
      <br><p>Thank you!</p>
    `,
    attachments,
  });
};

const sendPaymentReminder = async (member) => {
  return sendMail({
    to: member.email,
    subject: 'Payment Reminder - Due Soon',
    html: `
      <h2>Payment Reminder</h2>
      <p>Dear ${member.name},</p>
      <p>Your next payment of <strong>₹${member.monthlyFee}</strong> is due on <strong>${new Date(member.nextPaymentDate).toLocaleDateString()}</strong>.</p>
      <p>Please make your payment on time to avoid any disruption.</p>
      <br><p>Thank you!</p>
    `,
  });
};

module.exports = { sendMail, sendReceiptEmail, sendPaymentReminder };
