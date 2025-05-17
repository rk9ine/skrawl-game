import { create } from 'zustand';
import { drawingsApi } from '../services/mockApi';
import { MockDrawing } from '../mock';
import { DrawingPath } from '../types/drawing';

// Simple helper function to ensure numbers are valid
const ensureValidNumber = (num: number): number => {
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }
  return Math.round(num * 10) / 10; // Less precision for better performance
};

// Helper function to simplify SVG paths by removing redundant points
// This improves rendering performance by reducing the number of points
const simplifyPath = (path: string): string => {
  try {
    // Split the path into segments
    const segments = path.split(' ');
    if (segments.length <= 2) return path; // No simplification needed for short paths

    // Keep the first move command
    const result = [segments[0]];

    // Tolerance for point simplification (in pixels)
    const tolerance = 3; // Slightly higher tolerance for better performance

    // Process line segments
    let prevX = 0, prevY = 0;

    // Extract the starting point
    if (segments[0].startsWith('M')) {
      const parts = segments[0].substring(1).split(',');
      if (parts.length === 2) {
        prevX = Number(parts[0]) || 0;
        prevY = Number(parts[1]) || 0;
      }
    }

    // Process all line segments
    for (let i = 1; i < segments.length; i++) {
      if (segments[i].startsWith('L')) {
        const parts = segments[i].substring(1).split(',');
        if (parts.length !== 2) continue;

        const x = Number(parts[0]) || 0;
        const y = Number(parts[1]) || 0;

        // Calculate distance from previous point
        const dx = x - prevX;
        const dy = y - prevY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only keep points that are far enough from the previous point
        if (distance > tolerance) {
          result.push(`L${x},${y}`);
          prevX = x;
          prevY = y;
        }
      } else {
        // Keep any non-line commands
        result.push(segments[i]);
      }
    }

    return result.join(' ');
  } catch (error) {
    console.error('Error simplifying path:', error);
    return path; // Return original path if simplification fails
  }
};

interface DrawingState {
  // Canvas state
  paths: DrawingPath[];
  currentPath: string;
  color: string;
  strokeWidth: number;

  // Drawing metadata
  title: string;
  description: string;
  isPublic: boolean;
  tags: string[];

  // Saved drawings
  savedDrawings: MockDrawing[];
  isLoading: boolean;

  // Actions
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  startPath: (x: number, y: number) => void;
  addToPath: (x: number, y: number) => void;
  endPath: () => void;
  clearCanvas: () => void;
  undoLastPath: () => void;

  // Metadata actions
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  // Save/load actions
  saveDrawing: (userId: string) => Promise<MockDrawing | null>;
  loadDrawings: (userId: string) => Promise<void>;
  loadDrawingById: (drawingId: string) => Promise<MockDrawing | null>;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  // Canvas state
  paths: [],
  currentPath: '',
  color: '#4361EE', // Default to primary color
  strokeWidth: 5,

  // Drawing metadata
  title: '',
  description: '',
  isPublic: true,
  tags: [],

  // Saved drawings
  savedDrawings: [],
  isLoading: false,

  // Actions
  setColor: (color) => set({ color }),

  setStrokeWidth: (width) => set({ strokeWidth: width }),

  // Simple path creation
  startPath: (x, y) => {
    try {
      // Ensure coordinates are valid numbers
      const validX = ensureValidNumber(x);
      const validY = ensureValidNumber(y);

      // Start a new path
      set({ currentPath: `M${validX},${validY}` });
    } catch (error) {
      console.error('Error in startPath:', error);
      set({ currentPath: 'M0,0' });
    }
  },

  // Simple path updates
  addToPath: (x, y) => {
    try {
      // Ensure coordinates are valid numbers
      const validX = ensureValidNumber(x);
      const validY = ensureValidNumber(y);

      // Add point to the current path
      set(state => {
        // Skip points that are too close to the last point (optimization)
        const lastPoint = state.currentPath.split(' ').pop();
        if (lastPoint && lastPoint.startsWith('L')) {
          const parts = lastPoint.substring(1).split(',');
          if (parts.length === 2) {
            const lastX = Number(parts[0]) || 0;
            const lastY = Number(parts[1]) || 0;

            const dx = validX - lastX;
            const dy = validY - lastY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Skip if the point is too close (less than 2 pixels away)
            if (distance < 2) {
              return state;
            }
          }
        }

        return { currentPath: `${state.currentPath} L${validX},${validY}` };
      });
    } catch (error) {
      console.error('Error in addToPath:', error);
    }
  },

  // Simple path completion
  endPath: () => {
    try {
      const { currentPath, color, strokeWidth, paths } = get();

      // Only add the path if it's valid and not just a single point
      if (currentPath && currentPath.includes('L')) {
        // Simplify the path by removing redundant points (performance optimization)
        const simplifiedPath = simplifyPath(currentPath);

        const newPath: DrawingPath = {
          id: Date.now().toString(),
          path: simplifiedPath,
          color,
          strokeWidth,
        };

        // Batch update for better performance
        set({
          paths: [...paths, newPath],
          currentPath: '',
        });
      } else {
        // Just clear the current path if it's invalid or just a single point
        set({ currentPath: '' });
      }
    } catch (error) {
      console.error('Error in endPath:', error);
      set({ currentPath: '' });
    }
  },

  clearCanvas: () => {
    set({
      paths: [],
      currentPath: '',
      currentPoints: [],
    });
  },

  undoLastPath: () => {
    const { paths } = get();

    if (paths.length > 0) {
      const newPaths = [...paths];
      newPaths.pop();

      set({ paths: newPaths });
    }
  },

  // Metadata actions
  setTitle: (title) => set({ title }),

  setDescription: (description) => set({ description }),

  setIsPublic: (isPublic) => set({ isPublic }),

  addTag: (tag) => {
    const { tags } = get();

    if (!tags.includes(tag)) {
      set({ tags: [...tags, tag] });
    }
  },

  removeTag: (tag) => {
    const { tags } = get();

    set({ tags: tags.filter(t => t !== tag) });
  },

  // Save/load actions
  saveDrawing: async (userId) => {
    const { paths, title, description, isPublic, tags } = get();

    if (paths.length === 0) {
      return null;
    }

    try {
      // Convert paths to SVG data
      const svgData = paths.map(p =>
        `<path d="${p.path}" stroke="${p.color}" stroke-width="${p.strokeWidth}" fill="none" />`
      ).join('');

      const drawing = await drawingsApi.saveDrawing({
        userId,
        title: title || 'Untitled Drawing',
        description,
        svgData,
        isPublic,
        tags,
      });

      return drawing;
    } catch (error) {
      console.error('Error saving drawing:', error);
      return null;
    }
  },

  loadDrawings: async (userId) => {
    try {
      set({ isLoading: true });

      const drawings = await drawingsApi.getDrawingsByUser(userId);

      set({
        savedDrawings: drawings,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading drawings:', error);
      set({ isLoading: false });
    }
  },

  loadDrawingById: async (drawingId) => {
    try {
      set({ isLoading: true });

      const drawing = await drawingsApi.getDrawingById(drawingId);

      set({ isLoading: false });

      return drawing;
    } catch (error) {
      console.error('Error loading drawing:', error);
      set({ isLoading: false });
      return null;
    }
  },
}));
