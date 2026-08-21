'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Booking, BookingStatusType, ProviderProfile } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, MapPin, Clock, FileText, Loader2, Check, X, CheckSquare, Briefcase, IndianRupee, TrendingUp, Inbox, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ProviderDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom Modal States
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch bookings
      const bookingsRes = await apiClient.get<Booking[]>('/bookings');
      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data);
      } else {
        setError(bookingsRes.message || 'Failed to fetch your bookings list.');
      }

      // Fetch provider profile for rate/pricing stats
      const profileRes = await apiClient.get<ProviderProfile>('/providers/profile/me');
      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatusType) => {
    try {
      const res = await apiClient.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.success) {
        fetchDashboardData();
      } else {
        alert(res.message || 'Failed to update booking status.');
      }
    } catch {
      alert('An error occurred. Please try again.');
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      const res = await apiClient.put(`/bookings/${bookingToCancel}/status`, { status: 'cancelled' });
      if (res.success) {
        fetchDashboardData();
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user || user.role !== 'provider') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500">You must be logged in as a provider to view this page.</p>
        <Link
          href="/login"
          className="inline-flex justify-center rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Segment Bookings
  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const activeBookings = bookings.filter((b) => b.status === 'accepted');
  const finishedBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled');
  const completedJobs = bookings.filter((b) => b.status === 'completed');

  // Business Analytics calculations
  const hourlyRate = profile?.price || 0;
  const estimatedEarnings = completedJobs.length * hourlyRate;

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

  return (
    <div className="bg-neutral-50/50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Partner Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Partner Dashboard</span>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 mt-1">Hello, {user.name}</h1>
            <p className="text-neutral-500 text-sm">Manage your schedule, earnings, and incoming customer requests.</p>
          </div>
          <Link
            href="/profile/edit"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 shadow-sm transition"
          >
            <Briefcase className="w-4 h-4" />
            Edit Service Profile
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Business Stats Cards Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Est. Earnings</p>
              <h3 className="text-2xl font-black text-neutral-900 mt-1 flex items-center">
                <IndianRupee className="w-5 h-5 text-neutral-400" />
                {estimatedEarnings}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Completed Jobs</p>
              <h3 className="text-2xl font-black text-neutral-900 mt-1">{completedJobs.length}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active Jobs</p>
              <h3 className="text-2xl font-black text-neutral-900 mt-1">{activeBookings.length}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">New Requests</p>
              <h3 className="text-2xl font-black text-neutral-900 mt-1">{pendingRequests.length}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
              <Inbox className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Workspace (Pending and Active jobs) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Pending Proposals Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <span>Incoming Customer Requests</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-bold">
                  {pendingRequests.length}
                </span>
              </h2>
              {pendingRequests.length === 0 ? (
                <div className="bg-white border border-neutral-100 rounded-xl p-8 text-center text-sm text-neutral-500">
                  No new service requests currently.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((booking) => (
                    <div key={booking._id} className="bg-white border border-neutral-100 rounded-xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-xs font-bold text-neutral-400">Client Name</span>
                          <h4 className="font-bold text-neutral-900 text-base">{booking.customerId.name}</h4>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                      
                      <div className="text-sm font-semibold text-neutral-800 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100">
                        {booking.service}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{formatDate(booking.bookingDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{booking.preferredTime}</span>
                        </div>
                        <div className="flex items-start gap-1.5 sm:col-span-2">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{booking.address}</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="text-xs text-neutral-500 border-t border-neutral-50 pt-2 flex gap-1.5 items-start">
                          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>&ldquo;{booking.notes}&rdquo;</span>
                        </div>
                      )}

                      <div className="pt-4 border-t border-neutral-50 flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'rejected')}
                          className="flex items-center gap-1 bg-red-50 text-red-650 hover:bg-red-100 px-4 py-2 rounded-lg text-xs font-semibold transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline Request
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'accepted')}
                          className="flex items-center gap-1 bg-black text-white hover:bg-neutral-800 px-4 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Assignments Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <span>Active Assignments</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {activeBookings.length}
                </span>
              </h2>
              {activeBookings.length === 0 ? (
                <div className="bg-white border border-neutral-100 rounded-xl p-8 text-center text-sm text-neutral-500">
                  No active jobs scheduled.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <div key={booking._id} className="bg-white border border-neutral-100 rounded-xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-xs font-bold text-neutral-400">Client Name</span>
                          <h4 className="font-bold text-neutral-900 text-base">{booking.customerId.name}</h4>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="text-sm font-semibold text-neutral-800 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100">
                        {booking.service}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{formatDate(booking.bookingDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{booking.preferredTime}</span>
                        </div>
                        <div className="flex items-start gap-1.5 sm:col-span-2">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{booking.address}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-neutral-50 flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setBookingToCancel(booking._id);
                            setConfirmCancelOpen(true);
                          }}
                          className="flex items-center justify-center gap-1 bg-red-50 text-red-655 hover:bg-red-100 px-4 py-2.5 rounded-lg text-xs font-semibold transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel Job
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, 'completed')}
                          className="flex-grow flex items-center justify-center gap-1.5 bg-black text-white hover:bg-neutral-800 py-2.5 rounded-lg text-xs font-semibold transition shadow-sm"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          Mark Completed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Panel (Job History List) */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-neutral-900">Recent Job History</h2>
            {finishedBookings.length === 0 ? (
              <div className="bg-white border border-neutral-100 rounded-xl p-8 text-center text-sm text-neutral-500">
                No past records.
              </div>
            ) : (
              <div className="space-y-4">
                {finishedBookings.map((booking) => (
                  <div key={booking._id} className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-neutral-400">{formatDate(booking.bookingDate)}</span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-xs font-bold text-neutral-850 truncate">{booking.service}</p>
                    <div className="flex justify-between items-center text-[10px] text-neutral-400">
                      <span>Client: {booking.customerId.name}</span>
                      {booking.status === 'completed' && (
                        <span className="font-bold text-neutral-800 flex items-center">
                          <IndianRupee className="w-3 h-3" />
                          {hourlyRate} earned
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-neutral-100">
              
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start gap-4">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left space-y-1.5">
                    <h3 className="text-lg font-black leading-6 text-neutral-900">
                      Cancel Active Assignment
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Are you sure you want to cancel this accepted service request? This will immediately remove the job from your schedule and notify the customer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50/50 border-t border-neutral-100 px-4 py-3.5 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  className="inline-flex w-full justify-center rounded-lg bg-red-655 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition shadow-sm sm:w-auto"
                >
                  Yes, Cancel Assignment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmCancelOpen(false);
                    setBookingToCancel(null);
                  }}
                  className="mt-3 inline-flex w-full justify-center rounded-lg bg-white border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition sm:mt-0 sm:w-auto"
                >
                  No, Keep Assignment
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
