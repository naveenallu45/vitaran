import Link from 'next/link';
import Image from 'next/image';
import { ProviderProfile } from '@/types';
import { MapPin, Briefcase, IndianRupee } from 'lucide-react';

interface ProviderCardProps {
  profile: ProviderProfile;
}

const CATEGORY_LABELS: Record<string, string> = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  tutor: 'Tutor',
  photographer: 'Photographer',
  home_cleaning: 'Home Cleaning',
  ac_technician: 'AC Technician',
  computer_repair: 'Computer Repair',
};

export default function ProviderCard({ profile }: ProviderCardProps) {
  const categoryLabel = CATEGORY_LABELS[profile.category] || profile.category;

  return (
    <div className="flex flex-col overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:shadow-md transition duration-200">
      {/* Provider Header Details */}
      <div className="flex items-center gap-4 p-5">
        <Image
          src={profile.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop'}
          alt={profile.userId.name}
          width={64}
          height={64}
          unoptimized
          className="w-16 h-16 rounded-full object-cover border border-neutral-100 dark:border-neutral-800 flex-shrink-0"
        />
        <div className="min-w-0">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate">{profile.userId.name}</h3>
          <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-md bg-neutral-105 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 mt-1 uppercase tracking-wide">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Description & Quick Stats */}
      <div className="px-5 pb-5 flex-grow flex flex-col justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-4">{profile.description}</p>
        
        <div className="space-y-2 border-t border-neutral-50 dark:border-neutral-800 pt-4 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
            <span>{profile.experience} Years Experience</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
            <span>{profile.location}</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-200">
            <IndianRupee className="w-4 h-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
            <span>₹{profile.price} / hour</span>
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="border-t border-neutral-50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50 p-4">
        <Link
          href={`/providers/${profile._id}`}
          className="block w-full text-center rounded-lg bg-black dark:bg-white dark:text-black py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-sm transition"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
