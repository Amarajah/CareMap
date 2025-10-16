'use client';

import ProtectedRoute from '@/components/protectedRoute';
import InfoHub from '@/components/pages/infohub';

export default function InfoHubPage() {
  return (
    <ProtectedRoute>
      <InfoHub />
    </ProtectedRoute>
  );
}