const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  initialize(apiKey, modelName = 'gemini-2.0-flash-exp') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async splitScenes(options) {
    const { inputText, generationMode } = options;
    
    const prompt = `Split this story into scenes:\n\n${inputText}\n\nReturn JSON with scenes array.`;
    
    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { success: true, scenes: parsed.scenes || [] };
      }
    } catch (error) {
      console.error('AI Error:', error);
    }
    
    return { success: false, scenes: [] };
  }
}

module.exports = new AIService();
