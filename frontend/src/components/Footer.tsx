export default function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            &copy; {new Date().getFullYear()} Vitaran Service Booking Platform. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400 dark:text-neutral-500">
            <span className="hover:text-indigo-600 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-indigo-600 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-indigo-600 transition cursor-pointer">Contact Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
