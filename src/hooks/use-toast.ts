// Re-export sonner toast for compatibility with existing code
import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

function toast(options: ToastOptions) {
  const message = options.title || options.description || '';
  const description = options.title && options.description ? options.description : undefined;

  if (options.variant === 'destructive') {
    sonnerToast.error(message, { description });
  } else {
    sonnerToast.success(message, { description });
  }
}

export function useToast() {
  return { toast };
}

export { toast };
