import React, { useState } from 'react';

interface ShareModalProps {
  canvasId: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ canvasId, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const baseUrl = window.location.origin;
  const editUrl = `${baseUrl}/canvas/${canvasId}`;
  const viewOnlyUrl = `${baseUrl}/canvas/${canvasId}?viewOnly=true`;

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Share Your Canvas</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#495057' }}>
            🎨 Edit Link (Anyone can edit)
          </h4>
          <div className="share-link">{editUrl}</div>
          <button
            className="action-button"
            onClick={() => copyToClipboard(editUrl)}
          >
            {copied ? 'Copied!' : 'Copy Edit Link'}
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#495057' }}>
            👁️ View-Only Link
          </h4>
          <div className="share-link">{viewOnlyUrl}</div>
          <button
            className="action-button"
            onClick={() => copyToClipboard(viewOnlyUrl)}
          >
            {copied ? 'Copied!' : 'Copy View-Only Link'}
          </button>
        </div>

        <div className="modal-actions">
          <button className="action-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
