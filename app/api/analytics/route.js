import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7days';
    
    // Calculate date range
    let startDate = new Date();
    switch (range) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Calculate date range for time series
    const timeSeriesData = [];
    const currentDate = new Date();
    let interval;
    
    switch (range) {
      case '7days':
        interval = 'day';
        for (let i = 6; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(date.getDate() + 1);
          
          timeSeriesData.push({
            date: date.toISOString(),
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            visitors: 0,
            pageViews: 0
          });
        }
        break;
      case '30days':
        interval = 'day';
        for (let i = 29; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          timeSeriesData.push({
            date: date.toISOString(),
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            visitors: 0,
            pageViews: 0
          });
        }
        break;
      case '90days':
        interval = 'week';
        for (let i = 12; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - (i * 7));
          date.setHours(0, 0, 0, 0);
          
          // Start of week (Sunday)
          const day = date.getDay();
          const diff = date.getDate() - day;
          const weekStart = new Date(date.setDate(diff));
          
          timeSeriesData.push({
            date: weekStart.toISOString(),
            label: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            visitors: 0,
            pageViews: 0
          });
        }
        break;
      case '1year':
        interval = 'month';
        for (let i = 11; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setMonth(date.getMonth() - i, 1);
          date.setHours(0, 0, 0, 0);
          
          timeSeriesData.push({
            date: date.toISOString(),
            label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            visitors: 0,
            pageViews: 0
          });
        }
        break;
    }
    
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    // Get total visitors and page views
    const analytics = await db.collection('analytics').aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalVisitors: { $sum: 1 },
          totalPageViews: { $sum: '$pageViews' },
          uniqueVisitors: { $addToSet: '$sessionId' },
          pages: { $push: '$pages' },
          referrers: { $push: '$referrer' },
          userAgents: { $push: '$userAgent' },
          timestamps: { $push: '$timestamp' }
        }
      },
      {
        $project: {
          _id: 0,
          totalVisitors: 1,
          totalPageViews: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          pages: 1,
          referrers: 1,
          userAgents: 1,
          timestamps: 1
        }
      }
    ]).toArray();
    
    // Get top pages from posts and pages
    const topPages = await db.collection('posts').aggregate([
      {
        $match: {
          publishedAt: { $gte: startDate },
          status: 'published'
        }
      },
      {
        $project: {
          _id: 0,
          page: { $concat: ['/blog/', '$slug'] },
          views: { $ifNull: ['$viewCount', 0] }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]).toArray();
    
    // Process device data
    const deviceData = {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };
    
    if (analytics.length > 0 && analytics[0].userAgents) {
      analytics[0].userAgents.forEach(ua => {
        if (ua.match(/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i)) {
          deviceData.tablet++;
        } else if (ua.match(/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/)) {
          deviceData.mobile++;
        } else {
          deviceData.desktop++;
        }
      });
    }
    
    // Process traffic sources
    const trafficSources = [
      { source: 'Direct', visitors: 0 },
      { source: 'Search', visitors: 0 },
      { source: 'Social', visitors: 0 },
      { source: 'Referral', visitors: 0 }
    ];
    
    if (analytics.length > 0 && analytics[0].referrers) {
      analytics[0].referrers.forEach(ref => {
        if (!ref) {
          trafficSources[0].visitors++;
        } else if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) {
          trafficSources[1].visitors++;
        } else if (ref.includes('facebook') || ref.includes('twitter') || ref.includes('linkedin')) {
          trafficSources[2].visitors++;
        } else {
          trafficSources[3].visitors++;
        }
      });
    }
    
    // Calculate percentages
    const totalVisits = analytics[0]?.totalVisitors || 0;
    const totalPageViews = analytics[0]?.totalPageViews || 0;
    const uniqueVisitors = analytics[0]?.uniqueVisitors || 0;
    
    // Calculate bounce rate (simplified)
    const bounceRate = totalVisits > 0 ? Math.round((totalVisits - uniqueVisitors) / totalVisits * 100) : 0;
    
    // Calculate average session duration (simplified)
    let avgSessionDuration = '0m 0s';
    if (analytics.length > 0 && analytics[0].timestamps && analytics[0].timestamps.length > 1) {
      const timestamps = [...analytics[0].timestamps].sort();
      const totalDuration = timestamps[timestamps.length - 1] - timestamps[0];
      const avgMs = totalDuration / timestamps.length;
      const minutes = Math.floor(avgMs / 60000);
      const seconds = Math.floor((avgMs % 60000) / 1000);
      avgSessionDuration = `${minutes}m ${seconds}s`;
    }
    
    // Calculate percentages for top pages
    const totalTopPageViews = topPages.reduce((sum, page) => sum + (page.views || 0), 0);
    const pagesWithPercentage = topPages.map(page => ({
      ...page,
      percentage: totalTopPageViews > 0 ? Math.round((page.views / totalTopPageViews) * 100) : 0
    }));
    
    // Calculate device percentages
    const totalDevices = deviceData.desktop + deviceData.mobile + deviceData.tablet;
    const deviceStats = [
      { device: 'Desktop', icon: 'Monitor', visitors: deviceData.desktop, percentage: totalDevices > 0 ? Math.round((deviceData.desktop / totalDevices) * 100) : 0 },
      { device: 'Mobile', icon: 'Smartphone', visitors: deviceData.mobile, percentage: totalDevices > 0 ? Math.round((deviceData.mobile / totalDevices) * 100) : 0 },
      { device: 'Tablet', icon: 'Tablet', visitors: deviceData.tablet, percentage: totalDevices > 0 ? Math.round((deviceData.tablet / totalDevices) * 100) : 0 }
    ];
    
    // Calculate traffic source percentages
    const totalTraffic = trafficSources.reduce((sum, source) => sum + source.visitors, 0);
    const trafficSourcesWithPercentage = trafficSources.map(source => ({
      ...source,
      percentage: totalTraffic > 0 ? Math.round((source.visitors / totalTraffic) * 100) : 0
    }));
    
    // Prepare chart data
    const labels = timeSeriesData.map(item => item.label);
    const visitorData = timeSeriesData.map(item => item.visitors);
    const pageViewData = timeSeriesData.map(item => item.pageViews);
    
    return NextResponse.json({
      timeSeries: {
        labels,
        visitors: visitorData,
        pageViews: pageViewData,
        interval
      },
      overviewStats: [
        {
          title: 'Total Visitors',
          value: totalVisits.toLocaleString(),
          change: '+12.5%', // This would be calculated based on previous period in a real app
          changeType: 'positive',
          icon: 'Users'
        },
        {
          title: 'Page Views',
          value: totalPageViews.toLocaleString(),
          change: '+8.2%',
          changeType: 'positive',
          icon: 'Eye'
        },
        {
          title: 'Bounce Rate',
          value: `${bounceRate}%`,
          change: bounceRate > 50 ? '-2.1%' : '+2.1%',
          changeType: bounceRate > 50 ? 'positive' : 'negative',
          icon: 'MousePointer'
        },
        {
          title: 'Avg. Session',
          value: avgSessionDuration,
          change: '+15.3%',
          changeType: 'positive',
          icon: 'Clock'
        }
      ],
      topPages: pagesWithPercentage,
      trafficSources: trafficSourcesWithPercentage,
      deviceStats
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
