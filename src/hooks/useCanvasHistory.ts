import { useCallback, useRef, useState } from 'react';
import { fabric } from 'fabric';

interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

export const useCanvasHistory = (canvas: fabric.Canvas | null) => {
  const [historyState, setHistoryState] = useState<HistoryState>({
    canUndo: false,
    canRedo: false,
  });
  
  const historyStack = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const isRedoing = useRef(false);
  const isUndoing = useRef(false);

  const saveState = useCallback(() => {
    if (!canvas || isRedoing.current || isUndoing.current) return;

    const currentState = JSON.stringify(canvas.toJSON());
    
    // Remove any states after current index (when undoing then making new changes)
    historyStack.current = historyStack.current.slice(0, historyIndex.current + 1);
    
    // Add new state
    historyStack.current.push(currentState);
    historyIndex.current = historyStack.current.length - 1;
    
    // Limit history to 50 states
    if (historyStack.current.length > 50) {
      historyStack.current.shift();
      historyIndex.current--;
    }
    
    updateHistoryState();
  }, [canvas]);

  const updateHistoryState = useCallback(() => {
    setHistoryState({
      canUndo: historyIndex.current > 0,
      canRedo: historyIndex.current < historyStack.current.length - 1,
    });
  }, []);

  const undo = useCallback(() => {
    if (!canvas || historyIndex.current <= 0) return;

    isUndoing.current = true;
    historyIndex.current--;
    
    const previousState = historyStack.current[historyIndex.current];
    canvas.loadFromJSON(previousState, () => {
      canvas.renderAll();
      isUndoing.current = false;
      updateHistoryState();
    });
  }, [canvas, updateHistoryState]);

  const redo = useCallback(() => {
    if (!canvas || historyIndex.current >= historyStack.current.length - 1) return;

    isRedoing.current = true;
    historyIndex.current++;
    
    const nextState = historyStack.current[historyIndex.current];
    canvas.loadFromJSON(nextState, () => {
      canvas.renderAll();
      isRedoing.current = false;
      updateHistoryState();
    });
  }, [canvas, updateHistoryState]);

  const initializeHistory = useCallback(() => {
    if (!canvas) return;

    // Save initial state
    const initialState = JSON.stringify(canvas.toJSON());
    historyStack.current = [initialState];
    historyIndex.current = 0;
    updateHistoryState();
  }, [canvas, updateHistoryState]);

  return {
    saveState,
    undo,
    redo,
    initializeHistory,
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
  };
};
