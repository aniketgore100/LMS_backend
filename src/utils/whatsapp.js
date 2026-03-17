const logger = require('./logger');

/**
 * Placeholder WhatsApp notification service.
 * Replace implementation with actual WhatsApp Business API integration.
 */
const sendWhatsAppMessage = async ({ phone, message }) => {
  // TODO: Integrate with WhatsApp Business API (e.g., Twilio, Meta Cloud API)
  logger.info(`[WhatsApp Placeholder] To: ${phone} | Message: ${message}`);
  return { delivered: false, message: 'WhatsApp integration pending' };
};

const sendPaymentReminderWhatsApp = async (member) => {
  return sendWhatsAppMessage({
    phone: member.contactNumber,
    message: `Hello ${member.name}, your library payment is due on ${new Date(member.nextPaymentDate).toDateString()}. Please pay to continue.`,
  });
};

module.exports = { sendWhatsAppMessage, sendPaymentReminderWhatsApp };
