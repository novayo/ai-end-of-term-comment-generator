import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from "../types";

export const constructPrompt = (config: Omit<GenerationConfig, 'apiKey'>): string => {
  const traitsStr = config.traits.join('、');
  const stylesStr = config.styles.join('、');
  const stylePrompt = stylesStr ? `，請使用${stylesStr}風格` : '';

  return `請根據以下學生特質，為學生「${config.studentName}」生成一段${config.wordLimit}字的期末評語${stylePrompt}。
  
  要求：
  1. 評語要有創意，使用正向鼓勵的語氣和溫暖親切的口氣。
  2. 請使用第二人稱「你」來稱呼學生，不要用第三人稱。
  3. 字數控制在${config.wordLimit}字左右。
  4. 不要分段。
  
  特質：${traitsStr}`;
};

export const generateCommentAI = async (config: GenerationConfig): Promise<string> => {
  if (!config.apiKey) {
    throw new Error("請輸入 API Key");
  }

  // Initialize the client with the user-provided key
  const ai = new GoogleGenAI({ apiKey: config.apiKey });

  const prompt = constructPrompt({
    studentName: config.studentName,
    traits: config.traits,
    styles: config.styles,
    wordLimit: config.wordLimit
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) {
      throw new Error("AI 回應為空");
    }
    return text;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('403')) {
      throw new Error('API Key 無效或權限不足');
    }
    if (error.message?.includes('429')) {
      throw new Error('請求次數過多，請稍後再試');
    }
    throw new Error(error.message || "生成評語時發生錯誤");
  }
};