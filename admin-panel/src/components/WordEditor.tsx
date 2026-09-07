'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useState, useEffect, useRef } from 'react';
import { 
  Scissors, 
  Copy, 
  Clipboard, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  IndentDecrease,
  Minus,
  Plus,
  Type,
  Palette,
  Search,
  ZoomIn,
  ZoomOut,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table,
  ExternalLink,
  Link as LinkIcon,
  Unlink,
  X
} from 'lucide-react';
import { ReadAlsoExtension } from '@/lib/tiptap/ReadAlsoExtension';
import ReadAlsoModal from '@/components/ReadAlsoModal';

interface WordEditorProps {
  content: string | Record<string, unknown> | null | undefined;
  onChange: (content: string) => void;
}

export default function WordEditor({ content, onChange }: WordEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState('home');
  const [fontSize, setFontSize] = useState('11');
  const [lineHeight, setLineHeight] = useState('1.5');
  const [isReadAlsoModalOpen, setIsReadAlsoModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState(false);
  const [isHighlightColorPickerOpen, setIsHighlightColorPickerOpen] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const previousScrollY = useRef(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic',
          },
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      ReadAlsoExtension,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      updateCounts(editor.getText());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();
    const nextContent =
      typeof content === 'string'
        ? content
        : content && typeof content === 'object'
          ? content
          : '<p></p>';

    const shouldReplace =
      typeof nextContent === 'string'
        ? nextContent !== currentContent
        : JSON.stringify(nextContent) !== JSON.stringify(editor.getJSON());

    if (shouldReplace) {
      editor.commands.setContent(nextContent as any, { emitUpdate: false });
    }

    updateCounts(editor.getText());
  }, [editor, content]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 1024 || !toolbarRef.current) return;

      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < previousScrollY.current;
      const toolbarReachedTop = toolbarRef.current.getBoundingClientRect().top <= 56;

      window.dispatchEvent(new CustomEvent('editor-toolbar-visibility', {
        detail: window.scrollY > 0 && scrollingUp && toolbarReachedTop,
      }));
      previousScrollY.current = currentScrollY;
    };

    previousScrollY.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.dispatchEvent(new CustomEvent('editor-toolbar-visibility', { detail: false }));
    };
  }, []);

  const updateCounts = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(200, Math.max(50, prev + delta)));
  };

  const handleInsertReadAlso = (title: string, url: string, accentColor?: string) => {
    if (editor) {
      editor.chain().focus().insertReadAlso({ title, url, accentColor }).run();
    }
  };

  const handleSetLink = () => {
    if (editor && linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setIsLinkModalOpen(false);
    }
  };

  const handleUnsetLink = () => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  };

  const handleTextColorChange = (color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
      setTextColor(color);
      setIsTextColorPickerOpen(false);
    }
  };

  const handleHighlightColorChange = (color: string) => {
    if (editor) {
      // Pour la surbrillance, on utilise setMark avec un style inline
      editor.chain()
        .focus()
        .setMark('textStyle', {
          style: `background-color: ${color}`
        })
        .run();
      setHighlightColor(color);
      setIsHighlightColorPickerOpen(false);
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative isolate bg-[#f3f3f1] rounded-xl overflow-visible border border-[#d9d9d7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
      <div ref={toolbarRef} className="sticky top-0 z-50 max-w-full bg-[#f7f6f4] border-b border-[#d5d2ce] shadow-[0_1px_0_rgba(15,23,42,0.06)]">
        <div className="flex border-b border-[#e6e2dd] bg-[#f3f1ee]">
          {['home', 'insert', 'layout'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                activeTab === tab
                  ? 'bg-white text-[#0f172a] border-b-2 border-[#2563eb]'
                  : 'text-[#475569] hover:bg-white/70'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Home Tab Content */}
        {activeTab === 'home' && (
          <div className="p-2 flex flex-wrap gap-1 items-center bg-gradient-to-b from-gray-50 to-white">
            {/* Clipboard Group */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
              <button
                type="button"
                onClick={() => navigator.clipboard.readText().then(text => editor.chain().focus().insertContent(text).run())}
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Coller"
              >
                <Clipboard className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('cut')}
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Couper"
              >
                <Scissors className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('copy')}
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Copier"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Font Group */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
              <select
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-blue-50"
                title="Police"
              >
                <option>Calibri</option>
                <option>Arial</option>
                <option>Inter</option>
                <option>Times New Roman</option>
              </select>
              <select
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-blue-50 w-16"
                title="Taille"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
              >
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="18">18</option>
                <option value="20">20</option>
                <option value="24">24</option>
              </select>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Gras (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Italique (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`p-2 rounded ${editor.isActive('strike') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Barré"
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`p-2 rounded ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Souligné (Ctrl+U)"
                >
                  <UnderlineIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="p-1 hover:bg-blue-100 rounded transition-colors text-xs font-bold"
                  title="Indice"
                >
                  x₂
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-blue-100 rounded transition-colors text-xs font-bold"
                  title="Exposant"
                >
                  x²
                </button>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(true)}
                  className={`p-1 rounded ${editor.isActive('link') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                  title="Insérer un lien"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleUnsetLink}
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  title="Supprimer le lien"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1 relative">
                <button
                  type="button"
                  onClick={() => setIsTextColorPickerOpen(!isTextColorPickerOpen)}
                  className="p-1 hover:bg-blue-100 rounded transition-colors relative"
                  title="Couleur du texte"
                >
                  <Type className="w-4 h-4" />
                  <div 
                    className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
                    style={{ backgroundColor: textColor }}
                  />
                </button>
                {isTextColorPickerOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-50">
                    <div className="grid grid-cols-5 gap-1">
                      {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#008800'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleTextColorChange(color)}
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => handleTextColorChange(e.target.value)}
                      className="w-full mt-2 h-8 cursor-pointer"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-1 relative">
                <button
                  type="button"
                  onClick={() => setIsHighlightColorPickerOpen(!isHighlightColorPickerOpen)}
                  className="p-1 hover:bg-blue-100 rounded transition-colors relative"
                  title="Couleur de surbrillance"
                >
                  <Palette className="w-4 h-4" />
                  <div 
                    className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
                    style={{ backgroundColor: highlightColor }}
                  />
                </button>
                {isHighlightColorPickerOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-50">
                    <div className="grid grid-cols-5 gap-1">
                      {['#ffff00', '#00ffff', '#ff00ff', '#ff8800', '#88ff00', '#ffffff', '#cccccc', '#ffcccc', '#ccffcc', '#ccccff'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleHighlightColorChange(color)}
                          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={highlightColor}
                      onChange={(e) => handleHighlightColorChange(e.target.value)}
                      className="w-full mt-2 h-8 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Paragraph Group */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Aligner à gauche"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Centrer"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Aligner à droite"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`p-2 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Justifier"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Liste à puces"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Liste numérotée"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
              <button
                type="button"
                onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Augmenter le retrait"
              >
                <Indent className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().liftListItem('listItem').run()}
                className="p-2 hover:bg-blue-100 rounded transition-colors"
                title="Diminuer le retrait"
              >
                <IndentDecrease className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <select
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-blue-50"
                title="Interligne"
                value={lineHeight}
                onChange={(e) => setLineHeight(e.target.value)}
              >
                <option value="1.0">1.0</option>
                <option value="1.15">1.15</option>
                <option value="1.5">1.5</option>
                <option value="2.0">2.0</option>
              </select>
            </div>

            {/* Styles Group */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`px-3 py-1 text-sm rounded ${editor.isActive('paragraph') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Normal"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-3 py-1 text-sm font-bold rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Titre 1"
              >
                <Heading1 className="w-4 h-4 inline" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-1 text-sm font-bold rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Titre 2"
              >
                <Heading2 className="w-4 h-4 inline" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-3 py-1 text-sm font-bold rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Titre 3"
              >
                <Heading3 className="w-4 h-4 inline" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`px-3 py-1 text-sm rounded ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-100'} transition-colors`}
                title="Citation"
              >
                <Quote className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        )}

        {/* Insert Tab */}
        {activeTab === 'insert' && (
          <div className="p-2 flex gap-2 items-center bg-gradient-to-b from-gray-50 to-white">
            <button 
              type="button"
              onClick={() => setIsReadAlsoModalOpen(true)}
              className="p-2 hover:bg-blue-100 rounded transition-colors flex items-center gap-2" 
              title="Insérer un article recommandé"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">À lire aussi</span>
            </button>
            <button type="button" className="p-2 hover:bg-blue-100 rounded transition-colors" title="Insérer une image">
              <FileText className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 hover:bg-blue-100 rounded transition-colors" title="Insérer un lien">
              <Search className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="p-2 flex gap-2 items-center bg-gradient-to-b from-gray-50 to-white">
            <button type="button" className="p-2 hover:bg-blue-100 rounded transition-colors" title="Orientation">
              <FileText className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 hover:bg-blue-100 rounded transition-colors" title="Marges">
              <FileText className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#dfe0df] h-6 border-b border-[#c9c7c4] flex items-center px-4">
        <div className="flex-1 flex items-center gap-1">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-px h-3 bg-[#8a8a88]"></div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto bg-[#f4f4f3] p-3 sm:p-6 lg:p-8" style={{ minHeight: '600px' }}>
        <div 
          className="mx-auto min-h-[900px] bg-white p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.08)] sm:p-8 lg:p-12"
          style={{ 
            width: '100%',
            maxWidth: '1500px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center'
          }}
        >
            <EditorContent editor={editor} className="prose prose-sm min-w-0 max-w-none break-words focus:outline-none min-h-[760px] leading-relaxed text-[15px] sm:prose-base" />
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-[#1f2937] px-4 py-2 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {wordCount} mots
          </span>
          <span>{charCount} caractères</span>
          <span className="flex items-center gap-1">
            <Type className="w-3 h-3" />
            Français (France)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleZoom(-10)}
            className="p-1 hover:bg-gray-700 rounded"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center">{zoom}%</span>
          <button
            type="button"
            onClick={() => handleZoom(10)}
            className="p-1 hover:bg-gray-700 rounded"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Read Also Modal */}
      <ReadAlsoModal
        isOpen={isReadAlsoModalOpen}
        onClose={() => setIsReadAlsoModalOpen(false)}
        onInsert={handleInsertReadAlso}
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Insérer un lien
              </h2>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du lien
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="https://..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSetLink();
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSetLink}
                disabled={!linkUrl}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
