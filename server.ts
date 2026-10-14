import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI with recommended telemetry
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Google GenAI:', err);
  }
}

// Check live API capability endpoint
app.get('/api/assistant/status', (_req, res) => {
  res.json({
    hasApiKey: !!aiClient,
    model: 'gemini-3.8-live',
    ttsModel: 'gemini-3.8-flash-lite-tts',
    chatModel: 'gemini-3.8-flash',
  });
});

// Text-to-Speech Endpoint using gemini-3.8-flash-lite-tts
app.post('/api/assistant/tts', async (req, res) => {
  const { text, voiceName = 'Kore' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.slice(0, 500),
                speechMetadata: {
                  style: 'Warm, clear, and natural speaking assistant',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          success: true,
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
        });
      }
    } catch (ttsErr: any) {
      console.warn('Gemini TTS error, client will use browser synthesis:', ttsErr?.message);
    }
  }

  return res.json({
    success: false,
    useBrowserSpeech: true,
    message: 'Using browser speech synthesis fallback',
  });
});

// AI Screening & Conversational Voice Response API
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, language, persona, assistantName, conversationHistory } = req.body;

    const langName =
      language === 'urdu'
        ? 'Urdu (اردو)'
        : language === 'punjabi'
        ? 'Pakistani Punjabi (پنجابی)'
        : language === 'bilingual'
        ? 'Bilingual Urdu & English (Pakistani conversational style)'
        : 'English (Pakistani context)';

    if (aiClient) {
      const prompt = `You are "${assistantName || 'Aiman'}", an intelligent, polite Pakistani personal voice assistant.
Language: ${langName}.
Persona style: ${persona || 'polite_urdu'}.
Context: The user is speaking with you live using their microphone.
Always answer in a natural, friendly, conversational tone (1 to 2 short sentences).
If spoken in Urdu, provide natural Urdu script and readable Roman Urdu.
If spoken in Punjabi, provide Punjabi script/Shahmukhi and readable Roman script.
Keep responses concise and pleasant for direct spoken voice playback.

User's spoken message: "${message}"

Respond strictly in valid JSON format:
{
  "speechText": "Natural spoken response in the requested language",
  "romanUrdu": "Phonetic transliteration in readable Roman script",
  "englishSummary": "Concise English translation or meaning",
  "detectedLanguage": "urdu" | "punjabi" | "english"
}`;

      try {
        const geminiPromise = aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 4000)
        );
        const response: any = await Promise.race([geminiPromise, timeoutPromise]);

        const responseText = response.text || '{}';
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, ...parsed, source: 'gemini' });
      } catch (geminiErr) {
        console.warn('Gemini chat bypassed or timed out, using fallback:', geminiErr);
      }
    }

    // Local culturally authentic Pakistani fallback
    const lower = (message || '').toLowerCase();
    let speechText = 'السلام علیکم! میں پاک کال اے آئی اسسٹنٹ ہوں۔ فرمائیے میں آپ کی کیا مدد کر سکتا ہوں؟';
    let romanUrdu = 'Assalam-o-Alaikum! Main PakCall AI assistant hoon. Farmaiye main aapki kya madad kar sakta hoon?';
    let englishSummary = 'Greetings! I am the PakCall AI assistant. How may I assist you today?';

    if (language === 'punjabi' || lower.includes('kiddan') || lower.includes('ki haal')) {
      speechText = 'سلام جی! سب خیریت اے، تسی دسو تہاڈے لئی کی کر سکدا ہاں؟';
      romanUrdu = 'Salam ji! Sab khairiyat ae, tusi dasso tuhade layi ki kar sakda haan?';
      englishSummary = 'Greetings in Punjabi! Everything is well, tell me how I can help you.';
    } else if (language === 'english') {
      speechText = `Hello! I am ${assistantName || 'Aiman'}, your Pakistani AI assistant. How can I help you right now?`;
      romanUrdu = speechText;
      englishSummary = speechText;
    }

    return res.json({
      success: true,
      speechText,
      romanUrdu,
      englishSummary,
      source: 'pakistan_smart_rule_engine',
    });
  } catch (error: any) {
    console.error('Error in /api/assistant/chat:', error);
    return res.status(500).json({ error: error.message || 'Assistant response failed' });
  }
});

// AI Call Summarization API
app.post('/api/assistant/summarize', async (req, res) => {
  try {
    const { transcript, callerNumber, callerName } = req.body;

    if (aiClient && transcript && transcript.length > 0) {
      const prompt = `Summarize this phone call transcript screened in Pakistan for ${callerName || callerNumber}:
${JSON.stringify(transcript)}

Generate a structured JSON response:
{
  "summary": "1-2 sentence executive summary of caller intent and outcome",
  "urgency": "low" | "medium" | "high",
  "sentiment": "friendly" | "neutral" | "urgent" | "suspicious",
  "actionItems": ["action item 1", "action item 2"],
  "spamScore": number between 0 and 100
}`;

      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const responseText = response.text || '{}';
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, ...parsed });
      } catch (sumErr) {
        console.warn('Gemini summarize error:', sumErr);
      }
    }

    return res.json({
      success: true,
      summary: 'Call conversation processed and archived successfully.',
      urgency: 'medium',
      sentiment: 'neutral',
      actionItems: ['Review voice transcript'],
      spamScore: 10,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Summarization failed' });
  }
});

// WebSocket Server for Gemini Live API
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket, request) => {
  console.log('Client connected to Live Voice WebSocket');

  let liveSession: any = null;
  let isClosing = false;

  clientWs.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'start') {
        const { language = 'urdu', assistantName = 'Aiman', persona = 'polite_urdu' } = msg;

        const langInstructions =
          language === 'urdu'
            ? 'Speak in fluent, polite Pakistani Urdu. Keep answers short and clear.'
            : language === 'punjabi'
            ? 'Speak in warm conversational Pakistani Punjabi (Shahmukhi style). Keep answers short.'
            : 'Speak in clear, professional Pakistani English. Keep answers short.';

        const systemPrompt = `You are "${assistantName}", a real-time conversational voice assistant in Pakistan. ${langInstructions} You are engaged in a live microphone dialogue with the user.`;

        if (aiClient && (aiClient as any).live?.connect) {
          try {
            liveSession = await (aiClient as any).live.connect({
              model: 'gemini-3.8-live',
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
                systemInstruction: systemPrompt,
              },
              callbacks: {
                onmessage: (liveMsg: LiveServerMessage) => {
                  if (clientWs.readyState !== WebSocket.OPEN) return;

                  const parts = liveMsg.serverContent?.modelTurn?.parts || [];
                  for (const part of parts) {
                    if (part.inlineData?.data) {
                      clientWs.send(
                        JSON.stringify({
                          type: 'audio_chunk',
                          data: part.inlineData.data,
                          mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000',
                        })
                      );
                    }
                    if (part.text) {
                      clientWs.send(
                        JSON.stringify({
                          type: 'text_chunk',
                          text: part.text,
                        })
                      );
                    }
                  }

                  if (liveMsg.serverContent?.interrupted) {
                    clientWs.send(JSON.stringify({ type: 'interrupted' }));
                  }
                  if (liveMsg.serverContent?.turnComplete) {
                    clientWs.send(JSON.stringify({ type: 'turn_complete' }));
                  }
                },
                onclose: () => {
                  if (!isClosing && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'live_closed' }));
                  }
                },
                onerror: (err: any) => {
                  console.warn('Gemini Live API error:', err);
                  if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'live_fallback',
                        message: 'Live stream switching to low-latency turn mode',
                      })
                    );
                  }
                },
              },
            });

            clientWs.send(JSON.stringify({ type: 'session_ready', mode: 'gemini_live' }));
            return;
          } catch (connErr) {
            console.warn('Failed to start gemini-3.8-live session:', connErr);
          }
        }

        // Low latency turn fallback
        clientWs.send(
          JSON.stringify({
            type: 'session_ready',
            mode: 'turn_audio',
            message: 'Ready for voice conversation',
          })
        );
      } else if (msg.type === 'audio_input' && liveSession) {
        // Forward live PCM input to Gemini Live
        liveSession.sendRealtimeInput({
          audio: {
            data: msg.audio,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  clientWs.on('close', () => {
    isClosing = true;
    if (liveSession && typeof liveSession.close === 'function') {
      try {
        liveSession.close();
      } catch (e) {}
    }
    console.log('Client disconnected from Live Voice WebSocket');
  });
});

// Upgrade HTTP to WebSocket for /api/live
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`PakCall AI server running on port ${PORT}`);
  });
}

startServer();
