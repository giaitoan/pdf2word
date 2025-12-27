import React from 'react';
import { UploadedFile } from '../types';
import { FileText, Download, X, Eye } from 'lucide-react';

interface DocumentPreviewProps {
  file: UploadedFile;
  htmlContent: string | null;
  onClear: () => void;
  onDownload: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file, htmlContent, onClear, onDownload }) => {
  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
      
      {/* Source Preview */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-700 flex items-center">
            <Eye className="w-4 h-4 mr-2" /> Nguồn: {file.file.name}
          </h3>
          <button onClick={onClear} className="text-slate-400 hover:text-red-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
          {file.type === 'image' ? (
            <img 
              src={file.previewUrl} 
              alt="Source" 
              className="max-w-full max-h-full object-contain shadow-lg rounded" 
            />
          ) : (
            <div className="flex flex-col items-center text-slate-500">
              <FileText className="w-16 h-16 mb-2 text-slate-400" />
              <p>Không thể xem trước file PDF trực tiếp.</p>
              <p className="text-xs">File đã tải xong.</p>
            </div>
          )}
        </div>
      </div>

      {/* Result Preview */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" /> Xem trước kết quả Word
          </h3>
          {htmlContent && (
            <button 
              onClick={onDownload}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
              title="Tải về dạng Word (.doc) để giữ công thức Equation sửa được"
            >
              <Download className="w-4 h-4" /> Tải về file Word
            </button>
          )}
        </div>
        <div className="flex-1 overflow-auto p-8 bg-white preview-scroll">
          {htmlContent ? (
            <div 
              className="prose prose-slate max-w-none"
              // Rendering safe HTML from our own reliable Gemini output
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-pulse">
              <div className="w-12 h-2 bg-slate-200 rounded mb-4"></div>
              <div className="w-2/3 h-2 bg-slate-200 rounded mb-2"></div>
              <div className="w-1/2 h-2 bg-slate-200 rounded mb-2"></div>
              <p className="text-sm mt-4 text-slate-400">Đang chờ chuyển đổi...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;