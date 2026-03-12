const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const genAI = new GoogleGenerativeAI('AIzaSyBXFpd0hFGOLUQ10rYwpbMIb6RY4OWd_T8');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello?");
    console.log(result.response.text());
  } catch (error) {
    console.error(error);
  }
}

test();
