import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Eye, 
  Share2,
  Instagram,
  Facebook,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";

/**
 * Social Media Reports Page
 * صفحة تقارير السوشيال ميديا - Instagram و Facebook
 */
export default function SocialMediaReports() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                ← العودة للوحة التحكم
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                تقارير السوشيال ميديا
              </h1>
              <p className="text-sm text-muted-foreground">تحليل أداء Instagram و Facebook</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">إجمالي المتابعين</p>
                  <p className="text-3xl font-bold">12.5K</p>
                  <p className="text-purple-100 text-xs mt-1">+245 هذا الأسبوع</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm mb-1">التفاعل</p>
                  <p className="text-3xl font-bold">8.2K</p>
                  <p className="text-pink-100 text-xs mt-1">+12% من الأسبوع الماضي</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">الوصول</p>
                  <p className="text-3xl font-bold">45.3K</p>
                  <p className="text-blue-100 text-xs mt-1">+18% من الأسبوع الماضي</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">معدل التحويل</p>
                  <p className="text-3xl font-bold">3.8%</p>
                  <p className="text-green-100 text-xs mt-1">+0.5% من الأسبوع الماضي</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instagram Section */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Instagram</CardTitle>
                <CardDescription>تحليل أداء حساب Instagram</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instagram Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">المتابعين</p>
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">8,234</p>
                <p className="text-xs text-green-600 mt-1">+156 هذا الأسبوع</p>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">الإعجابات</p>
                  <Heart className="w-4 h-4 text-pink-500" />
                </div>
                <p className="text-2xl font-bold">5,621</p>
                <p className="text-xs text-green-600 mt-1">+8% من الأسبوع الماضي</p>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">التعليقات</p>
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">892</p>
                <p className="text-xs text-green-600 mt-1">+12% من الأسبوع الماضي</p>
              </div>
            </div>

            {/* Instagram Insights */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                رؤى Instagram
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">معدل التفاعل</span>
                  <span className="font-semibold text-purple-600">6.8%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">أفضل وقت للنشر</span>
                  <span className="font-semibold">8:00 PM - 10:00 PM</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">أكثر المنشورات تفاعلاً</span>
                  <span className="font-semibold">العروض الطبية</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">معدل النمو الشهري</span>
                  <span className="font-semibold text-green-600">+18.5%</span>
                </div>
              </div>
            </div>

            {/* Instagram Actions */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => window.open('https://www.instagram.com/', '_blank')}
              >
                <Instagram className="w-4 h-4 ml-2" />
                فتح Instagram
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => window.open('https://business.facebook.com/latest/insights', '_blank')}
              >
                عرض التحليلات المفصلة
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Facebook Section */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Facebook className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Facebook</CardTitle>
                <CardDescription>تحليل أداء صفحة Facebook</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Facebook Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">متابعي الصفحة</p>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">4,289</p>
                <p className="text-xs text-green-600 mt-1">+89 هذا الأسبوع</p>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">الوصول</p>
                  <Eye className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold">28.7K</p>
                <p className="text-xs text-green-600 mt-1">+15% من الأسبوع الماضي</p>
              </div>

              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">المشاركات</p>
                  <Share2 className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">456</p>
                <p className="text-xs text-green-600 mt-1">+22% من الأسبوع الماضي</p>
              </div>
            </div>

            {/* Facebook Insights */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                رؤى Facebook
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">معدل التفاعل</span>
                  <span className="font-semibold text-blue-600">4.2%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">أفضل وقت للنشر</span>
                  <span className="font-semibold">7:00 PM - 9:00 PM</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">أكثر المنشورات وصولاً</span>
                  <span className="font-semibold">المخيمات الطبية</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">معدل النمو الشهري</span>
                  <span className="font-semibold text-green-600">+12.3%</span>
                </div>
              </div>
            </div>

            {/* Facebook Actions */}
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => window.open('https://www.facebook.com/', '_blank')}
              >
                <Facebook className="w-4 h-4 ml-2" />
                فتح Facebook
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => window.open('https://business.facebook.com/latest/insights', '_blank')}
              >
                عرض التحليلات المفصلة
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Combined Insights */}
        <Card>
          <CardHeader>
            <CardTitle>رؤى مجمعة</CardTitle>
            <CardDescription>مقارنة الأداء بين Instagram و Facebook</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <h4 className="font-semibold mb-3">📊 ملخص الأداء</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-2">• Instagram يتفوق في معدل التفاعل (6.8% مقابل 4.2%)</p>
                    <p className="text-muted-foreground mb-2">• Facebook يحقق وصول أكبر (28.7K مقابل 25.6K)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">• أفضل المنشورات: العروض الطبية والمخيمات</p>
                    <p className="text-muted-foreground mb-2">• أفضل وقت للنشر: 7-10 مساءً</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <h4 className="font-semibold mb-3">💡 توصيات</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• زيادة المحتوى المرئي (صور وفيديوهات) لزيادة التفاعل</li>
                  <li>• التركيز على نشر العروض الطبية في أوقات الذروة</li>
                  <li>• استخدام Instagram Stories بشكل أكبر للتفاعل المباشر</li>
                  <li>• إنشاء حملات إعلانية مستهدفة على Facebook للوصول الأوسع</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
