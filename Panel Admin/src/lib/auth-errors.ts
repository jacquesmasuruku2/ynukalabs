// Helper function to translate Supabase auth errors to French
export function translateAuthError(error: any): string {
  if (!error) return "Erreur inconnue";

  const message = error?.message || String(error);

  // Translate common Supabase auth errors - short and direct messages
  const translations: Record<string, string> = {
    "Invalid login credentials": "Identifiants incorrects",
    "Invalid email": "Email invalide",
    "Password should be at least 6 characters": "Le mot de passe doit faire au moins 6 caractères",
    "Email not confirmed": "Email non confirmé",
    "User already registered": "Cet utilisateur existe déjà",
    "Unable to validate email address": "Email invalide",
    "For security purposes, you can only request this after": "Trop de tentatives, réessayez plus tard",
    "Email rate limit exceeded": "Trop de demandes, réessayez dans quelques minutes",
    "Invalid token": "Lien invalide ou expiré",
    "Token has expired": "Votre session a expiré",
    "AuthApiError": "Erreur d'authentification",
    "Something went wrong": "Une erreur s'est produite",
    "Network error": "Erreur de connexion réseau",
  };

  // Check for direct matches
  for (const [en, fr] of Object.entries(translations)) {
    if (message.includes(en)) {
      return fr;
    }
  }

  // If no translation found, return a generic error message
  return "Erreur d'authentification";
}
