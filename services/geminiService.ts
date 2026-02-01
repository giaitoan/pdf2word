import { GoogleGenAI } from "@google/genai";
import { UploadedFile } from "../types";
import { fileToBase64 } from "../utils/fileHelpers";

const MODEL_NAME = "gemini-2.5-flash"; // Fast and capable vision model

export const convertDocumentToHtml = async (uploadedFile: UploadedFile): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Convert file to base64
  const base64Data = await fileToBase64(uploadedFile.file);

  // Determine mime type
  const mimeType = uploadedFile.file.type;

  const systemInstruction = `
    You are an expert document conversion AI specialized in Optical Character Recognition (OCR) and Mathematical typesetting.
    Your task is to convert the provided document image or PDF into semantic HTML that is optimized for Microsoft Word import.

    CRITICAL RULES:
    Bạn là trợ lý nhập liệu đề thi từ hình ảnh/PDF. Hãy trích xuất câu hỏi từ tài liệu đính kèm.
    
    QUY TẮC NHẬN DIỆN:
        1. PHẦN I (Trắc nghiệm - 4 chọn 1):
       - Các câu hỏi bắt đầu bằng "Câu 1:", "Câu 2:"...
       - Đáp án đúng là đáp án có CHỮ CÁI (A, B, C, D) được GẠCH CHÂN. 
       - Output Type: giữ nguyên định dạng, công thức toán dạng LaTeX.

    2. PHẦN II (Trắc nghiệm Đúng/Sai):
       - Bắt đầu bằng "Câu [Số]: [Nội dung chung]". Bên trong có các ý a), b), c), d).
       - Hãy tách RIÊNG từng ý a, b, c, d thành các câu hỏi độc lập.
       - Định dạng Text: "Câu [Số]: [Nội dung chung] - ý [a/b/c/d]: [Nội dung riêng]".
       - Output Type:giữ nguyên định dạng, công thức toán dạng LaTeX.
    
    3. QUY TẮC PHÁT HIỆN HÌNH ẢNH (QUAN TRỌNG):
       - Nếu nội dung câu hỏi có hình ảnh minh họa (đồ thị, sơ đồ, hình vẽ...), hãy:
         1. Đặt "hasImage": true.
         2. Trả về toạ độ bounding box của hình ảnh đó trong "image_bbox".
         3. Định dạng bbox: [ymin, xmin, ymax, xmax] (thang đo chuẩn 1000x1000).
            Ví dụ: [100, 0, 500, 500] nghĩa là hình ảnh bắt đầu từ y=10% đến y=50%, x=0% đến x=50%.
       - "image_bbox" phải bao trùm toàn bộ hình ảnh minh họa và chú thích của nó.
       
    1. **Structure**: Use semantic HTML tags (<h1>, <h2>, <p>, <ul>, <ol>, <table>).
    2. **Mathematics**: ALL mathematical formulas, equations, and symbols MUST be converted into strict Presentation LaTeX ($...$). 
       - DO NOT use MathML (<math>...</math>).
       - DO NOT use raw text for complex math.
       - Ensure MathML is valid and well-formed.
    3. **Content**: Preserve the original text content accurately. Fix line breaks that occur in the middle of sentences.
    4. **Images**: Ignore non-math images or diagrams. Replace them with a placeholder <p><em>[Image ignored]</em></p>.
    5. **Output**: Return ONLY the inner HTML content meant for the <body>. Do not include <html>, <head>, or <body> tags in your output.
  `;

  const prompt = "Convert this document into HTML with MathML for equations.";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Low temperature for high accuracy
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No content generated.");
    }

    // Clean up potential markdown code blocks if the model adds them despite instructions
    let cleanText = text.replace(/^```html\s*/i, '').replace(/\s*```$/, '');
    
    return cleanText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
