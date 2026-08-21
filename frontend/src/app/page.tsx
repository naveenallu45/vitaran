'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  Wrench, 
  GraduationCap, 
  Camera, 
  Home as HomeIcon, 
  Tv, 
  Laptop, 
  ArrowRight,
  Shield,
  Star,
  Search,
  MapPin
} from 'lucide-react';

const CATEGORIES = [
  { id: 'electrician', name: 'Electricians', icon: Wrench, bg: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' },
  { id: 'plumber', name: 'Plumbers', icon: Wrench, bg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' },
  { id: 'tutor', name: 'Home Tutors', icon: GraduationCap, bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' },
  { id: 'photographer', name: 'Photographers', icon: Camera, bg: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' },
  { id: 'home_cleaning', name: 'Home Cleaning', icon: HomeIcon, bg: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400' },
  { id: 'ac_technician', name: 'AC Technicians', icon: Tv, bg: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400' },
  { id: 'computer_repair', name: 'PC & Laptop Repair', icon: Laptop, bg: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' },
];

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [city, setCity] = useState('Hyderabad');

  useEffect(() => {
    if (!loading && user?.role === 'provider') {
      router.replace('/dashboard/provider');
    }
  }, [user, loading, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchVal) query.append('search', searchVal);
    if (city) query.append('location', city);
    router.push(`/providers?${query.toString()}`);
  };

  if (loading || (user && user.role === 'provider')) {
    return null; // Don't flash homepage if logging in / provider redirecting
  }

  return (
    <div className="bg-[#FCFCFC] dark:bg-neutral-950 min-h-screen">
      
      {/* Sleek Hero Banner (Dark High Contrast Section to break the white) */}
      <section className="bg-[#0F1219] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,58,138,0.2),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-indigo-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              India&apos;s Premium Home Services Platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Home services, <br />
              <span className="text-indigo-400">on demand.</span>
            </h1>
            <p className="text-neutral-400 text-base sm:text-lg max-w-xl">
              Get top-rated, background-verified professionals for cleanings, repairs, and tutoring in minutes.
            </p>

            {/* Centered Search/Filter Card */}
            <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-neutral-900 p-2 rounded-xl shadow-lg flex flex-col md:flex-row gap-2 max-w-2xl text-neutral-900 dark:text-white mt-8 border dark:border-neutral-800">
              <div className="flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                <MapPin className="w-5 h-5 text-neutral-400" />
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="font-semibold focus:outline-none bg-transparent text-sm cursor-pointer dark:text-white dark:bg-neutral-900"
                >
                  <option value="Hyderabad" className="dark:bg-neutral-900">Hyderabad</option>
                  <option value="Bangalore" className="dark:bg-neutral-900">Bangalore</option>
                  <option value="Chennai" className="dark:bg-neutral-900">Chennai</option>
                  <option value="Mumbai" className="dark:bg-neutral-900">Mumbai</option>
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 flex-grow">
                <Search className="w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search for 'electrician', 'cleaning'..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full text-sm focus:outline-none placeholder-neutral-400 bg-transparent font-medium dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="bg-black dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white font-semibold text-sm px-6 py-3 rounded-lg transition duration-150"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Urban Company Style Service Grid */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">What service do you need?</h2>
            <p className="text-neutral-505 dark:text-neutral-400 text-sm mt-1">Select a category to view top verified professionals near you.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/providers?category=${cat.id}`}
                  className="group flex flex-col items-center text-center p-4 bg-white dark:bg-neutral-900 border border-neutral-50 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-sm transition cursor-pointer rounded-xl"
                >
                  <div className={`w-14 h-14 rounded-full ${cat.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition duration-150`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white leading-tight">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Verification Highlights */}
      <section className="bg-neutral-50 dark:bg-neutral-900/30 border-y border-neutral-100 dark:border-neutral-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4 items-start bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Verified Professionals</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Every partner undergoes background checks and quality screening.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">4.8+ Rated Experts</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Read honest feedback from verified users before booking.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Transparent Pricing</h3>
              <p className="text-xs text-neutral-555 dark:text-neutral-400 mt-1">Standard hourly rates. No hidden fees or surprise charges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Call to Action */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <div className="bg-[#1C1F2E] rounded-3xl text-white p-8 sm:p-12 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
          <h2 className="text-2xl sm:text-3xl font-black">Want to join as a partner?</h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto">
            Become a service provider on Vitaran. Choose your working hours, serve clients, and grow your service business.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-neutral-900 hover:bg-neutral-100 transition shadow-sm"
            >
              Register as Provider
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
