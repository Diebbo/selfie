"use client";

import { deleteAuthCookie } from '@/actions/auth.action';
import { useRouter } from 'next/navigation';

export function ChangeAccountPage() {
  const router = useRouter();

  const handleYesClick = async () => {
    await deleteAuthCookie();
    router.push('/login');
  };

  const handleNoClick = async () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto mt-10 text-center">
    <h1 className="text-2xl font-bold mb-4">Do you want to log in with another account?</h1>
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleYesClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Si
        </button>
        <button
          onClick={handleNoClick}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          No
        </button>
      </div>
    </div>
  );
};

export default ChangeAccountPage;