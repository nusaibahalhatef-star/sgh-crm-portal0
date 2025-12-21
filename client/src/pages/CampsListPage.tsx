import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Heart, Calendar, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CampsListPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: camps, isLoading } = trpc.camps.getAll.useQuery();

  const filteredCamps = camps?.filter((camp: any) =>
    camp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="h-16 w-16 mx-auto mb-6 fill-red-400 text-red-400" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              المخيمات الطبية الخيرية
            </h1>
            <p className="text-xl text-white/90">
              مبادراتنا الإنسانية في إطار المسؤولية المجتمعية لخدمة المحتاجين
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              عن المخيمات الطبية الخيرية
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              يأتي تنظيم المخيمات الطبية الخيرية ضمن مبادرات المستشفى السعودي الألماني
              في إطار المسؤولية المجتمعية، حيث نسعى لتقديم خدمات طبية عالية الجودة
              للمحتاجين والمستحقين بأسعار رمزية أو مجاناً. يشرف على المخيمات نخبة من
              أفضل الأطباء والجراحين المتخصصين، مع توفير أحدث الأجهزة والتقنيات الطبية.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="ابحث عن مخيم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 py-6 text-lg text-right"
            />
          </div>
        </div>
      </section>

      {/* Camps Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            </div>
          ) : filteredCamps && filteredCamps.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCamps.map((camp: any) => (
                <Card
                  key={camp.id}
                  className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-t-4 border-red-500 overflow-hidden"
                  onClick={() => setLocation(`/camps/${camp.slug || camp.id}`)}
                >
                  <CardContent className="p-0">
                    {camp.imageUrl ? (
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={camp.imageUrl}
                          alt={camp.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 right-4">
                          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                            <Heart className="h-4 w-4 fill-white" />
                            مخيم خيري
                          </div>
                        </div>
                        <div className="absolute bottom-4 right-4 left-4 text-white">
                          <h3 className="text-2xl font-bold mb-1">{camp.name}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 bg-gradient-to-br from-green-600 to-blue-600 flex flex-col items-center justify-center text-white p-6">
                        <Heart className="h-16 w-16 mb-4 fill-red-400 text-red-400" />
                        <h3 className="text-2xl font-bold text-center">{camp.name}</h3>
                      </div>
                    )}

                    <div className="p-6">
                      {camp.description && (
                        <p className="text-gray-600 text-right line-clamp-3 mb-4">
                          {camp.description}
                        </p>
                      )}

                      {camp.startDate && camp.endDate && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                          <Calendar className="h-4 w-4" />
                          <span>
                            من {new Date(camp.startDate).toLocaleDateString("ar-EG")} إلى{" "}
                            {new Date(camp.endDate).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                      )}

                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/camps/${camp.slug || camp.id}`);
                        }}
                      >
                        سجل في المخيم
                        <ArrowLeft className="mr-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">
                {searchQuery
                  ? "لم يتم العثور على مخيمات مطابقة للبحث"
                  : "لا توجد مخيمات متاحة حالياً"}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
