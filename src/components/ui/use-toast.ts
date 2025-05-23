// Re-export the toast from Sonner
import { toast } from 'sonner';

// We'll export it for backward compatibility
export { toast };

// The original useToast hook is no longer needed, but
// we'll keep a minimal implementation for compatibility
export const useToast = () => {
  return {
    toast,
    toasts: [], // Empty toasts array for compatibility
  };
};
