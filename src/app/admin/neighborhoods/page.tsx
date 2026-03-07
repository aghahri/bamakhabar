import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { NeighborhoodManager } from '@/components/NeighborhoodManager';
import { RecomputeNeighborhoodStatus } from '@/components/RecomputeNeighborhoodStatus';
import { ImportNeighborhoods } from '@/components/ImportNeighborhoods';

export default async function AdminNeighborhoodsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  const isAdmin = session.type === 'admin' || (session.type === 'user' && session.role === 'ADMIN');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">مدیریت محلات (استان / شهر / محله)</h1>
      {isAdmin && <ImportNeighborhoods />}
      <RecomputeNeighborhoodStatus />
      <NeighborhoodManager />
    </div>
  );
}

