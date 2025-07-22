import EditDoctorClient from './EditDoctorClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/doctors/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error('Failed to fetch doctor');
    }

    const { doctor } = await response.json();
    
    if (!doctor) {
      notFound();
    }

    return <EditDoctorClient doctorId={params.id} doctor={doctor} />;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    notFound();
  }
}