# วิธีตั้งค่า Webhook สำหรับ LINE Bot

## 🎯 ภาพรวม

เพื่อให้ LINE Bot ทำงานได้ คุณต้อง:
1. Deploy server ให้เข้าถึงได้จาก internet (HTTPS)
2. ตั้งค่า Webhook URL ใน LINE Developers Console

---

## 📍 วิธีที่ 1: ใช้ ngrok (สำหรับทดสอบ - ง่ายที่สุด)

### 1.1 ติดตั้ง ngrok
ดาวน์โหลดจาก: https://ngrok.com/download

หรือติดตั้งผ่าน npm:
```bash
npm install -g ngrok
```

### 1.2 รัน Server (ใน Terminal 1)
```bash
cd line-meeting-summarizer
npm start
```

### 1.3 รัน ngrok (ใน Terminal 2)
```bash
ngrok http 3000
```

### 1.4 คัดลอก URL
จะได้ URL แบบนี้:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
```

**Webhook URL จะเป็น:**
```
https://abc123.ngrok-free.app/webhook
```

⚠️ **ข้อจำกัด:** URL จะเปลี่ยนทุกครั้งที่รัน ngrok ใหม่ (ใช้ ngrok paid ถ้าต้องการ URL ถาวร)

---

## 📍 วิธีที่ 2: Deploy บน Render.com (ฟรี!)

### 2.1 เตรียมไฟล์

สร้างไฟล์ `render.yaml`:
```yaml
services:
  - type: web
    name: line-meeting-summarizer
    runtime: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: LINE_CHANNEL_SECRET
        sync: false
      - key: LINE_CHANNEL_ACCESS_TOKEN
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: PORT
        value: 3000
```

### 2.2 Push โค้ดขึ้น GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/meeting-summarizer.git
git push -u origin main
```

### 2.3 Deploy บน Render

1. ไปที่ https://render.com/
2. Sign up / Login
3. คลิก "New +" → "Web Service"
4. เชื่อม GitHub repository
5. เลือก repo ที่สร้างไว้
6. ตั้งค่า:
   - **Name:** line-meeting-summarizer
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
7. เพิ่ม Environment Variables:
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `GEMINI_API_KEY`
   - `PORT=3000`
8. คลิก "Create Web Service"

**Webhook URL จะเป็น:**
```
https://your-app-name.onrender.com/webhook
```

---

## 📍 วิธีที่ 3: Deploy บน Railway (ง่าย!)

### 3.1 ไปที่ Railway.app
https://railway.app/

### 3.2 เชื่อม GitHub และ Deploy
1. Sign up / Login
2. คลิก "New Project"
3. เลือก "Deploy from GitHub repo"
4. เลือก repository
5. เพิ่ม Environment Variables
6. Deploy!

**Webhook URL:**
```
https://your-app.railway.app/webhook
```

---

## 📍 วิธีที่ 4: Deploy บน Vercel

⚠️ **หมายเหตุ:** Vercel เหมาะกับ serverless functions มากกว่า long-running process

ต้องแปลงเป็น Serverless Function:

`api/webhook.js`:
```javascript
import { createServer } from '../server.js';

export default async function handler(req, res) {
  const server = createServer();
  return server(req, res);
}
```

---

## 🔧 ขั้นตอนที่ 2: ตั้งค่า LINE Webhook

### 2.1 เข้า LINE Developers Console
https://developers.line.biz/console/

### 2.2 เลือก Provider และ Channel
1. เลือก Provider ของคุณ
2. เลือก Messaging API Channel

### 2.3 ตั้งค่า Webhook
1. ไปที่แท็บ **"Messaging API"**
2. หา **"Webhook settings"**
3. คลิก **"Edit"**
4. ใส่ Webhook URL:
   ```
   https://your-domain.com/webhook
   ```
5. คลิก **"Update"**
6. **เปิด "Use webhook"** → ON
7. คลิก **"Verify"** เพื่อทดสอบ

### 2.4 ตั้งค่าเพิ่มเติม
- **Auto-reply messages** → OFF (ปิด)
- **Greeting messages** → OFF (ปิด)
- **Webhook** → ON (เปิด)

---

## ✅ ทดสอบ Webhook

### วิธีที่ 1: ใช้ Verify ใน LINE Console
คลิกปุ่ม "Verify" จะแสดง:
- ✅ Success → ทำงานได้
- ❌ Error → ตรวจสอบ URL และ server

### วิธีที่ 2: ส่งข้อความจริง
1. สแกน QR Code เพื่อเพิ่มเพื่อน
2. ส่งข้อความ "สวัสดี"
3. Bot ควรตอบ: "ส่งไฟล์เสียงของการประชุมมาที่นี่..."

### วิธีที่ 3: ส่งไฟล์เสียงทดสอบ
1. ส่งไฟล์ .mp3 หรือ .m4a
2. Bot จะถอดเสียงและสรุปกลับมา

---

## 🐛 แก้ปัญหา

### ❌ Webhook Verify ไม่ผ่าน

**ตรวจสอบ:**
1. Server รันอยู่หรือไม่?
2. URL ถูกต้องหรือไม่? (ต้องมี `/webhook`)
3. เป็น HTTPS หรือไม่? (ต้องเป็น HTTPS)
4. LINE_CHANNEL_SECRET ถูกต้องหรือไม่?

### ❌ Bot ไม่ตอบ

**ตรวจสอบ:**
1. Auto-reply ปิดแล้วหรือยัง?
2. Webhook เปิดแล้วหรือยัง?
3. ดู logs ของ server มี error หรือไม่?

### ❌ Bot ตอบแต่ไม่สรุป

**ตรวจสอบ:**
1. `GEMINI_API_KEY` ถูกต้องหรือไม่?
2. ไฟล์เสียงรูปแบบถูกต้องหรือไม่? (mp3, m4a)
3. ดู error logs ใน server

---

## 📊 ตรวจสอบ Logs

### ngrok
```bash
# ดู logs
ngrok http 3000 --log=stdout
```

### Render
- Dashboard → Service → Logs

### Railway
- Dashboard → Project → Logs

### ดู logs ของ server
```bash
npm start
# จะแสดง console.log และ error
```

---

## 💡 Tips

### 1. ใช้ ngrok สำหรับ Development
- ทดสอบเร็ว
- ไม่ต้อง deploy

### 2. ใช้ Render/Railway สำหรับ Production
- URL ถาวร
- Auto deploy จาก GitHub
- ฟรี (มี limitations)

### 3. ตั้งค่า Environment Variables ให้ถูกต้อง
ต้องมีครบทั้ง:
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `GEMINI_API_KEY`
- `PORT`

### 4. สำรองไฟล์ .env
ไฟล์ `.env` ไม่ควร commit ขึ้น GitHub
ใช้ `.env.example` แทน:
```bash
cp .env .env.example
# แก้ไขค่าใน .env.example เป็น placeholder
git add .env.example
```

---

## 🔗 ลิงก์ที่เป็นประโยชน์

- [LINE Messaging API Docs](https://developers.line.biz/en/docs/messaging-api/)
- [ngrok Documentation](https://ngrok.com/docs)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app/)

---

## 📞 ต้องการความช่วยเหลือ?

ถ้าติดปัญหา:
1. ดู logs ของ server
2. ตรวจสอบ environment variables
3. ทดสอบ API โดยตรงด้วย curl/Postman

**ตัวอย่าง curl:**
```bash
curl -X POST https://your-domain.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"message","message":{"type":"text","text":"test"}}]}'
```

