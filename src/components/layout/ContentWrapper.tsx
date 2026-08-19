import React from 'react';

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    // Menggunakan bg-slate-50 untuk Light Mode (Silver/Abu sangat muda) dan bg-slate-950 untuk Dark mode
    <main className="flex-1 overflow-y-auto p-6 md:p-10 w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {children}
      </div>
    </main>
  );
}