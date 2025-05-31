// Mock drawing data
export interface MockDrawing {
  id: string;
  userId: string;
  title: string;
  description?: string;
  svgData: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isPublic: boolean;
  tags: string[];
}

// Sample SVG paths for mock drawings
const sampleSvgPaths = [
  'M50,50 L200,50 L200,200 L50,200 Z', // Square
  'M100,50 A50,50 0 1,1 100,150 A50,50 0 1,1 100,50 Z', // Circle
  'M50,50 L150,50 L100,150 Z', // Triangle
  'M50,50 C100,0 150,100 200,50 S300,150 350,50', // Curve
  'M50,50 L200,50 L200,100 L100,100 L100,200 L50,200 Z', // Complex shape
];

// Generate a random SVG drawing with multiple paths and colors
const generateRandomSvg = (): string => {
  const numPaths = Math.floor(Math.random() * 5) + 1;
  const colors = ['#4361EE', '#FF6B6B', '#4CAF50', '#FFC107', '#F44336', '#2196F3'];

  let svgData = '';
  for (let i = 0; i < numPaths; i++) {
    const pathIndex = Math.floor(Math.random() * sampleSvgPaths.length);
    const colorIndex = Math.floor(Math.random() * colors.length);
    const strokeWidth = Math.floor(Math.random() * 5) + 1;

    svgData += `<path d="${sampleSvgPaths[pathIndex]}" stroke="${colors[colorIndex]}" stroke-width="${strokeWidth}" fill="none" />`;
  }

  return svgData;
};

export const mockDrawings: MockDrawing[] = [
  {
    id: 'drawing-1',
    userId: 'user-1',
    title: 'Tropical Rainforest',
    description: 'A drawing of a tropical rainforest with various animals',
    svgData: generateRandomSvg(),
    createdAt: '2025-03-15T10:30:00Z',
    updatedAt: '2025-03-15T10:45:00Z',
    likes: 24,
    isPublic: true,
    tags: ['nature', 'rainforest', 'animals'],
  },
  {
    id: 'drawing-2',
    userId: 'user-1',
    title: 'Tropical Bird',
    description: 'A colorful tropical bird from the rainforest',
    svgData: generateRandomSvg(),
    createdAt: '2025-03-16T14:20:00Z',
    updatedAt: '2025-03-16T14:35:00Z',
    likes: 18,
    isPublic: true,
    tags: ['bird', 'tropical', 'colorful'],
  },
  {
    id: 'drawing-3',
    userId: 'user-2',
    title: 'Jungle Landscape',
    description: 'A beautiful jungle landscape with a river',
    svgData: generateRandomSvg(),
    createdAt: '2025-03-14T09:10:00Z',
    updatedAt: '2025-03-14T09:30:00Z',
    likes: 32,
    isPublic: true,
    tags: ['landscape', 'jungle', 'river'],
  },
  {
    id: 'drawing-4',
    userId: 'user-2',
    title: 'Exotic Flowers',
    description: 'Various exotic flowers from the Amazon',
    svgData: generateRandomSvg(),
    createdAt: '2025-03-17T11:45:00Z',
    updatedAt: '2025-03-17T12:00:00Z',
    likes: 15,
    isPublic: true,
    tags: ['flowers', 'exotic', 'colorful'],
  },
  {
    id: 'drawing-5',
    userId: 'user-3',
    title: 'Jungle Animals',
    description: 'Various animals found in the Amazon jungle',
    svgData: generateRandomSvg(),
    createdAt: '2025-03-18T16:30:00Z',
    updatedAt: '2025-03-18T16:50:00Z',
    likes: 9,
    isPublic: true,
    tags: ['animals', 'jungle', 'wildlife'],
  },
];
