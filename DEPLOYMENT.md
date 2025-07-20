# Deployment Guide

This guide covers different ways to deploy the Household Harmony Hub application.

## 📦 Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## 🚀 Deployment Options

### 1. Static Hosting (Recommended)

#### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy automatically on push to main branch

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow the prompts
4. Automatic deployments on git push

#### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```
3. Run `npm run deploy`

### 2. Traditional Web Server

#### Apache
1. Build the project: `npm run build`
2. Copy `build` folder contents to your web root
3. Configure Apache for SPA routing (optional .htaccess):
   ```apache
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```

#### Nginx
1. Build the project: `npm run build`
2. Copy `build` folder contents to your web root
3. Configure Nginx for SPA routing:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

### 3. Docker Deployment

Using the included `docker-compose.yml`:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### 4. Node.js Server

```bash
# Build the project
npm run build

# Install serve globally
npm install -g serve

# Serve the build folder
serve -s build -l 3000
```

## 🔧 Environment Variables

For production, create a `.env.production` file:

```env
# Production port (if using Node.js server)
PORT=3000

# If deploying to a subdirectory
PUBLIC_URL=/household-hub

# Analytics (optional)
REACT_APP_GA_TRACKING_ID=your-google-analytics-id
```

## 📱 PWA Configuration

The app is PWA-ready. To fully enable PWA features:

1. Add a service worker (optional)
2. Create app icons in `public` folder
3. Update `manifest.json` with your app details

## 🔒 Security Considerations

- Enable HTTPS in production
- Set proper CORS headers
- Configure Content Security Policy
- Use secure headers (HSTS, etc.)

## 📊 Analytics (Optional)

To add Google Analytics:

1. Get a tracking ID from Google Analytics
2. Add to `.env.production`:
   ```env
   REACT_APP_GA_TRACKING_ID=your-tracking-id
   ```
3. Add Analytics component to your app

## 🚀 Performance Optimization

The build process automatically:
- Minifies JavaScript and CSS
- Optimizes images
- Enables gzip compression (server dependent)
- Generates source maps for debugging

For additional optimizations:
- Enable Brotli compression on your server
- Use a CDN for static assets
- Implement proper caching headers

## 🔍 Testing Production Build Locally

```bash
# Build the project
npm run build

# Test the production build
npx serve -s build

# Or use the Docker setup
docker-compose up
```

## 📝 Deployment Checklist

- [ ] Update package.json version
- [ ] Test the production build locally
- [ ] Verify all features work offline
- [ ] Check mobile responsiveness
- [ ] Test import/export functionality
- [ ] Verify localStorage persistence
- [ ] Update README with live demo URL
- [ ] Tag the release in git

## 🐛 Troubleshooting

### Build Fails
- Check for ESLint errors: `npm run build`
- Ensure all dependencies are installed: `npm install`
- Clear cache: `npm start -- --reset-cache`

### Blank Page After Deployment
- Check browser console for errors
- Verify PUBLIC_URL is set correctly
- Ensure server is configured for SPA routing

### Features Not Working
- Verify HTTPS is enabled (required for some mobile features)
- Check that the build includes all necessary files
- Test localStorage in incognito mode
