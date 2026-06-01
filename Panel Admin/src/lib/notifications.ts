import { createActivity, type CreateActivityData } from "./activities";

export type NotificationType = "login" | "register" | "message" | "notification" | "alert";

export interface NotificationData {
  type: NotificationType;
  user: string;
  message: string;
  timestamp?: Date;
  details?: string;
  metadata?: Record<string, any>;
}

/**
 * Envoie une notification globale qui apparaîtra dans la cloche de notification
 * et l'enregistre dans la base de données
 */
export async function sendNotification(data: NotificationData) {
  try {
    console.log("Envoi de notification:", data);
    const result = await createActivity({
      type: data.type,
      user: data.user,
      message: data.message,
      details: data.details,
      metadata: data.metadata,
    });
    console.log("Notification envoyée avec succès:", result);
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
  }
}

/**
 * Notifications prédéfinies pour les actions courantes
 */
export const notifications = {
  login: (user: string) => {
    sendNotification({
      type: "login",
      user,
      message: "Nouvelle connexion détectée",
    });
  },

  register: (user: string) => {
    sendNotification({
      type: "register",
      user,
      message: "Nouvel utilisateur enregistré",
    });
  },

  message: (user: string, message?: string) => {
    sendNotification({
      type: "message",
      user,
      message: message || "Nouveau message reçu",
    });
  },

  alert: (message: string) => {
    sendNotification({
      type: "alert",
      user: "system",
      message,
    });
  },

  notification: (message: string) => {
    sendNotification({
      type: "notification",
      user: "system",
      message,
    });
  },

  // Nouvelles notifications pour les ressources spécifiques
  newsletter: (email: string) => {
    sendNotification({
      type: "notification",
      user: email,
      message: "Nouvel abonné à la newsletter",
      details: `L'adresse ${email} s'est abonnée à la newsletter`,
      metadata: { email, type: "newsletter" },
    });
  },

  contactMessage: (name: string, subject: string) => {
    sendNotification({
      type: "message",
      user: name,
      message: `Nouveau message de contact: ${subject}`,
      details: `Un nouveau message a été reçu de ${name}`,
      metadata: { name, subject, type: "contact" },
    });
  },

  blogComment: (author: string) => {
    sendNotification({
      type: "message",
      user: author,
      message: "Nouveau commentaire sur le blog",
      details: `${author} a laissé un commentaire sur un article`,
      metadata: { author, type: "blog_comment" },
    });
  },

  donation: (donor: string, amount: string) => {
    sendNotification({
      type: "notification",
      user: donor,
      message: `Nouveau don de ${amount}`,
      details: `Un nouveau don a été reçu de ${donor}`,
      metadata: { donor, amount, type: "donation" },
    });
  },

  eventRegistration: (name: string) => {
    sendNotification({
      type: "notification",
      user: name,
      message: "Nouvelle inscription à un événement",
      details: `${name} s'est inscrit à un événement`,
      metadata: { name, type: "event_registration" },
    });
  },
};
