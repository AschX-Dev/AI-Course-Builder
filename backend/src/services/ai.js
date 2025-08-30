// Gemini-backed AI service with fallback to placeholders
const { GoogleGenerativeAI } = require("@google/generative-ai");

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

async function generateCourseOutline(title, topic) {
  const client = getGeminiClient();
  if (!client) {
    return {
      title: title || `Intro to ${topic}`,
      description: `An introductory course on ${topic}.`,
      chapters: [
        { title: `Getting Started with ${topic}` },
        { title: `${topic} Fundamentals` },
        { title: `Hands-on Project with ${topic}` },
      ],
    };
  }

  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are a course designer. Return JSON only with keys: title, description, chapters[].title. Input: title="${title}", topic="${topic}"`;
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" },
  });
  const text = result.response.text();
  try {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.chapters))
      throw new Error("bad shape");
    return parsed;
  } catch {
    return {
      title: title || `Intro to ${topic}`,
      description: `An introductory course on ${topic}.`,
      chapters: [
        { title: `Overview of ${topic}` },
        { title: `${topic} Deep Dive` },
      ],
    };
  }
}

async function generateChapterContent(chapterTitle, topic) {
  const client = getGeminiClient();
  if (!client) {
    return {
      content: `Detailed content for ${chapterTitle} about ${topic}.`,
      explanation: `Explanation of key concepts in ${chapterTitle}.`,
      codeExample: `console.log('Example for ${chapterTitle}');`,
      references: [
        `https://developer.mozilla.org/`,
        `https://example.com/${encodeURIComponent(topic)}`,
      ],
    };
  }

  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are a technical educator. Return JSON only with keys: content, explanation, codeExample, references[]. Input: topic="${topic}", chapterTitle="${chapterTitle}"`;
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" },
  });
  const text = result.response.text();
  try {
    const parsed = JSON.parse(text);
    if (!parsed || !parsed.content) throw new Error("bad shape");
    return parsed;
  } catch {
    return {
      content: `Detailed content for ${chapterTitle} about ${topic}.`,
      explanation: `Explanation of key concepts in ${chapterTitle}.`,
      codeExample: `console.log('Example for ${chapterTitle}');`,
      references: [
        `https://developer.mozilla.org/`,
        `https://example.com/${encodeURIComponent(topic)}`,
      ],
    };
  }
}

module.exports = { generateCourseOutline, generateChapterContent };
