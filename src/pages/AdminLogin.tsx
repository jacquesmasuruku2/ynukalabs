import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStrapiAuth } from "@/hooks/useStrapiAuth";

const AdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn } = useStrapiAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(t("admin.loginError"));
    } else {
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">{t("admin.loginTitle")}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t("admin.loginSubtitle")}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-3 mb-4 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder={t("admin.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-secondary border-secondary"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder={t("admin.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-secondary border-secondary"
              required
            />
          </div>
          <Button type="submit" variant="glow" className="w-full" disabled={loading}>
            {loading ? t("admin.loggingIn") : t("admin.login")}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
