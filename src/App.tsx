import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './components/Home';
import CanvasEditor from './components/CanvasEditor';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/canvas/:id" element={<CanvasEditor />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
