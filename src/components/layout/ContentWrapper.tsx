// src/components/layout/ContentWrapper.tsx
import React from 'react';

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-10 w-full">
      {/* Container untuk membatasi lebar konten agar rapi di desktop */}
      <div className="max-w-7xl mx-auto space-y-8">
        {children}
      </div>
    </main>
  );
}