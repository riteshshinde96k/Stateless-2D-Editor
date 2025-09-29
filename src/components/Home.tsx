import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import TemplateModal from './TemplateModal';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showTemplates, setShowTemplates] = useState(false);

  const createNewCanvas = () => {
    const newCanvasId = uuidv4();
    navigate(`/canvas/${newCanvasId}`);
  };

  const createFromTemplate = () => {
    setShowTemplates(true);
  };

  const handleTemplateSelect = (template: any) => {
    console.log('Template selected:', template);
    const newCanvasId = uuidv4();
    console.log('Generated canvas ID:', newCanvasId);
    
    // Store template ID in sessionStorage to be picked up by CanvasEditor
    sessionStorage.setItem(`template_${newCanvasId}`, template.id);
    console.log('Stored template ID in sessionStorage:', template.id);
    
    navigate(`/canvas/${newCanvasId}`);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">🎨 Stateless 2D Editor</h1>
      <p className="home-subtitle">
        Create beautiful designs and share them with anyone, instantly
      </p>
      
      <div className="home-actions">
        <button className="create-button primary" onClick={createNewCanvas}>
          Create Blank Canvas
        </button>
        <button className="create-button secondary" onClick={createFromTemplate}>
          Choose Template
        </button>
      </div>

      <TemplateModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
};

export default Home;


