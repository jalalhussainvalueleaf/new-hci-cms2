'use client';

import EditPostClient from './EditPostClient';
import { notFound } from 'next/navigation';

// This function tells Next.js which paths to pre-render at build time
// For dynamic routes, we'll return an empty array and handle 404s at runtime
export const dynamicParams = true; // Default in Next.js, but being explicit

export async function generateStaticParams() {
  // In a real app, you might want to pre-render some popular posts
  // For now, we'll return an empty array and handle all paths at runtime
  return [];
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  try {
    // Use absolute URL for API requests in server components
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/posts/${params.id}`, {
      // Revalidate the data every 60 seconds
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error('Failed to fetch post');
    }

    const { post } = await response.json();
    
    if (!post) {
      notFound();
    }

    // Pass the post data to the client component
    return <EditPostClient postId={params.id} post={post} />;
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
}
