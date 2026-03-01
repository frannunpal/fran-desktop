import { useCallback, useEffect, useRef } from 'react';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { useCloseModalStore } from '@presentation/Store/closeModalStore';

const closeInterceptors = new Map<string, () => boolean>();

export const registerCloseInterceptor = (windowId: string, interceptor: () => boolean) => {
  closeInterceptors.set(windowId, interceptor);
};

export const unregisterCloseInterceptor = (windowId: string) => {
  closeInterceptors.delete(windowId);
};

export const getCloseInterceptor = (windowId: string): (() => boolean) | undefined => {
  return closeInterceptors.get(windowId);
};

export interface UseCloseInterceptorOptions {
  isDirtyGetter: () => boolean;
  windowId?: string;
  onDiscard?: () => void;
}

export function useCloseInterceptor({
  isDirtyGetter,
  windowId,
  onDiscard,
}: UseCloseInterceptorOptions) {
  const windows = useDesktopStore(state => state.windows);
  const closeWindow = useDesktopStore(state => state.closeWindow);
  const openModal = useCloseModalStore(state => state.openModal);

  const activeWindowId = windowId ?? windows.find(w => w.isOpen)?.id;
  const isDirtyGetterRef = useRef(isDirtyGetter);
  const isActiveRef = useRef(false);
  const onDiscardRef = useRef(onDiscard);

  const handleDiscard = useCallback(() => {
    if (!activeWindowId) return;
    onDiscardRef.current?.();
    closeWindow(activeWindowId);
  }, [activeWindowId, closeWindow]);

  const handleSave = useCallback(() => {
    if (!activeWindowId) return;
    closeWindow(activeWindowId);
  }, [activeWindowId, closeWindow]);

  useEffect(() => {
    if (!activeWindowId) return;

    isActiveRef.current = true;

    const closeInterceptor = () => {
      if (!isActiveRef.current) return true;
      const isDirty = isDirtyGetterRef.current();
      if (isDirty) {
        openModal(activeWindowId, handleSave, handleDiscard);
        return false;
      }
      return true;
    };

    registerCloseInterceptor(activeWindowId, closeInterceptor);

    return () => {
      isActiveRef.current = false;
      unregisterCloseInterceptor(activeWindowId);
    };
  }, [activeWindowId, openModal, handleSave, handleDiscard]);
}
