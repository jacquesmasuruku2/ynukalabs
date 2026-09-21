import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Users, Calendar, Rocket, Award, MapPin, Star, Zap, Globe, Heart } from "lucide-react";

const Index = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Users, value: "500+", label: "Membres Actifs", color: "text-blue-600" },
    { icon: Calendar, value: "30+", label: "Événements", color: "text-purple-600" },
    { icon: Rocket, value: "15+", label: "Projets", color: "text-green-600" },
    { icon: Award, value: "1000+", label: "Bénéficiaires", color: "text-orange-600" },
  ];

  const upcomingEvents = [
    { 
      title: "Workshop Blockchain", 
      date: "25 Mars 2026", 
      type: "Workshop", 
      location: "Goma Innovation Center",
      time: "14:00 - 18:00",
      color: "from-blue-500 to-purple-600"
    },
    { 
      title: "Hackathon Web3", 
      date: "10 Avril 2026", 
      type: "Hackathon", 
      location: "Virunga Tech Park",
      time: "09:00 - 20:00",
      color: "from-purple-500 to-pink-600"
    },
    { 
      title: "Meetup Crypto", 
      date: "20 Avril 2026", 
      type: "Meetup", 
      location: "Goma Hub HQ",
      time: "17:00 - 19:00",
      color: "from-green-500 to-teal-600"
    },
  ];

  const projects = [
    { 
      name: "KivuPay", 
      category: "DeFi", 
      description: "Plateforme de paiement décentralisée pour la région des Grands Lacs",
      color: "from-blue-600 to-cyan-600"
    },
    { 
      name: "EduChain", 
      category: "Education", 
      description: "Système éducatif basé sur la blockchain pour les écoles congolaises",
      color: "from-purple-600 to-pink-600"
    },
    { 
      name: "VolcanoDAO", 
      category: "Social Impact", 
      description: "Organisation autonome pour le développement durable autour du Virunga",
      color: "from-green-600 to-emerald-600"
    },
  ];

  const partners = [
    "Cardano Foundation", 
    "Apex Fusion", 
    "Safrochain", 
    "UNICEF Innovation", 
    "Africa Blockchain Institute"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero avec image de fond */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/hero-bg.jpg" 
            alt="Goma Web3 Background" 
            className="w-full h-full object-cover opacity-30" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/60 to-orange-900/40" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-8 border border-white/30">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-300">Innovation</span>
            <span className="text-blue-300">Web3</span>
            <span className="text-green-300">à</span>
            <span className="text-purple-300">Goma</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold leading-tight mb-6">
            <span className="text-blue-400">GOMA</span>{" "}
            <span className="text-purple-400">HUB</span>{" "}
            <span className="text-green-400">WEB3</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-4xl mx-auto leading-relaxed">
            <span className="text-blue-300">Le centre d'innovation</span>{" "}
            <span className="text-purple-300">blockchain</span>{" "}
            <span className="text-green-300">pour le développement</span>{" "}
            <span className="text-orange-300">de la RD Congo</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <Link to="/community" className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-300" />
                <span className="text-white">Rejoindre</span>
                <span className="text-blue-300">la</span>
                <span className="text-purple-300">communauté</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </button>
            
            <button className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30">
              <Link to="/events" className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-orange-300" />
                <span className="text-green-300">Voir</span>
                <span className="text-blue-300">les</span>
                <span className="text-purple-300">événements</span>
              </Link>
            </button>
          </div>
        </div>
      </section>

      {/* Stats avec couleurs */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <stat.icon className={`h-10 w-10 mx-auto mb-4 ${stat.color}`} />
                  <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About avec couleurs */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="text-blue-600">Innovation</span>{" "}
            <span className="text-purple-600">Technologique</span>{" "}
            <span className="text-green-600">Locale</span>
          </h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            <span className="text-blue-500">Goma Hub Web3</span> est un{" "}
            <span className="text-purple-500">centre d'innovation</span> dédié au{" "}
            <span className="text-green-500">développement</span> des technologies{" "}
            <span className="text-orange-500">blockchain</span> en{" "}
            <span className="text-red-500">RD Congo</span>, créant des{" "}
            <span className="text-indigo-500">opportunités</span> pour la{" "}
            <span className="text-pink-500">jeunesse</span> locale.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-300">
            <Link to="/about" className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              <span className="text-yellow-200">En savoir</span>
              <span className="text-blue-200">plus</span>
            </Link>
          </button>
        </div>
      </section>

      {/* Events avec couleurs */}
      <section className="py-24 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="text-purple-600">Événements</span>{" "}
            <span className="text-pink-600">à</span>{" "}
            <span className="text-blue-600">venir</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100">
                  <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${event.color} text-white text-xs font-bold mb-4`}>
                    {event.type}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{event.title}</h3>
                  <div className="space-y-3 mb-6">
                    <p className="text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-600">{event.date}</span>
                    </p>
                    <p className="text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-purple-600">{event.location.replace('Goma Hub HQ', 'Ynuka Labs HQ')}</span>
                    </p>
                    <p className="text-gray-700 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-green-600">{event.time}</span>
                    </p>
                  </div>
                  <button className={`w-full bg-gradient-to-r ${event.color} text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity duration-300`}>
                    S'inscrire maintenant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects avec couleurs */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="text-green-600">Projets</span>{" "}
            <span className="text-blue-600">Innovants</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, i) => (
              <div key={i} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100">
                  <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${project.color} text-white text-xs font-bold mb-4`}>
                    {project.category}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{project.name}</h3>
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners avec logo */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <img src="/logo.png" alt="Goma Web3 Hub" className="h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-blue-600">Partenaires</span>{" "}
              <span className="text-purple-600">Stratégiques</span>
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {partners.map((partner, i) => (
              <div key={i} className="px-6 py-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <span className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter avec couleurs */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Heart className="h-12 w-12 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            <span className="text-yellow-300">Restez</span>{" "}
            <span className="text-green-300">Connecté</span>
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Recevez les dernières nouvelles sur nos{" "}
            <span className="text-yellow-300">événements</span> et{" "}
            <span className="text-green-300">opportunités</span>
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors duration-300">
              S'abonner
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Index;
