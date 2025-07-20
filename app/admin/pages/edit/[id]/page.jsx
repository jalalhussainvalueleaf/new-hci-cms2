import EditPageClient from './EditPageClient';

// Mock data - in a real app, this would come from your backend
const mockPosts = [
  {
    id: 1,
    title: 'Getting Started with Next.js',
    content: 'Next.js is a powerful React framework that makes building web applications easier...',
    excerpt: 'Learn the basics of Next.js and how to get started with this powerful framework.',
    status: 'published',
    category: 'Technology',
    tags: ['Next.js', 'React', 'JavaScript'],
    featured: true,
    allowComments: true,
    metaTitle: 'Getting Started with Next.js - Complete Guide',
    metaDescription: 'Learn Next.js from scratch with this comprehensive guide covering all the basics.',
  },
  {
    id: 2,
    title: 'React Best Practices',
    content: 'React is a popular JavaScript library for building user interfaces...',
    excerpt: 'Discover the best practices for writing clean and maintainable React code.',
    status: 'draft',
    category: 'Development',
    tags: ['React', 'JavaScript', 'Best Practices'],
    featured: false,
    allowComments: true,
    metaTitle: 'React Best Practices for Clean Code',
    metaDescription: 'Learn the essential React best practices every developer should know.',
  },
  {
    id: 3,
    title: 'New Post 3',
    content: 'Content for post 3...',
    excerpt: 'Excerpt for post 3.',
    status: 'draft',
    category: 'Business',
    tags: ['Business', 'Startup'],
    featured: false,
    allowComments: true,
    metaTitle: 'Post 3 Meta Title',
    metaDescription: 'Meta description for post 3.',
  },
  {
    id: 4,
    title: 'New Post 4',
    content: 'Content for post 4...',
    excerpt: 'Excerpt for post 4.',
    status: 'draft',
    category: 'Design',
    tags: ['Design', 'UI'],
    featured: false,
    allowComments: true,
    metaTitle: 'Post 4 Meta Title',
    metaDescription: 'Meta description for post 4.',
  },
];

export function generateStaticParams() {
  return mockPosts.map(page => ({ id: page.id.toString() }));
}

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
