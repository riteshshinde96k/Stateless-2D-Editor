import React from 'react';

interface Template {
  id: string;
  name: string;
  preview: string;
  description: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

const templates: Template[] = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    preview: '⬜',
    description: 'Start with a clean canvas'
  },
  {
    id: 'business-card',
    name: 'Business Card',
    preview: '💼',
    description: 'Professional business card layout'
  },
  {
    id: 'presentation',
    name: 'Presentation Slide',
    preview: '📊',
    description: 'Clean presentation slide template'
  },
  {
    id: 'social-post',
    name: 'Social Media Post',
    preview: '📱',
    description: 'Square social media post design'
  }
];

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose a Template</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="template-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => {
                onSelectTemplate(template);
                onClose();
              }}
            >
              <div className="template-preview">
                {template.preview}
              </div>
              <div className="template-name">{template.name}</div>
              <div className="template-description">{template.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
