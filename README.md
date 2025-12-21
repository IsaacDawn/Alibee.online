# Alibee Client Frontend

A modern, TikTok-like product discovery interface built with React.

## Features

- 🎯 **TikTok-like Experience**: Vertical scrolling product feed
- 🌍 **Multi-language Support**: English, Hebrew, Arabic
- 💱 **Multi-currency**: USD, EUR, ILS support
- 🔍 **Advanced Filtering**: Category, price range, video toggle
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Performance Optimized**: Lazy loading, infinite scroll
- 🎨 **Modern UI**: Beautiful gradients and animations

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on port 5000

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # App header with controls
│   ├── ProductCard.js  # Product display card
│   └── FilterModal.js  # Filter/search modal
├── services/           # API communication
│   └── productService.js
├── styles/            # Global styles
│   └── index.css
├── App.js             # Main application component
└── index.js           # Application entry point
```

## API Integration

The frontend communicates with the backend through these endpoints:

- `GET /api/products/comprehensive-filter` - Main product feed
- `GET /api/categories` - Product categories
- `GET /api/currency/rates` - Currency exchange rates
- `GET /api/health` - Health check

## Key Components

### Header
- App branding
- Language selector (EN/HE/AR)
- Currency selector (USD/EUR/ILS)
- Filter button

### ProductCard
- Product image with video overlay
- Price display with discount badges
- Star ratings
- Action buttons (View/Share)
- Like functionality

### FilterModal
- Category selection
- Price range slider
- Sort options
- Video-only toggle
- Product limit selector

## Styling

The app uses:
- **Styled Components** for component styling
- **CSS Grid/Flexbox** for layouts
- **CSS Animations** for smooth transitions
- **Gradient backgrounds** for modern look
- **Dark theme** optimized for product viewing

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

### Available Scripts

- `npm start` - Development server
- `npm build` - Production build
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Environment Variables

Create a `.env` file with:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
