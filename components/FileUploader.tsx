import React, { useCallback } from 'react';
import { Upload, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploaderProps {
  onFileSelect: (file: UploadedFile) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const handleFile = useCallback((file: File) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      alert('Chỉ hỗ trợ file Ảnh và PDF.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onFileSelect({
      file,
      previewUrl,
      type: isImage ? 'image' : 'pdf'
    });
  }, [onFileSelect]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile, disabled]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  return (
    <div 
      className={`relative w-full border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out
        ${disabled ? 'opacity-50 cursor-not-allowed border-slate-300 bg-slate-50' : 'cursor-pointer border-brand-300 bg-brand-50 hover:border-brand-500 hover:bg-brand-100'}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <input 
        type="file" 
        accept="image/*,application/pdf" 
        onChange={onInputChange} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className={`p-4 rounded-full ${disabled ? 'bg-slate-200' : 'bg-white shadow-sm'}`}>
          <Upload className={`w-8 h-8 ${disabled ? 'text-slate-400' : 'text-brand-600'}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Nhấn để tải lên hoặc kéo thả vào đây
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Hỗ trợ tài liệu PDF và Hình ảnh (PNG, JPG)
          </p>
        </div>
        <div className="flex gap-4 text-xs text-slate-400 font-medium">
          <span className="flex items-center"><ImageIcon className="w-3 h-3 mr-1" /> Hình ảnh</span>
          <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> PDF</span>
          <span className="flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> Tối đa 20MB</span>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;