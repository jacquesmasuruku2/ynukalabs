import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Download, FileText, LockKeyhole, PlayCircle } from "lucide-react";
import GoogleSignInDialog from "@/components/auth/GoogleSignInDialog";
import { getLearningCourse } from "@/data/learningCourses";
import { authService, type AuthUser } from "@/lib/auth";

export default function LearningCourseDetail() {
  const { slug = "" } = useParams();
  const course = getLearningCourse(slug);
  const [user, setUser] = useState<AuthUser | null>(() => authService.getUser());
  const [showAuth, setShowAuth] = useState(false);
  if (!course) return <Navigate to="/resources#education" replace />;

  const openCourse = () => {
    if (!user) { setShowAuth(true); return; }
    document.getElementById("chapitres")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <main className="min-h-screen bg-background pb-20 pt-28 text-white">
    <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 md:px-8">
      <Link to="/resources#education" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-[#ffb800]"><ArrowLeft className="h-4 w-4" />Retour aux ressources</Link>
      <section className="mt-8 grid overflow-hidden rounded-2xl border border-white/10 bg-[#071727]/35 md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[260px]"><img src={course.image} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className={`absolute inset-0 bg-gradient-to-tr ${course.accent} opacity-80`} /><div className="absolute inset-x-0 bottom-0 p-7"><span className="rounded-md border border-white/25 bg-[#071727]/65 px-2.5 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em]">{course.type}</span><h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">{course.title}</h1></div></div>
        <div className="flex flex-col justify-center p-7 md:p-9"><p className="text-lg leading-relaxed text-slate-200">{course.summary}</p><div className="mt-6 flex gap-6 border-y border-white/10 py-4 text-sm text-slate-300"><span><b className="block text-white">{course.duration}</b>Durée</span><span><b className="block text-white">{course.level}</b>Niveau</span><span><b className="block text-white">{course.chapters.length}</b>Chapitres</span></div><button type="button" onClick={openCourse} className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-[#ffb800] px-5 py-3 text-sm font-bold text-[#0f2847] transition hover:bg-[#ffd05a]"><PlayCircle className="h-4 w-4" />{user ? "Commencer le cours" : "Se connecter pour commencer"}</button></div>
      </section>
      <section id="chapitres" className="mt-12 scroll-mt-28 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div><p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-[#ffb800]">Programme du cours</p><h2 className="mt-3 font-display text-3xl font-bold">Vos chapitres</h2><div className="mt-7 space-y-3">{course.chapters.map((chapter, index) => <motion.article key={chapter.title} initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ffb800]/10 font-mono text-sm font-bold text-[#ffb800]">{String(index + 1).padStart(2, "0")}</span><div><h3 className="font-display text-lg font-bold">{chapter.title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-300">{user ? chapter.description : "Connectez-vous pour débloquer ce chapitre et suivre le cours dans son intégralité."}</p></div>{!user && <LockKeyhole className="ml-auto h-4 w-4 shrink-0 text-slate-500" />}</motion.article>)}</div></div>
        <aside className="h-fit rounded-xl border border-white/10 bg-white/[0.025] p-5"><FileText className="h-5 w-5 text-[#ffb800]" /><h2 className="mt-4 font-display text-xl font-bold">Support du cours</h2><p className="mt-2 text-sm leading-relaxed text-slate-300">Téléchargez le support PDF pour réviser à votre rythme.</p>{user ? <a href={course.supportUrl} download className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#ffb800] px-4 py-2.5 text-sm font-bold text-[#ffb800] transition hover:bg-[#ffb800] hover:text-[#0f2847]"><Download className="h-4 w-4" />Télécharger le PDF</a> : <button type="button" onClick={() => setShowAuth(true)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#ffb800] hover:text-[#ffb800]"><LockKeyhole className="h-4 w-4" />Support verrouillé</button>}<p className="mt-5 flex gap-2 text-xs leading-relaxed text-slate-400"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ffb800]" />La connexion est requise pour la totalité du cours et son support.</p></aside>
      </section>
    </div>
    <GoogleSignInDialog open={showAuth} onClose={() => setShowAuth(false)} onSuccess={(nextUser) => { setUser(nextUser); setShowAuth(false); }} title="Accéder au cours" description="Connectez-vous avec Google pour déverrouiller les chapitres et le support de cours." />
  </main>;
}
