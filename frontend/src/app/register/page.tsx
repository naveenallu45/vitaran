'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/AuthContext';
import { ShieldAlert, Loader2, User as UserIcon, Briefcase } from 'lucide-react';

const ROLE_VALUES = ['customer', 'provider'] as const;

const registerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(ROLE_VALUES, {
    message: 'Please select a role',
  }),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const { register: signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await signup(values.name, values.email, values.password, values.role);
      if (!res.success) {
        setError(res.message || 'Registration failed. Check details.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-neutral-900 p-8 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-sm">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-neutral-100 tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-605 dark:text-indigo-400 hover:text-indigo-500">
              Sign In
            </Link>
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 p-4 flex gap-3 text-sm text-red-700 dark:text-red-400">
            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold">Registration Failed</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Role selector buttons */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-neutral-300">I want to register as a:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('role', 'customer')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition ${
                  selectedRole === 'customer'
                    ? 'border-indigo-650 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-bold ring-2 ring-indigo-650/20'
                    : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 text-gray-600 dark:text-neutral-400'
                }`}
              >
                <UserIcon className="w-6 h-6" />
                <span className="text-sm">Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'provider')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition ${
                  selectedRole === 'provider'
                    ? 'border-indigo-655 bg-indigo-50/50 dark:bg-indigo-955/20 text-indigo-755 dark:text-indigo-400 font-bold ring-2 ring-indigo-655/20'
                    : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 text-gray-600 dark:text-neutral-400'
                }`}
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-sm">Provider</span>
              </button>
            </div>
            {errors.role && (
              <p className="text-xs font-semibold text-red-655 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-neutral-300">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              disabled={submitting}
              className={`block w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 transition ${
                errors.name ? 'border-red-300' : 'border-gray-200 dark:border-neutral-800'
              }`}
              placeholder="e.g. John Doe"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs font-semibold text-red-655 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-neutral-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              disabled={submitting}
              className={`block w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-655/20 focus:border-indigo-655 transition ${
                errors.email ? 'border-red-300' : 'border-gray-200 dark:border-neutral-800'
              }`}
              placeholder="e.g. test@vitaran.com"
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
              disabled={submitting}
              className={`block w-full rounded-lg border px-3 py-2 bg-white dark:bg-neutral-955 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 transition ${
                errors.password ? 'border-red-300' : 'border-gray-200 dark:border-neutral-800'
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
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
