import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, PlayCircle, Search, SlidersHorizontal } from "lucide-react";
import { LEARNING_COURSES } from "@/data/learningCourses";

const tabs = ["Tous", "Cours", "Modules", "Vidéos"] as const;

export function LearningCatalogSection() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Tous");
  const [search, setSearch] = useState("");
  const courses = useMemo(() => LEARNING_COURSES.filter((course) => {
    const matchesType = activeTab === "Tous" || course.type === (activeTab === "Modules" ? "Module" : activeTab === "Vidéos" ? "Vidéo" : "Cours");
    const matchesSearch = course.title.toLocaleLowerCase().includes(search.toLocaleLowerCase());
    return matchesType && matchesSearch;
  }), [activeTab, search]);

  return <section id="education" className="scroll-mt-28 py-16 md:py-24">
    <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="mb-9 flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#ffb800]">Académie Ynuka</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">Apprendre, comprendre, construire.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">Cours, modules et vidéos pour passer des fondamentaux du Web aux opportunités de la blockchain.</p>
        </div>
        <label className="flex h-11 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-slate-300 transition focus-within:border-[#ffb800]/70 md:w-[18rem]">
          <Search className="h-4 w-4 text-[#ffb800]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="Rechercher un cours" />
        </label>
      </div>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="mr-1 h-4 w-4 text-[#ffb800]" />
        {tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? "border-[#ffb800] bg-[#ffb800] text-[#0f2847]" : "border-white/10 bg-white/[0.025] text-slate-300 hover:border-white/30 hover:text-white"}`}>{tab}</button>)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => <motion.article key={course.slug} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.42, delay: index * 0.05 }} className="group overflow-hidden rounded-xl border border-white/10 bg-[#071727]/35 transition hover:-translate-y-1 hover:border-[#ffb800]/60">
          <div className="relative h-40 overflow-hidden"><img src={course.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className={`absolute inset-0 bg-gradient-to-tr ${course.accent} opacity-70`} /><span className="absolute left-3 top-3 rounded-md bg-[#071727]/85 px-2 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white">{course.type}</span></div>
          <div className="p-5"><div className="flex items-center justify-between text-xs text-slate-400"><span>{course.level}</span><span>{course.duration}</span></div><h3 className="mt-3 font-display text-xl font-bold text-white">{course.title}</h3><p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-slate-300">{course.summary}</p><Link to={`/resources/courses/${course.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#ffb800] hover:text-white">Découvrir le parcours <ArrowRight className="h-4 w-4" /></Link></div>
        </motion.article>)}
      </div>
      {courses.length === 0 && <div className="py-12 text-center text-slate-400"><BookOpen className="mx-auto mb-3 h-6 w-6" />Aucun contenu ne correspond à votre recherche.</div>}
      <p className="mt-6 flex items-center gap-2 text-xs text-slate-400"><PlayCircle className="h-4 w-4 text-[#ffb800]" />Connectez-vous pour accéder à l'intégralité des chapitres et télécharger les supports.</p>
    </div>
  </section>;
}
