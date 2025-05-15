
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface UserStatsBadgeProps {
  icon: React.ReactNode;
  count: number;
  label: string;
}

export const UserStatsBadge: React.FC<UserStatsBadgeProps> = ({ icon, count, label }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-[#212121]/80 rounded-md px-4 py-3 border border-[#2a2a2a] min-w-[110px]">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{count}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
};
