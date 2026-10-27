import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Highlighter, 
  Type, Heading1, Heading2, Heading3, Quote, Link2, Image as ImageIcon, 
  Video, FileText, Undo, Redo, Code, Eye, Eraser, Sparkles
} from 'lucide-react';

export const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Start writing legal policy or article content...',
  minHeight = '320px'
}) => {
  const editorRef = useRef(null);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [codeValue, setCodeValue] = useState(value);
  const [selectedFont, setSelectedFont] = useState('Inter, sans-serif');
  const [selectedFontSize, setSelectedFontSize] = useState('16px');
  const [showHighlightPalette, setShowHighlightPalette] = useState(false);

  // Initialize and synchronize content
  useEffect(() => {
    if (editorRef.current && !isCodeMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setCodeValue(value || '');
  }, [value, isCodeMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange?.(html);
      setCodeValue(html);
    }
  };

  const executeCommand = (command, val = null) => {
    if (isCodeMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  // Font family change
  const handleFontChange = (fontFamily) => {
    setSelectedFont(fontFamily);
    executeCommand('fontName', fontFamily);
  };

  // Font size change using custom span wrapping or execCommand
  const handleFontSizeChange = (sizePx) => {
    setSelectedFontSize(sizePx);
    if (isCodeMode) return;
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = sizePx;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    handleInput();
  };

  // Highlight Text (Background Color)
  const handleHighlight = (colorHex) => {
    setShowHighlightPalette(false);
    if (isCodeMode) return;
    editorRef.current?.focus();
    if (colorHex === 'transparent') {
      document.execCommand('removeFormat', false, null);
    } else {
      document.execCommand('hiliteColor', false, colorHex);
    }
    handleInput();
  };

  // Insert Link
  const handleInsertLink = () => {
    const url = prompt('Enter URL link (e.g. https://jivathunai.org/terms):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  // Insert Image URL
  const handleInsertImage = () => {
    const url = prompt('Enter image URL to embed:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  // Insert Video Embed
  const handleInsertVideo = () => {
    const url = prompt('Enter video URL (e.g. MP4 link or YouTube/Vimeo embed URL):');
    if (url) {
      const videoHtml = `<div style="margin:16px 0;border-radius:12px;overflow:hidden;background:#000;"><video controls src="${url}" style="width:100%;max-height:400px;border-radius:12px;"></video></div>`;
      executeCommand('insertHTML', videoHtml);
    }
  };

  // Insert PDF Download Badge
  const handleInsertPdf = () => {
    const title = prompt('Enter PDF document title:', 'Official Legal Document');
    const url = prompt('Enter PDF download URL:');
    if (url) {
      const pdfHtml = `<div style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px;margin:10px 0;"><a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0f766e;font-weight:700;text-decoration:none;font-size:13px;">View / Download PDF: ${title}</a></div>`;
      executeCommand('insertHTML', pdfHtml);
    }
  };

  // Toggle Code View
  const toggleCodeView = () => {
    if (isCodeMode) {
      onChange?.(codeValue);
      if (editorRef.current) {
        editorRef.current.innerHTML = codeValue;
      }
      setIsCodeMode(false);
    } else {
      setCodeValue(editorRef.current ? editorRef.current.innerHTML : '');
      setIsCodeMode(true);
    }
  };

  const highlightColors = [
    { name: 'Yellow', color: '#fef08a' },
    { name: 'Emerald', color: '#a7f3d0' },
    { name: 'Sky', color: '#bae6fd' },
    { name: 'Rose', color: '#fecdd3' },
    { name: 'Orange', color: '#fed7aa' },
    { name: 'None', color: 'transparent' }
  ];

  const fonts = [
    { label: 'Inter (Sans)', value: 'Inter, sans-serif' },
    { label: 'Georgia (Serif)', value: 'Georgia, serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Courier (Mono)', value: 'Courier, monospace' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' }
  ];

  const fontSizes = [
    { label: '12px (Small)', value: '12px' },
    { label: '14px (Body)', value: '14px' },
    { label: '16px (Normal)', value: '16px' },
    { label: '18px (Medium)', value: '18px' },
    { label: '20px (Lead)', value: '20px' },
    { label: '24px (Title)', value: '24px' },
    { label: '28px (Headline)', value: '28px' },
    { label: '32px (Display)', value: '32px' }
  ];

  return (
    <div className="w-full border border-slate-300 rounded-2xl bg-white shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
      
      {/* WYSIWYG Controls Toolbar */}
      <div className="bg-slate-50/90 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1.5 text-slate-700">
        
        {/* Font Family Selector */}
        <select
          value={selectedFont}
          onChange={(e) => handleFontChange(e.target.value)}
          disabled={isCodeMode}
          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          title="Font Family"
        >
          {fonts.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Font Size Selector */}
        <select
          value={selectedFontSize}
          onChange={(e) => handleFontSizeChange(e.target.value)}
          disabled={isCodeMode}
          className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          title="Font Size"
        >
          {fontSizes.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Text Styling: Bold, Italic, Underline, Strikethrough */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('italic')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('underline')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 transition-colors"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('strikeThrough')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 transition-colors"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Highlight Text Feature */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHighlightPalette(prev => !prev)}
            disabled={isCodeMode}
            className="p-1.5 rounded-md hover:bg-slate-200/80 active:bg-slate-300 text-amber-700 transition-colors flex items-center gap-1"
            title="Text Highlighter"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          {showHighlightPalette && (
            <div className="absolute left-0 top-full mt-1.5 p-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 flex items-center gap-1.5 animate-in fade-in zoom-in-95">
              {highlightColors.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleHighlight(h.color)}
                  className="w-5 h-5 rounded-md border border-slate-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: h.color === 'transparent' ? '#ffffff' : h.color }}
                  title={`Highlight: ${h.name}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Text Color Picker */}
        <input
          type="color"
          onChange={(e) => executeCommand('foreColor', e.target.value)}
          disabled={isCodeMode}
          className="w-7 h-7 p-0.5 rounded-md border border-slate-200 cursor-pointer bg-white"
          title="Text Color"
        />

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Bullets & Numbered Lists */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 transition-colors font-black text-xs"
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 transition-colors font-black text-xs"
          title="Heading 3"
        >
          H3
        </button>

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<p>')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 transition-colors font-bold text-xs"
          title="Paragraph"
        >
          P
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Text Alignments */}
        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 text-slate-700 transition-colors"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 text-slate-700 transition-colors"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 text-slate-700 transition-colors"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Media & Link Inserters */}
        <button
          type="button"
          onClick={handleInsertLink}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 text-emerald-700 transition-colors"
          title="Insert Link"
        >
          <Link2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleInsertImage}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 text-blue-700 transition-colors"
          title="Insert Image by URL"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleInsertVideo}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 text-purple-700 transition-colors"
          title="Insert Video Embed"
        >
          <Video className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleInsertPdf}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 text-rose-700 transition-colors"
          title="Insert PDF Document Link"
        >
          <FileText className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Clear Formatting, Undo, Redo */}
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 text-slate-500 transition-colors"
          title="Clear Formatting"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('undo')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 text-slate-500 transition-colors ml-auto"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('redo')}
          disabled={isCodeMode}
          className="p-1.5 rounded-md hover:bg-slate-200/80 text-slate-500 transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>

        {/* Toggle HTML Code Mode */}
        <button
          type="button"
          onClick={toggleCodeView}
          className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1 ${
            isCodeMode ? 'bg-slate-900 text-white' : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
          }`}
          title="Toggle HTML Code View"
        >
          {isCodeMode ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
          <span>{isCodeMode ? 'Preview' : 'HTML'}</span>
        </button>

      </div>

      {/* Editor Content Area */}
      {isCodeMode ? (
        <textarea
          value={codeValue}
          onChange={(e) => {
            setCodeValue(e.target.value);
            onChange?.(e.target.value);
          }}
          className="w-full p-4 font-mono text-xs text-slate-900 bg-slate-900/5 focus:outline-none resize-y"
          style={{ minHeight }}
          placeholder="Raw HTML code..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="p-5 focus:outline-none overflow-y-auto leading-relaxed prose prose-sm max-w-none text-slate-900"
          style={{ 
            minHeight,
            fontFamily: selectedFont 
          }}
          data-placeholder={placeholder}
        />
      )}

      {/* Word and Character Count Status Bar */}
      <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>WYSIWYG Legal & Policy CMS Editor</span>
        <span>
          {codeValue ? codeValue.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length : 0} words
        </span>
      </div>

    </div>
  );
};
