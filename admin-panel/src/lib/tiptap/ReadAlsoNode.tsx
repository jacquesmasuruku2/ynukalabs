'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import { ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { ReactNodeViewProps } from '@tiptap/react';

export default function ReadAlsoNode(props: ReactNodeViewProps) {
  const { node, updateAttributes, deleteNode } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(node.attrs.title);
  const [url, setUrl] = useState(node.attrs.url);
  const [accentColor, setAccentColor] = useState(node.attrs.accentColor || '#2563eb');

  const handleSave = () => {
    updateAttributes({ title, url, accentColor });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(node.attrs.title);
    setUrl(node.attrs.url);
    setAccentColor(node.attrs.accentColor || '#2563eb');
    setIsEditing(false);
  };

  const badgeStyle = {
    backgroundColor: accentColor,
  };

  const linkStyle = {
    color: accentColor,
  };

  return (
    <NodeViewWrapper className="my-8">
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          {/* Edit controls */}
          <div className="flex justify-end gap-2 mb-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={deleteNode}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </>
            )}
          </div>

          {isEditing ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de l'article
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Entrez le titre..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'article
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur d'accentuation
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="#2563eb"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Badge with arrow */}
              <div className="flex justify-center mb-2">
                <div 
                  className="relative px-4 py-1 text-white text-xs font-semibold uppercase tracking-wide"
                  style={badgeStyle}
                >
                  À lire aussi
                  <div 
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                    style={{ borderTopColor: accentColor }}
                  />
                </div>
              </div>

              {/* Content Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6">
                <a 
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-bold text-lg hover:underline transition-colors"
                  style={linkStyle}
                >
                  <ArrowRight className="w-5 h-5 flex-shrink-0" />
                  <span>{title}</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
