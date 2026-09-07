const FESTIVAL_WHATSAPP_NUMBER = "237655551150";

/**
 * Builds a wa.me deep link that opens a WhatsApp conversation with the
 * festival's number, pre-filled with the given message.
 */
export const buildWhatsAppUrl = (message: string): string => {
  return `https://wa.me/${FESTIVAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
