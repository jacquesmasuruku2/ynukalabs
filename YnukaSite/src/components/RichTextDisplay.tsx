import React, { useEffect } from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
  content,
  className = '',
}) => {
  useEffect(() => {
    // Custom styles for the displayed content
    const style = document.createElement('style');
    style.textContent = `
      .rich-text-content h1 {
        font-size: 2rem;
        font-weight: bold;
        margin: 1.5rem 0 1rem;
        line-height: 1.2;
      }
      .rich-text-content h2 {
        font-size: 1.75rem;
        font-weight: bold;
        margin: 1.25rem 0 0.75rem;
        line-height: 1.3;
      }
      .rich-text-content h3 {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 1rem 0 0.5rem;
        line-height: 1.4;
      }
      .rich-text-content h4 {
        font-size: 1.25rem;
        font-weight: bold;
        margin: 0.75rem 0 0.5rem;
        line-height: 1.5;
      }
      .rich-text-content h5 {
        font-size: 1.125rem;
        font-weight: bold;
        margin: 0.5rem 0 0.25rem;
        line-height: 1.5;
      }
      .rich-text-content h6 {
        font-size: 1rem;
        font-weight: bold;
        margin: 0.5rem 0 0.25rem;
        line-height: 1.5;
      }
      .rich-text-content p {
        margin: 0.75rem 0;
        line-height: 1.7;
      }
      .rich-text-content ul, .rich-text-content ol {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
      }
      .rich-text-content li {
        margin: 0.25rem 0;
        line-height: 1.6;
      }
      .rich-text-content ul {
        list-style-type: disc;
      }
      .rich-text-content ol {
        list-style-type: decimal;
      }
      .rich-text-content strong {
        font-weight: bold;
      }
      .rich-text-content em {
        font-style: italic;
      }
      .rich-text-content u {
        text-decoration: underline;
      }
      .rich-text-content s {
        text-decoration: line-through;
      }
      .rich-text-content a {
        color: hsl(var(--primary));
        text-decoration: underline;
      }
      .rich-text-content a:hover {
        color: hsl(var(--primary) / 0.8);
      }
      .rich-text-content blockquote {
        border-left: 4px solid hsl(var(--primary));
        padding-left: 1rem;
        margin: 1rem 0;
        font-style: italic;
        color: hsl(var(--muted-foreground));
      }
      .rich-text-content img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin: 1rem 0;
      }
      .rich-text-content code {
        background-color: hsl(var(--secondary));
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.9em;
      }
      .rich-text-content pre {
        background-color: hsl(var(--secondary));
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1rem 0;
      }
      .rich-text-content pre code {
        background-color: transparent;
        padding: 0;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
