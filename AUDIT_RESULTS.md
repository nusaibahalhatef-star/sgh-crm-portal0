# تقرير فحص المنصة الشامل

## 1. سبب بطء الحفظ (المشكلة الرئيسية)
- مجلد `.wwebjs_auth` (بيانات WhatsApp Web) تم تتبعه في git
- يحتوي على أكثر من **100MB** من ملفات cache و SQLite
- مجلد `.git/objects/pack` = **106MB** بسبب هذه الملفات
- **الحل**: حذف من git history وإضافة إلى .gitignore

## 2. ملفات غير مستخدمة (Dead Files)
| الملف | الحجم | السبب |
|-------|-------|-------|
| `app/` (مجلد كامل) | 560KB, 79 ملف | نسخة قديمة مكررة لا تُستورد |
| `server/whatsappWebService.ts` | - | لا يُستورد من أي مكان |
| `server/whatsappConfig.ts` | - | لا يُستورد من أي مكان |
| `server/whatsappBusinessAPI.ts` | - | مستبدل بـ whatsappCloudAPI.ts |
| `server/facebookConversion.ts` | - | لا يُستورد من أي مكان |
| `server/metaGraphAPI.test.ts` | - | ملف اختبار يتيم |
| `client/src/pages/ComponentShowcase.tsx` | 1437 سطر | لا يُستورد ولا يُستخدم |
| `client/src/pages/CampsPage.tsx` | - | لا يُستورد |
| `client/src/pages/DoctorsListPage.tsx` | - | لا يُستورد |

## 3. Hooks غير مستخدمة
| Hook | مراجع |
|------|-------|
| `useConfirmDialog.ts` | 0 (معرّف فقط) |
| `useFormValidation.ts` | 0 (معرّف فقط) |
| `useStatusLabels.ts` | 0 (معرّف فقط) |

## 4. أنماط مكررة تحتاج hooks
- نمط تنسيق التاريخ: 153 استخدام في الصفحات
- نمط Badge للحالة: 60 استخدام
- نمط تنسيق رقم الهاتف: 39 استخدام
- نمط حوار التأكيد/الحذف: 16 استخدام
- نمط formatDistanceToNow: 5 ملفات
- نمط Loading spinner: 9 استخدامات

## 5. ملفات كبيرة
- صور الأطباء: 7.1MB (24 صورة)
- drizzle/meta snapshots: 1.9MB (34 ملف)
- server/fonts: 832KB
- todo.md: 3265 سطر (204KB)
