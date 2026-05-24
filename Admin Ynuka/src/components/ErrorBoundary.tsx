import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error | null;
};

// ErrorBoundary captures rendering errors and logs the component stack.
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log full details to the console including component stack for debugging
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:\n", errorInfo.componentStack);
    // You could also send this to a remote error tracking service here.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h1>Une erreur est survenue dans l'interface d'administration.</h1>
          <p>La console contient la pile d'exécution du composant pour le debug.</p>
          <details style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>
            <summary>Afficher l'erreur</summary>
            {this.state.error?.toString()}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
