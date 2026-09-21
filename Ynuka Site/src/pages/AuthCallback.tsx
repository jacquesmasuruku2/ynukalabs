import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/lib/auth";

/**
 * AuthCallback Page
 * 
 * Cette page gère le retour de Google OAuth après redirection.
 * Google redirige ici avec un code d'autorisation dans l'URL.
 * 
 * Flow:
 * 1. Google redirige vers /auth/callback avec code
 * 2. Cette page extrait le code et les informations utilisateur
 * 3. Stocke l'utilisateur dans localStorage via authService
 * 4. Redirige vers la page d'origine ou la page blog
 */

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const credential = searchParams.get("credential");
        const error = searchParams.get("error");

        // Gérer les erreurs Google
        if (error) {
          console.error("Google OAuth error:", error);
          setErrorMessage(error);
          setStatus("error");
          setTimeout(() => navigate("/blog"), 3000);
          return;
        }

        if (!credential) {
          console.error("No credential in callback");
          setErrorMessage("Google credential missing");
          setStatus("error");
          setTimeout(() => navigate("/blog"), 3000);
          return;
        }

        // Décoder le JWT credential pour obtenir les infos utilisateur
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const userData = JSON.parse(jsonPayload);
        
        const userInfo = {
          email: userData.email,
          name: userData.name,
          avatar: userData.picture,
        };

        // Stocker l'utilisateur via authService
        authService.signIn(userInfo);
        
        setStatus("success");
        
        // Rediriger vers la page d'origine ou la page blog
        const returnUrl = sessionStorage.getItem("auth_return_url") || "/blog";
        sessionStorage.removeItem("auth_return_url");
        
        setTimeout(() => navigate(returnUrl), 1000);
        
      } catch (error) {
        console.error("Error handling Google callback:", error);
        setErrorMessage("Authentication failed");
        setStatus("error");
        setTimeout(() => navigate("/blog"), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <h2 className="text-xl font-semibold">Authentication in progress...</h2>
            <p className="text-muted-foreground">Please wait while we sign you in.</p>
          </div>
        )}
        
        {status === "success" && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600">Authentication successful!</h2>
            <p className="text-muted-foreground">Redirecting you back...</p>
          </div>
        )}
        
        {status === "error" && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600">Authentication failed</h2>
            <p className="text-muted-foreground">{errorMessage || "An error occurred during authentication"}</p>
            <p className="text-sm text-muted-foreground">Redirecting to blog...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
