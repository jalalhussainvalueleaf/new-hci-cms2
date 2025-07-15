'use client';

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

const stats = [
  {
    title: 'Total Posts',
    value: '24',
    change: '+12%',
    changeType: 'positive',
    icon: FileText,
  },
  {
    title: 'Total Pages',
    value: '8',
    change: '+5%',
    changeType: 'positive',
    icon: FileText,
  },
  {
    title: 'Total Users',
    value: '156',
    change: '+18%',
    changeType: 'positive',
    icon: Users,
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
  { label: 'Published Posts', value: '18', icon: FileText },
  { label: 'Draft Posts', value: '6', icon: FileText },
  { label: 'Comments', value: '45', icon: MessageSquare },
  { label: 'Media Files', value: '128', icon: Image },
  { label: 'Categories', value: '12', icon: Tag },
  { label: 'Tags', value: '34', icon: Tag },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your site.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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