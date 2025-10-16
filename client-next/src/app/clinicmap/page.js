'use client';

import ProtectedRoute from '@/components/protectedRoute';
import ClinicMap from '@/components/pages/clinicmap';

export default function ClinicMapPage() {
  return (
    <ProtectedRoute>
      <ClinicMap />
    </ProtectedRoute>
  );
}