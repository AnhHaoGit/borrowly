import { toast } from "sonner";

interface NotifyOptions {
  description?: string;
  id?: string | number;
}

export const notify = {
  success: (message: string, options?: NotifyOptions) =>
    toast.success(message, options),
  error: (message: string, options?: NotifyOptions) =>
    toast.error(message, options),
  info: (message: string, options?: NotifyOptions) =>
    toast.info(message, options),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) => toast.promise(promise, messages),
};
