import { Rocket } from 'lucide-react';

export default function Logo({ size = 'md' }) {
  const isLarge = size === 'lg';

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-primary text-white shadow-lg shadow-purple-500/25 border border-white/20 transition-transform duration-200 hover:scale-105 ${
        isLarge ? 'w-12 h-12' : 'w-10 h-10'
      }`}
    >
      {/* Rocket Deployment Icon */}
      <Rocket
        className={`${
          isLarge ? 'w-6 h-6' : 'w-5 h-5'
        } text-white transform -rotate-45 drop-shadow-md`}
      />
    </div>
  );
}
