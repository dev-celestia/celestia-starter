"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AutosaveState {
  saving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
  dirty: boolean;
}

/**
 * Periodic background auto-save (PRD: every 10 seconds on change). Mark the
 * form dirty on every change; the hook saves on the next interval tick and
 * exposes flush() for manual saves (Cmd+S / publish actions).
 */
export function useAutosave(
  save: () => Promise<boolean>,
  intervalMs: number,
  enabled: boolean,
) {
  const [state, setState] = useState<AutosaveState>({
    saving: false,
    lastSavedAt: null,
    error: null,
    dirty: false,
  });

  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);

  const markDirty = useCallback(() => {
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      setState((s) => ({ ...s, dirty: true }));
    }
  }, []);

  const runSave = useCallback(async () => {
    if (savingRef.current || !dirtyRef.current) return;
    savingRef.current = true;
    dirtyRef.current = false;
    setState((s) => ({ ...s, saving: true, dirty: false }));
    try {
      const ok = await saveRef.current();
      if (ok) {
        setState({ saving: false, lastSavedAt: new Date(), error: null, dirty: dirtyRef.current });
      } else {
        dirtyRef.current = true;
        setState({ saving: false, lastSavedAt: null, error: "Save failed — will retry", dirty: true });
      }
    } catch {
      dirtyRef.current = true;
      setState({ saving: false, lastSavedAt: null, error: "Save failed — will retry", dirty: true });
    } finally {
      savingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => {
      void runSave();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [enabled, intervalMs, runSave]);

  const flush = useCallback(async () => {
    dirtyRef.current = true;
    await runSave();
  }, [runSave]);

  const clearDirty = useCallback(() => {
    dirtyRef.current = false;
    setState((s) => ({ ...s, dirty: false }));
  }, []);

  return { ...state, markDirty, flush, clearDirty };
}
