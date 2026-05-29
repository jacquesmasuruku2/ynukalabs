// Helper function to translate Supabase auth errors to French
export function translateAuthError(error: any): string {
  if (!error) return "Erreur inconnue";

  const message = error?.message || String(error);

  // Translate common Supabase auth errors - short and direct messages
  const translations: Record<string, string> = {
    "Invalid login credentials": "Identifiants incorrects",
    "Invalid credentials": "Identifiants incorrects",
    "L'inscription directe n'est pas activée": "L'inscription en ligne n'est pas disponible. Contactez un administrateur pour obtenir un compte.",
    "Request failed to all API endpoints": "Impossible de joindre l'API. Vérifiez que api.php est accessible (ex. /api/api.php).",
    "Invalid email": "Email invalide",
    "Password should be at least 6 characters": "Le mot de passe doit faire au moins 6 caractères",
    "Email not confirmed": "Email non confirmé",
    "User already registered": "Cet utilisateur existe déjà",
    "Registration is closed": "Inscription fermée. Demandez à un admin de vous ajouter à la liste autorisée, ou connectez-vous avec Google.",
    "Password must be at least 6 characters": "Le mot de passe doit faire au moins 6 caractères",
    "Unable to validate email address": "Email invalide",
    "For security purposes, you can only request this after": "Trop de tentatives, réessayez plus tard",
    "Email rate limit exceeded": "Trop de demandes, réessayez dans quelques minutes",
    "Invalid token": "Lien invalide ou expiré",
    "Token has expired": "Votre session a expiré",
    "AuthApiError": "Erreur d'authentification",
    "Something went wrong": "Une erreur s'est produite",
    "Network error": "Erreur de connexion réseau",
    "Google OAuth not configured on the server":
      "Connexion Google non configurée sur le serveur (GOOGLE_CLIENT_ID / SECRET dans api.php).",
  };

  // Check for direct matches
  for (const [en, fr] of Object.entries(translations)) {
    if (message.includes(en)) {
      return fr;
    }
  }

  // Message API ou réseau déjà explicite
  if (
    message.includes("Impossible de joindre") ||
    message.includes("Erreur réseau") ||
    message.includes("inscription") ||
    /[àâäéèêëïîôùûüç]/i.test(message)
  ) {
    return message;
  }

  return "Erreur d'authentification";
}

const googleOAuthErrors: Record<string, string> = {
  missing_code: "Connexion Google annulée.",
  access_denied: "Connexion Google refusée.",
  not_authorized:
    "Ce compte Google n'est pas autorisé. Demandez à un admin de vous ajouter (table admin_allowed_emails) ou activez GOOGLE_OPEN_ACCESS sur le serveur.",
  invalid_profile: "Profil Google invalide ou email non vérifié.",
  token_exchange_failed:
    "Échec OAuth Google : vérifiez Client ID, Secret et l'URI de redirection dans Google Cloud.",
  no_access_token: "Google n'a pas renvoyé de jeton d'accès.",
  invalid_state: "Session expirée. Cliquez à nouveau sur le bouton Google.",
  invalid_token: "Jeton de session invalide après connexion Google.",
};

export function translateGoogleOAuthError(code: string): string {
  const key = code.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return googleOAuthErrors[key] ?? `Erreur Google (${code})`;
}
