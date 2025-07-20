import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Page from '@/models/Page';

// GET /api/pages/[id] - Get a single page by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectToDB();
    
    const page = await Page.findById(id);
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[id] - Update a page
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    await connectToDB();
    
    // Find and update the page
    const updatedPage = await Page.findByIdAndUpdate(
      id,
      {
        $set: {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          status: data.status,
          slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
          featured: data.featured,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          featuredImage: data.featuredImage,
          template: data.template,
          allowComments: data.allowComments,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Page updated successfully',
      page: updatedPage
    });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[id] - Delete a page
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await connectToDB();
    
    const deletedPage = await Page.findByIdAndDelete(id);
    
    if (!deletedPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Page deleted successfully',
      pageId: id
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
