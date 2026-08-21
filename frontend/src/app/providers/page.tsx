'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { ProviderProfile } from '@/types';
import ProviderCard from '@/components/ProviderCard';
import { ProviderCardSkeleton } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import { Search, MapPin, Grid, IndianRupee, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const CATEGORIES = [
  { id: 'electrician', name: 'Electrician' },
  { id: 'plumber', name: 'Plumber' },
  { id: 'tutor', name: 'Tutor' },
  { id: 'photographer', name: 'Photographer' },
  { id: 'home_cleaning', name: 'Home Cleaning' },
  { id: 'ac_technician', name: 'AC Technician' },
  { id: 'computer_repair', name: 'Computer Repair' },
];

const LOCATIONS = ['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai'];

const PRICE_RANGES = [
  { id: 'below_500', name: 'Below ₹500' },
  { id: '500_1000', name: '₹500 - ₹1,000' },
  { id: 'above_1000', name: 'Above ₹1,000' },
];

function ProvidersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [profiles, setProfiles] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1') || 1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect guard
  useEffect(() => {
    if (!authLoading && user?.role === 'provider') {
      router.replace('/dashboard/provider');
    }
  }, [user, authLoading, router]);

  // Sync state from query parameters on load
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setLocation(searchParams.get('location') || '');
    setPriceRange(searchParams.get('priceRange') || '');
    setPage(parseInt(searchParams.get('page') || '1') || 1);
  }, [searchParams]);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (searchTerm) query.append('search', searchTerm);
        if (category) query.append('category', category);
        if (location) query.append('location', location);
        if (priceRange) query.append('priceRange', priceRange);
        query.append('page', page.toString());
        query.append('limit', '8');

        const res = await apiClient.get<{ profiles: ProviderProfile[]; pagination: { pages: number } }>(
          `/providers?${query.toString()}`
        );

        if (res.success && res.data) {
          setProfiles(res.data.profiles);
          setTotalPages(res.data.pagination.pages || 1);
        } else {
          setError(res.message || 'Failed to fetch provider listings.');
        }
      } catch {
        setError('A network error occurred. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [searchTerm, category, location, priceRange, page]);

  if (authLoading || (user && user.role === 'provider')) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  // Handle setting updates inside URL search parameters
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset pagination to page 1 on filter
    router.push(`/providers?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setLocation('');
    setPriceRange('');
    setPage(1);
    router.push('/providers');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center sm:text-left space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-905 dark:text-neutral-100">Find Service Providers</h1>
        <p className="text-gray-500 dark:text-neutral-400">Discover and book trusted local experts instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-6 rounded-xl space-y-6 lg:sticky lg:top-24">
          <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-neutral-800">
            <h2 className="font-bold text-gray-900 dark:text-neutral-100">Filters</h2>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-indigo-605 dark:text-indigo-400 hover:text-indigo-500 transition"
            >
              Clear All
            </button>
          </div>

          {/* Search bar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-neutral-400 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Name or keyword..."
                value={searchTerm}
                onChange={(e) => updateQuery('search', e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 dark:text-white"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-neutral-400 uppercase tracking-wider">Category</label>
            <div className="relative">
              <Grid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
              <select
                value={category}
                onChange={(e) => updateQuery('category', e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-9 pr-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 dark:text-white"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-neutral-400 uppercase tracking-wider">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
              <select
                value={location}
                onChange={(e) => updateQuery('location', e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-9 pr-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 dark:text-white"
              >
                <option value="">All Locations</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-neutral-400 uppercase tracking-wider">Price Rate</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
              <select
                value={priceRange}
                onChange={(e) => updateQuery('priceRange', e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-9 pr-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 dark:text-white"
              >
                <option value="">All Prices</option>
                {PRICE_RANGES.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Listings Grid */}
        <section className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <ProviderCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          ) : profiles.length === 0 ? (
            <EmptyState
              title="No providers found"
              description="Try adjusting your filter search criteria or keyword inputs to find matching providers."
              action={
                <button
                  onClick={handleClearFilters}
                  className="rounded-lg bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition shadow-sm"
                >
                  Reset All Filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profiles.map((profile) => (
                  <ProviderCard key={profile._id} profile={profile} />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-6">
                  <button
                    onClick={() => {
                      const newPage = Math.max(1, page - 1);
                      updateQuery('page', newPage.toString());
                    }}
                    disabled={page === 1}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-sm transition disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-505 dark:text-neutral-400 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => {
                      const newPage = Math.min(totalPages, page + 1);
                      updateQuery('page', newPage.toString());
                    }}
                    disabled={page === totalPages}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-55 dark:hover:bg-neutral-800 shadow-sm transition disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <ProvidersContent />
    </Suspense>
  );
}
