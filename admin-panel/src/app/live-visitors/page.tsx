'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LiveVisitorsWidget } from '@/components/LiveVisitorsWidget';

export default function LiveVisitorsPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Visiteurs du site</h1>
            <p className="mt-1 text-secondary">
              Toutes les visites du site public : anonymes et connectées. En ligne maintenant et historique 24 h.
            </p>
          </div>
          <div className="card rounded-lg border p-5 shadow-sm">
            <LiveVisitorsWidget />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
