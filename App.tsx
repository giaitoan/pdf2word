import React, { useState } from 'react';
import { AppState, UploadedFile } from './types';
import FileUploader from './components/FileUploader';
import DocumentPreview from './components/DocumentPreview';
import { convertDocumentToHtml } from './services/geminiService';
import { downloadWordDocument } from './utils/fileHelpers';
import { Sparkles, Loader2, AlertTriangle, FileInput, Info } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: UploadedFile) => {
    setUploadedFile(file);
    setAppState(AppState.PROCESSING);
    setError(null);
    setHtmlContent(null);

    try {
      const result = await convertDocumentToHtml(file);
      setHtmlContent(result);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setAppState(AppState.ERROR);
      setError(err.message || "Chuyển đổi thất bại. Vui lòng thử lại.");
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    setHtmlContent(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  const handleDownload = () => {
    if (htmlContent) {
      const fileName = uploadedFile?.file.name.split('.')[0] || "document";
      downloadWordDocument(htmlContent, fileName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              PDFtoWordMath
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 hidden md:block">Chuyển pdf hoặc ảnh sang word giữ công thức Toán</span>
            <span className="text-sm font-medium text-brand-600">
              Thiết kế bởi thầy Chân Đức
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Hero (Only show when IDLE) */}
        {appState === AppState.IDLE && (
          <div className="text-center max-w-2xl mx-auto mb-12 mt-8">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Chuyển đổi Toán sang Word
              <br />
              <span className="text-brand-600">Ngay lập tức</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Ứng dụng này giúp bản chuyển file pdf hoặc ảnh bất kì thành file word, giữ nguyên công thức Toán hiển thị đẹp trên word, không cần MathType luôn. Thầy Đức quá tuyệt!
            </p>
          </div>
        )}

        {/* Error Notification */}
        {appState === AppState.ERROR && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Chuyển đổi thất bại</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => setAppState(AppState.IDLE)}
                className="text-sm underline mt-1 hover:text-red-800"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Main Interface */}
        <div className="space-y-6">
          {appState === AppState.IDLE && (
            <div className="max-w-2xl mx-auto shadow-xl shadow-brand-100/50 rounded-xl bg-white">
               <FileUploader onFileSelect={handleFileSelect} />
            </div>
          )}

          {(appState === AppState.PROCESSING || appState === AppState.SUCCESS || appState === AppState.ERROR) && uploadedFile && (
            <>
               {appState === AppState.PROCESSING && (
                 <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-brand-600 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mt-6">Đang phân tích tài liệu</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">
                      Đang nhận diện bố cục, văn bản và chuyển đổi công thức Toán...
                    </p>
                 </div>
               )}

               {(appState === AppState.SUCCESS || (appState === AppState.ERROR && htmlContent)) && (
                 <DocumentPreview 
                   file={uploadedFile} 
                   htmlContent={htmlContent} 
                   onClear={handleClear}
                   onDownload={handleDownload}
                 />
               )}
            </>
          )}
        </div>

        {/* Info Footer */}
        {appState === AppState.IDLE && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-center">
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileInput className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Tải lên tệp</h3>
                <p className="text-sm text-slate-500">Hỗ trợ tài liệu PDF và hình ảnh rõ nét.</p>
             </div>
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Trích xuất AI</h3>
                <p className="text-sm text-slate-500">Gemini nhận diện cấu trúc và các phương trình toán học phức tạp.</p>
             </div>
             <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Chuẩn Equation</h3>
                <p className="text-sm text-slate-500">Tải xuống dạng Word (.doc) với công thức Equation hoàn toàn có thể chỉnh sửa.</p>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;