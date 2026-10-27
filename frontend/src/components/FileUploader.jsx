import React, { useState } from 'react';
import { UploadCloud, File, Image, Video, CheckCircle, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const FileUploader = ({ label = "Upload Media or Legal Documents", onFileSelected, accept = "*", maxMB = 10 }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const { showToast } = useNotification();

  const processFile = (selected) => {
    if (!selected) return;

    if (selected.size > maxMB * 1024 * 1024) {
      showToast(`File size exceeds limit of ${maxMB} MB`, 'error');
      return;
    }

    setFile(selected);
    if (selected.type?.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(selected.name)) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }

    if (onFileSelected) {
      // If we need the actual File object to be appended to FormData, we should pass it
      onFileSelected(selected);
    }
    showToast(`File "${selected.name}" uploaded successfully.`, 'success');
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) processFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (onFileSelected) {
      onFileSelected(null);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-slate-700 mb-2">{label}</label>

      {!file ? (
        <label 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${isDragging ? 'border-emerald-600 bg-emerald-100' : 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80'} rounded-2xl cursor-pointer transition-all group`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform mb-2" />
            <p className="text-xs font-semibold text-slate-600">
              <span className="text-emerald-700 font-bold">Click to upload</span> or drag and drop
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Photos, Videos (MP4/MOV) or Legal Documents (PDF)</p>
          </div>
          <input type="file" className="hidden" accept={accept} onChange={handleFileChange} />
        </label>
      ) : (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="flex items-center gap-3">
            {preview ? (
              <img src={preview} alt="Preview" className="w-10 h-10 object-cover rounded-xl border border-emerald-300" />
            ) : file.type.startsWith('video/') ? (
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <File className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-slate-800 line-clamp-1">{file.name}</p>
              <p className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
