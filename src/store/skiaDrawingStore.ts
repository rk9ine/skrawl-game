import { create } from 'zustand';
import { Skia, SkPath, Paint, PaintStyle, StrokeCap, StrokeJoin } from '@shopify/react-native-skia';

export interface CurrentPath {
  path: SkPath;
  paint: Paint;
  color: string;
}

interface SkiaDrawingState {
  // Paths that have been completed (user lifted finger)
  completedPaths: CurrentPath[];
  // Current stroke settings
  stroke: Paint;
  strokeWidth: number;
  color: string;
  // Canvas information
  canvasInfo: { width: number; height: number } | null;
  
  // Actions
  setCompletedPaths: (paths: CurrentPath[]) => void;
  setStroke: (stroke: Paint) => void;
  setStrokeWidth: (width: number) => void;
  setColor: (color: string) => void;
  setCanvasInfo: (info: { width: number; height: number }) => void;
  
  // Drawing actions
  undoLastPath: () => void;
  clearCanvas: () => void;
}

// History for undo/redo
const history: {
  undo: CurrentPath[];
  redo: CurrentPath[];
} = {
  undo: [],
  redo: []
};

// Create a paint object with the given stroke width and color
export const getPaint = (strokeWidth: number, color: string): Paint => {
  const paint = Skia.Paint();
  paint.setStrokeWidth(strokeWidth);
  paint.setStrokeMiter(5);
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);
  paint.setAntiAlias(true);
  const _color = paint.copy();
  _color.setColor(Skia.Color(color));
  return _color;
};

export const useSkiaDrawingStore = create<SkiaDrawingState>((set, get) => ({
  completedPaths: [],
  stroke: getPaint(5, '#4361EE'),
  strokeWidth: 5,
  color: '#4361EE',
  canvasInfo: null,
  
  setCompletedPaths: (paths) => set({ completedPaths: paths }),
  
  setStroke: (stroke) => set({ stroke }),
  
  setStrokeWidth: (width) => {
    set({ strokeWidth: width });
    // Update the stroke with the new width
    const { color } = get();
    set({ stroke: getPaint(width, color) });
  },
  
  setColor: (color) => {
    set({ color });
    // Update the stroke with the new color
    const { strokeWidth } = get();
    set({ stroke: getPaint(strokeWidth, color) });
  },
  
  setCanvasInfo: (info) => set({ canvasInfo: info }),
  
  undoLastPath: () => {
    if (history.undo.length === 0) return;
    
    // Get the last path in history
    const lastPath = history.undo[history.undo.length - 1];
    
    // Add the path to redo history
    history.redo.push(lastPath);
    
    // Remove path from undo history
    history.undo.splice(history.undo.length - 1, 1);
    
    // Update global state
    set({ completedPaths: [...history.undo] });
  },
  
  clearCanvas: () => {
    // Clear history
    history.undo = [];
    history.redo = [];
    
    // Clear paths
    set({ completedPaths: [] });
  },
}));

// Helper function to push a path to history
export const pushToHistory = (path: CurrentPath) => {
  history.undo.push(path);
  // Clear redo history when a new path is added
  history.redo = [];
};

// Helper function to redo a path
export const redoPath = () => {
  if (history.redo.length === 0) return;
  
  // Get the last path from redo history
  const lastPath = history.redo[history.redo.length - 1];
  
  // Remove the path from redo history
  history.redo.splice(history.redo.length - 1, 1);
  
  // Add the path to undo history
  history.undo.push(lastPath);
  
  // Update the state
  useSkiaDrawingStore.getState().setCompletedPaths([...history.undo]);
};
