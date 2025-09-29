import React from 'react';
import { Tool } from './CanvasEditor';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onDelete: () => void;
  hasSelection: boolean;
  snapToGrid?: boolean;
  onSnapToggle?: () => void;
  onToggleLock?: () => void;
  selectedObjectLocked?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolChange,
  onDelete,
  hasSelection,
  snapToGrid = false,
  onSnapToggle,
  onToggleLock,
  selectedObjectLocked = false,
}) => {
  const tools = [
    { id: 'select' as Tool, icon: '↖️', label: 'Select' },
    { id: 'rectangle' as Tool, icon: '⬜', label: 'Rectangle' },
    { id: 'circle' as Tool, icon: '⭕', label: 'Circle' },
    { id: 'text' as Tool, icon: '📝', label: 'Text' },
    { id: 'pen' as Tool, icon: '✏️', label: 'Pen' },
  ];

  return (
    <div className="toolbar">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
      
      <div style={{ height: '20px' }} /> {/* Spacer */}
      
      <button
        className="tool-button"
        onClick={onDelete}
        disabled={!hasSelection}
        title="Delete Selected"
        style={{ opacity: hasSelection ? 1 : 0.5 }}
      >
        🗑️
      </button>
      
      {onSnapToggle && (
        <button
          className={`tool-button ${snapToGrid ? 'active' : ''}`}
          onClick={onSnapToggle}
          title="Snap to Grid"
        >
          📐
        </button>
      )}
      
      {hasSelection && onToggleLock && (
        <button
          className={`tool-button ${selectedObjectLocked ? 'active' : ''}`}
          onClick={onToggleLock}
          title={selectedObjectLocked ? "Unlock Object" : "Lock Object"}
        >
          {selectedObjectLocked ? '🔒' : '🔓'}
        </button>
      )}
    </div>
  );
};

export default Toolbar;
