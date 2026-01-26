# متطلبات وتعليمات Meta لرسائل WhatsApp التسويقية

## المصدر
https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/onboarding

---

## 1. متطلبات الأهلية (Eligibility Requirements)

لاستخدام WhatsApp Business API للرسائل التسويقية، يجب استيفاء:

### القيود القانونية والسياسات
- الالتزام بـ **سياسات المراسلة في واتساب للأعمال** (WhatsApp Business Messaging Policies)
- القيود تختلف حسب الدولة والمحتوى والقطاع

### المتطلبات التقنية
1. **حساب WhatsApp Business نشط** ولم يتم تقييده من المراسلة
2. **دولة الضريبة** المرتبطة بالحساب **ليست ضمن المناطق الخاضعة للعقوبات**
3. **دولة النشاط التجاري** المالك **ليست ضمن المناطق الخاضعة للعقوبات**

---

## 2. نظام القوالب (Message Templates)

### القاعدة الأساسية
**جميع رسائل WhatsApp Business API يجب أن تستخدم قوالب معتمدة مسبقاً من Meta**

### أنواع القوالب
1. **قوالب المصادقة** (Authentication Templates)
2. **قوالب الخدمة** (Utility Templates)
3. **قوالب التسويق** (Marketing Templates) - **تحتاج موافقة Meta**

### عملية الموافقة على القوالب
- يجب إنشاء القالب في **WhatsApp Manager**
- إرسال القالب للمراجعة من Meta
- انتظار الموافقة (قد يستغرق 24-48 ساعة)
- بعد الموافقة، يمكن استخدام القالب في API

### قيود القوالب
- **لا يمكن إرسال رسائل حرة (Free-form)** إلا في نافذة 24 ساعة بعد رد العميل
- **المتغيرات (Variables)** محدودة ويجب تعريفها في القالب
- **الأزرار التفاعلية** يجب تعريفها في القالب مسبقاً

---

## 3. تسجيل رقم الهاتف على Cloud API

### المتطلب الإلزامي
- **يجب تسجيل رقم هاتف النشاط التجاري على Cloud API أولاً**
- لا يمكن استخدام Marketing Messages API بدون Cloud API

### الاستخدام المزدوج
- **Cloud API**: لإرسال رسائل المصادقة والخدمة والرسائل الحرة واستقبال الرسائل
- **Marketing Messages API**: لإرسال رسائل تسويقية محسّنة

---

## 4. عملية التأهيل (Onboarding)

### خطوات التأهيل للنشاط التجاري
1. فتح **WhatsApp Manager** > نظرة عامة
2. في قسم "التنبيهات"، النقر على "قبول الشروط"
3. إكمال توقيع شروط خدمة Marketing Messages API
4. بعد الموافقة، يمكن البدء بإرسال الرسائل

### التحقق من الأهلية عبر API
```bash
curl 'https://graph.facebook.com/v24.0/<WHATSAPP_BUSINESS_ACCOUNT_ID>/?fields=marketing_messages_onboarding_status' \
    -H 'Authorization: Bearer <ACCESS_TOKEN>'
```

**الاستجابة المتوقعة:**
- `ELIGIBLE`: مؤهل للتسجيل
- `ONBOARDED`: تم التأهيل بنجاح
- `NOT_ELIGIBLE`: غير مؤهل

---

## 5. إرسال الرسائل التسويقية

### نقطة النهاية (Endpoint)
```
POST /<WHATSAPP_BUSINESS_PHONE_NUMBER_ID>/marketing_messages
```

### بنية الطلب
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "<WHATSAPP_USER_PHONE_NUMBER>",
  "message_activity_sharing": true,
  "type": "template",
  "template": {
    "name": "<TEMPLATE_NAME>",
    "language": {
      "code": "ar"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "<VARIABLE_VALUE>"
          }
        ]
      },
      {
        "type": "button",
        "sub_type": "quick_reply",
        "index": "0",
        "parameters": [
          {
            "type": "payload",
            "payload": "<BUTTON_PAYLOAD>"
          }
        ]
      }
    ]
  }
}
```

---

## 6. الأزرار التفاعلية (Interactive Buttons)

### أنواع الأزرار المدعومة
1. **Quick Reply Buttons** - أزرار رد سريع
2. **Call-to-Action Buttons** - أزرار دعوة لإجراء (URL، Phone)

### القيود
- **يجب تعريف الأزرار في القالب مسبقاً**
- الحد الأقصى: **3 أزرار** لكل رسالة
- نص الزر محدود بـ **20 حرف**

### مثال على Quick Reply Buttons
```json
{
  "type": "button",
  "sub_type": "quick_reply",
  "index": "0",
  "parameters": [
    {
      "type": "payload",
      "payload": "CONFIRM_BOOKING_123"
    }
  ]
}
```

---

## 7. Webhooks لاستقبال الردود

### التسجيل في Webhooks
- يجب تسجيل webhook URL في **App Dashboard**
- اشتراك في حدث `messages` لاستقبال ردود المستخدمين

### بنية Webhook للرد على الأزرار
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "<USER_PHONE>",
          "type": "button",
          "button": {
            "payload": "CONFIRM_BOOKING_123",
            "text": "تأكيد الحجز ✅"
          }
        }]
      }
    }]
  }]
}
```

---

## 8. مشاركة نشاط الحدث (Event Activity Sharing)

### الافتراضي
- **مفعّل تلقائياً** بعد التأهيل
- يشارك أحداث: التسليم، القراءة، النقر

### التحكم
- يمكن تعطيله من **WhatsApp Manager** > إعدادات الحساب
- أو عبر API باستخدام `message_activity_sharing: false`

---

## 9. القيود والحدود

### حدود الإرسال
- تعتمد على **جودة الحساب** (Quality Rating)
- **Tier System**: Tier 1 (1K/day) → Tier 2 (10K/day) → Tier 3 (100K/day)

### نافذة الرسائل (Messaging Window)
- **24 ساعة** بعد آخر رسالة من المستخدم
- خارج النافذة: **يجب استخدام قوالب معتمدة فقط**

### قيود المحتوى
- **ممنوع**: المحتوى المضلل، الترويج للكحول/التبغ، المحتوى الجنسي
- **مطلوب**: موافقة صريحة من المستخدم (Opt-in)

---

## 10. التوصيات للتطبيق

### المرحلة الحالية (Placeholder)
✅ استخدام WhatsApp Integration (QR Code) للاختبار السريع
✅ إنشاء helper functions جاهزة للتكامل المستقبلي
✅ تصميم نظام إعدادات الرسائل مرن

### المرحلة المستقبلية (Production)
🔄 إنشاء قوالب في WhatsApp Manager وإرسالها للموافقة
🔄 التأهيل الرسمي للحساب عبر WhatsApp Manager
🔄 تسجيل Webhook لاستقبال ردود الأزرار التفاعلية
🔄 ربط API الفعلي بدلاً من Placeholder

---

## 11. الخطوات العملية التالية

### 1. إنشاء القوالب المطلوبة
- قالب تأكيد الحجز التفاعلي (مع زرين: تأكيد / إلغاء)
- قالب تأكيد النجاح
- قالب الترحيب عند الحضور

### 2. إعداد Webhook
- إنشاء endpoint في السيرفر: `/api/webhooks/whatsapp`
- معالجة ردود الأزرار وتحديث قاعدة البيانات

### 3. التكامل مع Cloud API
- الحصول على Access Token من Meta
- تسجيل رقم الهاتف على Cloud API
- اختبار إرسال الرسائل

---

## المراجع
- [WhatsApp Business Messaging Policies](https://www.whatsapp.com/legal/business-policy)
- [Marketing Messages API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
