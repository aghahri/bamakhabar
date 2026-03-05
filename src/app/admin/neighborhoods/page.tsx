import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { NeighborhoodManager } from '@/components/NeighborhoodManager';

export default async function AdminNeighborhoodsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">مدیریت محلات (استان / شهر / محله)</h1>
      <NeighborhoodManager />
    </div>
  );
}

