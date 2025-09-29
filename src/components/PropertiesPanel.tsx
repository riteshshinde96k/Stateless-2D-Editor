import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';

interface PropertiesPanelProps {
  selectedObject: fabric.Object;
  onUpdate: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  onUpdate,
}) => {
  const [properties, setProperties] = useState({
    fill: '',
    stroke: '',
    strokeWidth: 0,
    opacity: 1,
    fontSize: 16,
    fontFamily: 'Arial',
    text: '',
  });

  useEffect(() => {
    if (!selectedObject) return;

    setProperties({
      fill: (selectedObject.fill as string) || '#000000',
      stroke: (selectedObject.stroke as string) || '#000000',
      strokeWidth: selectedObject.strokeWidth || 0,
      opacity: selectedObject.opacity || 1,
      fontSize: (selectedObject as any).fontSize || 16,
      fontFamily: (selectedObject as any).fontFamily || 'Arial',
      text: (selectedObject as any).text || '',
    });
  }, [selectedObject]);

  const updateProperty = (property: string, value: any) => {
    if (!selectedObject) return;

    (selectedObject as any).set(property, value);
    setProperties(prev => ({ ...prev, [property]: value }));
    onUpdate();
  };

  const isTextObject = selectedObject && selectedObject.type === 'i-text';
  const hasStroke = selectedObject && selectedObject.stroke;
  const hasFill = selectedObject && selectedObject.fill;

  return (
    <div className="properties-panel">
      <h3 className="properties-title">Properties</h3>
      
      {hasFill && (
        <div className="property-group">
          <label className="property-label">Fill Color</label>
          <input
            type="color"
            className="color-input"
            value={properties.fill}
            onChange={(e) => updateProperty('fill', e.target.value)}
          />
        </div>
      )}

      {hasStroke && (
        <>
          <div className="property-group">
            <label className="property-label">Stroke Color</label>
            <input
              type="color"
              className="color-input"
              value={properties.stroke}
              onChange={(e) => updateProperty('stroke', e.target.value)}
            />
          </div>
          
          <div className="property-group">
            <label className="property-label">Stroke Width</label>
            <input
              type="range"
              className="property-input"
              min="0"
              max="20"
              value={properties.strokeWidth}
              onChange={(e) => updateProperty('strokeWidth', parseInt(e.target.value))}
            />
            <span>{properties.strokeWidth}px</span>
          </div>
        </>
      )}

      <div className="property-group">
        <label className="property-label">Opacity</label>
        <input
          type="range"
          className="property-input"
          min="0"
          max="1"
          step="0.1"
          value={properties.opacity}
          onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
        />
        <span>{Math.round(properties.opacity * 100)}%</span>
      </div>

      {isTextObject && (
        <>
          <div className="property-group">
            <label className="property-label">Font Size</label>
            <input
              type="range"
              className="property-input"
              min="8"
              max="72"
              value={properties.fontSize}
              onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
            />
            <span>{properties.fontSize}px</span>
          </div>
          
          <div className="property-group">
            <label className="property-label">Font Family</label>
            <select
              className="property-input"
              value={properties.fontFamily}
              onChange={(e) => updateProperty('fontFamily', e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Impact">Impact</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default PropertiesPanel;
