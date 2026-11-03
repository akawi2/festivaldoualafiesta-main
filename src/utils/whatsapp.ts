const FESTIVAL_WHATSAPP_NUMBER = "237655551150";

/**
 * Builds a wa.me deep link that opens a WhatsApp conversation with the
 * festival's number, pre-filled with the given message.
 */
export const buildWhatsAppUrl = (message: string): string => {
  return `https://wa.me/${FESTIVAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

/**
 * Redirige une seule fois vers WhatsApp après une inscription réussie.
 * Navigation directe (et non window.open, bloqué par les navigateurs hors geste
 * utilisateur) ; le délai laisse le temps de lire la confirmation / de finir
 * un téléchargement en cours.
 */
export const redirectToWhatsApp = (url: string, delayMs = 2000): void => {
  setTimeout(() => window.location.assign(url), delayMs);
};
