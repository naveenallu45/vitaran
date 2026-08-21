import { BookingStatusType } from '@/types';

interface StatusBadgeProps {
  status: BookingStatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<BookingStatusType, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    accepted: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const labels: Record<BookingStatusType, string> = {
    pending: 'Pending Request',
    accepted: 'Accepted',
    rejected: 'Rejected',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
