// FIX: Using namespace import for React to solve JSX intrinsic element errors.
import * as React from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-[var(--primary-color)]/20 hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4">
      <div className="bg-gray-900 p-3 rounded-full text-[var(--primary-color)]">
        {icon}
      </div>
      <div>
        <p className="text-4xl font-bold text-gray-100">{value}</p>
        <p className="text-gray-400 uppercase tracking-wider text-sm">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;