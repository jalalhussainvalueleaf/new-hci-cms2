import EditPageClient from './EditPageClient';

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/pages/${params.id}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch page');
    }
    
    const data = await res.json();
    
    if (!data.page) {
      return <div>Page not found</div>;
    }
    
    return <EditPageClient pageId={params.id} page={data.page} />;
  } catch (error) {
    console.error('Error loading page:', error);
    return <div>Error loading page. Please try again.</div>;
  }
}
