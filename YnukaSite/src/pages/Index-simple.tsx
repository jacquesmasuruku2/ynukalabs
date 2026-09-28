import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Users, Calendar, Rocket, Award } from "lucide-react";

const Index = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Users, value: "500+", label: "Membres" },
    { icon: Calendar, value: "30+", label: "Événements" },
    { icon: Rocket, value: "15+", label: "Projets" },
    { icon: Award, value: "1000+", label: "Bénéficiaires" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Innovation Web3 à Goma
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            GOMA HUB{" "}
            <span className="text-orange-500">WEB3</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Le centre d'innovation blockchain pour le développement de la RD Congo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 text-white px-8 py-4 rounded-lg font-medium hover:bg-orange-600 transition-colors">
              <Link to="/community" className="flex items-center">
                Rejoindre la communauté <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </button>
            <button className="border border-gray-300 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              <Link to="/events">Voir les événements</Link>
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
