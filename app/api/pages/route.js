import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Page from '@/models/Page';

// GET /api/pages - Get all pages
export async function GET() {
  try {
    await connectToDB();
    const pages = await Page.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create a new page
export async function POST(request) {
  try {
    const data = await request.json();
    await connectToDB();
    
    const newPage = new Page({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      status: data.status || 'draft',
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      featured: data.featured || false,
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.excerpt || '',
      featuredImage: data.featuredImage || '',
      template: data.template || 'default',
      author: data.author || 'Admin',
      allowComments: data.allowComments !== undefined ? data.allowComments : true,
    });

    const savedPage = await newPage.save();
    return NextResponse.json(
      { message: 'Page created successfully', page: savedPage },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}
