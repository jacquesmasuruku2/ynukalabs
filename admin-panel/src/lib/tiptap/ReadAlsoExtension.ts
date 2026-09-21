import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ReadAlsoNode from './ReadAlsoNode';

export interface ReadAlsoAttributes {
  title: string;
  url: string;
  accentColor?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    readAlso: {
      insertReadAlso: (attributes: ReadAlsoAttributes) => ReturnType;
    };
  }
}

export const ReadAlsoExtension = Node.create<ReadAlsoAttributes>({
  name: 'readAlso',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      title: {
        default: '',
      },
      url: {
        default: '',
      },
      accentColor: {
        default: '#2563eb',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="read-also"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'read-also',
      'data-title': HTMLAttributes.title || '',
      'data-url': HTMLAttributes.url || '',
      'data-accent-color': HTMLAttributes.accentColor || '#2563eb',
    })];
  },

  addCommands() {
    return {
      insertReadAlso:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ReadAlsoNode);
  },
});
