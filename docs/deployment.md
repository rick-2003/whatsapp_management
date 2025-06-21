# Deployment Guide

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd whatsapp-management
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Database Setup**
   - Follow `docs/supabase-setup.md`
   - Create tables and policies
   - Add admin user

4. **Development**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## Deployment Options

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

### Netlify
1. Build: `npm run build`
2. Upload `dist` folder
3. Add environment variables

### Other Platforms
- Works with any static hosting
- Build output is in `dist` folder
- Supports SPA routing

## Environment Variables

Required variables for production:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
