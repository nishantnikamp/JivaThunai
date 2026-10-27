import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Camera, Video, X, Image as ImageIcon, Play, CheckCircle2, Trash2, Crop, FileText } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedBlob } from '../utils/cropImage';

export const MediaUploader = ({ type, onUploadComplete, onRemove, maxFiles = 5, initialFiles = [] }) => {
  const { token } = useAuth();
  const [files, setFiles] = useState(() => {
    return initialFiles.map((fileUrl) => {
       if (!fileUrl) return null;
       const url = typeof fileUrl === 'string' ? fileUrl : fileUrl.url;
       const isVideo = type === 'video';
       return {
         id: `initial-${Math.random().toString(36).substring(7)}`,
         file: new File([], isVideo ? 'existing_video.webm' : 'existing_image.jpg', { type: isVideo ? 'video/webm' : 'image/jpeg' }),
         previewUrl: url,
         fileId: url.split('/').pop(),
         progress: 100,
         status: 'complete',
         type: type
       };
    }).filter(Boolean);
  });

  useEffect(() => {
    if (files.length === 0 && initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles.map((fileUrl) => {
         if (!fileUrl) return null;
         const url = typeof fileUrl === 'string' ? fileUrl : fileUrl.url;
         const isVideo = type === 'video';
         const isDoc = type === 'document';
         return {
           id: `initial-${Math.random().toString(36).substring(7)}`,
           file: new File([], isDoc ? 'existing_document.pdf' : isVideo ? 'existing_video.webm' : 'existing_image.jpg', { type: isDoc ? 'application/pdf' : isVideo ? 'video/webm' : 'image/jpeg' }),
           previewUrl: url,
           fileId: url.split('/').pop(),
           progress: 100,
           status: 'complete',
           type: type
         };
      }).filter(Boolean));
    }
  }, [initialFiles, type]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  
  // Cropping State
  const [cropQueue, setCropQueue] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(1);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).slice(0, maxFiles - files.length);
    const imagesToCrop = [];
    
    validFiles.forEach(file => {
      const fileId = Math.random().toString(36).substring(7);
      const isImage = file.type.startsWith('image/');
      const isDoc = type === 'document';
      const previewUrl = URL.createObjectURL(file);
      
      if (isImage && !isDoc) {
        imagesToCrop.push({
          id: fileId,
          file,
          previewUrl,
          crop: { x: 0, y: 0 },
          zoom: 1,
          croppedAreaPixels: null
        });
      } else {
        const newFileObj = {
          id: fileId,
          file,
          previewUrl,
          progress: 0,
          status: 'uploading',
          type: isDoc ? 'document' : 'video'
        };
        setFiles(prev => [...prev, newFileObj]);
        uploadFile(fileId, file, previewUrl);
      }
    });
    
    if (imagesToCrop.length > 0) {
      setCropQueue(prev => [...prev, ...imagesToCrop]);
    }
  };

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCropQueue(prev => {
      if (prev.length === 0) return prev;
      const newQueue = [...prev];
      newQueue[0].croppedAreaPixels = croppedAreaPixels;
      return newQueue;
    });
  }, []);

  const handleCropConfirm = async () => {
    if (cropQueue.length === 0) return;
    const currentCrop = cropQueue[0];
    try {
      const croppedBlob = await getCroppedBlob(currentCrop.previewUrl, currentCrop.croppedAreaPixels);
      const croppedFile = new File([croppedBlob], currentCrop.file.name, { type: 'image/jpeg' });
      const croppedPreviewUrl = URL.createObjectURL(croppedFile);
      
      const newFileObj = {
        id: currentCrop.id,
        file: croppedFile,
        previewUrl: croppedPreviewUrl,
        progress: 0,
        status: 'uploading',
        type: 'image'
      };
      
      setFiles(prev => [...prev, newFileObj]);
      uploadFile(currentCrop.id, croppedFile, croppedPreviewUrl);
    } catch (e) {
      console.error(e);
    }
    
    // Remove from queue
    setCropQueue(prev => prev.slice(1));
  };

  const handleCropCancel = () => {
    setCropQueue(prev => prev.slice(1));
  };

  const uploadFile = async (id, file, previewUrl) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/v1/media/upload', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: 100, status: 'complete', fileId: data.fileId } : f));
        
        if (onUploadComplete) {
          // Pass the real Backend GridFS URL to the form!
          onUploadComplete(data.url);
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: 0, status: 'error' } : f));
    }
  };

  const cancelUpload = async (id) => {
    let targetFileId = null;
    let targetUrl = null;
    
    setFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target) {
        if (target._interval) clearInterval(target._interval);
        if (target.previewUrl) {
           targetUrl = target.previewUrl;
           URL.revokeObjectURL(target.previewUrl);
        }
        if (target.fileId) targetFileId = target.fileId;
      }
      return prev.filter(f => f.id !== id);
    });
    
    if (onRemove && targetUrl) {
      onRemove(targetUrl);
    }
    
    if (targetFileId) {
      try {
        await fetch(`http://localhost:8080/api/v1/media/${targetFileId}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
      } catch (err) {
        console.error('Failed to delete media', err);
      }
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [files]);

  const startCamera = async (mode = 'photo') => {
    try {
      setIsCameraActive(true);
      const constraints = mode === 'video' 
        ? { video: true, audio: true } 
        : { video: true, audio: false };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera/Microphone access denied or unavailable.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsRecording(false);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      processFiles([file]);
      stopCamera();
    }, 'image/jpeg');
  };

  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    setRecordedChunks([]);
    const mediaRecorder = new MediaRecorder(videoRef.current.srcObject);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setRecordedChunks(prev => [...prev, e.data]);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
      // The onstop event might fire before all chunks are available if we don't use setTimeout or promise,
      // but for this React component, standard browser behavior handles it.
      // A safer approach:
    };
    
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = (e) => {
        // Collect tracks from the active ref since state updates are async
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // We'll just construct the blob directly to ensure no race conditions
      setTimeout(() => {
        setRecordedChunks(chunks => {
            if(chunks.length > 0) {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
                processFiles([file]);
            }
            return chunks;
        });
        stopCamera();
      }, 500);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      {!isCameraActive && files.length < maxFiles && (
        <div 
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50'}`}
        >
          <input 
            type="file" multiple accept={type === 'document' ? "application/pdf" : type === 'image' ? "image/*" : type === 'video' ? "video/*" : "image/*,video/*"} 
            className="hidden" ref={fileInputRef} onChange={(e) => processFiles(e.target.files)}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-slate-100 text-slate-500 rounded-full">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Drag & drop files or <button type="button" onClick={() => fileInputRef.current?.click()} className="text-emerald-600 hover:underline">Browse</button></p>
              <p className="text-xs text-slate-400 mt-1">Supports {type === 'document' ? 'PDF' : 'JPEG, PNG, MP4'} (Max {maxFiles} files)</p>
            </div>
            
            {type !== 'document' && (
              <>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">OR</span>
                </div>
                
                <div className="flex gap-2">
                  <button type="button" onClick={() => startCamera('photo')} className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Take Photo
                  </button>
                  <button type="button" onClick={() => startCamera('video')} className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 flex items-center gap-2">
                    <Video className="w-4 h-4" /> Record Video
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Camera Interface */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            {mediaRecorderRef.current && isRecording ? (
               <button type="button" onClick={stopRecording} className="px-6 py-2 bg-rose-600 text-white rounded-full font-bold animate-pulse">Stop Recording</button>
            ) : (
               <>
                 <button type="button" onClick={takePhoto} className="px-6 py-2 bg-white text-black rounded-full font-bold">Snap Photo</button>
                 <button type="button" onClick={startRecording} className="px-6 py-2 bg-rose-600 text-white rounded-full font-bold">Start Recording</button>
               </>
            )}
            <button type="button" onClick={stopCamera} className="px-6 py-2 bg-slate-800 text-white rounded-full font-bold">Cancel</button>
          </div>
        </div>
      )}

      {/* File Queue & Previews */}
      {files.length > 0 && (
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Uploaded Media ({files.length}/{maxFiles})
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">
              {maxFiles - files.length > 0 ? `${maxFiles - files.length} slot${maxFiles - files.length === 1 ? '' : 's'} remaining` : 'Max limit reached'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 w-full">
            {files.map(file => (
              <div 
                key={file.id} 
                className="w-full flex items-center justify-between gap-3.5 sm:gap-4 p-3 sm:p-4 bg-white border border-slate-200/90 hover:border-emerald-300 rounded-2xl shadow-xs hover:shadow-sm transition-all relative group overflow-hidden"
              >
                {/* Progress Bar Background */}
                {file.status === 'uploading' && (
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-emerald-50 transition-all duration-300 -z-10" 
                    style={{ width: `${file.progress}%` }}
                  />
                )}
                
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                  {/* Thumbnail Preview */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative border border-slate-200 shadow-2xs group/thumb">
                    {file.type === 'image' ? (
                       <img src={file.previewUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : file.type === 'document' ? (
                       <div className="w-full h-full flex items-center justify-center bg-rose-100 text-rose-600">
                          <FileText className="w-7 h-7" />
                       </div>
                    ) : (
                       <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                          <Play className="w-7 h-7" />
                       </div>
                    )}
                    
                    {/* Crop Overlay inside thumbnail for quick edit */}
                    {file.status === 'complete' && file.type === 'image' && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setCropQueue([{
                            id: file.id,
                            file: file.file,
                            previewUrl: file.previewUrl,
                            crop: { x: 0, y: 0 },
                            zoom: 1,
                            croppedAreaPixels: null,
                            isEdit: true
                          }]);
                        }}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs z-10 cursor-pointer"
                        title="Crop / Recenter Image"
                      >
                        <Crop className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={file.file?.name || 'Uploaded Media'}>
                      {file.file?.name && file.file.name !== 'existing_image.jpg' && file.file.name !== 'existing_video.webm' && file.file.name !== 'existing_document.pdf'
                        ? file.file.name
                        : (file.type === 'video' ? 'Pet Video' : file.type === 'document' ? 'Document PDF' : 'Pet Photo')}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {file.file?.size > 0 ? (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                          {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                          {file.type === 'video' ? 'Video Media' : file.type === 'document' ? 'PDF Document' : 'Image Media'}
                        </span>
                      )}

                      {file.status === 'uploading' ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {file.progress}% Uploading
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {file.status === 'complete' && file.type === 'image' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCropQueue([{
                          id: file.id,
                          file: file.file,
                          previewUrl: file.previewUrl,
                          crop: { x: 0, y: 0 },
                          zoom: 1,
                          croppedAreaPixels: null,
                          isEdit: true
                        }]);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Edit / Crop Image"
                    >
                      <Crop className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => cancelUpload(file.id)} 
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" 
                    title={file.status === 'uploading' ? "Cancel Upload" : "Remove Media"}
                  >
                    {file.status === 'uploading' ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Cropping Modal */}
      {cropQueue.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] max-h-[800px]">
            {/* Left/Top: Cropper Area */}
            <div className="relative w-full h-[350px] md:h-full md:w-2/3 bg-slate-950 flex-shrink-0">
              <Cropper
                image={cropQueue[0].previewUrl}
                crop={cropQueue[0].crop}
                zoom={cropQueue[0].zoom}
                aspect={aspectRatio}
                minZoom={0.1}
                maxZoom={5}
                restrictPosition={false}
                onCropChange={(crop) => setCropQueue(prev => { const n = [...prev]; n[0].crop = crop; return n; })}
                onZoomChange={(zoom) => setCropQueue(prev => { const n = [...prev]; n[0].zoom = zoom; return n; })}
                onCropComplete={handleCropComplete}
                style={{
                  containerStyle: { background: '#020617' },
                  cropAreaStyle: { border: '2px solid #10b981', boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.7)' }
                }}
              />
              
              {/* Zoom Controls Overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20 flex items-center gap-4 w-64 max-w-full">
                <span className="text-white/70 text-xs font-black">-</span>
                <input 
                  type="range" min={0.1} max={5} step={0.1} 
                  value={cropQueue[0].zoom} 
                  onChange={(e) => setCropQueue(prev => { const n = [...prev]; n[0].zoom = parseFloat(e.target.value); return n; })}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                />
                <span className="text-white/70 text-xs font-black">+</span>
              </div>
            </div>
            
            {/* Right/Bottom: Controls */}
            <div className="flex flex-col p-6 sm:p-8 bg-white md:w-1/3 border-l border-slate-100 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-black text-2xl text-slate-800 tracking-tight">Adjust Image</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Image {cropQueue.length > 1 ? `1 of ${cropQueue.length}` : 'Editor'}</p>
                </div>
                <button type="button" onClick={handleCropCancel} className="p-2.5 text-slate-700 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors group">
                  <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
                </button>
              </div>

              <div className="space-y-8 flex-1">
                {/* Aspect Ratio Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 block">Aspect Ratio</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      onClick={() => setAspectRatio(1)}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${aspectRatio === 1 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      1:1 (Square)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAspectRatio(4/3)}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${aspectRatio === 4/3 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      4:3 (Standard)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAspectRatio(16/9)}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${aspectRatio === 16/9 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      16:9 (Wide)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAspectRatio(9/16)}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${aspectRatio === 9/16 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      9:16 (Story)
                    </button>
                  </div>
                </div>


              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100">
                <button type="button" onClick={handleCropCancel} className="px-5 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors w-1/3 text-center">
                  Skip
                </button>
                <button type="button" onClick={handleCropConfirm} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-all shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 text-center flex justify-center items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
