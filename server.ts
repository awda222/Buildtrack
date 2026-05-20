import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin for backend protection
admin.initializeApp({
  projectId: "rational-striker-r07pf" // From firebase-applet-config.json
});

const app = express();
const PORT = 3000;

// Initialize Gemini (Will use process.env.GEMINI_API_KEY or Application Default Credentials)
const ai = new GoogleGenAI({
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// Auth Middleware
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (err: any) {
    console.error('Verify token error:', err);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API: Gemini Chat
app.post("/api/assistant", requireAuth, async (req, res) => {
  try {
    const { message, projectData, userProfile } = req.body;
    
    const systemInstruction = `
      You are "BuildTrack Site Intelligence" (SI), an elite AI Construction Consultant specializing in Indian civil engineering and site management.
      
      USER CONTEXT:
      - Name: ${userProfile?.displayName || 'Builder'}
      - Role: ${userProfile?.role || 'Site Supervisor'}
      
      SITE TELEMETRY (Current Projects):
      ${JSON.stringify(projectData, null, 2)}
      
      CORE CAPABILITIES:
      1. Technical Expert: You know mix designs (M20, M25), curing times, rebar (sariya) requirements, and IS codes.
      2. Material Strategist: You monitor site stock. If the user asks about progress, warn them if critical materials like cement or sand are low.
      3. Safety First: Always advocate for PPE (Hardhats, boots) and site safety.
      4. Language: Use professional yet accessible English. You can use common Indian construction terms (e.g., "PCC", "RCC", "shuttering", "centering", "fine aggregate").
      
      COMMUNICATION STYLE:
      - Be direct and authoritative.
      - Use Markdown (bold, lists) for clarity.
      - Address the user by their name (${userProfile?.displayName}) if appropriate.
      - If a query is ambiguous, ask for technical specifics (e.g., "What is the slab area?" or "What grade of concrete are you using?").
      
      When the user says "Namaste", respond with a professional greeting tailored to their role.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
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
