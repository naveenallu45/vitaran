import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white border border-dashed border-gray-200 rounded-xl">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
        <HelpCircle className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
