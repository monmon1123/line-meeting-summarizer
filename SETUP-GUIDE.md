# คู่มือการตั้งค่า Gemini API

## ⚠️ ปัญหาที่พบ: API Key ไม่สามารถใช้งานได้

Error: `models/gemini-pro is not found for API version v1beta`

## ✅ วิธีแก้ไข:

### 1. ตรวจสอบว่า API Key ถูกต้อง
   - ไปที่ [Google AI Studio](https://makersuite.google.com/app/apikey)
   - ตรวจสอบว่า API Key ยังใช้งานได้

### 2. ตรวจสอบว่า Enable API แล้ว
   - ไปที่ [Google Cloud Console - Generative Language API](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)
   - คลิก "Enable" ถ้ายังไม่ได้เปิดใช้งาน

### 3. ตรวจสอบ Quota และ Billing
   - ตรวจสอบที่ [API Quotas](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)
   - บางครั้งต้อง enable billing (แต่ free tier ก็ใช้ได้)

### 4. รอสักครู่หลัง Enable API
   - บางครั้งต้องรอ 1-2 นาทีหลังจาก enable API

## 🧪 ทดสอบ API Key

หลังจากแก้ไขแล้ว ให้รันคำสั่ง:

```bash
node quick-test.js
```

## 📝 ทางเลือกอื่น: ใช้ Vertex AI แทน

ถ้า Gemini API ไม่ได้ ให้ใช้ Vertex AI API แทน:
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Vertex AI API
3. ใช้ Service Account หรือ OAuth แทน API Key

## 🆘 ติดปัญหา?

ลองดูที่:
- [Gemini API Quickstart](https://ai.google.dev/tutorials/get_started_node)
- [API Error Messages](https://ai.google.dev/api/rest/v1/ErrorDetails)

