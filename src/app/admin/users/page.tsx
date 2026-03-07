import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { UserManager } from '@/components/UserManager';

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">مدیریت کاربران و خبرنگاران محله</h1>
      <UserManager />
    </div>
  );
}
