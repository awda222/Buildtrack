import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API: Gemini Chat
app.post("/api/assistant", async (req, res) => {
  try {
    const { message, projectData } = req.body;
    
    const systemInstruction = `
      You are BuildTrack Assistant, a specialized AI for Indian construction builders and supervisors.
      You are site-aware. Here is the current project state:
      ${JSON.stringify(projectData, null, 2)}
      
      Your goal is to help builders manage material stock, track tasks, and estimate quantities.
      - Use simple, direct language.
      - If stock is low for a material, mention it if relevant to the user's question.
      - You can answer technical questions about mix ratios (e.g., M20, M25 concrete) or quantities.
      - Support code-mixing (English and common Hindi construction terms like 'sariya' for rebar, 'bore' for well, etc. if appropriate).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction,
      },
    });

    if (!response || !response.text) {
      throw new Error("No response text received from Gemini");
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred" });
  }
});

// Vite middleware
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
