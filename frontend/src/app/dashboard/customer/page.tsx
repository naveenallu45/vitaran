'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Booking, ProviderProfile } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { Calendar, MapPin, Clock, FileText, Loader2, AlertTriangle, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CustomerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom Modal States
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const fetchBookingsAndFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<Booking[]>('/bookings');
      if (res.success && res.data) {
        setBookings(res.data);
      } else {
        setError(res.message || 'Failed to fetch your bookings list.');
      }

      // Fetch favorites
      const favRes = await apiClient.get<ProviderProfile[]>('/providers/favorites/me');
      if (favRes.success && favRes.data) {
        setFavorites(favRes.data);
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookingsAndFavorites();
    }
  }, [user]);

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      const res = await apiClient.delete(`/bookings/${bookingToCancel}`);
      if (res.success) {
        fetchBookingsAndFavorites();
      } else {
        alert(res.message || 'Failed to cancel the booking.');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setConfirmCancelOpen(false);
      setBookingToCancel(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  if (!user || user.role !== 'customer') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-555">You must be logged in as a customer to view this page.</p>
        <Link
          href="/login"
          className="inline-flex justify-center rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Filter bookings into categories
  const upcomingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const pastBookings = bookings.filter((b) => b.status === 'rejected' || b.status === 'cancelled');

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const BookingList = ({ list }: { list: Booking[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {list.map((booking) => (
        <div
          key={booking._id}
          className="bg-white border border-gray-100 dark:border-neutral-800 dark:bg-neutral-900 rounded-xl p-6 hover:shadow-sm transition space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            {/* Header info */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">Provider</span>
                <h4 className="text-base font-bold text-gray-900 dark:text-neutral-250">{booking.providerId.name}</h4>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            {/* Service & Details */}
            <div className="text-sm font-bold text-neutral-800 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-850 px-3.5 py-2 rounded-lg border border-neutral-100/50 dark:border-neutral-805">
              {booking.service}
            </div>

            <div className="space-y-2 pt-2 text-xs text-gray-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-neutral-500 flex-shrink-0" />
                <span>{formatDate(booking.bookingDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 dark:text-neutral-500 flex-shrink-0" />
                <span>{booking.preferredTime}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 dark:text-neutral-500 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{booking.address}</span>
              </div>
              {booking.notes && (
                <div className="flex items-start gap-2 pt-2 border-t border-gray-50 dark:border-neutral-800 mt-2 text-xs text-gray-500 dark:text-neutral-405">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>&ldquo;{booking.notes}&rdquo;</span>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation CTA */}
          {(booking.status === 'pending' || booking.status === 'accepted') && (
            <div className="pt-4 border-t border-gray-50 dark:border-neutral-800 mt-4 flex justify-end">
              <button
                onClick={() => {
                  setBookingToCancel(booking._id);
                  setConfirmCancelOpen(true);
                }}
                className="rounded-lg border border-red-200 text-red-655 px-4 py-2 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100">My Bookings Dashboard</h1>
        <p className="text-gray-500 dark:text-neutral-400 mt-1">Manage and track your active and past service requests.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Main dashboard content grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Bookings workflow */}
        <div className="lg:col-span-2 space-y-12">
          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="You haven't requested any service bookings yet. Browse our top providers and book today!"
              action={
                <Link
                  href="/providers"
                  className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition"
                >
                  Browse Providers
                </Link>
              }
            />
          ) : (
            <>
              {/* Active / Upcoming Bookings */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100 border-b border-gray-100 dark:border-neutral-800 pb-2">Active Bookings</h2>
                {upcomingBookings.length === 0 ? (
                  <p className="text-sm text-gray-500">No active bookings scheduled.</p>
                ) : (
                  <BookingList list={upcomingBookings} />
                )}
              </div>

              {/* Completed Bookings */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100 border-b border-gray-100 dark:border-neutral-800 pb-2">Completed Bookings</h2>
                {completedBookings.length === 0 ? (
                  <p className="text-sm text-gray-500">No completed bookings yet.</p>
                ) : (
                  <BookingList list={completedBookings} />
                )}
              </div>

              {/* Cancelled Bookings */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-neutral-100 border-b border-gray-100 dark:border-neutral-800 pb-2">Cancelled & Rejected</h2>
                {pastBookings.length === 0 ? (
                  <p className="text-sm text-gray-550">No cancelled or rejected bookings.</p>
                ) : (
                  <BookingList list={pastBookings} />
                )}
              </div>
            </>
          )}
        </div>

        {/* Favorites sidebar panel */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            Favorite Providers
          </h3>

          {favorites.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-2xl text-center text-xs text-neutral-450 dark:text-neutral-500">
              No favorited providers yet. Click the heart icon on a provider profile to save them here!
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((profile) => (
                <div 
                  key={profile._id} 
                  className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-805 p-4 rounded-xl flex items-center gap-3 shadow-sm"
                >
                  <Image
                    src={profile.profileImage}
                    alt={profile.userId.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-12 h-12 rounded-full object-cover border border-neutral-100 dark:border-neutral-800 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-grow">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">{profile.userId.name}</h4>
                    <span className="text-[10px] text-indigo-605 font-bold uppercase tracking-wider">
                      {profile.category}
                    </span>
                  </div>
                  <Link
                    href={`/providers/${profile._id}`}
                    className="text-xs bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 font-bold px-3 py-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Premium Cancellation Modal */}
      {confirmCancelOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setConfirmCancelOpen(false);
              setBookingToCancel(null);
            }}
          />

          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-neutral-100 dark:border-neutral-800">
              
              <div className="bg-white dark:bg-neutral-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start gap-4">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-655 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left space-y-1.5">
                    <h3 className="text-lg font-black leading-6 text-neutral-900 dark:text-white">
                      Cancel Service Booking
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Are you sure you want to cancel this booking? This action will notify the service provider and cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50/50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 px-4 py-3.5 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  className="inline-flex w-full justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition shadow-sm sm:w-auto"
                >
                  Yes, Cancel Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmCancelOpen(false);
                    setBookingToCancel(null);
                  }}
                  className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-55 transition sm:mt-0 sm:w-auto"
                >
                  No, Keep Booking
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
