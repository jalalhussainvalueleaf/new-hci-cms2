'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp,
  MessageSquare,
  Image,
  Tag,
  Star,
  LayoutGrid,
  FileCheck,
  MessageCircle,
  BarChart3,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalPages: 0,
    totalUsers: 0,
    totalMedia: 0,
    totalTestimonials: 0,
    totalDoctors: 0,
    totalCategories: 0,
    totalTags: 0,
    totalPageViews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Helper function to safely fetch and parse JSON
      const fetchWithErrorHandling = async (url, errorMessage) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return await response.json();
        } catch (error) {
          console.error(`${errorMessage}:`, error);
          return null;
        }
      };

      // Load all stats in parallel with error handling
      const [
        postsData, 
        usersData, 
        mediaData, 
        testimonialsData,
        doctorsData,
        categoriesData,
        analyticsData,
        tagsData
      ] = await Promise.all([
        fetchWithErrorHandling('/api/posts', 'Error fetching posts'),
        fetchWithErrorHandling('/api/users', 'Error fetching users'),
        fetchWithErrorHandling('/api/media', 'Error fetching media'),
        fetchWithErrorHandling('/api/testimonials', 'Error fetching testimonials'),
        fetchWithErrorHandling('/api/doctors', 'Error fetching doctors'),
        fetchWithErrorHandling('/api/categories', 'Error fetching categories'),
        fetchWithErrorHandling('/api/analytics', 'Error fetching analytics'),
        fetchWithErrorHandling('/api/tags', 'Error fetching tags')
      ]);

      // Calculate counts with null checks
      const posts = postsData?.posts || [];
      const users = usersData?.users || [];
      const media = mediaData?.media || [];
      const testimonials = testimonialsData?.testimonials || [];
      const doctors = doctorsData?.doctors || [];
      const categories = categoriesData?.categories || [];
      const tags = tagsData?.tags || [];
      const pageViews = analyticsData?.totalPageViews || 0;

      // Debug log to see the structure of posts
      console.log('Posts data sample:', posts[0]);
      console.log('Post keys:', posts.length > 0 ? Object.keys(posts[0]) : 'No posts');

      // Count all posts
      const totalPosts = Array.isArray(posts) ? posts.length : 0;
      
      // Try to count pages by checking for page-specific fields
      // First, let's see if any posts have a 'type' or 'isPage' field
      const pageIndicators = ['page', 'isPage', 'page_type', 'post_type'];
      const potentialPages = posts.filter(post => {
        if (!post) return false;
        return Object.keys(post).some(key => 
          pageIndicators.some(indicator => 
            key.toLowerCase().includes(indicator) && 
            post[key] === true || 
            String(post[key]).toLowerCase() === 'page'
          )
        );
      });

      console.log('Potential pages found:', potentialPages.length);
      console.log('Potential pages sample:', potentialPages[0]);
      
      const totalPages = potentialPages.length;

      setStats({
        totalPosts: totalPosts,
        totalPages: totalPages,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalMedia: Array.isArray(media) ? media.length : 0,
        totalTestimonials: Array.isArray(testimonials) ? testimonials.length : 0,
        totalDoctors: Array.isArray(doctors) ? doctors.length : 0,
        totalCategories: Array.isArray(categories) ? categories.length : 0,
        totalTags: Array.isArray(tags) ? tags.length : 0,
        totalPageViews: typeof pageViews === 'number' ? pageViews : 0,
      });

      // Generate recent activity
      generateRecentActivity({
        posts: postsData.posts || [],
        users: usersData.users || [],
        testimonials: testimonialsData.testimonials || [],
        doctors: doctorsData.doctors || []
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecentActivity = (data) => {
    const activities = [];
    
    // Add recent posts
    const recentPosts = data.posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(post => ({
        action: 'New post published',
        item: `"${post.title}"`,
        time: formatTimeAgo(post.createdAt),
        icon: FileText,
        link: `/admin/posts/${post._id}`
      }));
    
    // Add recent users
    const recentUsers = data.users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .map(user => ({
        action: 'New user registered',
        item: user.email,
        time: formatTimeAgo(user.createdAt),
        icon: Users,
        link: '/admin/users'
      }));
    
    // Add recent testimonials
    const recentTestimonials = data.testimonials
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .map(testimonial => ({
        action: 'New testimonial received',
        item: `from ${testimonial.name}`,
        time: formatTimeAgo(testimonial.createdAt),
        icon: MessageCircle,
        link: '/admin/testimonials'
      }));
    
    // Add recent doctors
    const recentDoctors = data.doctors
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .map(doctor => ({
        action: 'New doctor added',
        item: `Dr. ${doctor.name}`,
        time: formatTimeAgo(doctor.createdAt),
        icon: Users,
        link: '/admin/doctors'
      }));
    
    // Combine and sort all activities
    const allActivities = [...recentPosts, ...recentUsers, ...recentTestimonials, ...recentDoctors]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
    
    setRecentActivity(allActivities);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const dashboardStats = [
    {
      title: 'Total Posts',
      value: stats.totalPosts.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      link: '/admin/posts'
    },
    {
      title: 'Total Pages',
      value: stats.totalPages.toString(),
      change: '+5%',
      changeType: 'positive',
      icon: LayoutGrid,
      link: '/admin/pages'
    },
    {
      title: 'Testimonials',
      value: stats.totalTestimonials.toString(),
      change: '+8%',
      changeType: 'positive',
      icon: Star,
      link: '/admin/testimonials'
    },
    {
      title: 'Doctors',
      value: stats.totalDoctors.toString(),
      change: '+15%',
      changeType: 'positive',
      icon: Users,
      link: '/admin/doctors'
    },
    {
      title: 'Page Views',
      value: stats.totalPageViews.toLocaleString(),
      change: '+22%',
      changeType: 'positive',
      icon: Eye,
      link: '/admin/analytics'
    },
  ];

  const quickStats = [
    { 
      label: 'Published Posts', 
      value: stats.totalPosts.toString(), 
      icon: FileText,
      link: '/admin/posts?status=published'
    },
    { 
      label: 'Draft Posts', 
      value: '0', 
      icon: FileText,
      link: '/admin/posts?status=draft'
    },
    { 
      label: 'Testimonials', 
      value: stats.totalTestimonials.toString(), 
      icon: Star,
      link: '/admin/testimonials'
    },
    { 
      label: 'Doctors', 
      value: stats.totalDoctors.toString(), 
      icon: Users,
      link: '/admin/doctors'
    },
    { 
      label: 'Media Files', 
      value: stats.totalMedia.toString(), 
      icon: Image,
      link: '/admin/media'
    },
    { 
      label: 'Categories', 
      value: stats.totalCategories.toString(), 
      icon: Tag,
      link: '/admin/categories'
    },
    { 
      label: 'Users', 
      value: stats.totalUsers.toString(), 
      icon: Users,
      link: '/admin/users'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your site.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.link} key={stat.title} className="hover:opacity-90 transition-opacity">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change} from last month
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickStats.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  href={item.link} 
                  key={item.label} 
                  className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 rounded-md bg-blue-50">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const Icon = activity.icon || Clock;
                  return (
                    <Link 
                      href={activity.link || '#'} 
                      key={index} 
                      className="block hover:bg-gray-50 px-6 py-4 transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5 mr-3">
                          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {activity.item}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}