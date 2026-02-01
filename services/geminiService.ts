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
    1. **Structure**: Use semantic HTML tags (<h1>, <h2>, <p>, <ul>, <ol>, <table>).
    2. **Mathematics**: ALL mathematical formulas, equations, and symbols MUST be converted into strict LaTeX ($...$). 
       - DO NOT use MathML (<math>...</math>).
       - DO NOT use images for math.
       - DO NOT use raw text for complex math.
       - Ensure MathML is valid and well-formed.
    3. **Content**: Preserve the original text content accurately. Fix line breaks that occur in the middle of sentences.
    4. **Images**: Ignore non-math images or diagrams. Replace them with a placeholder <p><em>[Image ignored]</em></p>.
    5. **Output**: Return ONLY the inner HTML content meant for the <body>. Do not include <html>, <head>, or <body> tags in your output.

    QUY TẮC ĐỊNH DẠNG VĂN BẢN VÀ LATEX (BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI):
    1. ĐỊNH DẠNG CÔNG THỨC TOÁN:
       - Toàn bộ công thức toán, biểu thức số học, đại số và các kí hiệu hình học (điểm, đoạn thẳng, tam giác, đường tròn...) PHẢI được chuyển sang định dạng LaTeX và nằm trong cặp dấu \${ }$.
       - Ví dụ ĐÚNG: \${2x-3}$, \${\\Delta ABC}$, \${A \\in d}$, \${BC = 5cm}$.
       - Ví dụ SAI: $2x-3$, 2x-3, (O).
    2. QUY TẮC DẤU NGOẶC TRONG CÔNG THỨC (Nằm trong \${ }$):
       - Ngoặc đơn ( ): Chuyển thành \\left( \\right). Ví dụ: \${(x+1)}$ -> \${\\left(x+1\\right)}$.
       - Ngoặc vuông [ ]: Chuyển thành \\left[ \\right]. Ví dụ: \${[a,b]}$ -> \${\\left[a,b\\right]}$.
       - Ngoặc nhọn { }: Chuyển thành \\left\\{ \\right\\}. Ví dụ: \${{1; 2}}$ -> \${\\left\\{1; 2\\right\\}}$.
       - Giá trị tuyệt đối | |: Chuyển thành \\left| \\right|. Ví dụ: \${|x|}$ -> \${\\left|x\\right|}$.
       - Ngoại lệ: Hệ phương trình hoặc các cấu trúc LaTeX phức tạp (như \\begin{cases}...) thì giữ nguyên cấu trúc nội tại, không bọc thêm \\left \\right nếu không cần thiết.
    3. PHÂN BIỆT VĂN BẢN VÀ CÔNG THỨC:
       - Các ký tự hoa gần nhau là công thức toán, đưa vào \${ }$. Ví dụ: S.ABC -> \${S.ABC}$, MN -> \${MN}$.
       - Các ký tự số (ngoại trừ sau là dấu "." hoặc ":") là công thức toán, đưa vào \${ }$. Ví dụ ĐÚNG: 12 -> \${12}$, Ví dụ SAI: 12. -> \${12}$.
       - Các dấu ngoặc chứa văn bản chú thích (không phải biểu thức toán) thì GIỮ NGUYÊN, không đưa vào \${ }$. Ví dụ: "(1 điểm)", "(đề thi gồm 01 trang)", "(dành cho học sinh giỏi)".
    4. KÍ HIỆU HÌNH HỌC & ĐƠN VỊ ĐẶC BIỆT:
       - Góc: Sử dụng \\widehat{...}. Ví dụ: góc ABC -> \${\\widehat{ABC}}$.
       - Độ: Sử dụng {}^\\circ. Ví dụ: 90 độ -> \${90{}^\\circ}$.
       - Tam giác: Từ "tam giác" hoặc kí hiệu tam giác -> đổi thành \\Delta. Ví dụ: tam giác ABC -> \${\\Delta ABC}$.
    5. CÁC QUY TẮC KHÁC:
       - Dấu trừ "-": Không để khoảng trắng trước và sau dấu trừ trong công thức. Ví dụ: \${a-b}$.
       - Loại bỏ dòng thừa: Bỏ qua các dòng chứa nhiều dấu chấm liên tiếp (..............) dùng để điền khuyết.
       - Xử lý khoảng trắng: Xóa bỏ các khoảng trắng thừa liên tiếp.
       - Nếu biểu thức quá dài hoặc dạng MathType phức tạp không thể chuyển đổi chính xác, hãy ghi chú lại thay vì chuyển đổi sai.
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
