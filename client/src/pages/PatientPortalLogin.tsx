/**
 * Patient Portal Login / Register Page
 * صفحة تسجيل دخول / تسجيل جديد لبوابة المريض
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Phone, KeyRound, UserPlus, ArrowRight, Heart, Shield, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Step = "phone" | "otp" | "register";

export default function PatientPortalLogin() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  
  // Registration fields
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [email, setEmail] = useState("");

  // Check if already logged in
  const { data: patient, isLoading: checkingAuth } = trpc.patientPortal.me.useQuery();

  useEffect(() => {
    if (patient) {
      navigate("/patient-portal/dashboard");
    }
  }, [patient, navigate]);

  const sendOtpMutation = trpc.patientPortal.sendOtp.useMutation({
    onSuccess: (data) => {
      toast.success("تم إرسال رمز التحقق إلى هاتفك");
      if (data.devCode) {
        setDevCode(data.devCode);
      }
      setStep("otp");
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ في إرسال الرمز");
    },
  });

  const verifyOtpMutation = trpc.patientPortal.verifyOtp.useMutation({
    onSuccess: (data) => {
      if (data.needsRegistration) {
        toast.info("يرجى إكمال بيانات التسجيل");
        setStep("register");
      } else {
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/patient-portal/dashboard");
      }
    },
    onError: (err) => {
      toast.error(err.message || "رمز التحقق غير صحيح");
    },
  });

  const registerMutation = trpc.patientPortal.register.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء حسابك بنجاح! مرحباً بك");
      navigate("/patient-portal/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ في التسجيل");
    },
  });

  const handleSendOtp = () => {
    if (!phone || phone.length < 9) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return;
    }
    sendOtpMutation.mutate({ phone });
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error("يرجى إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }
    verifyOtpMutation.mutate({ phone, code: otp });
  };

  const handleRegister = () => {
    if (!fullName || fullName.length < 3) {
      toast.error("يرجى إدخال الاسم الكامل (3 أحرف على الأقل)");
      return;
    }
    if (!gender) {
      toast.error("يرجى اختيار الجنس");
      return;
    }
    registerMutation.mutate({
      phone,
      code: otp,
      fullName,
      address: address || undefined,
      age: age ? parseInt(age) : undefined,
      gender: gender as "male" | "female",
      email: email || undefined,
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" dir="rtl">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 dark:text-green-400">بوابة المريض</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              سجّل دخولك لإدارة حجوزاتك ومواعيدك واستلام نتائجك
            </p>
          </div>

          {/* Step: Phone Number */}
          {step === "phone" && (
            <Card className="shadow-lg border-green-100 dark:border-green-900/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  تسجيل الدخول
                </CardTitle>
                <CardDescription>أدخل رقم هاتفك لتلقي رمز التحقق</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="مثال: 777123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="mt-1.5 text-base h-11 sm:h-12"
                    dir="ltr"
                    maxLength={15}
                  />
                </div>
                <Button
                  onClick={handleSendOtp}
                  disabled={sendOtpMutation.isPending || phone.length < 9}
                  className="w-full h-11 sm:h-12 bg-green-600 hover:bg-green-700 text-base font-semibold"
                >
                  {sendOtpMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>إرسال رمز التحقق</>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step: OTP Verification */}
          {step === "otp" && (
            <Card className="shadow-lg border-green-100 dark:border-green-900/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-green-600" />
                  رمز التحقق
                </CardTitle>
                <CardDescription>أدخل الرمز المرسل إلى {phone}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {devCode && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">رمز التحقق (للتطوير):</p>
                    <p className="text-2xl font-bold text-amber-800 dark:text-amber-300 tracking-widest" dir="ltr">{devCode}</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="otp" className="text-sm font-medium">رمز التحقق</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="أدخل الرمز المكون من 6 أرقام"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="mt-1.5 text-center text-xl tracking-[0.5em] h-12 sm:h-14 font-mono"
                    dir="ltr"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setStep("phone"); setOtp(""); setDevCode(null); }}
                    className="flex-1 h-11"
                  >
                    <ArrowRight className="h-4 w-4 ml-1" />
                    تغيير الرقم
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={verifyOtpMutation.isPending || otp.length !== 6}
                    className="flex-1 h-11 bg-green-600 hover:bg-green-700 font-semibold"
                  >
                    {verifyOtpMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>تحقق</>
                    )}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSendOtp}
                  disabled={sendOtpMutation.isPending}
                  className="w-full text-sm text-muted-foreground"
                >
                  إعادة إرسال الرمز
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step: Registration */}
          {step === "register" && (
            <Card className="shadow-lg border-green-100 dark:border-green-900/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  تسجيل حساب جديد
                </CardTitle>
                <CardDescription>أكمل بياناتك لإنشاء حسابك في بوابة المريض</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">الاسم الكامل <span className="text-red-500">*</span></Label>
                  <Input
                    id="fullName"
                    placeholder="أدخل اسمك الكامل"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 h-10 sm:h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium">العمر</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="العمر"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="mt-1 h-10 sm:h-11"
                      min={1}
                      max={150}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">الجنس <span className="text-red-500">*</span></Label>
                    <Select value={gender} onValueChange={(v) => setGender(v as "male" | "female")}>
                      <SelectTrigger className="mt-1 h-10 sm:h-11">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium">العنوان</Label>
                  <Input
                    id="address"
                    placeholder="المدينة - الحي"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 h-10 sm:h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني (اختياري)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-10 sm:h-11"
                    dir="ltr"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("otp")}
                    className="flex-1 h-11"
                  >
                    <ArrowRight className="h-4 w-4 ml-1" />
                    رجوع
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={registerMutation.isPending || !fullName || !gender}
                    className="flex-1 h-11 bg-green-600 hover:bg-green-700 font-semibold"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>إنشاء الحساب</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-green-50 dark:border-gray-700">
              <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-foreground">إدارة المواعيد</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-green-50 dark:border-gray-700">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-foreground">النتائج والتقارير</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-green-50 dark:border-gray-700">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-foreground">خصوصية وأمان</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-green-50 dark:border-gray-700">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-foreground">ملفك الطبي</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
