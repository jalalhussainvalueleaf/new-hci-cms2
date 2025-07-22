'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  ArrowUpRight
} from 'lucide-react';

// Import the chart component
import dynamic from 'next/dynamic';

// Dynamically import the chart component with SSR disabled
const TimeSeriesChart = dynamic(
  () => import('@/components/analytics/TimeSeriesChart'),
  { ssr: false }
);

const overviewStats = [
  {
    title: 'Total Visitors',
    value: '24,567',
    change: '+12.5%',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Page Views',
    value: '89,234',
    change: '+8.2%',
    changeType: 'positive',
    icon: Eye,
  },
  {
    title: 'Bounce Rate',
    value: '34.2%',
    change: '-2.1%',
    changeType: 'positive',
    icon: MousePointer,
  },
  {
    title: 'Avg. Session',
    value: '2m 34s',
    change: '+15.3%',
    changeType: 'positive',
    icon: Clock,
  },
];

const topPages = [
  { page: '/blog/getting-started-nextjs', views: 12543, percentage: 28 },
  { page: '/about', views: 8932, percentage: 20 },
  { page: '/services', views: 7621, percentage: 17 },
  { page: '/contact', views: 5432, percentage: 12 },
  { page: '/blog/react-best-practices', views: 4321, percentage: 10 },
];

const trafficSources = [
  { source: 'Organic Search', visitors: 15234, percentage: 62 },
  { source: 'Direct', visitors: 4567, percentage: 19 },
  { source: 'Social Media', visitors: 2890, percentage: 12 },
  { source: 'Referral', visitors: 1876, percentage: 7 },
];

const deviceStats = [
  { device: 'Desktop', icon: Monitor, visitors: 14567, percentage: 59 },
  { device: 'Mobile', icon: Smartphone, visitors: 8234, percentage: 34 },
  { device: 'Tablet', icon: Tablet, visitors: 1766, percentage: 7 },
];

// Icons mapping
const iconComponents = {
  Users,
  Eye,
  MousePointer,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  BarChart3,
  TrendingUp
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overviewStats: [],
    topPages: [],
    trafficSources: [],
    deviceStats: [],
    timeSeries: {
      labels: [],
      visitors: [],
      pageViews: [],
      interval: 'day'
    }
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?range=${dateRange}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your website performance and visitor insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.overviewStats.map((stat) => {
          const Icon = iconComponents[stat.icon] || BarChart3;
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
                <div className={`flex items-center text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
                  )}
                  {stat.change} from last period
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visitors Over Time */}
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Visitors Over Time</CardTitle>
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>12.5% from last period</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Total Visitors</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <div className="h-full w-full">
                  <TimeSeriesChart 
                    title=""
                    labels={data.timeSeries.labels}
                    data={data.timeSeries.visitors}
                    borderColor="#3b82f6"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Page Views Trend */}
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Page Views Trend</CardTitle>
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>8.2% from last period</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Total Page Views</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <div className="h-full w-full">
                  <TimeSeriesChart 
                    title=""
                    labels={data.timeSeries.labels}
                    data={data.timeSeries.pageViews}
                    borderColor="#10b981"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{page.page}</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${page.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 min-w-0">{page.percentage}%</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">{page.views.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-gray-900">{source.source}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 min-w-0">{source.percentage}%</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{source.visitors.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">visitors</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.deviceStats.map((device, index) => {
                  const Icon = iconComponents[device.icon] || Monitor;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-900">{device.device}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${device.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 min-w-0">{device.percentage}%</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{device.visitors.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">visitors</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}