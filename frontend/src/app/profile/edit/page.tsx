'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { ProviderProfile } from '@/types';
import { ShieldAlert, Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';

const CATEGORY_VALUES = [
  'electrician',
  'plumber',
  'tutor',
  'photographer',
  'home_cleaning',
  'ac_technician',
  'computer_repair',
] as const;

const LOCATION_VALUES = ['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai'] as const;

// Profile Zod schema
const profileFormSchema = z.object({
  category: z.enum(CATEGORY_VALUES, {
    message: 'Please select a valid service category',
  }),
  description: z.string().min(10, 'About me description must be at least 10 characters'),
  experience: z.number({ message: 'Experience must be a number' }).min(0, 'Experience must be 0 or more years'),
  location: z.enum(LOCATION_VALUES, {
    message: 'Please select a valid location',
  }),
  price: z.number({ message: 'Price must be a number' }).min(0, 'Rate per hour cannot be negative'),
  profileImage: z.string().url('Please enter a valid profile image URL'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  });

  const currentProfileImage = watch('profileImage');

  useEffect(() => {
    if (currentProfileImage) {
      setImagePreview(currentProfileImage);
    }
  }, [currentProfileImage]);

  useEffect(() => {
    const fetchMyProfile = async () => {
      setLoadingProfile(true);
      setError(null);
      try {
        const res = await apiClient.get<ProviderProfile>('/providers/profile/me');
        if (res.success && res.data) {
          const profile = res.data;
          setValue('category', profile.category);
          setValue('description', profile.description);
          setValue('experience', profile.experience);
          setValue('location', profile.location);
          setValue('price', profile.price);
          setValue('profileImage', profile.profileImage);
          setImagePreview(profile.profileImage);
        }
      } catch {
        // Ignored if profile does not exist yet (it will be created)
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user && user.role === 'provider') {
      fetchMyProfile();
    } else {
      setLoadingProfile(false);
    }
  }, [user, setValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const res = await apiClient.post<{ url: string }>('/upload', { image: base64String });
        if (res.success && res.data) {
          setValue('profileImage', res.data.url);
          setImagePreview(res.data.url);
        } else {
          setError(res.message || 'Image upload failed.');
        }
      } catch {
        setError('An error occurred during file upload.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiClient.put<ProviderProfile>('/providers/profile', values);
      if (res.success) {
        setSuccess('Profile details saved successfully.');
        setTimeout(() => {
          router.push('/dashboard/provider');
        }, 1500);
      } else {
        setError(res.message || 'Failed to save profile details.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user || user.role !== 'provider') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500">Only service providers can configure profile pages.</p>
        <Link
          href="/login"
          className="inline-flex justify-center rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Configure Service Profile</h1>
        <p className="text-gray-500 mt-1">Set up your public directory bio, service rate, and area details.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
        
        {/* Profile Image Upload & Live Preview block */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Service Banner Avatar</label>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
              {imagePreview ? (
                <NextImage src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-grow">
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleFileChange}
                disabled={submitting || uploadingImage}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer ${
                  submitting || uploadingImage ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo File
              </label>
              <p className="text-[10px] text-gray-400">Supports PNG, JPG, GIF up to 5MB. Automatically optimized.</p>
              {/* Keep URL input hidden but managed by form register */}
              <input type="hidden" {...register('profileImage')} />
            </div>
          </div>
          {errors.profileImage && (
            <p className="text-xs font-semibold text-red-655 mt-0.5">{errors.profileImage.message}</p>
          )}
        </div>

        {/* Category SELECT */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Service Category</label>
          <select
            disabled={submitting}
            className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition ${
              errors.category ? 'border-red-300' : 'border-gray-200'
            }`}
            {...register('category')}
          >
            <option value="">Select service category</option>
            <option value="electrician">Electrician</option>
            <option value="plumber">Plumber</option>
            <option value="tutor">Tutor</option>
            <option value="photographer">Photographer</option>
            <option value="home_cleaning">Home Cleaning</option>
            <option value="ac_technician">AC Technician</option>
            <option value="computer_repair">Computer Repair</option>
          </select>
          {errors.category && (
            <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.category.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Experience */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Experience (Years)</label>
            <input
              type="number"
              disabled={submitting}
              placeholder="e.g. 5"
              className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition ${
                errors.experience ? 'border-red-300' : 'border-gray-200'
              }`}
              {...register('experience', { valueAsNumber: true })}
            />
            {errors.experience && (
              <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.experience.message}</p>
            )}
          </div>

          {/* Rate */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Price Rate (₹ per hour)</label>
            <input
              type="number"
              disabled={submitting}
              placeholder="e.g. 500"
              className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition ${
                errors.price ? 'border-red-300' : 'border-gray-200'
              }`}
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.price.message}</p>
            )}
          </div>
        </div>

        {/* Location SELECT */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Location City</label>
          <select
            disabled={submitting}
            className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition ${
              errors.location ? 'border-red-300' : 'border-gray-200'
            }`}
            {...register('location')}
          >
            <option value="">Select location city</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Chennai">Chennai</option>
            <option value="Mumbai">Mumbai</option>
          </select>
          {errors.location && (
            <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.location.message}</p>
          )}
        </div>

        {/* Biography */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Description / About Me</label>
          <textarea
            rows={4}
            disabled={submitting}
            placeholder="Tell clients about your expertise, background, qualifications, and services offered..."
            className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition ${
              errors.description ? 'border-red-300' : 'border-gray-200'
            }`}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.description.message}</p>
          )}
        </div>

        {/* Save CTA */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving Profile...' : 'Save Profile Bio'}
          </button>
        </div>
      </form>
    </div>
  );
}
