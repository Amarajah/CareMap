'use client';

import ProtectedRoute from '@/components/protectedRoute';
import HomePage from '@/components/pages/home';

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}