import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Lazy initialize GenAI instance
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Route: Generate Suno AI Music Prompt, Lyrics, Title, and YouTube Playlist Pack
app.post("/api/generate-suno", async (req, res) => {
  try {
    const {
      concept = "Rainy Cafe Study Lofi",
      genre = "Lofi Hip-Hop",
      mood = "Cozy & Relaxing",
      vocalType = "Female Whispering Vocals",
      language = "ko",
      targetSunoVersion = "v5.5",
      customInstructions = "",
    } = req.body;

    const ai = getGenAI();

    const promptText = `
You are an expert Suno AI (v5.5) music prompt engineer and top YouTube playlist curator.
The user wants to generate a complete Suno AI music generation pack (Style Prompt + Lyrics with Meta Tags + Song Title) specifically tailored for a YouTube Music Playlist video or channel.

User Requirements:
- Playlist Concept/Theme: ${concept}
- Main Genre / Style: ${genre}
- Mood / Vibe: ${mood}
- Vocal Style & Timbre Preference: ${vocalType}
- Lyrics & Title Language: ${language === 'ko' ? 'Korean (한국어)' : language === 'en' ? 'English (영어)' : 'Bilingual Korean + English (한국어 + 영어 혼용)'}
- Target Suno Engine Version: Suno AI ${targetSunoVersion} (Suno v5.5 hyper-fidelity audio engine, optimized tag structuring, multi-genre micro-blending)
- Extra Custom Request: ${customInstructions || 'None'}

VOCAL & DYNAMIC GENDER DISTRIBUTION RULES:
1. Vocal Style represents the overall TIMBRE, EMOTION & FEELING (e.g. whispering, warm, airy, soaring, groovy).
2. CRITICAL FOR 20-TRACK PLAYLIST: DO NOT lock all 20 tracks to a single gender voice! Continuous same-voice playback makes a 1-2 hour playlist boring.
3. Dynamically distribute male vocals, female vocals, harmonized duets, vocal chops, and instrumental pieces across the 20 tracks according to what best matches each individual song's sub-theme, mood, and genre!
4. Incorporate clear vocal tags in Suno styleTags and bracketed lyric meta tags for each song (e.g., [Female Soft Voice], [Male Warm Vocal], [Duet Harmony], [Vocal Chops], [Whisper], etc.).

SUNO v5.5 PROMPT FORMATTING RULES:
1. Style Prompt (Music Genre/Style field in Suno AI):
   - MUST be a concise, high-impact string of comma-separated style tags (e.g., "lofi hip hop, chill beats, rhodes piano, vinyl crackle, female vocal hum, 80 bpm, warm acoustic, hi-fi studio mix").
   - Keep under 120-140 characters. Avoid narrative sentences. Use comma-separated tags that Suno AI v5.5 interprets with maximum fidelity.
2. GENRE-SPECIFIC SONG STRUCTURE & 2-3 MINUTE LENGTH MANDATE (CRITICAL REQUIREMENT):
   Every song (both main song lyrics & EVERY track in 'tracklist') MUST be formatted for a complete 2 to 3 minute (120-180+ second) full song in Suno AI v5.5.
   To guarantee a 2~3 minute full song, every single track MUST contain FULL, COMPLETE, UNABBREVIATED multi-section lyrics (at least 20 to 35+ lines of poetry per song). DO NOT use short 2-4 line stubs or placeholders like "(Repeat Chorus)"!

   Strictly apply the exact structural sequence corresponding to the track's genre:

   - 팝 / Pop / Ballad / R&B (Target: 2:30 ~ 3:30 min):
     [Intro] → [Verse 1] (4-6 lines) → [Pre-Chorus] (2-4 lines) → [Chorus] (4-6 lines) → [Verse 2] (4-6 lines) → [Pre-Chorus] (2-4 lines) → [Chorus] (4-6 lines) → [Bridge] (4 lines) → [Final Chorus] (4-6 lines) → [Outro] (2-4 lines)

   - 댄스 / EDM / House / Synthwave / Electro (Target: 2:30 ~ 3:15 min):
     [Intro] → [Verse 1] (4-6 lines) → [Build] (2-4 lines) → [Chorus / Drop] (4-6 lines + drop cues) → [Verse 2] (4-6 lines) → [Build] (2-4 lines) → [Drop] (4-6 lines + drop cues) → [Breakdown] (4 lines) → [Final Drop] (4-6 lines + high energy climax)

   - 시티팝 / City Pop / Retro / Funk / Disco (Target: 2:45 ~ 3:30 min):
     [Intro] → [Verse 1] (4-6 lines) → [Pre-Chorus] (2-4 lines) → [Chorus] (4-6 lines) → [Instrumental Solo] (e.g. [Saxophone Solo] / [Synthesizer Solo]) → [Verse 2] (4-6 lines) → [Chorus] (4-6 lines) → [Bridge] (4 lines) → [Final Chorus] (4-6 lines) → [Outro] (2-4 lines)

   - 록 / 팝펑크 / Rock / Metal / J-Rock (Target: 2:30 ~ 3:20 min):
     [Guitar Intro] → [Verse 1] (4-6 lines) → [Pre-Chorus] (2-4 lines) → [Chorus] (4-6 lines) → [Verse 2] (4-6 lines) → [Chorus] (4-6 lines) → [Breakdown / Bridge] (4 lines) → [Double Chorus] (8 lines - belted high vocal) → [Outro] (2-4 lines)

   - 어쿠스틱 / 포크 / K-Indie / Singer-Songwriter (Target: 2:15 ~ 3:00 min):
     [Intro] → [Verse 1] (4-6 lines) → [Chorus] (4-6 lines) → [Verse 2] (4-6 lines) → [Chorus] (4-6 lines) → [Bridge] (4 lines) → [Final Chorus] (4-6 lines)

   - Neo-Soul / Soul / Groove / Smooth R&B (Target: 2:30 ~ 3:30 min):
     [Intro] → [Verse 1] (4-6 lines) → [Chorus] (4-6 lines) → [Verse 2] (4-6 lines) → [Chorus] (4-6 lines) → [Instrumental / Bridge] (4 lines) → [Chorus] (4-6 lines) → [Ad-lib Outro] (4 lines fading with vocal ad-libs)

   - Lofi / Jazz Hop / Ambient (Instrumental or Vocal Chops) (Target: 2:00 ~ 3:00 min):
     [Intro - Ambience & Keys] → [Verse - Main Theme] → [Saxophone / Guitar Solo] → [Bridge - Mellow Keys] → [Outro - Rain & Vinyl Fade]

   STRICT LENGTH RULE FOR 20-TRACK PLAYLIST:
   - Every single track in 'tracklist' MUST contain FULL, COMPLETE, LONG multi-section lyrics (20 to 35+ lines of lyrics) so the Suno generator produces a complete 2~3 minute track for all 20 songs.
   - Lyrics should fit "${concept}" evoking emotion for a YouTube playlist.
3. YouTube 20-Track Playlist Pack (IMPORTANT: MUST GENERATE FULL PROMPTS & RICH LONG LYRICS FOR ALL 20 SONGS + YOUTUBE SEO OPTIMIZATION PACK):
   - Provide a catchy, click-worthy YouTube Playlist Title (e.g., "🎧 [Playlist] 비 오는 날, 창가 자리에서 듣는 20곡의 감성 Lofi")
   - A ready-to-use YouTube video description with timestamps placeholder and relevant hashtags.
   - An AI Image Generator prompt (Midjourney/DALL-E) for the YouTube video thumbnail.
   - An AI Video Loop Generator prompt (Runway Gen-3 / Kling / Luma / Pika) for creating a seamless infinite looping background video (cinemagraph, subtle ambient movement, gentle camera breathing, 4k 60fps).
   - EXACTLY 20 Track List Ideas (tracks 1 through 20) with unique, creative song titles, specific Suno AI style tags, AND full-length multi-section structured lyrics with bracketed Suno meta tags ([Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro]) for EACH song so the creator can generate all 20 full 2-3 minute songs for a 1-2 hour YouTube playlist video!
   - YouTube SEO Pack:
     * titleOptions: 3 variations (clickbaitHook, keywordRich, aestheticMinimal)
     * searchTags: array of 10-15 high-search-volume keywords (e.g. ["lofi hip hop", "공부할때듣는음악", "작업곡 플리", "suno lofi", "study music"])
     * descriptionHook: engaging 2-3 sentence opener to boost watch-time and algorithm recommendation
     * targetKeywords: 3-5 primary target search keywords

Return ONLY valid JSON matching this exact structure:
{
  "songTitle": "Main Song Title in chosen language",
  "englishTitle": "English Title Translation if Korean or vice-versa",
  "stylePrompt": "concise comma-separated Suno v5.5 style tags under 130 chars",
  "lyrics": "Full structured lyrics with [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro] Suno meta tags",
  "styleExplanation": "Short tips explaining why these style tags work best in Suno AI v5.5 and how to adjust BPM/vibe",
  "playlistConcept": {
    "playlistTitle": "Catchy YouTube Video/Playlist Title for 20 tracks",
    "playlistDescription": "Engaging YouTube description text with timestamps placeholder and hashtags",
    "thumbnailPrompt": "Detailed AI art prompt for YouTube Thumbnail",
    "videoLoopPrompt": "Detailed prompt for Runway Gen-3/Kling/Luma/Pika to generate seamless 4k infinite video loop cinemagraph with camera motion and particle FX",
    "tracklist": [
      { "trackNumber": 1, "title": "Track 1 Title", "styleTags": "suno style tags for track 1", "lyrics": "Full long multi-section lyrics for track 1 with [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro]" },
      ... up to track 20
    ],
    "seoPack": {
      "titleOptions": {
        "clickbaitHook": "High CTR emotional hook title",
        "keywordRich": "Keyword optimized search title",
        "aestheticMinimal": "Minimal aesthetic trendy title"
      },
      "searchTags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
      "descriptionHook": "Engaging 2-3 sentence description hook to boost watch time",
      "targetKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            songTitle: { type: Type.STRING },
            englishTitle: { type: Type.STRING },
            stylePrompt: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            styleExplanation: { type: Type.STRING },
            playlistConcept: {
              type: Type.OBJECT,
              properties: {
                playlistTitle: { type: Type.STRING },
                playlistDescription: { type: Type.STRING },
                thumbnailPrompt: { type: Type.STRING },
                videoLoopPrompt: { type: Type.STRING },
                tracklist: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      trackNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      styleTags: { type: Type.STRING },
                      lyrics: { type: Type.STRING },
                    },
                    required: ["trackNumber", "title", "styleTags", "lyrics"],
                  },
                },
                seoPack: {
                  type: Type.OBJECT,
                  properties: {
                    titleOptions: {
                      type: Type.OBJECT,
                      properties: {
                        clickbaitHook: { type: Type.STRING },
                        keywordRich: { type: Type.STRING },
                        aestheticMinimal: { type: Type.STRING },
                      },
                      required: ["clickbaitHook", "keywordRich", "aestheticMinimal"],
                    },
                    searchTags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    descriptionHook: { type: Type.STRING },
                    targetKeywords: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["titleOptions", "searchTags", "descriptionHook", "targetKeywords"],
                },
              },
              required: [
                "playlistTitle",
                "playlistDescription",
                "thumbnailPrompt",
                "tracklist",
              ],
            },
          },
          required: [
            "songTitle",
            "englishTitle",
            "stylePrompt",
            "lyrics",
            "styleExplanation",
            "playlistConcept",
          ],
        },
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error("Error generating Suno prompt:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to generate Suno AI prompt",
    });
  }
});

// API Route: Extend / Variations generator
app.post("/api/generate-lyrics-variation", async (req, res) => {
  try {
    const { currentLyrics, stylePrompt, action, language = "ko" } = req.body;
    const ai = getGenAI();

    const promptText = `
You are a song lyrics editor and Suno AI tag expert.
Task: ${
      action === "expand-full"
        ? "Expand and lengthen these lyrics into a rich, complete full-length song structure (at least 20+ lines) with [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Chorus], [Bridge], and [Outro]. Make the story deep, emotional, and poetic."
        : action === "add-bridge"
        ? "Add an emotional Bridge and Guitar/Instrumental Breakdown to these lyrics"
        : action === "translate"
        ? "Translate and adapt these lyrics to " + (language === "ko" ? "Korean" : "English") + " while preserving rhyming and Suno structural tags like [Verse], [Chorus]"
        : action === "extend-outro"
        ? "Add an extended Outro section with fading ad-libs and instrumental cues"
        : "Refine and polish these lyrics with enhanced Suno AI meta tags ([Whisper], [Belt], [Ad-lib], etc.)"
    }

Original Style: ${stylePrompt}
Current Lyrics:
${currentLyrics}

Return JSON with format:
{
  "updatedLyrics": "The modified full lyrics string with Suno meta tags"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updatedLyrics: { type: Type.STRING },
          },
          required: ["updatedLyrics"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, updatedLyrics: data.updatedLyrics });
  } catch (err: any) {
    console.error("Error updating lyrics:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to update lyrics",
    });
  }
});

// API Route: Dedicated AI YouTube SEO Tag & Keyword Generator
app.post("/api/generate-tags", async (req, res) => {
  try {
    const {
      songTitle = "Midnight Chill Lofi",
      genre = "Lofi Hip Hop",
      mood = "Relaxing & Cozy",
      language = "ko",
    } = req.body;

    const ai = getGenAI();

    const promptText = `
You are a world-class YouTube Algorithm Specialist and SEO Keyword Strategist for Music Channels and Suno AI creators.
Generate an extensive, YouTube-optimized SEO keyword and search tag package for a song or music playlist with the following details:

Song/Playlist Title: ${songTitle}
Music Genre / Style: ${genre}
Mood / Atmosphere: ${mood || 'Relaxing'}
Target Language Preference: ${language === 'ko' ? 'Korean + High-volume English Mix' : 'English + Global Mix'}

Requirements:
1. "searchTags": Array of 15-20 highly relevant, high-search-volume keywords (e.g. ["lofi hip hop", "공부할때듣는음악", "chill beats", "작업곡 플리", "suno lofi", "study music", "relaxing music"])
2. "primaryKeywords": Array of 4-5 core high-traffic seed terms.
3. "longtailKeywords": Array of 5-6 long-tail high-CTR search phrases that users search for on YouTube.
4. "hashtags": Array of 6-8 trending YouTube hashtags starting with # (e.g. ["#Lofi", "#StudyMusic", "#Playlist", "#SunoAI"]).
5. "studioFormattedString": A single comma-separated string containing all search tags, ready to paste directly into YouTube Studio's Tags box (under 480 characters).
6. "seoTips": Array of 2 concise, high-impact YouTube growth tips specifically for ranking this song/playlist.

Return ONLY valid JSON matching this schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            searchTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            primaryKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            longtailKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            studioFormattedString: { type: Type.STRING },
            seoTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "searchTags",
            "primaryKeywords",
            "longtailKeywords",
            "hashtags",
            "studioFormattedString",
            "seoTips",
          ],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, tagsData: data });
  } catch (err: any) {
    console.error("Error generating SEO tags:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to generate AI SEO tags",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
