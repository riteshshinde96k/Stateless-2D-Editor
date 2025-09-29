# 🎨 Stateless 2D Editor

A lightweight, web-based canvas editor where anyone can add and edit shapes/text, and share the canvas via a public link. Built with React, Fabric.js, and Firebase Firestore.

🌐 **Live Demo**: [https://stateless-2d-editor-97379.web.app](https://stateless-2d-editor-97379.web.app)

## 🎯 What I Built

This project implements a complete **"mini Canva"** experience that meets all core requirements and includes several bonus features:

- **Stateless Design**: No login required - anyone can create, edit, and share canvases instantly
- **URL-based Scene Management**: Each canvas gets a unique shareable URL (`/canvas/:id`)
- **Real-time Persistence**: Auto-saves to Firebase Firestore with smart fallback to localStorage
- **Professional Canvas Tools**: Built with Fabric.js for smooth object manipulation
- **Collaborative Sharing**: Both edit and view-only sharing modes
- **Production Ready**: Deployed on Firebase Hosting with proper error handling

### Key Trade-offs Made:
1. **Simplicity over Complexity**: Chose auto-save over real-time collaboration for better performance
2. **Accessibility over Authentication**: No login required for maximum ease of use
3. **Smart Fallback**: Works offline with localStorage when Firebase is unavailable
4. **User-First Design**: Intuitive UI with keyboard shortcuts and visual feedback

## ✨ Features

### Core Features
- **Canvas Editor**: Add rectangles, circles, text, and use pen tool for drawing
- **Object Manipulation**: Move, resize, rotate, and delete objects
- **Real-time Properties**: Edit colors, stroke width, opacity, and text properties
- **Stateless URL System**: Each canvas has a unique shareable URL
- **Auto-save**: Canvas state is automatically saved to Firebase Firestore
- **Share Functionality**: Generate shareable links for collaboration

### Bonus Features
- **Undo/Redo**: Full history management with Ctrl+Z/Ctrl+Y shortcuts
- **View-Only Mode**: Share read-only links with `?viewOnly=true`
- **Export Options**: Export canvas as PNG or SVG
- **Snap to Grid**: Visual alignment helpers for precise positioning
- **Object Locking**: Lock/unlock objects to prevent accidental edits
- **Templates**: Choose from pre-designed templates (business card, presentation, social media)
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth interactions
- **Error Boundaries**: Production-grade error handling and recovery

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project (for Firestore database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stateless-2d-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Copy your Firebase configuration
   - Update `src/firebase/config.ts` with your Firebase configuration:

   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Canvas Library**: Fabric.js for canvas manipulation
- **Database**: Firebase Firestore (no authentication required)
- **Routing**: React Router DOM
- **Styling**: CSS with modern design patterns

### Project Structure
```
src/
├── components/
│   ├── CanvasEditor.tsx    # Main canvas editor component
│   ├── Home.tsx           # Landing page with canvas creation
│   ├── Toolbar.tsx        # Tool selection sidebar
│   ├── PropertiesPanel.tsx # Object properties editor
│   └── ShareModal.tsx     # Share functionality modal
├── firebase/
│   ├── config.ts          # Firebase configuration
│   └── canvasService.ts   # Firestore operations
├── App.tsx               # Main app with routing
├── App.css              # Global styles
└── index.tsx            # React app entry point
```

### Data Flow
1. **Canvas Creation**: Home page generates UUID and redirects to `/canvas/:id`
2. **Canvas Loading**: CanvasEditor loads existing data from Firestore or starts fresh
3. **Auto-save**: Changes are debounced and automatically saved to Firestore
4. **Sharing**: Generate shareable URLs with optional view-only mode

## 🎯 Usage

### Creating a Canvas
1. Visit the home page
2. Click "Create New Canvas"
3. Start adding shapes, text, or drawings

### Editing Objects
1. Select any object on the canvas
2. Use the properties panel to modify:
   - Fill and stroke colors
   - Stroke width
   - Opacity
   - Font size and family (for text)

### Sharing
1. Click "Share Canvas" in the top bar
2. Copy the edit link for collaborative editing
3. Copy the view-only link for read-only access

### Tools Available
- **Select**: Default selection tool
- **Rectangle**: Add rectangular shapes
- **Circle**: Add circular shapes
- **Text**: Add editable text
- **Pen**: Free drawing tool

## 🔧 Configuration

### Firebase Setup
1. Create a Firestore database in test mode
2. No authentication rules needed - the app works without login
3. Data structure:
   ```
   canvases/{canvasId}:
   {
     id: string,
     objects: Array<FabricObject>,
     createdAt: Timestamp,
     updatedAt: Timestamp
   }
   ```

### Environment Variables (Optional)
Create a `.env` file for environment-specific configuration:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Vercel
```bash
npm run build
npx vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist folder to Netlify or connect GitHub repository
```

## 🎨 Design Decisions & Trade-offs

### Stateless Architecture
- **Decision**: No user authentication, canvas accessible via URL
- **Trade-off**: Simpler UX but no user ownership/management
- **Benefit**: Instant sharing without signup friction

### Auto-save Strategy
- **Decision**: Debounced saves (1 second delay)
- **Trade-off**: Potential data loss vs. reduced Firestore writes
- **Benefit**: Balance between data safety and cost optimization

### Fabric.js Integration
- **Decision**: Use Fabric.js for canvas manipulation
- **Trade-off**: Larger bundle size vs. rich canvas features
- **Benefit**: Professional-grade canvas editing capabilities

### Real-time Collaboration
- **Decision**: Auto-save only (no real-time sync)
- **Trade-off**: Simpler implementation vs. live collaboration
- **Future Enhancement**: Could add WebSocket/Firebase real-time listeners

## 🔮 Future Enhancements

### Completed Features ✅
- [x] **Undo/Redo**: History management for actions
- [x] **Snap to Grid**: Visual alignment helpers
- [x] **Templates**: Pre-designed canvas templates
- [x] **Object Locking**: Prevent accidental edits
- [x] **Export Options**: PNG and SVG export
- [x] **View-Only Mode**: Read-only sharing
- [x] **Error Boundaries**: Production error handling

### Future Enhancements
- [ ] **Layers Panel**: Layer management system
- [ ] **Real-time Collaboration**: Live cursor tracking
- [ ] **Comments**: Annotation system
- [ ] **Version History**: Canvas version management
- [ ] **Image Upload**: Add and manipulate images
- [ ] **Advanced Shapes**: More geometric shapes and tools

### Performance Optimizations
- [ ] **Lazy Loading**: Load canvas objects on demand
- [ ] **Image Optimization**: Compress uploaded images
- [ ] **Caching**: Browser caching for frequently accessed canvases
- [ ] **CDN**: Serve static assets from CDN

## 🐛 Known Issues

1. **Mobile Touch**: Some touch gestures may not work perfectly on mobile
2. **Large Canvases**: Performance may degrade with 100+ objects
3. **Browser Compatibility**: Requires modern browser with Canvas support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Fabric.js](http://fabricjs.com/) for the powerful canvas library
- [Firebase](https://firebase.google.com/) for the backend infrastructure
- [React](https://reactjs.org/) for the frontend framework

---

**Built with ❤️ for seamless creative collaboration**
