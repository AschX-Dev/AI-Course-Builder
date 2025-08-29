// Placeholder AI service. Replace with OpenAI later.

async function generateCourseOutline(title, topic) {
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

async function generateChapterContent(chapterTitle, topic) {
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

module.exports = { generateCourseOutline, generateChapterContent };

