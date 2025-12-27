/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Creates a Word-compatible HTML document blob.
 * This technique uses the MIME type application/msword and specific XML namespaces
 * to trick Word into opening the HTML and parsing MathML into OMML automatically.
 */
export const downloadWordDocument = (htmlContent: string, fileName: string) => {
  // We wrap the content in a specific HTML structure that Word recognizes
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns:m='http://schemas.microsoft.com/office/2004/12/omml' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${fileName}</title>
      <!--[if gte mso 9]>
      <xml>
      <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; }
        p { margin-bottom: 10px; line-height: 1.5; }
        h1 { font-size: 16pt; font-weight: bold; color: #2E74B5; }
        h2 { font-size: 13pt; font-weight: bold; color: #2E74B5; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        td, th { border: 1px solid #999; padding: 5px; }
      </style>
    </head>
    <body>
  `;

  const footer = `
    </body>
    </html>
  `;

  const fullContent = header + htmlContent + footer;

  // Use application/msword to prompt Word to open it. 
  // Although technically HTML, Word parses this perfectly including MathML -> OMML
  const blob = new Blob([fullContent], { type: 'application/msword' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.doc`; // .doc is more reliable for the HTML-to-Word trick than .docx
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};