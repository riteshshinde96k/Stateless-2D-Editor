import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fabric } from 'fabric';
import { canvasService } from '../firebase/canvasService';
import { isFirebaseConfigured } from '../firebase/config';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import ShareModal from './ShareModal';

export type Tool = 'select' | 'rectangle' | 'circle' | 'text' | 'pen';

const CanvasEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  // Callback ref to ensure we get the canvas element when it's created
  const setCanvasRef = useCallback((element: HTMLCanvasElement | null) => {
    console.log('Canvas ref callback called with:', element);
    if (element && id && !fabricCanvasRef.current) {
      console.log('Canvas element available, initializing...');
      // Initialize canvas directly with the element
      setTimeout(() => {
        initializeCanvasWithElement(element);
      }, 100);
    }
  }, [id]);
  
  console.log('CanvasEditor component rendered with ID:', id);
  
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Force stop loading after 2 seconds as absolute fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('FORCE STOPPING LOADING - 2 second timeout');
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const gridSize = 20;
  
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [canvasReady, setCanvasReady] = useState(false);
  
  // History management
  const historyStack = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const isRedoing = useRef(false);
  const isUndoing = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyIndex.current > 0);
    setCanRedo(historyIndex.current < historyStack.current.length - 1);
  }, []);

  const saveState = useCallback(() => {
    if (!fabricCanvasRef.current || isRedoing.current || isUndoing.current) {
      console.log('SaveState skipped - no canvas or in undo/redo operation');
      return;
    }

    const currentState = JSON.stringify(fabricCanvasRef.current.toJSON());
    
    // Remove any states after current index (when undoing then making new changes)
    historyStack.current = historyStack.current.slice(0, historyIndex.current + 1);
    
    // Add new state
    historyStack.current.push(currentState);
    historyIndex.current = historyStack.current.length - 1;
    
    console.log('State saved, new index:', historyIndex.current, 'stack length:', historyStack.current.length);
    
    // Limit history to 50 states
    if (historyStack.current.length > 50) {
      historyStack.current.shift();
      historyIndex.current--;
    }
    
    updateHistoryState();
  }, [updateHistoryState]);

  const undo = useCallback(() => {
    console.log('Undo called, current index:', historyIndex.current, 'stack length:', historyStack.current.length);
    if (!fabricCanvasRef.current || historyIndex.current <= 0) {
      console.log('Cannot undo - no canvas or at beginning of history');
      return;
    }

    isUndoing.current = true;
    historyIndex.current--;
    
    const previousState = historyStack.current[historyIndex.current];
    console.log('Loading previous state, new index:', historyIndex.current);
    fabricCanvasRef.current.loadFromJSON(previousState, () => {
      fabricCanvasRef.current?.renderAll();
      isUndoing.current = false;
      updateHistoryState();
      console.log('Undo completed');
    });
  }, [updateHistoryState]);

  const redo = useCallback(() => {
    console.log('Redo called, current index:', historyIndex.current, 'stack length:', historyStack.current.length);
    if (!fabricCanvasRef.current || historyIndex.current >= historyStack.current.length - 1) {
      console.log('Cannot redo - no canvas or at end of history');
      return;
    }

    isRedoing.current = true;
    historyIndex.current++;
    
    const nextState = historyStack.current[historyIndex.current];
    console.log('Loading next state, new index:', historyIndex.current);
    fabricCanvasRef.current.loadFromJSON(nextState, () => {
      fabricCanvasRef.current?.renderAll();
      isRedoing.current = false;
      updateHistoryState();
      console.log('Redo completed');
    });
  }, [updateHistoryState]);

  const initializeHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    // Save initial state
    const initialState = JSON.stringify(fabricCanvasRef.current.toJSON());
    historyStack.current = [initialState];
    historyIndex.current = 0;
    updateHistoryState();
  }, [updateHistoryState]);

  // Cleanup canvas on unmount
  useEffect(() => {
    return () => {
      if (fabricCanvasRef.current) {
        console.log('Disposing canvas on cleanup');
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  const initializeCanvas = () => {
    if (!canvasRef.current || !id) {
      console.log('Cannot initialize canvas - missing ref or id');
      return;
    }
    initializeCanvasWithElement(canvasRef.current);
  };

  const initializeCanvasWithElement = (canvasElement: HTMLCanvasElement) => {
    if (!canvasElement || !id) {
      console.log('Cannot initialize canvas - missing element or id');
      return;
    }

    console.log('Initializing canvas for ID:', id);
    
    try {
      const canvas = new fabric.Canvas(canvasElement, {
        width: 800,
        height: 600,
        backgroundColor: 'white',
      });

      fabricCanvasRef.current = canvas;
      setCanvasReady(true);
      
      // History will be initialized after canvas setup
      
      console.log('Canvas created successfully');

      // Check if view-only mode
      const viewOnly = searchParams.get('viewOnly') === 'true';
      setIsViewOnly(viewOnly);
      
      if (viewOnly) {
        canvas.selection = false;
      }

      // Set up event listeners
      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', () => setSelectedObject(null));
      canvas.on('object:modified', (e) => {
        if (snapToGrid && e.target) {
          snapObjectToGrid(e.target);
        }
        debouncedSave();
        saveState();
      });
      canvas.on('object:added', () => {
        debouncedSave();
        saveState();
      });
      canvas.on('object:removed', () => {
        debouncedSave();
        saveState();
      });

      // Immediately stop loading - don't wait for data loading
      console.log('Setting loading to false');
      setIsLoading(false);
      
      // Set up keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
          } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
            e.preventDefault();
            redo();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Load data after canvas is ready
      setTimeout(() => {
        loadCanvasData();
      }, 200);

      // Cleanup keyboard listener
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };

    } catch (error) {
      console.error('Error initializing canvas:', error);
      setError('Failed to initialize canvas');
      setIsLoading(false);
    }
  };

  const loadCanvasData = async () => {
    if (!id || !fabricCanvasRef.current) {
      console.log('Missing id or canvas ref for data loading:', { id, canvas: !!fabricCanvasRef.current });
      return;
    }

    try {
      console.log('Loading canvas data for:', id);
      
      // Debug: Show all sessionStorage keys
      console.log('All sessionStorage keys:', Object.keys(sessionStorage));
      
      // Check for template data first
      const templateKey = `template_${id}`;
      const templateId = sessionStorage.getItem(templateKey);
      console.log('Checking for template with key:', templateKey);
      console.log('Found template ID:', templateId);
      
      if (templateId) {
        console.log('Loading template:', templateId);
        createTemplateObjects(templateId);
        sessionStorage.removeItem(templateKey);
        return;
      }
      
      // Load from Firestore
      const canvasData = await canvasService.loadCanvas(id);
      console.log('Canvas data loaded:', canvasData);
      
      if (canvasData && canvasData.objects.length > 0) {
        fabricCanvasRef.current.loadFromJSON(
          { objects: canvasData.objects },
          () => {
            console.log('Canvas loaded from JSON');
            fabricCanvasRef.current?.renderAll();
            initializeHistory();
          }
        );
      } else {
        // Initialize empty canvas
        console.log('No existing data - empty canvas');
        initializeHistory();
      }
    } catch (err) {
      console.error('Error loading canvas data:', err);
      // Don't set error state, just continue with empty canvas
      initializeHistory();
    }
  };

  const snapObjectToGrid = (obj: fabric.Object) => {
    if (!snapToGrid) return;
    
    const left = Math.round((obj.left || 0) / gridSize) * gridSize;
    const top = Math.round((obj.top || 0) / gridSize) * gridSize;
    
    obj.set({
      left,
      top
    });
    
    fabricCanvasRef.current?.renderAll();
  };

  const createTemplateObjects = (templateId: string) => {
    if (!fabricCanvasRef.current) {
      console.error('No canvas available for template creation');
      return;
    }

    const canvas = fabricCanvasRef.current;
    console.log('Creating template objects for:', templateId);

    // Clear any existing objects first
    canvas.clear();

    switch (templateId) {
      case 'business-card':
        console.log('Creating business card template');
        // Create business card template
        const cardBg = new fabric.Rect({
          left: 50,
          top: 50,
          width: 300,
          height: 180,
          fill: '#f0f0f0',
          stroke: '#ccc',
          strokeWidth: 2
        });
        
        const nameText = new fabric.Textbox('Your Name', {
          left: 70,
          top: 80,
          width: 200,
          fontSize: 24,
          fontWeight: 'bold',
          fill: '#333'
        });
        
        const titleText = new fabric.Textbox('Your Title', {
          left: 70,
          top: 120,
          width: 200,
          fontSize: 16,
          fill: '#666'
        });
        
        const emailText = new fabric.Textbox('contact@email.com', {
          left: 70,
          top: 160,
          width: 200,
          fontSize: 14,
          fill: '#888'
        });
        
        canvas.add(cardBg, nameText, titleText, emailText);
        break;

      case 'presentation':
        console.log('Creating presentation template');
        // Create presentation template
        const slideBg = new fabric.Rect({
          left: 20,
          top: 20,
          width: 760,
          height: 560,
          fill: '#ffffff',
          stroke: '#ddd',
          strokeWidth: 1
        });
        
        const slideTitle = new fabric.Textbox('Presentation Title', {
          left: 50,
          top: 50,
          width: 700,
          fontSize: 36,
          fontWeight: 'bold',
          fill: '#2c3e50',
          textAlign: 'center'
        });
        
        const contentArea = new fabric.Rect({
          left: 50,
          top: 150,
          width: 700,
          height: 300,
          fill: '#ecf0f1',
          stroke: '#bdc3c7',
          strokeWidth: 1
        });
        
        const contentText = new fabric.Textbox('Content goes here...', {
          left: 70,
          top: 280,
          width: 660,
          fontSize: 18,
          fill: '#34495e',
          textAlign: 'center'
        });
        
        canvas.add(slideBg, slideTitle, contentArea, contentText);
        break;

      case 'social-post':
        console.log('Creating social media post template');
        // Create social media post template
        const postBg = new fabric.Rect({
          left: 100,
          top: 100,
          width: 400,
          height: 400,
          fill: '#3498db',
          rx: 20,
          ry: 20
        });
        
        const postText = new fabric.Textbox('Your Message', {
          left: 150,
          top: 250,
          width: 300,
          fontSize: 24,
          fontWeight: 'bold',
          fill: '#ffffff',
          textAlign: 'center'
        });
        
        const decorCircle = new fabric.Circle({
          left: 250,
          top: 150,
          radius: 40,
          fill: '#ffffff',
          opacity: 0.8
        });
        
        canvas.add(postBg, decorCircle, postText);
        break;

      default:
        console.log('Creating blank canvas or unknown template:', templateId);
        // Blank canvas - do nothing
        break;
    }

    canvas.renderAll();
    initializeHistory();
    debouncedSave();
  };

  const handleSelection = (e: fabric.IEvent) => {
    const activeObject = e.selected?.[0] || e.target;
    setSelectedObject(activeObject || null);
  };

  const debouncedSave = useCallback(() => {
    if (isViewOnly) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveCanvas();
    }, 1000); // Save after 1 second of inactivity
  }, [isViewOnly]);

  const saveCanvas = async () => {
    if (!fabricCanvasRef.current || !id || isViewOnly) return;

    try {
      const canvasData = fabricCanvasRef.current.toJSON();
      await canvasService.updateCanvas(id, canvasData.objects);
    } catch (err) {
      console.error('Error saving canvas:', err);
    }
  };

  const addShape = (shapeType: 'rectangle' | 'circle') => {
    if (!fabricCanvasRef.current || isViewOnly) return;

    let shape: fabric.Object;

    if (shapeType === 'rectangle') {
      shape = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 80,
        fill: '#3498db',
        stroke: '#2980b9',
        strokeWidth: 2,
      });
    } else {
      shape = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: '#e74c3c',
        stroke: '#c0392b',
        strokeWidth: 2,
      });
    }

    fabricCanvasRef.current.add(shape);
    fabricCanvasRef.current.setActiveObject(shape);
    fabricCanvasRef.current.renderAll();
    saveState();
  };

  const addText = () => {
    if (!fabricCanvasRef.current || isViewOnly) return;

    const text = new fabric.IText('Click to edit', {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: '#333',
      fontFamily: 'Arial',
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    saveState();
  };

  const enableDrawing = () => {
    if (!fabricCanvasRef.current || isViewOnly) return;

    fabricCanvasRef.current.isDrawingMode = true;
    fabricCanvasRef.current.freeDrawingBrush.width = 3;
    fabricCanvasRef.current.freeDrawingBrush.color = '#2c3e50';
    debouncedSave();
  };

  const disableDrawing = () => {
    if (!fabricCanvasRef.current || isViewOnly) return;

    fabricCanvasRef.current.isDrawingMode = false;
    debouncedSave();
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current || !selectedObject || isViewOnly) return;

    fabricCanvasRef.current.remove(selectedObject);
    setSelectedObject(null);
    fabricCanvasRef.current.renderAll();
    saveState();
  };

  const toggleObjectLock = () => {
    if (!selectedObject) return;
    
    const isLocked = selectedObject.lockMovementX || false;
    selectedObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockRotation: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      selectable: isLocked, // If unlocking, make selectable
    });
    
    fabricCanvasRef.current?.renderAll();
    saveState();
  };

  const exportCanvas = (format: 'png' | 'svg') => {
    if (!fabricCanvasRef.current) return;

    if (format === 'png') {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
      });
      
      const link = document.createElement('a');
      link.download = `canvas-${id}.png`;
      link.href = dataURL;
      link.click();
    } else {
      const svg = fabricCanvasRef.current.toSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `canvas-${id}.svg`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
    }
  };

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    
    if (tool === 'pen') {
      enableDrawing();
    } else {
      disableDrawing();
    }

    if (tool === 'rectangle') {
      addShape('rectangle');
      setActiveTool('select');
    } else if (tool === 'circle') {
      addShape('circle');
      setActiveTool('select');
    } else if (tool === 'text') {
      addText();
      setActiveTool('select');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading canvas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="canvas-editor">
      {!isViewOnly && (
        <Toolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onDelete={deleteSelected}
          hasSelection={!!selectedObject}
          snapToGrid={snapToGrid}
          onSnapToggle={() => setSnapToGrid(!snapToGrid)}
          onToggleLock={toggleObjectLock}
          selectedObjectLocked={selectedObject?.lockMovementX || false}
        />
      )}
      
      <div className="canvas-container">
        <div className="top-bar">
          <div className="canvas-title">
            {isViewOnly ? '👁️ Viewing Canvas' : '🎨 Canvas Editor'}
            {!isFirebaseConfigured() && (
              <span style={{ 
                marginLeft: '10px', 
                fontSize: '0.8rem', 
                color: '#ffc107',
                backgroundColor: '#fff3cd',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #ffeaa7'
              }}>
                Demo Mode (Local Storage)
              </span>
            )}
          </div>
          <div className="top-bar-actions">
            {!isViewOnly && (
              <>
                <button
                  className="action-button"
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                >
                  ↶ Undo
                </button>
                <button
                  className="action-button"
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                >
                  ↷ Redo
                </button>
              </>
            )}
            <button
              className="action-button"
              onClick={() => exportCanvas('png')}
            >
              Export PNG
            </button>
            <button
              className="action-button"
              onClick={() => exportCanvas('svg')}
            >
              Export SVG
            </button>
            {!isViewOnly && (
              <button
                className="action-button primary"
                onClick={() => setShowShareModal(true)}
              >
                Share Canvas
              </button>
            )}
          </div>
        </div>
        
        <div className="canvas-area">
          <div className="fabric-canvas-wrapper">
            <canvas ref={setCanvasRef} />
          </div>
        </div>
      </div>
      
      {!isViewOnly && selectedObject && (
        <PropertiesPanel
          selectedObject={selectedObject}
          onUpdate={() => fabricCanvasRef.current?.renderAll()}
        />
      )}
      
      {showShareModal && (
        <ShareModal
          canvasId={id!}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default CanvasEditor;
