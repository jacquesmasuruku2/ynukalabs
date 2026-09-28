import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link2, Share2, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface MotivationFormData {
  email: string;
  linkedin_url?: string;
  twitter_url?: string;
  portfolio_url?: string;
  message?: string;
  cv_file?: File;
}

interface FormErrors {
  email?: string;
  linkedin_url?: string;
  twitter_url?: string;
  portfolio_url?: string;
  message?: string;
  cv_file?: string;
}

interface MotivationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MotivationFormData) => Promise<void>;
  userEmail: string;
  userName: string;
  isSubmitting?: boolean;
}

const MotivationFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  userEmail,
  userName,
  isSubmitting = false,
}: MotivationFormModalProps) => {
  const { t, i18n } = useTranslation();
  const isFr = i18n.language === "fr";
  const { toast } = useToast();

  const [formData, setFormData] = useState<MotivationFormData>({
    email: userEmail,
    linkedin_url: "",
    twitter_url: "",
    portfolio_url: "",
    message: "",
    cv_file: undefined,
  });

  const [errors, setErrors] = useState<Partial<FormErrors>>({});
  const [fileName, setFileName] = useState<string>("");

  const validateUrl = (url: string, type: string): boolean => {
    if (!url) return true; // Optional field
    try {
      const urlObj = new URL(url);
      if (type === "linkedin" && !urlObj.hostname.includes("linkedin")) {
        return false;
      }
      if (type === "twitter" && !urlObj.hostname.includes("twitter") && !urlObj.hostname.includes("x.com")) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof MotivationFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate PDF file
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({
          ...prev,
          cv_file: isFr ? "Seuls les fichiers PDF sont acceptés" : "Only PDF files are accepted",
        }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          cv_file: isFr ? "La taille du fichier ne doit pas dépasser 5 MB" : "File size must not exceed 5 MB",
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        cv_file: file,
      }));
      setFileName(file.name);
      // Clear error
      if (errors.cv_file) {
        setErrors((prev) => ({
          ...prev,
          cv_file: undefined,
        }));
      }
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      cv_file: undefined,
    }));
    setFileName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Partial<FormErrors> = {};

    if (!formData.email) {
      newErrors.email = isFr ? "L'email est requis" : "Email is required";
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = isFr ? "Format d'email invalide" : "Invalid email format";
    }

    if (formData.linkedin_url && !validateUrl(formData.linkedin_url, "linkedin")) {
      newErrors.linkedin_url = isFr ? "URL LinkedIn invalide" : "Invalid LinkedIn URL";
    }

    if (formData.twitter_url && !validateUrl(formData.twitter_url, "twitter")) {
      newErrors.twitter_url = isFr ? "URL X invalide" : "Invalid X URL";
    }

    if (formData.portfolio_url) {
      try {
        new URL(formData.portfolio_url);
      } catch {
        newErrors.portfolio_url = isFr ? "URL portfolio invalide" : "Invalid portfolio URL";
      }
    }

    // CV is optional, no validation required

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        email: userEmail,
        linkedin_url: "",
        twitter_url: "",
        portfolio_url: "",
        message: "",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isFr ? "Erreur" : "Error",
        description: error.message || (isFr ? "Une erreur est survenue" : "An error occurred"),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold mb-2">
            {isFr ? "Complétez votre profil" : "Complete your profile"}
          </h2>
          <p className="text-muted-foreground">
            {isFr 
              ? "Aidez-nous à mieux vous connaître en complétant vos informations." 
              : "Help us know you better by completing your information."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User name (display only) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {isFr ? "Nom" : "Name"}
            </label>
            <div className="px-4 py-3 bg-muted rounded-lg text-foreground font-medium">
              {userName}
            </div>
          </div>

          {/* Email (display only) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {isFr ? "Email" : "Email"}
            </label>
            <div className="px-4 py-3 bg-muted rounded-lg text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {userEmail}
            </div>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label htmlFor="linkedin_url" className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              {isFr ? "Profil LinkedIn" : "LinkedIn Profile"} ({isFr ? "optionnel" : "optional"})
            </label>
            <Input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              placeholder="https://linkedin.com/in/your-profile"
              value={formData.linkedin_url}
              onChange={handleChange}
              className={errors.linkedin_url ? "border-red-500" : ""}
            />
            {errors.linkedin_url && (
              <p className="text-red-500 text-sm mt-1">{errors.linkedin_url}</p>
            )}
          </div>

          {/* X (Twitter) URL */}
          <div>
            <label htmlFor="twitter_url" className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              {isFr ? "Profil X" : "X Profile"} ({isFr ? "optionnel" : "optional"})
            </label>
            <Input
              id="twitter_url"
              name="twitter_url"
              type="url"
              placeholder="https://x.com/your-profile"
              value={formData.twitter_url}
              onChange={handleChange}
              className={errors.twitter_url ? "border-red-500" : ""}
            />
            {errors.twitter_url && (
              <p className="text-red-500 text-sm mt-1">{errors.twitter_url}</p>
            )}
          </div>

          {/* Portfolio URL */}
          <div>
            <label htmlFor="portfolio_url" className="block text-sm font-medium mb-2 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              {isFr ? "Lien portfolio" : "Portfolio Link"} ({isFr ? "optionnel" : "optional"})
            </label>
            <Input
              id="portfolio_url"
              name="portfolio_url"
              type="url"
              placeholder="https://your-portfolio.com"
              value={formData.portfolio_url}
              onChange={handleChange}
              className={errors.portfolio_url ? "border-red-500" : ""}
            />
            {errors.portfolio_url && (
              <p className="text-red-500 text-sm mt-1">{errors.portfolio_url}</p>
            )}
          </div>

          {/* CV Upload */}
          <div>
            <label htmlFor="cv_file" className="block text-sm font-medium mb-2">
              {isFr ? "Télécharger votre CV" : "Upload your CV"} ({isFr ? "optionnel, PDF uniquement" : "optional, PDF only"})
            </label>
            {fileName ? (
              <div className="flex items-center justify-between px-4 py-3 bg-muted border border-border rounded-lg">
                <span className="text-sm text-foreground flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  {fileName}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  {isFr ? "Supprimer" : "Remove"}
                </button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  id="cv_file"
                  name="cv_file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className={`cursor-pointer ${errors.cv_file ? "border-red-500" : ""}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isFr ? "Max 5 MB" : "Max 5 MB"}
                </p>
              </div>
            )}
            {errors.cv_file && (
              <p className="text-red-500 text-sm mt-1">{errors.cv_file}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              {isFr ? "Message de motivation (optionnel)" : "Motivation message (optional)"}
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder={isFr 
                ? "Dites-nous pourquoi vous êtes intéressé par cette opportunité..." 
                : "Tell us why you're interested in this opportunity..."}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isFr ? "Annuler" : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="glow"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting
                ? (isFr ? "Envoi..." : "Submitting...")
                : (isFr ? "Soumettre" : "Submit")}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default MotivationFormModal;
