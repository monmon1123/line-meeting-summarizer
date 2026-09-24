// server.js
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client, middleware } from "@line/bot-sdk";

dotenv.config();

const PORT = process.env.PORT || 3000;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const lineConfig = {
  channelSecret: LINE_CHANNEL_SECRET,
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
};

const client = new Client(lineConfig);
const app = express();

// LINE middleware ตรวจสอบ signature
app.post("/webhook", middleware(lineConfig), express.json(), async (req, res) => {
  try {
    const events = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

async function handleEvent(event) {
  // สนใจเฉพาะ message ที่เป็น audio / file / voice note
  if (event.type !== "message") return;

  const msg = event.message;
  if (msg.type === "audio" || msg.type === "file") {
    // ดาวน์โหลด binary จาก LINE
    const messageId = msg.id;
    const stream = await client.getMessageContent(messageId);

    // เก็บไฟล์ชั่วคราว
    const filename = `./tmp/${messageId}.m4a`;
    await streamToFile(stream, filename);

    // (ถ้าจำเป็น) แปลงรูปแบบด้วย ffmpeg -> ตัวอย่างนี้ข้ามไป ถ้าไฟล์เป็น mp3/m4a ก็ส่งได้
    // ส่งไฟล์ไปยัง Gemini (transcription)
    const transcription = await transcribeAudioWithGemini(filename);

    // สรุปด้วย Chat API
    const summary = await summarizeText(transcription);

    // ตอบกลับใน LINE
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: `สรุปการประชุม (bullet points):\n\n${summary}`,
    });

    // ลบไฟล์ชั่วคราว
    fs.unlinkSync(filename);
  } else {
    // ตอบ message ปกติแนะนำการใช้งาน
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: "ส่งไฟล์เสียงของการประชุมมาที่นี่ (m4a/mp3) เพื่อให้ระบบสรุปให้นะครับ",
    });
  }
}

// helper: save stream to file
function streamToFile(stream, filepath) {
  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(filepath);
    stream.pipe(out);
    stream.on("end", () => resolve());
    stream.on("error", (err) => reject(err));
  });
}

// helper: call Gemini API to transcribe audio
async function transcribeAudioWithGemini(filepath) {
  try {
    // อ่านไฟล์เสียงเป็น base64
    const audioData = fs.readFileSync(filepath);
    const base64Audio = audioData.toString('base64');
    
    // กำหนด MIME type ตามนามสกุลไฟล์
    const mimeType = filepath.endsWith('.mp3') ? 'audio/mp3' : 'audio/mp4';
    
    // ใช้ Gemini model ที่รองรับ audio
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Audio,
          mimeType: mimeType
        }
      },
      "โปรดถอดเสียงนี้เป็นข้อความภาษาไทย ให้ครบถ้วนและถูกต้อง"
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    return text || "";
  } catch (error) {
    console.error("Gemini transcription error:", error);
    throw new Error("Transcription failed");
  }
}

// helper: summarize text via Gemini
async function summarizeText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `คุณเป็นผู้ช่วยที่เชี่ยวชาญในการสรุปการประชุม โปรดสรุปข้อความด้านล่างเป็น bullet points สั้น ๆ ให้ชัดเจนและแยกหัวข้อถ้ามี:\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    return summary || "ไม่สามารถสรุปได้";
  } catch (error) {
    console.error("Gemini summarize error:", error);
    throw new Error("Summarization failed");
  }
}

app.listen(PORT, () => {
  if (!fs.existsSync("./tmp")) fs.mkdirSync("./tmp");
  console.log(`Server running on port ${PORT}`);
});
