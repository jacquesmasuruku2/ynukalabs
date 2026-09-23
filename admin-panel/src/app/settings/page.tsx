'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, Bell, Camera, Check, Clock, Copy, Database, Globe, Key, Loader2, Palette, RefreshCw, Save, Shield, Trash2, User, UserPlus } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';

type Theme = 'blue' | 'gray' | 'dark' | 'green' | 'purple' | 'orange';
type Notice = { type: 'success' | 'error'; text: string } | null;
type Settings = { siteName: string; contactEmail: string; emailNotifications: boolean; securityAlerts: boolean; weeklyReports: boolean; publicApiKey: string };

const themes: { name: string; value: Theme; color: string }[] = [
  { name: 'Bleu', value: 'blue', color: 'bg-blue-600' }, { name: 'Gris', value: 'gray', color: 'bg-gray-600' },
  { name: 'Sombre', value: 'dark', color: 'bg-gray-900' }, { name: 'Vert', value: 'green', color: 'bg-green-600' },
  { name: 'Violet', value: 'purple', color: 'bg-purple-600' }, { name: 'Orange', value: 'orange', color: 'bg-orange-600' },
];
const emptySettings: Settings = { siteName: '', contactEmail: '', emailNotifications: true, securityAlerts: true, weeklyReports: false, publicApiKey: '' };
type TeamMember = { id: string; email: string; name: string; isActive: boolean; hasPassword: boolean; isSuperAdmin: boolean; lastLoginAt: string | null; lastActiveAt: string | null; isOnline: boolean };
type InviteRow = { id: string; email: string; status: string; expiresAt: string };

function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [profile, setProfile] = useState({ name: '', email: '', avatarUrl: '' as string | null });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingDatabase, setTestingDatabase] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '' });
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const showNotice = (nextNotice: Notice) => {
    setNotice(nextNotice);
    window.setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Impossible de charger les paramètres');
        setSettings(data.settings);
        setProfile({ name: data.user.name, email: data.user.email, avatarUrl: data.user.avatarUrl || null });
      })
      .catch((error: Error) => showNotice({ type: 'error', text: error.message }))
      .finally(() => setLoading(false));
  }, []);

  const request = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, { ...options, credentials: 'include' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Une erreur est survenue');
    return data;
  };

  const saveSettings = async () => {
    setSaving(true);
    try { const data = await request('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) }); setSettings(data.settings); showNotice({ type: 'success', text: 'Paramètres enregistrés.' }); }
    catch (error) { showNotice({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de l’enregistrement' }); }
    finally { setSaving(false); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try { const data = await request('/api/admin/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) }); setProfile(data.user); showNotice({ type: 'success', text: 'Profil mis à jour.' }); }
    catch (error) { showNotice({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' }); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    setSaving(true);
    try { await request('/api/admin/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(passwords) }); setPasswords({ currentPassword: '', newPassword: '' }); showNotice({ type: 'success', text: 'Mot de passe changé. Les autres sessions ont été déconnectées.' }); }
    catch (error) { showNotice({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe' }); }
    finally { setSaving(false); }
  };

  const testDatabase = async () => {
    setTestingDatabase(true);
    try { await request('/api/admin/database'); setDatabaseConnected(true); showNotice({ type: 'success', text: 'Connexion à la base confirmée.' }); }
    catch { setDatabaseConnected(false); showNotice({ type: 'error', text: 'La connexion à la base a échoué.' }); }
    finally { setTestingDatabase(false); }
  };

  const regenerateKey = async () => {
    setSaving(true);
    try { const data = await request('/api/admin/settings', { method: 'POST' }); setSettings((current) => ({ ...current, publicApiKey: data.publicApiKey })); showNotice({ type: 'success', text: 'Clé API régénérée.' }); }
    catch (error) { showNotice({ type: 'error', text: error instanceof Error ? error.message : 'Erreur lors de la régénération' }); }
    finally { setSaving(false); }
  };

  const copyKey = async () => { await navigator.clipboard.writeText(settings.publicApiKey); setCopied(true); window.setTimeout(() => setCopied(false), 2000); };

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/admin/avatar', { method: 'POST', credentials: 'include', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Échec du téléversement');
      setProfile((current) => ({ ...current, avatarUrl: data.user.avatarUrl }));
      await refreshUser();
      showNotice({ type: 'success', text: 'Avatar mis à jour.' });
    } catch (error) {
      showNotice({ type: 'error', text: error instanceof Error ? error.message : 'Impossible de changer l’avatar' });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAvatar = async () => {
    setUploadingAvatar(true);
    try {
      const data = await request('/api/admin/avatar', { method: 'DELETE' });
      setProfile((current) => ({ ...current, avatarUrl: data.user.avatarUrl }));
      await refreshUser();
      showNotice({ type: 'success', text: 'Avatar retiré.' });
    } catch (error) {
      showNotice({ type: 'error', text: error instanceof Error ? error.message : 'Impossible de retirer l’avatar' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initials = (profile.name || profile.email || 'A').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'A';

  const loadTeam = async () => {
    if (!user?.isSuperAdmin) return;
    setLoadingTeam(true);
    try { const data = await request('/api/admin/invites'); setTeam(data.team || []); setInvites(data.invites || []); }
    catch (error) { showNotice({ type: 'error', text: error instanceof Error ? error.message : 'Impossible de charger l’équipe' }); }
    finally { setLoadingTeam(false); }
  };
  useEffect(() => { if (user?.isSuperAdmin) void loadTeam(); }, [user?.isSuperAdmin]);

  const sendInvite = async () => {
    if (!inviteForm.email.trim()) return showNotice({ type: 'error', text: 'Email requis pour l’invitation.' });
    setInviting(true);
    try { const data = await request('/api/admin/invites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inviteForm) }); setInviteForm({ email: '', name: '' }); showNotice({ type: 'success', text: data.message }); await loadTeam(); }
    catch (error) { showNotice({ type: 'error', text: error instanceof Error ? error.message : 'Échec de l’invitation' }); }
    finally { setInviting(false); }
  };
  const removeInvite = async (inviteId: string) => { await request('/api/admin/invites', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteId }) }); await loadTeam(); };
  const removeAdmin = async (userId: string) => { if (!confirm('Retirer cet administrateur ?')) return; await request('/api/admin/invites', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) }); await loadTeam(); };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return <div className="space-y-6 pb-6">
    <div><h1 className="text-3xl font-bold text-primary">Paramètres</h1><p className="mt-1 text-secondary">Gérer les paramètres du panneau d&apos;administration</p></div>
    {notice && <div className={`rounded-md border p-3 text-sm ${notice.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.text}</div>}
    <section className="card rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-900 dark:bg-amber-950/30"><Heading icon={<Shield className="h-5 w-5 text-amber-600" />} title="Accès Premium" />{user?.isSuperAdmin ? <p className="text-sm text-amber-900 dark:text-amber-100">L’accès Premium est activé par défaut pour le Super Admin.</p> : <div className="space-y-4"><p className="text-sm text-amber-900 dark:text-amber-100">Débloquez les fonctionnalités avancées du panel avec l’abonnement Premium.</p><button type="button" onClick={() => { window.location.href = '/api/admin/premium/checkout'; }} className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">Passer au Premium</button><p className="text-xs text-amber-800 dark:text-amber-200">Le paiement sécurisé est ouvert via Stripe ou NOWPayments.</p></div>}</section>
    {user?.isSuperAdmin && <AdminPresenceSection team={team} />}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Palette className="h-5 w-5 text-pink-600" />} title="Apparence" /><div className="grid grid-cols-3 gap-3">{themes.map((item) => <button key={item.value} type="button" onClick={() => setTheme(item.value)} aria-pressed={theme === item.value} className={`flex flex-col items-center rounded-lg border-2 p-3 transition-all ${theme === item.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}><span className={`mb-2 h-8 w-8 rounded-full ${item.color}`} /><span className="text-xs text-gray-700">{item.name}</span>{theme === item.value && <Check className="mt-1 h-3 w-3 text-blue-600" />}</button>)}</div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Globe className="h-5 w-5 text-blue-600" />} title="Général" /><div className="space-y-4"><Field label="Nom du site" value={settings.siteName} onChange={(value) => setSettings({ ...settings, siteName: value })} /><Field label="Email de contact" type="email" value={settings.contactEmail} onChange={(value) => setSettings({ ...settings, contactEmail: value })} /><ActionButton onClick={saveSettings} loading={saving}>Enregistrer</ActionButton></div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Database className="h-5 w-5 text-green-600" />} title="Base de données" /><div className="space-y-4"><Field label="URL de connexion" value="Configurée dans l’environnement serveur" disabled onChange={() => undefined} /><div className="flex items-center justify-between"><span className="text-sm text-secondary">Statut de connexion</span><span className={`rounded-full px-2 py-1 text-xs font-medium ${databaseConnected === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{databaseConnected === false ? 'Erreur' : databaseConnected === true ? 'Connecté' : 'Non testé'}</span></div><ActionButton onClick={testDatabase} loading={testingDatabase} dark>Tester la connexion</ActionButton></div></section>
      <section className="card rounded-lg border p-6 shadow-sm md:col-span-2"><Heading icon={<User className="h-5 w-5 text-purple-600" />} title="Profil & avatar" /><div className="grid gap-6 md:grid-cols-[auto_1fr]"><div className="flex flex-col items-center gap-3">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="h-24 w-24 rounded-full object-cover ring-2 ring-blue-100" /> : <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#0f2847] to-blue-600 text-2xl font-bold text-white">{initials}</span>}<input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAvatar(file); }} /><div className="flex flex-wrap justify-center gap-2"><button type="button" disabled={uploadingAvatar} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60">{uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}Changer</button>{profile.avatarUrl && <button type="button" disabled={uploadingAvatar} onClick={() => void removeAvatar()} className="inline-flex items-center gap-1.5 rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" />Retirer</button>}</div><p className="max-w-[12rem] text-center text-[11px] text-secondary">JPEG, PNG, WebP ou GIF — 5 Mo max.</p></div><div className="space-y-4"><Field label="Nom d'utilisateur" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} /><Field label="Email" type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} /><ActionButton onClick={saveProfile} loading={saving}>Mettre à jour</ActionButton></div></div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Shield className="h-5 w-5 text-red-600" />} title="Sécurité" /><div className="space-y-4"><Field label="Mot de passe actuel" type="password" value={passwords.currentPassword} onChange={(value) => setPasswords({ ...passwords, currentPassword: value })} /><Field label="Nouveau mot de passe (8 caractères minimum)" type="password" value={passwords.newPassword} onChange={(value) => setPasswords({ ...passwords, newPassword: value })} /><ActionButton onClick={changePassword} loading={saving} danger>Changer le mot de passe</ActionButton></div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Bell className="h-5 w-5 text-yellow-600" />} title="Notifications" /><div className="space-y-4"><Toggle label="Notifications par email" checked={settings.emailNotifications} onChange={(value) => setSettings({ ...settings, emailNotifications: value })} /><Toggle label="Alertes de sécurité" checked={settings.securityAlerts} onChange={(value) => setSettings({ ...settings, securityAlerts: value })} /><Toggle label="Rapports hebdomadaires" checked={settings.weeklyReports} onChange={(value) => setSettings({ ...settings, weeklyReports: value })} /><ActionButton onClick={saveSettings} loading={saving}>Enregistrer les préférences</ActionButton></div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Key className="h-5 w-5 text-gray-600" />} title="Clés API" /><div className="space-y-4"><div><label className="mb-1 block text-sm font-medium text-secondary">Clé API publique</label><div className="flex gap-2"><input value={settings.publicApiKey} readOnly className="min-w-0 flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm" /><button type="button" onClick={copyKey} aria-label="Copier la clé API" className="rounded-md bg-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-300">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div></div><ActionButton onClick={regenerateKey} loading={saving} dark><RefreshCw className="mr-2 inline h-4 w-4" />Régénérer la clé API</ActionButton></div></section>
      {user?.isSuperAdmin && <section className="card rounded-lg border p-6 shadow-sm md:col-span-2"><Heading icon={<UserPlus className="h-5 w-5 text-indigo-600" />} title="Équipe & invitations" /><p className="mb-4 text-sm text-secondary">Vous pouvez inviter d’autres administrateurs. Ils pourront gérer le contenu mais ne pourront pas inviter d’autres utilisateurs.</p><div className="mb-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><Field label="Email à inviter" type="email" value={inviteForm.email} onChange={(value) => setInviteForm({ ...inviteForm, email: value })} /><Field label="Nom (optionnel)" value={inviteForm.name} onChange={(value) => setInviteForm({ ...inviteForm, name: value })} /><div className="flex items-end"><button type="button" onClick={() => void sendInvite()} disabled={inviting} className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{inviting ? 'Envoi...' : 'Inviter'}</button></div></div>{loadingTeam ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" /> : <div className="grid gap-6 md:grid-cols-2"><div><h3 className="mb-2 text-sm font-semibold">Administrateurs</h3><ul className="divide-y rounded-lg border">{team.map((member) => <li key={member.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"><div><p className="font-medium">{member.name} {member.isSuperAdmin && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">Super-admin</span>}</p><p className="text-xs text-secondary">{member.email}</p><p className="text-[11px] text-secondary">{member.hasPassword ? 'Mot de passe défini' : 'En attente de mot de passe'}</p></div>{!member.isSuperAdmin && <button type="button" onClick={() => void removeAdmin(member.id)} className="text-xs text-red-600">Retirer</button>}</li>)}{team.length === 0 && <li className="px-3 py-4 text-sm text-secondary">Aucun membre pour le moment.</li>}</ul></div><div><h3 className="mb-2 text-sm font-semibold">Invitations</h3><ul className="divide-y rounded-lg border">{invites.map((invite) => <li key={invite.id} className="flex items-center justify-between px-3 py-2.5 text-sm"><div><p className="font-medium">{invite.email}</p><p className="text-[11px] text-secondary">{invite.status} · expire le {new Date(invite.expiresAt).toLocaleDateString('fr-FR')}</p></div>{invite.status === 'pending' && <button type="button" onClick={() => void removeInvite(invite.id)} className="text-xs text-red-600">Annuler</button>}</li>)}{invites.length === 0 && <li className="px-3 py-4 text-sm text-secondary">Aucune invitation.</li>}</ul></div></div>}</section>}
    </div>
  </div>;
}

function Heading({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="mb-4 flex items-center gap-3"><div>{icon}</div><h2 className="text-lg font-semibold text-primary">{title}</h2></div>; }
function AdminPresenceSection({ team }: { team: TeamMember[] }) {
  const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Jamais';
  return <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Activity className="h-5 w-5 text-emerald-600" />} title="Présence des administrateurs" /><p className="mb-4 text-sm text-secondary">Les membres sont considérés actifs s’ils ont utilisé le panel au cours des 12 dernières secondes.</p><div className="overflow-x-auto"><table className="w-full min-w-[38rem] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-secondary"><th className="px-3 py-2 font-medium">Administrateur</th><th className="px-3 py-2 font-medium">Statut</th><th className="px-3 py-2 font-medium">Dernière activité</th><th className="px-3 py-2 font-medium">Dernière connexion</th></tr></thead><tbody className="divide-y">{team.map((member) => <tr key={member.id}><td className="px-3 py-3"><p className="font-medium text-primary">{member.name}</p><p className="text-xs text-secondary">{member.email}</p></td><td className="px-3 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${member.isOnline ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-200'}`}><span className={`h-2 w-2 rounded-full ${member.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />{member.isOnline ? 'Actif maintenant' : 'Hors ligne'}</span></td><td className="px-3 py-3 text-secondary"><Clock className="mr-1 inline h-3.5 w-3.5" />{formatDate(member.lastActiveAt)}</td><td className="px-3 py-3 text-secondary">{formatDate(member.lastLoginAt)}</td></tr>)}{team.length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-secondary">Aucun administrateur invité n’a encore intégré le panel.</td></tr>}</tbody></table></div></section>;
}
function Field({ label, value, onChange, type = 'text', disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) { return <div><label className="mb-1 block text-sm font-medium text-secondary">{label}</label><input type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100" /></div>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex cursor-pointer items-center justify-between text-sm text-secondary"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded text-blue-600" /></label>; }
function ActionButton({ children, onClick, loading, dark = false, danger = false }: { children: React.ReactNode; onClick: () => void; loading: boolean; dark?: boolean; danger?: boolean }) { return <button type="button" onClick={onClick} disabled={loading} className={`w-full rounded-md py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${danger ? 'bg-red-600 hover:bg-red-700' : dark ? 'bg-gray-800 hover:bg-gray-900' : 'bg-blue-600 hover:bg-blue-700'}`}>{loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : <><Save className="mr-2 inline h-4 w-4" />{children}</>}</button>; }

export default function SettingsPage() { return <ProtectedRoute><AdminLayout><SettingsContent /></AdminLayout></ProtectedRoute>; }
