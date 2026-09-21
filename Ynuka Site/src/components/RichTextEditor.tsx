import React, { useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Écrivez votre contenu ici...',
  className = '',
}) => {
  useEffect(() => {
    // Custom styles for the editor
    const style = document.createElement('style');
    style.textContent = `
      .ql-editor {
        min-height: 200px;
        font-size: 14px;
        line-height: 1.6;
      }
      .ql-toolbar {
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        background-color: hsl(var(--secondary));
      }
      .ql-container {
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        background-color: hsl(var(--background));
      }
      .ql-toolbar button {
        color: hsl(var(--muted-foreground));
      }
      .ql-toolbar button:hover {
        color: hsl(var(--foreground));
      }
      .ql-toolbar .ql-active {
        color: hsl(var(--primary));
      }
      .ql-stroke {
        stroke: hsl(var(--muted-foreground));
      }
      .ql-fill {
        fill: hsl(var(--muted-foreground));
      }
      .ql-toolbar button:hover .ql-stroke {
        stroke: hsl(var(--foreground));
      }
      .ql-toolbar button:hover .ql-fill {
        fill: hsl(var(--foreground));
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image',
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        theme="snow"
      />
    </div>
  );
};

export default RichTextEditor;
