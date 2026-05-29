'use client';

import { useSavedProsStore } from '@/store/useSavedProsStore';
import { CatalogItem } from '@/types/models';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface SaveProButtonProps {
  item: CatalogItem;
}

export function SaveProButton({ item }: SaveProButtonProps) {
  const { isSaved, savePro, removePro } = useSavedProsStore();
  const saved = isSaved(item.id);

  const toggleSave = () => {
    if (saved) {
      removePro(item.id);
      toast.success('Removed from Saved Pros');
    } else {
      savePro(item);
      toast.success('Saved Pro successfully!');
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleSave();
      }}
      className="p-2 rounded-full bg-white border border-zinc-200 shadow-sm hover:scale-105 transition-all text-zinc-400 hover:text-rose-500"
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
    </button>
  );
}
