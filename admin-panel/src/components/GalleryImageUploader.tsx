'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';

export default function GalleryImageUploader({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'ynuka/gallery');
        const response = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.url) throw new Error(data.error || `Échec de l’upload de ${file.name}`);
        uploaded.push(data.url);
      }
      onChange([...images, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Échec du téléversement.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(event) => { const files = Array.from(event.target.files || []); if (files.length) void uploadFiles(files); }} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? 'Téléversement...' : 'Ajouter des images'}
        </button>
        <span className="text-xs text-secondary">JPEG, PNG, WebP ou GIF · 10 Mo maximum par image</span>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
      {images.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((url, index) => <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-md border bg-gray-50 dark:border-slate-700 dark:bg-slate-800">
          <img src={url} alt={`Image ${index + 1}`} className="aspect-square w-full object-cover" />
          <button type="button" aria-label={`Retirer l’image ${index + 1}`} onClick={() => onChange(images.filter((_, imageIndex) => imageIndex !== index))} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"><X className="h-4 w-4" /></button>
        </div>)}
      </div>}
    </div>
  );
}
