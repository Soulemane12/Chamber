"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

function ConfirmEmailComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email confirmation...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('No confirmation token found in the URL.');
          return;
        }
        
        // Verify the token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email_change',
        });
        
        if (error) {
          console.error('Error verifying email:', error);
          setStatus('error');
          setMessage(`Error verifying your email: ${error.message}`);
          return;
        }
        
        setStatus('success');
        setMessage('Your email has been confirmed successfully!');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err) {
        console.error('Unexpected error during confirmation:', err);
        setStatus('error');
        setMessage('An unexpected error occurred while confirming your email.');
      }
    };
    
    confirmEmail();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full text-center space-y-6 animate-fade-in">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{message}</h1>
            <p className="text-gray-700 dark:text-gray-300">Please wait while we verify your email...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{message}</h1>
            <p className="text-gray-700 dark:text-gray-300">You will be redirected to the login page shortly...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Failed</h1>
            <p className="text-gray-700 dark:text-gray-300">{message}</p>
            <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ConfirmEmailComponent />
    </Suspense>
  );
} 