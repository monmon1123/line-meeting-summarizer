# LINE Meeting Summarizer with Gemini AI

บอท LINE สำหรับถอดเสียงและสรุปการประชุมโดยใช้ Google Gemini AI

## คุณสมบัติ
- รับไฟล์เสียงจาก LINE (m4a, mp3)
- ถอดเสียงเป็นข้อความด้วย Gemini AI
- สรุปการประชุมเป็น bullet points ภาษาไทย

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. สร้างไฟล์ `.env` และใส่ค่าต่อไปนี้:
```env
# LINE Bot Configuration
LINE_CHANNEL_SECRET=your_line_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
```

## วิธีใช้งาน

1. รัน server:
```bash
node server.js
```

2. ตั้งค่า Webhook URL ใน LINE Developers Console:
```
https://your-domain.com/webhook
```

3. ส่งไฟล์เสียงการประชุม (m4a/mp3) ไปยังบอท LINE
4. รอรับสรุปการประชุมกลับมาเป็น bullet points

## การเปลี่ยนจาก OpenAI เป็น Gemini

โปรเจกต์นี้ได้รับการอัปเดตให้ใช้ Google Gemini AI แทน OpenAI:
- ✅ เปลี่ยนจาก OpenAI Whisper เป็น Gemini สำหรับถอดเสียง
- ✅ เปลี่ยนจาก GPT เป็น Gemini สำหรับสรุปข้อความ
- ✅ ใช้ `@google/generative-ai` package
- ✅ ใช้ `gemini-2.5-flash` model (ล่าสุด!)

## วิธีขอ Gemini API Key

1. ไปที่ [Google AI Studio](https://makersuite.google.com/app/apikey)
2. คลิก "Get API Key"
3. คัดลอก API key และใส่ใน `.env` file

## Requirements
- Node.js 16+
- LINE Bot Channel (Channel Secret และ Access Token)
- Google Gemini API Key

