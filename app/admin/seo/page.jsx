'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, ExternalLink } from 'lucide-react';

export default function SEOPage() {
  const [alert, setAlert] = useState(null);
  const [seoSettings, setSeoSettings] = useState({
    siteTitle: 'My Awesome Website',
    tagline: 'Building amazing digital experiences',
    metaDescription: 'A comprehensive content management system for modern websites',
    homeTitle: 'Welcome to My Website',
    homeDescription: 'Discover amazing content and insights on our platform',
    socialTitle: 'My Awesome Website',
    socialDescription: 'Building amazing digital experiences with cutting-edge technology',
    twitterHandle: '@mywebsite',
    facebookPage: 'https://facebook.com/mywebsite',
    enableSitemap: true,
    enableRobots: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
    robotsContent: `User-agent: *
Disallow: /admin/
Disallow: /private/

Sitemap: https://yoursite.com/sitemap.xml`,
  });

  const handleSave = () => {
    console.log('Saving SEO settings:', seoSettings);
    setAlert({ type: 'success', message: 'SEO settings saved successfully' });
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-gray-600">Configure search engine optimization settings</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site-title">Site Title</Label>
                <Input
                  id="site-title"
                  value={seoSettings.siteTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, siteTitle: e.target.value })}
                />
                <p className="text-sm text-gray-600 mt-1">
                  This appears in browser tabs and search results
                </p>
              </div>

              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={seoSettings.tagline}
                  onChange={(e) => setSeoSettings({ ...seoSettings, tagline: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="meta-description">Site Meta Description</Label>
                <Textarea
                  id="meta-description"
                  rows={3}
                  value={seoSettings.metaDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Recommended length: 150-160 characters
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Homepage SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="home-title">Homepage Title</Label>
                <Input
                  id="home-title"
                  value={seoSettings.homeTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, homeTitle: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="home-description">Homepage Description</Label>
                <Textarea
                  id="home-description"
                  rows={3}
                  value={seoSettings.homeDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, homeDescription: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="social-title">Social Media Title</Label>
                <Input
                  id="social-title"
                  value={seoSettings.socialTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, socialTitle: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="social-description">Social Media Description</Label>
                <Textarea
                  id="social-description"
                  rows={3}
                  value={seoSettings.socialDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, socialDescription: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="twitter-handle">Twitter Handle</Label>
                <Input
                  id="twitter-handle"
                  placeholder="@username"
                  value={seoSettings.twitterHandle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, twitterHandle: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="facebook-page">Facebook Page URL</Label>
                <Input
                  id="facebook-page"
                  placeholder="https://facebook.com/yourpage"
                  value={seoSettings.facebookPage}
                  onChange={(e) => setSeoSettings({ ...seoSettings, facebookPage: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-opengraph">Enable Open Graph</Label>
                    <p className="text-sm text-gray-600">For Facebook and LinkedIn sharing</p>
                  </div>
                  <Switch
                    id="enable-opengraph"
                    checked={seoSettings.enableOpenGraph}
                    onCheckedChange={(checked) => setSeoSettings({ ...seoSettings, enableOpenGraph: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-twitter-cards">Enable Twitter Cards</Label>
                    <p className="text-sm text-gray-600">For enhanced Twitter sharing</p>
                  </div>
                  <Switch
                    id="enable-twitter-cards"
                    checked={seoSettings.enableTwitterCards}
                    onCheckedChange={(checked) => setSeoSettings({ ...seoSettings, enableTwitterCards: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-sitemap">XML Sitemap</Label>
                  <p className="text-sm text-gray-600">Generate XML sitemap for search engines</p>
                </div>
                <Switch
                  id="enable-sitemap"
                  checked={seoSettings.enableSitemap}
                  onCheckedChange={(checked) => setSeoSettings({ ...seoSettings, enableSitemap: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-robots">Robots.txt</Label>
                  <p className="text-sm text-gray-600">Control search engine crawling</p>
                </div>
                <Switch
                  id="enable-robots"
                  checked={seoSettings.enableRobots}
                  onCheckedChange={(checked) => setSeoSettings({ ...seoSettings, enableRobots: checked })}
                />
              </div>

              {seoSettings.enableRobots && (
                <div>
                  <Label htmlFor="robots-content">Robots.txt Content</Label>
                  <Textarea
                    id="robots-content"
                    value={seoSettings.robotsContent}
                    onChange={(e) => setSeoSettings({ ...seoSettings, robotsContent: e.target.value })}
                    rows={8}
                    className="mt-1 font-mono text-sm"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Configure how search engines crawl your site
                  </p>
                </div>
              )}

              {seoSettings.enableSitemap && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">Sitemap URL</p>
                      <p className="text-sm text-green-700">yoursite.com/sitemap.xml</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Console</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="google-verification">Google Search Console Verification</Label>
                <Input
                  id="google-verification"
                  placeholder="google-site-verification=..."
                />
              </div>

              <div>
                <Label htmlFor="bing-verification">Bing Webmaster Verification</Label>
                <Input
                  id="bing-verification"
                  placeholder="msvalidate.01=..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="google-analytics">Google Analytics Tracking ID</Label>
                <Input
                  id="google-analytics"
                  placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter your Google Analytics tracking ID
                </p>
              </div>

              <div>
                <Label htmlFor="google-tag-manager">Google Tag Manager ID</Label>
                <Input
                  id="google-tag-manager"
                  placeholder="GTM-XXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
                <Input
                  id="facebook-pixel"
                  placeholder="123456789012345"
                />
              </div>

              <div>
                <Label htmlFor="custom-analytics">Custom Analytics Code</Label>
                <Textarea
                  id="custom-analytics"
                  rows={6}
                  placeholder="<!-- Custom analytics or tracking code -->"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}