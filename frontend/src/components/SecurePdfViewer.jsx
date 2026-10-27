import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const SecurePdfViewer = ({ url, token }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const pdfDocRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPdfDoc, setIsPdfDoc] = useState(false);
  const { user } = useAuth(); // Has user.email, user.mobileNumber

  useEffect(() => {
    // Security Event Listeners: Block right-click, text selection, and save/print hotkeys
    const handleContextMenu = (e) => { e.preventDefault(); };
    const handleSelectStart = (e) => { e.preventDefault(); };
    const handleKeyDown = (e) => {
      // Block Ctrl+P (Print), Ctrl+C (Copy), Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && ['p', 'c', 's'].includes(e.key?.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);

    // CSS print override is added dynamically
    const style = document.createElement('style');
    style.innerHTML = `@media print { body { display: none !important; } }`;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const addWatermark = (ctx, width, height) => {
    const text = `${user?.email || 'verified-user'} • ${user?.mobileNumber || user?.phone || 'confidential'}`;
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = 'rgba(150, 150, 150, 0.35)'; // Semi-transparent security overlay
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    // Draw repeating pattern
    const stepX = 380;
    const stepY = 180;
    for (let i = -width * 1.5; i < width * 2; i += stepX) {
      for (let j = -height * 1.5; j < height * 2; j += stepY) {
        ctx.fillText(text, i, j);
      }
    }
    ctx.restore();
  };

  const renderPdfPage = async (pdf, pageNumber) => {
    const canvas = canvasRef.current;
    if (!canvas || !pdf) return;
    const context = canvas.getContext('2d');

    const page = await pdf.getPage(pageNumber);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const renderTask = page.render({
      canvasContext: context,
      viewport: viewport
    });

    await renderTask.promise;
    addWatermark(context, canvas.width, canvas.height);
  };

  useEffect(() => {
    let isCancelled = false;
    let loadingTask = null;

    const renderDocument = async () => {
      if (!url) {
        setLoading(false);
        setError({
          isNotFound: true,
          message: 'No certificate document was provided for preview.'
        });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        pdfDocRef.current = null;
        setNumPages(0);
        setCurrentPage(1);

        const isDataUrl = typeof url === 'string' && url.startsWith('data:');
        const isBlobUrl = typeof url === 'string' && url.startsWith('blob:');

        const headers = {};
        if (token && !isDataUrl && !isBlobUrl) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
          if (response.status === 404) {
            setLoading(false);
            setError({
              isNotFound: true,
              message: 'No certificate document was uploaded by the owner for this record.'
            });
            return;
          }
          throw new Error(`Failed to retrieve certificate (HTTP ${response.status})`);
        }

        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        const blob = await response.blob();
        if (isCancelled) return;

        const arrayBuffer = await blob.arrayBuffer();
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Sniff binary format using magic numbers
        const uint8 = new Uint8Array(arrayBuffer);
        const hasPdfMagic = uint8.length >= 4 &&
          uint8[0] === 0x25 && uint8[1] === 0x50 && uint8[2] === 0x44 && uint8[3] === 0x46; // %PDF
        const hasJpegMagic = uint8.length >= 3 &&
          uint8[0] === 0xFF && uint8[1] === 0xD8 && uint8[2] === 0xFF;
        const hasPngMagic = uint8.length >= 4 &&
          uint8[0] === 0x89 && uint8[1] === 0x50 && uint8[2] === 0x4E && uint8[3] === 0x47;
        const hasGifMagic = uint8.length >= 4 &&
          uint8[0] === 0x47 && uint8[1] === 0x49 && uint8[2] === 0x46 && uint8[3] === 0x38;
        const hasWebpMagic = uint8.length >= 12 &&
          uint8[0] === 0x52 && uint8[1] === 0x49 && uint8[2] === 0x46 && uint8[3] === 0x46 &&
          uint8[8] === 0x57 && uint8[9] === 0x45 && uint8[10] === 0x42 && uint8[11] === 0x50;
        const hasBmpMagic = uint8.length >= 2 &&
          uint8[0] === 0x42 && uint8[1] === 0x4D;

        const isImage = hasJpegMagic || hasPngMagic || hasGifMagic || hasWebpMagic || hasBmpMagic ||
          contentType.includes('image') ||
          blob.type.startsWith('image/') ||
          (typeof url === 'string' && (
            url.startsWith('data:image/') ||
            /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(url)
          ));

        // Helper to render image source to canvas
        const renderImageBlob = (imageBlob) => new Promise((resolve, reject) => {
          const img = new window.Image();
          const imgUrl = URL.createObjectURL(imageBlob);

          img.onload = () => {
            if (isCancelled) {
              URL.revokeObjectURL(imgUrl);
              return resolve(false);
            }
            const c = canvasRef.current;
            if (!c) {
              URL.revokeObjectURL(imgUrl);
              return resolve(false);
            }
            const ctx = c.getContext('2d');
            const maxWidth = 850;
            const scale = Math.min(1, maxWidth / img.width);
            c.width = Math.round(img.width * scale);
            c.height = Math.round(img.height * scale);
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(imgUrl);
            addWatermark(ctx, c.width, c.height);
            setLoading(false);
            setIsPdfDoc(false);
            resolve(true);
          };

          img.onerror = () => {
            URL.revokeObjectURL(imgUrl);
            reject(new Error('Image decoding failed'));
          };

          img.src = imgUrl;
        });

        // If recognized as image OR does not have %PDF header, try rendering as image first
        if (isImage || !hasPdfMagic) {
          try {
            const success = await renderImageBlob(blob);
            if (success) return;
          } catch (imgErr) {
            if (!hasPdfMagic) {
              setError({
                isInvalidStructure: true,
                message: 'The certificate document structure is unrecognized or corrupted. Please upload a valid PDF or image file (JPG, PNG, WebP).'
              });
              setLoading(false);
              return;
            }
          }
        }

        // Render PDF document
        try {
          loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/cmaps/',
            cMapPacked: true
          });

          const pdf = await loadingTask.promise;
          if (isCancelled) return;

          pdfDocRef.current = pdf;
          setNumPages(pdf.numPages);
          setCurrentPage(1);
          setIsPdfDoc(true);

          await renderPdfPage(pdf, 1);
          if (isCancelled) return;
          setLoading(false);
        } catch (pdfErr) {
          // If PDF parser failed, attempt image fallback once more in case of misidentified image stream
          try {
            const imgSuccess = await renderImageBlob(blob);
            if (imgSuccess) return;
          } catch (_) {}

          console.warn('PDF document parse error:', pdfErr);
          const isInvalid = pdfErr.name === 'InvalidPDFException' || 
            (pdfErr.message && pdfErr.message.includes('Invalid PDF structure'));

          setError({
            isInvalidStructure: isInvalid,
            message: isInvalid 
              ? 'Invalid PDF structure: The certificate document is corrupted or not in standard PDF format. Please re-upload a valid PDF, JPG, or PNG document.'
              : (pdfErr.message || 'Failed to render PDF certificate.')
          });
          setLoading(false);
        }

      } catch (err) {
        const isCancelledError = 
          err.name === 'RenderingCancelledException' || 
          err.name === 'AbortException' || 
          (err.message && err.message.includes('Loading aborted'));
          
        if (isCancelledError) {
          return;
        }

        console.warn('Secure document preview handler caught exception:', err);
        if (!isCancelled) {
          const isInvalid = err.name === 'InvalidPDFException' || 
            (err.message && err.message.includes('Invalid PDF structure'));
          
          setError({
            isInvalidStructure: isInvalid,
            message: isInvalid 
              ? 'The uploaded certificate document has an invalid or corrupted structure. Please re-upload a valid PDF, JPG, or PNG document.'
              : (err.message || 'Failed to render secure certificate preview.')
          });
          setLoading(false);
        }
      }
    };

    renderDocument();

    return () => {
      isCancelled = true;
      if (loadingTask) {
        try { loadingTask.destroy(); } catch(e) {}
      }
    };
  }, [url, token, user]);

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > numPages || !pdfDocRef.current) return;
    setCurrentPage(newPage);
    try {
      setLoading(true);
      await renderPdfPage(pdfDocRef.current, newPage);
    } catch (e) {
      console.error('Error changing PDF page:', e);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    if (error.isNotFound) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-amber-200/80 rounded-3xl shadow-sm text-center max-w-lg mx-auto my-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4 border border-amber-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-slate-800 mb-1">No Document Uploaded by Owner</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
            The pet owner has not attached an official verification certificate or photo record for this document type yet.
          </p>
          <div className="px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200/60 text-[11px] font-bold text-amber-700">
            Document Status: Pending Owner Upload
          </div>
        </div>
      );
    }

    if (error.isInvalidStructure) {
      return (
        <div className="flex flex-col items-center justify-center p-10 bg-white border border-rose-200/80 rounded-3xl shadow-sm text-center max-w-lg mx-auto my-6">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 border border-rose-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h4 className="text-base font-black text-slate-800 mb-1">Invalid Certificate Structure</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
            {error.message || 'The selected certificate document has an invalid or corrupted structure and cannot be previewed.'}
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs text-slate-600 space-y-1.5 mb-4 w-full">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" /> Supported Formats:
            </div>
            <div className="text-[11px] text-slate-500 pl-5">• Standard PDF Documents (PDF 1.3 - 2.0)</div>
            <div className="text-[11px] text-slate-500 pl-5">• Scanned Photos & Images (JPG, JPEG, PNG, WebP)</div>
          </div>
          <div className="px-3 py-1.5 bg-rose-50 rounded-full border border-rose-200/60 text-[11px] font-bold text-rose-700">
            Action: Re-upload a clean PDF or image certificate
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center max-w-md mx-auto my-6">
        <ShieldAlert className="w-10 h-10 text-rose-500 mb-3" />
        <p className="text-sm font-bold text-slate-700">{typeof error === 'string' ? error : error.message}</p>
        <p className="text-xs text-slate-500 mt-1">Unable to stream verified certificate data.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        ref={containerRef} 
        className="relative w-full max-w-3xl mx-auto border-4 border-slate-200 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center min-h-[400px] select-none shadow-sm"
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-30">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
            <p className="text-sm font-bold text-slate-600">Verifying & Decrypting Document Stream...</p>
          </div>
        )}
        {/* Canvas blocks direct pointer events; overlay handles print/drag shielding */}
        <canvas ref={canvasRef} className="max-w-full h-auto shadow-xl pointer-events-none" />
        
        {/* Transparent overlay shield explicitly to prevent drag/drop/copying */}
        <div 
          className="absolute inset-0 z-20 cursor-not-allowed" 
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
        />
      </div>

      {/* Multi-page Navigation Bar for PDFs */}
      {isPdfDoc && numPages > 1 && (
        <div className="mt-4 flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700">
            Page {currentPage} of {numPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= numPages || loading}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

