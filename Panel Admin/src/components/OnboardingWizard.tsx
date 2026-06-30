import { useState } from "react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sun, Moon, Monitor, PanelLeft, PanelRight, Bell, BellOff, Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpg";

type Step = 1 | 2 | 3 | 4;

export function OnboardingWizard() {
  const { preferences, updateTheme, updateSidebarPosition, updateNotificationsEnabled, completeOnboarding } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [tempTheme, setTempTheme] = useState(preferences.theme);
  const [tempSidebar, setTempSidebar] = useState(preferences.sidebarPosition);
  const [tempNotifications, setTempNotifications] = useState(preferences.notificationsEnabled);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleComplete = () => {
    updateTheme(tempTheme);
    updateSidebarPosition(tempSidebar);
    updateNotificationsEnabled(tempNotifications);
    completeOnboarding();
    navigate({ to: "/admin" });
  };

  const steps = [
    {
      step: 1,
      title: "Choisissez votre thème",
      description: "Sélectionnez le mode d'affichage qui vous convient le mieux",
      icon: Sparkles,
    },
    {
      step: 2,
      title: "Position de la barre latérale",
      description: "Préférez-vous la sidebar à gauche ou à droite ?",
      icon: PanelLeft,
    },
    {
      step: 3,
      title: "Notifications",
      description: "Activez ou désactivez les notifications système",
      icon: Bell,
    },
    {
      step: 4,
      title: "Bienvenue !",
      description: "Votre configuration est terminée",
      icon: Check,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-[#eef4f3] to-slate-200 p-4 md:p-8 relative">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white">
        <CardHeader className="text-center pb-6">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-[#2a5298]/8 blur-2xl" />
              <img
                src={logo}
                alt="Logo Ynuka Labs"
                className="relative h-16 w-16 rounded-2xl object-cover shadow-lg border-2 border-slate-200/50"
                style={{ clipPath: "polygon(25% 6%, 75% 6%, 94% 50%, 75% 94%, 25% 94%, 6% 50%)" }}
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Configuration initiale</CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                Personnalisez votre expérience du panel d'administration
              </CardDescription>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = currentStep === s.step;
              const isCompleted = currentStep > s.step;
              return (
                <div key={s.step} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                      isActive && "bg-[#2a5298] text-white shadow-lg scale-110",
                      isCompleted && "bg-emerald-500 text-white",
                      !isActive && !isCompleted && "bg-slate-200 text-slate-400",
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-8 h-0.5 transition-all duration-300",
                        isCompleted ? "bg-emerald-500" : "bg-slate-200",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Step 1: Theme Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Mode d'affichage</h3>
                <p className="text-sm text-slate-600">Choisissez entre le mode clair, sombre ou automatique</p>
              </div>

              <RadioGroup value={tempTheme} onValueChange={(value: any) => setTempTheme(value)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={cn(
                    "relative flex flex-col items-center p-6 rounded-xl border-2 transition-all cursor-pointer hover:border-[#2a5298]/50",
                    tempTheme === "light" ? "border-[#2a5298] bg-[#2a5298]/5" : "border-slate-200 bg-slate-50",
                  )}
                  onClick={() => setTempTheme("light")}
                >
                  <RadioGroupItem value="light" id="light" className="sr-only" />
                  <Sun className="w-8 h-8 text-amber-500 mb-3" />
                  <Label htmlFor="light" className="font-medium text-slate-900 cursor-pointer">
                    Mode clair
                  </Label>
                  <p className="text-xs text-slate-500 mt-1 text-center">Pour les environnements lumineux</p>
                </div>

                <div
                  className={cn(
                    "relative flex flex-col items-center p-6 rounded-xl border-2 transition-all cursor-pointer hover:border-[#2a5298]/50",
                    tempTheme === "dark" ? "border-[#2a5298] bg-[#2a5298]/5" : "border-slate-200 bg-slate-50",
                  )}
                  onClick={() => setTempTheme("dark")}
                >
                  <RadioGroupItem value="dark" id="dark" className="sr-only" />
                  <Moon className="w-8 h-8 text-indigo-500 mb-3" />
                  <Label htmlFor="dark" className="font-medium text-slate-900 cursor-pointer">
                    Mode sombre
                  </Label>
                  <p className="text-xs text-slate-500 mt-1 text-center">Pour les environnements sombres</p>
                </div>

                <div
                  className={cn(
                    "relative flex flex-col items-center p-6 rounded-xl border-2 transition-all cursor-pointer hover:border-[#2a5298]/50",
                    tempTheme === "system" ? "border-[#2a5298] bg-[#2a5298]/5" : "border-slate-200 bg-slate-50",
                  )}
                  onClick={() => setTempTheme("system")}
                >
                  <RadioGroupItem value="system" id="system" className="sr-only" />
                  <Monitor className="w-8 h-8 text-slate-500 mb-3" />
                  <Label htmlFor="system" className="font-medium text-slate-900 cursor-pointer">
                    Automatique
                  </Label>
                  <p className="text-xs text-slate-500 mt-1 text-center">S'adapte à votre système</p>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Sidebar Position */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Position de la barre latérale</h3>
                <p className="text-sm text-slate-600">Choisissez où afficher la barre de navigation</p>
              </div>

              <RadioGroup value={tempSidebar} onValueChange={(value: any) => setTempSidebar(value)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={cn(
                    "relative flex flex-col items-center p-6 rounded-xl border-2 transition-all cursor-pointer hover:border-[#2a5298]/50",
                    tempSidebar === "left" ? "border-[#2a5298] bg-[#2a5298]/5" : "border-slate-200 bg-slate-50",
                  )}
                  onClick={() => setTempSidebar("left")}
                >
                  <RadioGroupItem value="left" id="left" className="sr-only" />
                  <PanelLeft className="w-8 h-8 text-[#2a5298] mb-3" />
                  <Label htmlFor="left" className="font-medium text-slate-900 cursor-pointer">
                    À gauche
                  </Label>
                  <p className="text-xs text-slate-500 mt-1 text-center">Position classique</p>
                </div>

                <div
                  className={cn(
                    "relative flex flex-col items-center p-6 rounded-xl border-2 transition-all cursor-pointer hover:border-[#2a5298]/50",
                    tempSidebar === "right" ? "border-[#2a5298] bg-[#2a5298]/5" : "border-slate-200 bg-slate-50",
                  )}
                  onClick={() => setTempSidebar("right")}
                >
                  <RadioGroupItem value="right" id="right" className="sr-only" />
                  <PanelRight className="w-8 h-8 text-[#2a5298] mb-3" />
                  <Label htmlFor="right" className="font-medium text-slate-900 cursor-pointer">
                    À droite
                  </Label>
                  <p className="text-xs text-slate-500 mt-1 text-center">Position alternative</p>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Notifications */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Notifications</h3>
                <p className="text-sm text-slate-600">Activez les notifications pour rester informé</p>
              </div>

              <div className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-slate-200 bg-slate-50">
                <div className="flex items-center gap-4 mb-4">
                  {tempNotifications ? (
                    <Bell className="w-12 h-12 text-[#2a5298]" />
                  ) : (
                    <BellOff className="w-12 h-12 text-slate-400" />
                  )}
                  <div className="flex items-center gap-3">
                    <Switch
                      id="notifications"
                      checked={tempNotifications}
                      onCheckedChange={setTempNotifications}
                      className="data-[state=checked]:bg-[#2a5298]"
                    />
                    <Label htmlFor="notifications" className="font-medium text-slate-900 cursor-pointer text-lg">
                      {tempNotifications ? "Activées" : "Désactivées"}
                    </Label>
                  </div>
                </div>
                <p className="text-sm text-slate-500 text-center max-w-sm">
                  {tempNotifications
                    ? "Vous recevrez des notifications pour les actions importantes dans le panel."
                    : "Vous ne recevrez pas de notifications système."}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Welcome */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2a5298] to-[#1e3c72] flex items-center justify-center shadow-lg">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Bienvenue sur Ynuka Labs !</h3>
                <p className="text-slate-600">Votre configuration est terminée. Vous êtes maintenant prêt à utiliser le panel d'administration.</p>
              </div>

              <div className="bg-gradient-to-br from-[#2a5298]/5 to-[#1e3c72]/5 rounded-xl p-6 border border-[#2a5298]/10">
                <h4 className="font-semibold text-slate-900 mb-3">Votre configuration :</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-medium">Thème :</span>
                    <span className="ml-auto">
                      {tempTheme === "light" && "Mode clair ☀️"}
                      {tempTheme === "dark" && "Mode sombre 🌙"}
                      {tempTheme === "system" && "Automatique 💻"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-medium">Sidebar :</span>
                    <span className="ml-auto">{tempSidebar === "left" ? "À gauche ⬅️" : "À droite ➡️"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-medium">Notifications :</span>
                    <span className="ml-auto">{tempNotifications ? "Activées 🔔" : "Désactivées 🔕"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext} className="gap-2 bg-[#2a5298] hover:bg-[#1e3c72]">
                Suivant
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="gap-2 bg-[#2a5298] hover:bg-[#1e3c72]">
                Commencer
                <Sparkles className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
