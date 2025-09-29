import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

export interface CanvasData {
  id: string;
  objects: any[];
  createdAt: Date;
  updatedAt: Date;
}

// Local storage fallback for demo mode
const localStorageService = {
  saveCanvas(canvasId: string, canvasData: any[]): void {
    const data = {
      id: canvasId,
      objects: canvasData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`canvas_${canvasId}`, JSON.stringify(data));
  },

  loadCanvas(canvasId: string): CanvasData | null {
    const data = localStorage.getItem(`canvas_${canvasId}`);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt)
      };
    }
    return null;
  }
};

export const canvasService = {
  // Save canvas data to Firestore or localStorage
  async saveCanvas(canvasId: string, canvasData: any[]): Promise<void> {
    if (!isFirebaseConfigured()) {
      // Use localStorage in demo mode
      localStorageService.saveCanvas(canvasId, canvasData);
      return;
    }

    try {
      const canvasRef = doc(db, 'canvases', canvasId);
      const now = new Date();
      
      await setDoc(canvasRef, {
        id: canvasId,
        objects: canvasData,
        updatedAt: now,
        createdAt: now
      }, { merge: true });
    } catch (error) {
      console.error('Error saving canvas:', error);
      // Fallback to localStorage if Firebase fails
      localStorageService.saveCanvas(canvasId, canvasData);
    }
  },

  // Load canvas data from Firestore or localStorage
  async loadCanvas(canvasId: string): Promise<CanvasData | null> {
    if (!isFirebaseConfigured()) {
      // Use localStorage in demo mode
      return localStorageService.loadCanvas(canvasId);
    }

    try {
      const canvasRef = doc(db, 'canvases', canvasId);
      const canvasSnap = await getDoc(canvasRef);
      
      if (canvasSnap.exists()) {
        const data = canvasSnap.data();
        return {
          id: data.id,
          objects: data.objects || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error loading canvas:', error);
      // Fallback to localStorage if Firebase fails
      return localStorageService.loadCanvas(canvasId);
    }
  },

  // Update canvas data
  async updateCanvas(canvasId: string, canvasData: any[]): Promise<void> {
    if (!isFirebaseConfigured()) {
      // Use localStorage in demo mode
      localStorageService.saveCanvas(canvasId, canvasData);
      return;
    }

    try {
      const canvasRef = doc(db, 'canvases', canvasId);
      await updateDoc(canvasRef, {
        objects: canvasData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating canvas:', error);
      // Fallback to localStorage if Firebase fails
      localStorageService.saveCanvas(canvasId, canvasData);
    }
  }
};
