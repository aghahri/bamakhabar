import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { NewsForm } from '@/components/NewsForm';

export default async function NewNewsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  const isReporter = session.type === 'user' && session.role === 'REPORTER';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">افزودن خبر جدید</h1>
      <NewsForm
        isReporter={isReporter}
        reporterNeighborhoodId={session.type === 'user' ? session.neighborhoodId : null}
      />
    </div>
  );
}
