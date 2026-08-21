'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await login(values.email, values.password);
      if (!res.success) {
        setError(res.message || 'Invalid email or password.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-neutral-900 p-8 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-sm">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-neutral-100 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-indigo-605 dark:text-indigo-400 hover:text-indigo-500">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 p-4 flex gap-3 text-sm text-red-700 dark:text-red-400">
            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold">Login Failed</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-neutral-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={submitting}
              className={`block w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 transition ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="e.g. customer@vitaran.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs font-semibold text-red-655 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-neutral-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={submitting}
              className={`block w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-955 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 transition ${
                errors.password ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs font-semibold text-red-655 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center rounded-lg bg-black dark:bg-white dark:text-black py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
