import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// NOTE: In a production environment, this should be proxied through a backend to protect the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Validates if a face is present and clear in the image.
 * This simulates the "Face Recognition" using GenAI for liveness/quality check.
 * In a real B.Tech project, you would use OpenCV/FaceNet here, but Gemini 
 * provides a great "Anti-Spoofing" or quality layer.
 */
export const validateFaceInImage = async (base64Image: string): Promise<{ valid: boolean; message: string }> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this image for an attendance system. 
            Requirements:
            1. There must be exactly one human face.
            2. The face must be clearly visible (not blurry, not covered).
            3. It should look like a live photo, not a photo of a screen (anti-spoofing check).
            
            Return a JSON object with:
            - "valid": boolean
            - "reason": string (short explanation)
            `
          },
        ],
      },
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return { valid: result.valid, message: result.reason };
    }
    return { valid: false, message: "Could not parse AI response." };

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    // Fallback for demo if API fails
    return { valid: true, message: "AI Validation skipped (Network Error), proceeding mock." };
  }
};

export const analyzeClassPerformance = async (marks: any[], attendance: any[]): Promise<string> => {
  try {
    const prompt = `
      Analyze this class performance data:
      Marks: ${JSON.stringify(marks)}
      Attendance Count: ${attendance.length}
      
      Provide a brief, encouraging summary for the teacher about class performance trends.
      Keep it under 50 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Analysis unavailable.";
  } catch (error) {
    return "Could not generate analysis.";
  }
};