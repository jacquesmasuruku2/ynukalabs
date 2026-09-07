'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Edit, Plus, Trash2, UserRound } from 'lucide-react';

type TeamMember = { id: string; name: string; slug: string; role: string; imageUrl: string | null; isActive: boolean };

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    const response = await fetch('/api/team-members');
    if (response.ok) setMembers(await response.json());
    setLoading(false);
  };

  useEffect(() => { loadMembers(); }, []);

  const removeMember = async (id: string) => {
    if (!confirm('Supprimer ce membre de l’équipe ?')) return;
    await fetch(`/api/team-members/${id}`, { method: 'DELETE' });
    loadMembers();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Équipe</h1>
            <p className="mt-1 text-secondary">Gérer les profils visibles sur /team</p>
          </div>
          <Link href="/team-members/new" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Nouveau membre
          </Link>
        </div>
        {loading ? <p className="py-12 text-center text-secondary">Chargement...</p> : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <article key={member.id} className="card overflow-hidden rounded-lg border shadow-sm">
                <div className="flex items-center gap-4 p-5">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-blue-50">
                    {member.imageUrl ? <img src={member.imageUrl} alt={member.name} className="h-full w-full object-cover" /> : <UserRound className="m-4 h-8 w-8 text-blue-600" />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-primary">{member.name}</h2>
                    <p className="text-sm text-blue-600">{member.role}</p>
                    <p className="truncate text-xs text-secondary">/team/{member.slug}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t p-3">
                  <Link href={`/team-members/${member.id}/edit`} className="p-2 text-gray-500 hover:text-blue-600" title="Modifier"><Edit className="h-4 w-4" /></Link>
                  <button onClick={() => removeMember(member.id)} className="p-2 text-gray-500 hover:text-red-600" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
            {!members.length && <p className="col-span-full py-12 text-center text-secondary">Aucun membre enregistré.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
