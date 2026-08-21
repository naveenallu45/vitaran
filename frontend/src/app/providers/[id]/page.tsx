'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { ProviderProfile, Booking, Review } from '@/types';
import { Loader2, ArrowLeft, ShieldCheck, X, Star, Heart, MessageSquare, AlertCircle } from 'lucide-react';
import Image from 'next/image';

// Zod validation for booking form
const bookingFormSchema = z.object({
  service: z.string().min(3, 'Service description must be at least 3 characters'),
  bookingDate: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date >= today;
  }, { message: 'Date must be today or in the future' }),
  preferredTime: z.string().min(1, 'Preferred time is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function ProviderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Review & Favorites states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [hasCompletedBooking, setHasCompletedBooking] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
  });

  // Fetch provider profiles and reviews
  const fetchData = async (providerId: string | string[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ProviderProfile>(`/providers/${providerId}`);
      if (res.success && res.data) {
        setProfile(res.data);
        const reviewsRes = await apiClient.get<Review[]>(`/providers/${res.data.userId._id}/reviews`);
        if (reviewsRes.success && reviewsRes.data) {
          setReviews(reviewsRes.data);
        }
      } else {
        setError(res.message || 'Provider profile not found.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Check if current user has a completed booking to enable reviews
  useEffect(() => {
    if (user && user.role === 'customer' && profile) {
      apiClient.get<Booking[]>('/bookings').then((res) => {
        if (res.success && res.data) {
          const hasCompleted = res.data.some(
            (b) => b.providerId._id === profile.userId._id && b.status === 'completed'
          );
          setHasCompletedBooking(hasCompleted);
        }
      });

      // Fetch customer favorites to see if this provider is favorited
      apiClient.get<ProviderProfile[]>('/providers/favorites/me').then((res) => {
        if (res.success && res.data) {
          const favorited = res.data.some(
            (p) => p.userId._id === profile.userId._id
          );
          setIsFavorited(favorited);
        }
      });
    }
  }, [user, profile]);

  const handleToggleFavorite = async () => {
    if (!profile) return;
    try {
      const res = await apiClient.post<{ isFavorited: boolean }>(`/providers/${profile.userId._id}/favorite`, {});
      if (res.success && res.data) {
        setIsFavorited(res.data.isFavorited);
      }
    } catch {
      alert('Failed to toggle favorite status.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const res = await apiClient.post<Review>(`/providers/${profile.userId._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.success && res.data) {
        setReviewComment('');
        setReviewRating(5);
        // Refresh reviews and profile aggregates
        if (id) fetchData(id);
      } else {
        setReviewError(res.message || 'Failed to submit review.');
      }
    } catch {
      setReviewError('An error occurred. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const onBookSubmit = async (values: BookingFormValues) => {
    if (!profile) return;
    setBookingError(null);
    setBookingSubmitting(true);
    try {
      const res = await apiClient.post('/bookings', {
        providerId: profile.userId._id,
        ...values,
      });

      if (res.success) {
        setIsModalOpen(false);
        reset();
        router.push('/dashboard/customer');
      } else {
        setBookingError(res.message || 'Failed to submit booking request.');
      }
    } catch {
      setBookingError('An error occurred. Please check connection.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (authLoading || (user && user.role === 'provider') || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Provider Profile Not Found</h2>
        <p className="text-gray-500 dark:text-neutral-400">{error || 'The profile details might have been removed or does not exist.'}</p>
        <Link
          href="/providers"
          className="inline-flex items-center text-sm font-semibold text-indigo-605 hover:text-indigo-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listings
        </Link>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    electrician: 'Electrician',
    plumber: 'Plumber',
    tutor: 'Tutor',
    photographer: 'Photographer',
    home_cleaning: 'Home Cleaning',
    ac_technician: 'AC Technician',
    computer_repair: 'Computer Repair',
  };

  const isOwnProfile = user && user.id === profile.userId._id;
  const isProviderUser = user && user.role === 'provider';

  // Compute rating breakdown graphs
  const ratingDistribution = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 stars
  reviews.forEach((r) => {
    const starIdx = Math.floor(r.rating) - 1;
    if (starIdx >= 0 && starIdx < 5) ratingDistribution[starIdx]++;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/providers"
          className="inline-flex items-center text-sm font-semibold text-gray-500 dark:text-neutral-400 hover:text-indigo-605 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listings
        </Link>
      </div>

      {/* Main Details Panel */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-3">
        
        {/* Profile Image & Quick Specs */}
        <div className="bg-gray-50/50 dark:bg-neutral-900/50 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-neutral-800">
          <div className="relative">
            <Image
              src={profile.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop'}
              alt={profile.userId.name}
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-neutral-800 shadow-sm mb-6"
              unoptimized
            />
            {user && user.role === 'customer' && (
              <button
                onClick={handleToggleFavorite}
                className="absolute bottom-6 right-0 p-2 bg-white dark:bg-neutral-800 rounded-full shadow border border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
                title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-neutral-400 dark:text-neutral-500'}`} />
              </button>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-100">{profile.userId.name}</h2>
          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-750 dark:text-neutral-305 mt-2 uppercase tracking-wide">
            {categoryLabels[profile.category] || profile.category}
          </span>

          {/* Aggregated Star Rating Display */}
          <div className="flex items-center gap-1.5 justify-center mt-3 bg-neutral-100 dark:bg-neutral-850 px-3 py-1 rounded-full text-xs">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-extrabold text-neutral-805 dark:text-neutral-200">{profile.averageRating || 0}</span>
            <span className="text-neutral-400">({profile.totalReviews || 0} Reviews)</span>
          </div>

          <div className="mt-8 space-y-3 w-full text-sm text-gray-600 dark:text-neutral-400 text-left">
            <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
              <span className="text-gray-405 dark:text-neutral-500">Experience</span>
              <span className="font-semibold text-gray-900 dark:text-neutral-200">{profile.experience} Years</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
              <span className="text-gray-405 dark:text-neutral-500">Location</span>
              <span className="font-semibold text-gray-900 dark:text-neutral-200">{profile.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-405 dark:text-neutral-500">Pricing</span>
              <span className="font-semibold text-gray-900 dark:text-neutral-200">₹{profile.price} / hour</span>
            </div>
          </div>
        </div>

        {/* Biography & Description */}
        <div className="md:col-span-2 p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-neutral-100">About Provider</h3>
            <p className="text-gray-605 dark:text-neutral-400 leading-relaxed text-sm whitespace-pre-line">{profile.description}</p>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-neutral-800 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-neutral-500">
              <ShieldCheck className="w-5 h-5 text-indigo-605 flex-shrink-0" />
              <span>Identity Verified & Safety Checked</span>
            </div>

            {/* Booking action button */}
            {isOwnProfile ? (
              <span className="text-xs text-gray-500 font-medium">This is your public provider profile page.</span>
            ) : isProviderUser ? (
              <span className="text-xs text-gray-500 font-medium">Service Providers cannot book other service providers.</span>
            ) : user ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition shadow-sm"
              >
                Book Service
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition shadow-sm"
              >
                Sign In to Book Service
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Panel */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-8 shadow-sm space-y-8">
        <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-605" />
          Customer Feedback
        </h3>

        {/* Rating Metrics & Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-neutral-50/50 dark:bg-neutral-850/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
          <div className="text-center space-y-1">
            <h4 className="text-4xl font-black text-neutral-900 dark:text-neutral-100">{profile.averageRating || 0}</h4>
            <div className="flex justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(profile.averageRating || 0)
                      ? 'text-yellow-500 fill-current'
                      : 'text-neutral-200 dark:text-neutral-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-1 font-semibold">
              Based on {profile.totalReviews || 0} reviews
            </p>
          </div>

          {/* Star progress bars */}
          <div className="md:col-span-2 space-y-1.5 text-xs">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars - 1] || 0;
              const total = reviews.length || 1;
              const pct = (count / total) * 100;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-3 text-neutral-505 dark:text-neutral-400 font-bold">{stars}</span>
                  <Star className="w-3.5 h-3.5 text-neutral-350 fill-current flex-shrink-0" />
                  <div className="flex-grow h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-4 text-right text-neutral-400 font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Reviews list */}
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-neutral-450 dark:text-neutral-500 text-sm">
            No reviews submitted for this provider yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 space-y-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="pt-6 first:pt-0 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-neutral-800 dark:text-neutral-250">{rev.customerId.name}</span>
                  <span className="text-neutral-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'text-yellow-500 fill-current' : 'text-neutral-200 dark:text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-neutral-605 dark:text-neutral-450 italic leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Submission Form (Visible only to authenticated customers with completed bookings) */}
        {hasCompletedBooking && (
          <form onSubmit={handleReviewSubmit} className="border-t border-neutral-100 dark:border-neutral-800 pt-8 space-y-4">
            <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Write a Review</h4>
            {reviewError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{reviewError}</span>
              </div>
            )}
            
            {/* Stars Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">Rating stars</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    className="p-1 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${s <= reviewRating ? 'text-yellow-500 fill-current' : 'text-neutral-200 dark:text-neutral-700'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">Review Message</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your service experience..."
                rows={3}
                required
                className="block w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-605/20 focus:border-indigo-605 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="inline-flex justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black px-5 py-2 text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition disabled:opacity-50"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>

      {/* Booking Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg border border-gray-100 dark:border-neutral-800 shadow-xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-neutral-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Book Service Request</h3>
                <p className="text-xs text-gray-500">Provide schedule details for {profile.userId.name}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-650 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleSubmit(onBookSubmit)} className="p-6 space-y-4">
              {bookingError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">
                  {bookingError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Service Task Description</label>
                <input
                  type="text"
                  placeholder="e.g. Fixing kitchen lights, tutoring math"
                  className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 bg-white dark:bg-neutral-950 dark:text-white transition ${
                    errors.service ? 'border-red-300' : 'border-gray-200 dark:border-neutral-800'
                  }`}
                  {...register('service')}
                />
                {errors.service && (
                  <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.service.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Booking Date</label>
                  <input
                    type="date"
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 bg-white dark:bg-neutral-950 dark:text-white transition ${
                      errors.bookingDate ? 'border-red-300' : 'border-gray-200 dark:border-neutral-800'
                    }`}
                    {...register('bookingDate')}
                  />
                  {errors.bookingDate && (
                    <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.bookingDate.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Preferred Time Slot</label>
                  <select
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 bg-white dark:bg-neutral-950 dark:text-white transition ${
                      errors.preferredTime ? 'border-red-300' : 'border-gray-200 dark:border-neutral-800'
                    }`}
                    {...register('preferredTime')}
                  >
                    <option value="">Select Slot</option>
                    <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  </select>
                  {errors.preferredTime && (
                    <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.preferredTime.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Service Address</label>
                <textarea
                  placeholder="Street details, building number, and city..."
                  rows={2}
                  className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 bg-white dark:bg-neutral-950 dark:text-white transition ${
                    errors.address ? 'border-red-300' : 'border-gray-200 dark:border-neutral-800'
                  }`}
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Optional Notes</label>
                <textarea
                  placeholder="Any specific requests or requirements..."
                  rows={2}
                  className="block w-full rounded-lg border border-gray-200 dark:border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 bg-white dark:bg-neutral-950 dark:text-white transition"
                  {...register('notes')}
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-200 dark:border-neutral-800 px-4 py-2 text-sm font-semibold text-gray-750 dark:text-neutral-300 hover:bg-gray-55 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="rounded-lg bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition disabled:opacity-50 inline-flex items-center"
                >
                  {bookingSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
