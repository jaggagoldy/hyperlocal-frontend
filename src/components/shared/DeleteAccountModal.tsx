import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function DeleteAccountModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) setMounted(true);
    else setTimeout(() => setMounted(false), 200); // Wait for transition
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  const handleDelete = async () => {
    if (inputText !== 'DELETE') return;
    setLoading(true);
    try {
      await apiClient.delete('/user/me');
      toast.success('Account deleted successfully');
      logout();
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className={`fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-2xl shadow-2xl border border-destructive/20 transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-xl font-bold">Delete Account</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This action is <strong className="text-foreground">irreversible</strong>. It will permanently delete your account, vendor profile (if any), and all associated data except for historical orders which will be anonymized.
          </p>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Type <strong className="text-destructive">DELETE</strong> to confirm
            </label>
            <Input
              className="h-11 border-destructive/30 focus-visible:ring-destructive"
              placeholder="DELETE"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={inputText !== 'DELETE' || loading}
              className="font-bold shadow-lg shadow-destructive/20"
            >
              {loading ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
