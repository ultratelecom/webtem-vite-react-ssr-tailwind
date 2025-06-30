# 🚀 WebTem: Vite + React + SSR + TailwindCSS Template

A modern, production-ready web development template featuring **self-healing monitoring capabilities** and comprehensive error handling.

![GitHub stars](https://img.shields.io/github/stars/ultratelecom/webtem-vite-react-ssr-tailwind)
![GitHub license](https://img.shields.io/github/license/ultratelecom/webtem-vite-react-ssr-tailwind)
![GitHub last commit](https://img.shields.io/github/last-commit/ultratelecom/webtem-vite-react-ssr-tailwind)

## ✨ Features

### 🏗️ **Core Stack**
- **⚡ Vite** - Lightning-fast build tool and dev server
- **⚛️ React 19** - Latest React with concurrent features  
- **🔧 TypeScript** - Full type safety
- **🎨 TailwindCSS** - Utility-first CSS framework
- **📄 SSR Ready** - Server-side rendering with vite-plugin-ssr
- **🗃️ Zustand** - Lightweight state management
- **🔥 Supabase** - Backend-as-a-Service integration
- **🎮 Three.js** - 3D graphics capabilities

### 🛡️ **Self-Healing Monitoring System**
- **🔍 Error Boundaries** - Automatic error recovery with visual feedback
- **📊 Console Interception** - Real-time error capture and filtering
- **🤖 Fix Registry** - Database of common errors and auto-fixes
- **📈 Analytics** - Error trends and system health monitoring
- **💾 Persistent Tracking** - Error history across sessions
- **🧪 Testing Tools** - Built-in error generation for testing

### 🔧 **Development Experience**
- **🔄 Hot Module Replacement** - Instant updates during development
- **📱 Mobile-first** - Responsive design patterns
- **🎯 ESLint** - Code quality enforcement
- **🔒 Type Safety** - Comprehensive TypeScript configuration
- **📝 Auto-documentation** - Self-documenting error system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ultratelecom/webtem-vite-react-ssr-tailwind.git

# Navigate to project directory
cd webtem-vite-react-ssr-tailwind

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your application running with the monitoring system active!

## 🧪 Testing the Self-Healing System

The template includes a built-in test panel to demonstrate the monitoring capabilities:

1. **Open Developer Tools** (F12) 
2. **Click the test buttons** in the monitoring panel:
   - `Test Console Error` - Triggers console error capture
   - `Test Console Warning` - Demonstrates warning interception  
   - `Test React Error` - Shows error boundary recovery
   - `Generate Report` - Creates system analytics report

You'll see real-time monitoring messages in the console:

```
🚀 Initializing Self-Healing Monitoring System...
✅ Error Monitor: Loaded persisted errors
✅ Console Interceptor: Started monitoring
✅ Error Listeners: Configured
🎉 Self-Healing Monitoring System is now active!
```

## 📊 Built-in Error Fixes

The system automatically handles common development issues:

### **Dependency Issues**
- Missing npm packages → Installation suggestions
- Module resolution errors → Path corrections

### **React Issues** 
- Key prop warnings → Best practice suggestions
- Unmounted component updates → Memory leak prevention

### **Network Issues**
- CORS errors → Proxy configuration help
- Failed requests → Automatic retry logic

### **Runtime Issues**
- Undefined variables → Null check suggestions
- Memory leaks → Cleanup operations

## 🛠️ Configuration

### Monitoring System

```typescript
import { monitoringSystem } from './src/monitoring';

// Get system health
const health = monitoringSystem.getSystemHealth();

// Add custom error listener
ErrorMonitor.addListener((report) => {
  console.log('New error:', report.error.message);
});

// Register custom fix
FixRegistry.registerFix({
  id: 'my-fix',
  name: 'Custom Fix',
  errorPattern: /My Error Pattern/,
  fixFunction: async (error) => {
    // Your fix logic
    return true;
  }
});
```

### TailwindCSS Customization

Edit `tailwind.config.js` to customize your design system:

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Your custom styles
    },
  },
  plugins: [],
}
```

## 📦 Build & Deploy

### Development
```bash
npm run dev          # Start dev server
npm run lint         # Run ESLint
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### SSR Deployment
For SEO and performance benefits, enable SSR:

1. Uncomment SSR plugin in `vite.config.ts`
2. Configure server routes in `pages/` directory
3. See [MONITORING_SYSTEM.md](./MONITORING_SYSTEM.md) for detailed SSR setup

## 📁 Project Structure

```
webtem-vite-react-ssr-tailwind/
├── src/
│   ├── components/          # React components
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorMonitor.ts
│   │   ├── FixRegistry.ts
│   │   └── ConsoleInterceptor.ts
│   ├── store/              # Zustand stores
│   ├── lib/                # Utility libraries
│   └── styles/             # CSS and styling
├── pages/                  # SSR pages (when enabled)
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🎯 Use Cases

### **New Project Template**
Perfect starting point for:
- SaaS applications
- E-commerce sites  
- Portfolio websites
- Dashboard applications
- Content management systems

### **Development Learning**
Great for understanding:
- Modern React patterns
- Error handling strategies
- SSR implementation
- Build tool configuration
- TypeScript best practices

### **Production Applications**
Ready for deployment with:
- Comprehensive error monitoring
- Performance optimization
- SEO-friendly SSR
- Mobile-responsive design
- Scalable architecture

## 🔄 Upcoming Features

- [ ] **AI-Powered Error Classification** - Intelligent error categorization
- [ ] **Visual Dashboard** - Real-time monitoring interface  
- [ ] **Performance Metrics** - Core Web Vitals tracking
- [ ] **Automated Testing** - Built-in test generation
- [ ] **Deployment Helpers** - One-click deploy scripts

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test the monitoring system thoroughly
5. Submit a pull request

## 📝 Documentation

- [Self-Healing Monitoring System](./MONITORING_SYSTEM.md) - Complete monitoring documentation
- [SSR Setup Guide](./docs/SSR_SETUP.md) - Server-side rendering configuration
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Amazing build tool
- [React](https://reactjs.org/) - The UI library we love
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management

## ⭐ Support

If this template helps you build amazing projects, please give it a star! ⭐

---

**Happy coding!** 🚀 Built with ❤️ for the developer community.
