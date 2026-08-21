'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { LogOut, User as UserIcon, Calendar, Briefcase, LayoutDashboard, Menu, X, ChevronRight, Home, Search, Sparkles, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const isCustomerOrGuest = !user || user.role === 'customer';

  return (
    <>
      <nav className="border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90 dark:bg-neutral-900/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            
            {/* Mobile Header: Left Hamburger Toggle */}
            <div className="flex md:hidden flex-1 justify-start">
              <button
                onClick={() => setMobileMenuOpen(true)}
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-indigo-600 focus:outline-none transition"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-center md:justify-start">
              <Link 
                href={user?.role === 'provider' ? '/dashboard/provider' : '/'} 
                className="flex items-center gap-2.5 group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black dark:bg-neutral-800 text-white group-hover:bg-neutral-800 transition duration-200">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 transition duration-200">
                  vitaran<span className="text-indigo-605 font-bold">.</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6 ml-auto">
              {/* Only show Search directory to Guests or Customers */}
              {isCustomerOrGuest && (
                <Link href="/providers" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-605 transition">
                  Find Services
                </Link>
              )}

              {user ? (
                <>
                  {user.role === 'provider' ? (
                    <>
                      <Link
                        href="/dashboard/provider"
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-605 flex items-center space-x-1 transition"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile/edit"
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-605 flex items-center space-x-1 transition"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/dashboard/customer"
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-605 flex items-center space-x-1 transition"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>My Bookings</span>
                      </Link>
                    </>
                  )}

                  {/* User detail, theme toggle and logout */}
                  <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-neutral-800 pl-6">
                    <button
                      onClick={toggleTheme}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-450 transition rounded-full hover:bg-gray-50 dark:hover:bg-neutral-800"
                      title="Toggle Theme"
                    >
                      {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span>{user.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-605 dark:text-gray-400 uppercase tracking-wide">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-gray-50 dark:hover:bg-neutral-800"
                      title="Log Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-neutral-800 pl-6">
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-450 transition rounded-full hover:bg-gray-50 dark:hover:bg-neutral-800"
                    title="Toggle Theme"
                  >
                    {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-605 transition">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-md bg-black dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Header: Right Profile Link */}
            <div className="flex md:hidden flex-1 justify-end items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-yellow-500 transition rounded-full hover:bg-gray-50 dark:hover:bg-neutral-800"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
              </button>
              {user ? (
                <Link
                  href={user.role === 'provider' ? '/dashboard/provider' : '/dashboard/customer'}
                  className="p-2 text-gray-550 dark:text-gray-400 hover:text-indigo-605 transition"
                >
                  <UserIcon className="h-6 w-6" />
                </Link>
              ) : (
                <Link href="/login" className="text-sm font-semibold text-indigo-605 dark:text-indigo-400 hover:text-indigo-500 transition px-2">
                  Sign In
                </Link>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Sliding Sidebar Drawer */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Dark Backdrop */}
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        />

        {/* Sliding Panel */}
        <div className={`absolute inset-y-0 left-0 w-80 max-w-xs bg-white dark:bg-neutral-900 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-black dark:bg-neutral-800 text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-base font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                  vitaran<span className="text-indigo-605 font-bold">.</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-600 dark:hover:text-gray-400 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Links List */}
            <div className="py-4 px-3 space-y-1">
              {isCustomerOrGuest && (
                <>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-gray-750 dark:text-gray-305 hover:bg-indigo-50 dark:hover:bg-neutral-800 hover:text-indigo-605 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-gray-400" />
                      <span>Home Page</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>

                  <Link
                    href="/providers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-gray-755 dark:text-gray-305 hover:bg-indigo-50 dark:hover:bg-neutral-800 hover:text-indigo-605 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span>Find Services</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                </>
              )}

              {user && (
                <>
                  {user.role === 'provider' ? (
                    <>
                      <Link
                        href="/dashboard/provider"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-gray-755 dark:text-gray-305 hover:bg-indigo-50 dark:hover:bg-neutral-800 hover:text-indigo-605 transition"
                      >
                        <div className="flex items-center gap-3">
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Provider Dashboard</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </Link>
                      <Link
                        href="/profile/edit"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-gray-755 dark:text-gray-305 hover:bg-indigo-50 dark:hover:bg-neutral-800 hover:text-indigo-605 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-4 h-4" />
                          <span>Configure Profile</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/dashboard/customer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-gray-755 dark:text-gray-305 hover:bg-indigo-50 dark:hover:bg-neutral-800 hover:text-indigo-605 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4" />
                        <span>My Service Bookings</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="border-t border-gray-100 dark:border-neutral-800 p-6 bg-gray-50/50 dark:bg-neutral-900/50">
            {user ? (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-neutral-850 text-gray-605 dark:text-gray-400 uppercase mt-0.5">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-3 py-2 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-850 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-center text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
