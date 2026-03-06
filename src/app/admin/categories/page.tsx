import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { CategoryManager } from '@/components/CategoryManager';

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">مدیریت دسته‌بندی‌ها (سیاسی، نظامی و …)</h1>
      <CategoryManager />
    </div>
  );
}
