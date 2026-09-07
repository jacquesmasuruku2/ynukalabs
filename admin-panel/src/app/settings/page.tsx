'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, Copy, Database, Globe, Key, Loader2, Palette, RefreshCw, Save, Shield, User } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useTheme } from '@/components/ThemeProvider';

type Theme = 'blue' | 'gray' | 'dark' | 'green' | 'purple' | 'orange';
type Notice = { type: 'success' | 'error'; text: string } | null;
type Settings = { siteName: string; contactEmail: string; emailNotifications: boolean; securityAlerts: boolean; weeklyReports: boolean; publicApiKey: string };

const themes: { name: string; value: Theme; color: string }[] = [
  { name: 'Bleu', value: 'blue', color: 'bg-blue-600' }, { name: 'Gris', value: 'gray', color: 'bg-gray-600' },
  { name: 'Sombre', value: 'dark', color: 'bg-gray-900' }, { name: 'Vert', value: 'green', color: 'bg-green-600' },
  { name: 'Violet', value: 'purple', color: 'bg-purple-600' }, { name: 'Orange', value: 'orange', color: 'bg-orange-600' },
];
const emptySettings: Settings = { siteName: '', contactEmail: '', emailNotifications: true, securityAlerts: true, weeklyReports: false, publicApiKey: '' };

function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingDatabase, setTestingDatabase] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

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
        setProfile({ name: data.user.name, email: data.user.email });
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

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return <div className="space-y-6 pb-6">
    <div><h1 className="text-3xl font-bold text-primary">Paramètres</h1><p className="mt-1 text-secondary">Gérer les paramètres du panneau d&apos;administration</p></div>
    {notice && <div className={`rounded-md border p-3 text-sm ${notice.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{notice.text}</div>}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Palette className="h-5 w-5 text-pink-600" />} title="Apparence" /><div className="grid grid-cols-3 gap-3">{themes.map((item) => <button key={item.value} type="button" onClick={() => setTheme(item.value)} aria-pressed={theme === item.value} className={`flex flex-col items-center rounded-lg border-2 p-3 transition-all ${theme === item.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}><span className={`mb-2 h-8 w-8 rounded-full ${item.color}`} /><span className="text-xs text-gray-700">{item.name}</span>{theme === item.value && <Check className="mt-1 h-3 w-3 text-blue-600" />}</button>)}</div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Globe className="h-5 w-5 text-blue-600" />} title="Général" /><div className="space-y-4"><Field label="Nom du site" value={settings.siteName} onChange={(value) => setSettings({ ...settings, siteName: value })} /><Field label="Email de contact" type="email" value={settings.contactEmail} onChange={(value) => setSettings({ ...settings, contactEmail: value })} /><ActionButton onClick={saveSettings} loading={saving}>Enregistrer</ActionButton></div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Database className="h-5 w-5 text-green-600" />} title="Base de données" /><div className="space-y-4"><Field label="URL de connexion" value="Configurée dans l’environnement serveur" disabled onChange={() => undefined} /><div className="flex items-center justify-between"><span className="text-sm text-secondary">Statut de connexion</span><span className={`rounded-full px-2 py-1 text-xs font-medium ${databaseConnected === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{databaseConnected === false ? 'Erreur' : databaseConnected === true ? 'Connecté' : 'Non testé'}</span></div><ActionButton onClick={testDatabase} loading={testingDatabase} dark>Tester la connexion</ActionButton></div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<User className="h-5 w-5 text-purple-600" />} title="Utilisateur" /><div className="space-y-4"><Field label="Nom d'utilisateur" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} /><Field label="Email" type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} /><ActionButton onClick={saveProfile} loading={saving}>Mettre à jour</ActionButton></div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Shield className="h-5 w-5 text-red-600" />} title="Sécurité" /><div className="space-y-4"><Field label="Mot de passe actuel" type="password" value={passwords.currentPassword} onChange={(value) => setPasswords({ ...passwords, currentPassword: value })} /><Field label="Nouveau mot de passe (8 caractères minimum)" type="password" value={passwords.newPassword} onChange={(value) => setPasswords({ ...passwords, newPassword: value })} /><ActionButton onClick={changePassword} loading={saving} danger>Changer le mot de passe</ActionButton></div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Bell className="h-5 w-5 text-yellow-600" />} title="Notifications" /><div className="space-y-4"><Toggle label="Notifications par email" checked={settings.emailNotifications} onChange={(value) => setSettings({ ...settings, emailNotifications: value })} /><Toggle label="Alertes de sécurité" checked={settings.securityAlerts} onChange={(value) => setSettings({ ...settings, securityAlerts: value })} /><Toggle label="Rapports hebdomadaires" checked={settings.weeklyReports} onChange={(value) => setSettings({ ...settings, weeklyReports: value })} /><ActionButton onClick={saveSettings} loading={saving}>Enregistrer les préférences</ActionButton></div></section>
      <section className="card rounded-lg border p-6 shadow-sm"><Heading icon={<Key className="h-5 w-5 text-gray-600" />} title="Clés API" /><div className="space-y-4"><div><label className="mb-1 block text-sm font-medium text-secondary">Clé API publique</label><div className="flex gap-2"><input value={settings.publicApiKey} readOnly className="min-w-0 flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm" /><button type="button" onClick={copyKey} aria-label="Copier la clé API" className="rounded-md bg-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-300">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div></div><ActionButton onClick={regenerateKey} loading={saving} dark><RefreshCw className="mr-2 inline h-4 w-4" />Régénérer la clé API</ActionButton></div></section>
    </div>
  </div>;
}

function Heading({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="mb-4 flex items-center gap-3"><div>{icon}</div><h2 className="text-lg font-semibold text-primary">{title}</h2></div>; }
function Field({ label, value, onChange, type = 'text', disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) { return <div><label className="mb-1 block text-sm font-medium text-secondary">{label}</label><input type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100" /></div>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex cursor-pointer items-center justify-between text-sm text-secondary"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded text-blue-600" /></label>; }
function ActionButton({ children, onClick, loading, dark = false, danger = false }: { children: React.ReactNode; onClick: () => void; loading: boolean; dark?: boolean; danger?: boolean }) { return <button type="button" onClick={onClick} disabled={loading} className={`w-full rounded-md py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${danger ? 'bg-red-600 hover:bg-red-700' : dark ? 'bg-gray-800 hover:bg-gray-900' : 'bg-blue-600 hover:bg-blue-700'}`}>{loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : <><Save className="mr-2 inline h-4 w-4" />{children}</>}</button>; }

export default function SettingsPage() { return <ProtectedRoute><AdminLayout><SettingsContent /></AdminLayout></ProtectedRoute>; }
