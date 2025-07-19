'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Eye, 
  TrendingUp,
  MessageSquare,
  Image,
  Tag
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalPages: 0,
    totalUsers: 0,
    totalMedia: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Load all stats in parallel
      const [postsRes, usersRes, mediaRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/users'),
        fetch('/api/media'),
      ]);

      const [postsData, usersData, mediaData] = await Promise.all([
        postsRes.json(),
        usersRes.json(),
        mediaRes.json(),
      ]);

      setStats({
        totalPosts: postsData.posts?.length || 0,
        totalPages: postsData.posts?.filter(p => p.type === 'page')?.length || 0,
        totalUsers: usersData.users?.length || 0,
        totalMedia: mediaData.media?.length || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: 'Total Posts',
      value: stats.totalPosts.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      change: '+18%',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Media Files',
      value: stats.totalMedia.toString(),
      change: '+22%',
      changeType: 'positive',
      icon: Image,
    },
    {
      title: 'Page Views',
      value: '12.3K',
      change: '+22%',
      changeType: 'positive',
      icon: Eye,
    },
  ];

  const quickStats = [
    { label: 'Published Posts', value: stats.totalPosts.toString(), icon: FileText },
    { label: 'Draft Posts', value: '6', icon: FileText },
    { label: 'Comments', value: '45', icon: MessageSquare },
    { label: 'Media Files', value: stats.totalMedia.toString(), icon: Image },
    { label: 'Categories', value: '12', icon: Tag },
    { label: 'Tags', value: '34', icon: Tag },
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
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New post published', item: '"Getting Started with Next.js"', time: '2 hours ago' },
                { action: 'Comment approved', item: 'On "React Best Practices"', time: '4 hours ago' },
                { action: 'Page updated', item: '"About Us" page', time: '1 day ago' },
                { action: 'Media uploaded', item: '5 new images', time: '2 days ago' },
                { action: 'User registered', item: 'john.doe@example.com', time: '3 days ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.item}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}