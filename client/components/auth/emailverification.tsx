"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { deleteAuthCookie, verification } from '@/actions/auth.action';

export function EmailVerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState<string>('Verifica in corso...');
  const searchParams = useSearchParams();
  const emailToken = searchParams.get('emailToken');
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      if (emailToken) {
        try { 
          const response = await verification(emailToken);
          if (response.status === 200) {
            setVerificationStatus('Verification successful! Click here to go to the login page.');
          } else {
            setVerificationStatus('Error during email verification. Invalid token.');
          }
        } catch (error) {
          setVerificationStatus('Error during email verification. Invalid token.');
        }
      } else {
        setVerificationStatus('Verification token missing.');
      }
    };

    verifyEmail();
  }, [emailToken]);


  const handleLoginRedirect = async () => {
    await deleteAuthCookie();
    router.push('/login');
  };

  return (
    <div className="container mx-auto mt-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Verifica Email</h1>
      <p className={`text-lg ${verificationStatus.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
        {verificationStatus}
      </p>
      {verificationStatus.includes('successful') && (
        <button
          onClick={handleLoginRedirect}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to login page
        </button>
      )}
    </div>
  );
};

export default EmailVerificationPage;