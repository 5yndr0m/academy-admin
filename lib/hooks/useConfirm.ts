import { useState, useCallback } from "react";

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  variant?: "destructive" | "default";
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: ((confirmed: boolean) => void) | null;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        resolve,
        ...options,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state]);

  return {
    confirm,
    confirmState: state,
    handleConfirm,
    handleCancel,
  };
}
