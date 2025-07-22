import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

// Paths that should be tracked
const TRACKED_PATHS = ['/blog/', '/about', '/contact', '/services'];

// Extend the request type to include our custom properties
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Only track specific paths
  const shouldTrack = TRACKED_PATHS.some(path => pathname.startsWith(path));
  
  if (!shouldTrack) {
    return NextResponse.next();
  }

  try {
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    // Get or create session ID
    let sessionId = request.cookies.get('sessionId')?.value;
    let isNewSession = false;
    
    if (!sessionId) {
      sessionId = uuidv4();
      isNewSession = true;
    }
    
    // Get user agent and referrer
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    
    // Create analytics record
    const analyticsRecord = {
      sessionId,
      path: pathname,
      timestamp: new Date(),
      userAgent,
      referrer: referrer || 'direct',
      pageViews: 1,
      isNewSession
    };
    
    // Store in database
    await db.collection('analytics').insertOne(analyticsRecord);
    
    // Update post view count if this is a blog post
    if (pathname.startsWith('/blog/')) {
      const slug = pathname.split('/').pop();
      await db.collection('posts').updateOne(
        { slug },
        { 
          $inc: { viewCount: 1 },
          $setOnInsert: { viewCount: 1 }
        },
        { upsert: true }
      );
    }
    
    // Set session cookie if new session
    const response = NextResponse.next();
    if (isNewSession) {
      response.cookies.set('sessionId', sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      });
    }
    
    return response;
    
  } catch (error) {
    console.error('Error in analytics middleware:', error);
    return NextResponse.next();
  }
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/blog/:path*',
    '/about',
    '/contact',
    '/services'
  ],
};
