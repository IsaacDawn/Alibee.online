import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { productService } from './services/productService';
import ProductImageCarouselTikTok from './components/ProductImageCarouselTikTok';
import Header from './components/Header';

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: #000;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: 60px; /* Space for fixed header */
`;

const VideoContainer = styled.div`
  scroll-snap-type: y mandatory;
  overflow-y: auto;
  height: 100vh;
  touch-action: pan-y;
`;

const VideoItem = styled.div`
  scroll-snap-align: start;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: ${props => props.$bgGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  width: 100%;
  max-width: 100vw;
  text-align: center;
  
  @media (min-aspect-ratio: 1/1) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 0;
  }
`;

const ProductImageContainer = styled.div`
  width: 90vw;
  height: 50vh;
  background: transparent;
  border-radius: 1rem;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: none;
  overflow: hidden;
  margin-top: 1vh;
  
  @media (min-aspect-ratio: 1/1) {
    width: 50vw;
    height: 80vh;
    margin-top: 0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ProductImage = styled.img`
  object-fit: cover;
  width: 90%;
  height: 90%;
  border-radius: 1rem;
`;

const ImageFrame = styled.div`
  width: 90%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-aspect-ratio: 1/1) {
    width: 90%;
    height: 90%;
    aspect-ratio: 1 / 1;
  }
`;

const InfoFrame = styled.div`
  width: 90%;
  height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-aspect-ratio: 1/1) {
    width: 90%;
    height: 90%;
    aspect-ratio: 1 / 1;
  }
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 60%, rgba(0,0,0,0.7) 100%);
  pointer-events: none;
`;


const ActionButtons = styled.div`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.8));

  &:hover {
    transform: scale(1.05);
  }

  &.liked {
    color: #ff6b6b;
  }
`;


const ProductInfoOverlay = styled.div`
  position: absolute;
  top: calc(50vh + 2vh);
  left: 50%;
  transform: translateX(-50%);
  width: calc(90vw * 0.9);
  z-index: 20;
  text-align: left;
  direction: ltr;
  background: rgba(0, 0, 0, 0.0);
  backdrop-filter: blur(10px);
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0);
  
  @media (min-aspect-ratio: 1/1) {
    position: static;
    transform: none;
    width: 50vw;
    height: 80vh;
    margin-left: 0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 80vh;
    overflow-y: auto;
  }
`;

const LandscapeContentWrapper = styled.div`
  @media (min-aspect-ratio: 1/1) {
    display: flex;
    flex-direction: column;
    flex: 1;
    max-height: 80vh;
    overflow-y: auto;
  }
`;

const BuyNowButtonWrapper = styled.div`
  position: fixed;
  bottom: 6vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
  
  @media (min-aspect-ratio: 1/1) {
    position: fixed;
    bottom: 3vh;
    left: 75vw;
    transform: translateX(-50%);
    margin-top: 0;
    align-self: auto;
  }
`;

const ProductTitle = styled.h2`
  color: ${props => props.$textColor || 'white'};
  cursor: pointer;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  text-align: left;
  direction: ltr;
  max-width: 100%;
`;

const ProductPrice = styled.p`
  color: ${props => props.$textColor || '#4ade80'};
  font-size: clamp(0.8rem, 2.2vw, 0.9rem);
  font-weight: 600;
  margin: 0;
`;

const ProductRating = styled.div`
  color: ${props => props.$textColor || '#fbbf24'};
  font-size: clamp(0.7rem, 2vw, 0.8rem);
  margin: 0.15rem 0;
`;

const OrderVolume = styled.p`
  color: ${props => props.$textColor || '#a3e4d7'};
  font-size: clamp(0.65rem, 1.8vw, 0.75rem);
  margin: 0.15rem 0 0 0;
`;

const ProductDescription = styled.p`
  color: white;
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0.5rem 0;
  text-shadow: 1px 1px 2px black;
`;

const BuyNowButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem);
  border-radius: 9999px;
  font-size: clamp(0.75rem, 2.2vw, 0.875rem);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #dc2626;
    transform: scale(1.05);
  }
`;

const Toast = styled.div`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 10000;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease-out;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

const SearchModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const SearchModalContent = styled.div`
  width: 100%;
  max-width: 42rem;
  padding: 2.5rem;
  color: white;
  background: linear-gradient(145deg, #1f2937 0%, #111827 100%);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1rem;
    border-radius: 1rem;
    max-width: calc(100vw - 2rem);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgba(55, 65, 81, 0.8);
  border: 2px solid rgba(75, 85, 99, 0.5);
  border-radius: 0.75rem;
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(55, 65, 81, 0.9);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
`;

const CategorySelect = styled.select`
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgba(55, 65, 81, 0.8);
  border: 2px solid rgba(75, 85, 99, 0.5);
  border-radius: 0.75rem;
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(55, 65, 81, 0.9);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }

  option {
    background: #1f2937;
    color: white;
    padding: 0.5rem;
  }
`;

const PriceRangeContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const PriceInput = styled.input`
  flex: 1;
  padding: 1rem 1.25rem;
  background: rgba(55, 65, 81, 0.8);
  border: 2px solid rgba(75, 85, 99, 0.5);
  border-radius: 0.75rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(55, 65, 81, 0.9);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
`;

const SortSelect = styled.select`
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgba(55, 65, 81, 0.8);
  border: 2px solid rgba(75, 85, 99, 0.5);
  border-radius: 0.75rem;
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(55, 65, 81, 0.9);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }

  option {
    background: #1f2937;
    color: white;
    padding: 0.5rem;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(55, 65, 81, 0.3);
  border-radius: 0.75rem;
  border: 1px solid rgba(75, 85, 99, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(55, 65, 81, 0.5);
    border-color: rgba(75, 85, 99, 0.5);
  }
`;

const ToggleLabel = styled.label`
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  flex: 1;
`;

const ToggleSwitch = styled.input`
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
  accent-color: #3b82f6;
  transform: scale(1.2);
`;

const SearchButtonModal = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  font-size: 1.125rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  text-align: center;
  padding: 2rem;
`;

const RetryButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background: #2563eb;
  }
`;

// Function to calculate high contrast text color based on background
const getHighContrastTextColor = (gradientString) => {
  // Extract colors from gradient string
  const colorMatches = gradientString.match(/#[0-9a-fA-F]{6}/g);
  if (!colorMatches || colorMatches.length === 0) {
    return 'white'; // Default fallback
  }
  
  // Convert hex to RGB and calculate brightness
  const getBrightness = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };
  
  // Calculate average brightness of all colors in gradient
  const avgBrightness = colorMatches.reduce((sum, color) => sum + getBrightness(color), 0) / colorMatches.length;
  
  // Return high contrast color based on brightness
  if (avgBrightness > 128) {
    // Light background - use dark text
    return '#000000';
  } else {
    // Dark background - use light text
    return '#ffffff';
  }
};

// Function to get accent color based on background
const getAccentColor = (gradientString, baseColor) => {
  const colorMatches = gradientString.match(/#[0-9a-fA-F]{6}/g);
  if (!colorMatches || colorMatches.length === 0) {
    return baseColor;
  }
  
  const getBrightness = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };
  
  const avgBrightness = colorMatches.reduce((sum, color) => sum + getBrightness(color), 0) / colorMatches.length;
  
  if (avgBrightness > 128) {
    // Light background - use darker accent colors
    switch (baseColor) {
      case '#4ade80': return '#059669'; // Darker green
      case '#fbbf24': return '#d97706'; // Darker yellow
      case '#a3e4d7': return '#0d9488'; // Darker teal
      default: return '#000000';
    }
  } else {
    // Dark background - use lighter accent colors
    switch (baseColor) {
      case '#4ade80': return '#86efac'; // Lighter green
      case '#fbbf24': return '#fde047'; // Lighter yellow
      case '#a3e4d7': return '#5eead4'; // Lighter teal
      default: return '#ffffff';
    }
  }
};

// Function to get star background color based on card background
const getStarBackgroundColor = (gradientString) => {
  const colorMatches = gradientString.match(/#[0-9a-fA-F]{6}/g);
  if (!colorMatches || colorMatches.length === 0) {
    return 'rgba(0, 0, 0, 0.7)'; // Default dark background
  }
  
  const getBrightness = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };
  
  const avgBrightness = colorMatches.reduce((sum, color) => sum + getBrightness(color), 0) / colorMatches.length;
  
  if (avgBrightness > 128) {
    // Light background - use dark background for stars
    return 'rgba(0, 0, 0, 0.7)';
  } else {
    // Dark background - use light background for stars
    return 'rgba(255, 255, 255, 0.9)';
  }
};

// Translation object for all three languages
const translations = {
  en: {
    buyNow: 'Buy Now',
    search: 'Search',
    searchAndFilter: 'Search & Filter Products',
    onlyVideos: 'Only products with videos',
    searching: '🔍 Searching Products...',
    searchingDescription: 'Please wait while we search for products based on your filters.',
    minPrice: 'Minimum Price',
    maxPrice: 'Maximum Price',
    sortBy: 'Sort By',
    ascending: 'Price: Low to High',
    descending: 'Price: High to Low',
    default: 'Default',
    category: 'Category',
    allCategories: 'All Categories'
  },
  ar: {
    buyNow: 'اشتري الآن',
    search: 'بحث',
    searchAndFilter: 'البحث وتصفية المنتجات',
    onlyVideos: 'المنتجات التي تحتوي على فيديو فقط',
    searching: '🔍 البحث عن المنتجات...',
    searchingDescription: 'يرجى الانتظار بينما نبحث عن المنتجات بناءً على المرشحات الخاصة بك.',
    minPrice: 'الحد الأدنى للسعر',
    maxPrice: 'الحد الأقصى للسعر',
    sortBy: 'ترتيب حسب',
    ascending: 'السعر: من الأقل للأعلى',
    descending: 'السعر: من الأعلى للأقل',
    default: 'افتراضي',
    category: 'الفئة',
    allCategories: 'جميع الفئات'
  },
  he: {
    buyNow: 'קנה עכשיו',
    search: 'חיפוש',
    searchAndFilter: 'חיפוש וסינון מוצרים',
    onlyVideos: 'רק מוצרים עם וידאו',
    searching: '🔍 מחפש מוצרים...',
    searchingDescription: 'אנא המתן בזמן שאנו מחפשים מוצרים בהתבסס על המסננים שלך.',
    minPrice: 'מחיר מינימלי',
    maxPrice: 'מחיר מקסימלי',
    sortBy: 'מיון לפי',
    ascending: 'מחיר: נמוך לגבוה',
    descending: 'מחיר: גבוה לנמוך',
    default: 'ברירת מחדל',
    category: 'קטגוריה',
    allCategories: 'כל הקטגוריות'
  }
};

function App() {
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // New filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [justVideo, setJustVideo] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Header states
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');
  
  const videoContainerRef = useRef(null);
  const initialLoadCount = 5;
  const hasInitiallyLoaded = useRef(false);

  // Load liked products from localStorage on mount
  useEffect(() => {
    const savedLikes = localStorage.getItem('alibee_liked_products');
    if (savedLikes) {
      try {
        const likedArray = JSON.parse(savedLikes);
        setLikedProducts(new Set(likedArray));
      } catch (error) {
        console.error('Error loading liked products from localStorage:', error);
      }
    }
  }, []);

  // Save liked products to localStorage whenever it changes
  useEffect(() => {
    const likedArray = Array.from(likedProducts);
    localStorage.setItem('alibee_liked_products', JSON.stringify(likedArray));
  }, [likedProducts]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('Loading categories...');
        const categoriesData = await productService.getCategories();
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData);
          console.log('Categories loaded successfully:', categoriesData.length);
        } else {
          setCategories([]);
          console.log('No categories found');
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      }
    };
    
    // Add a small delay to avoid race conditions with products loading
    const timer = setTimeout(() => {
      loadCategories();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Load initial products
  const loadProducts = useCallback(async (reset = false) => {
    console.log('loadProducts called with reset:', reset);
    setLoading(true);
    setError(null);

    try {
      const apiParams = {
        category: selectedCategory || 'all',
        sort_order: sortOrder,
        currency: selectedCurrency,
        limit: 100,
        min_price: minPrice,
        max_price: maxPrice,
        JustVideo: justVideo ? 1 : 0
      };
      
      console.log('API Parameters:', JSON.stringify(apiParams, null, 2));
      const response = await productService.getProducts(apiParams);
      console.log('API Response:', response);

      // Handle the response from productService
      let allProducts = [];
      if (response && response.products && Array.isArray(response.products)) {
        allProducts = response.products;
        console.log('Found products:', allProducts.length);
      } else {
        console.log('No products found in response:', response);
        allProducts = [];
      }

      if (reset) {
        setProducts(allProducts);
        setDisplayedProducts(allProducts.slice(0, initialLoadCount));
        setCurrentProductIndex(0);
        setHasMore(allProducts.length > initialLoadCount);
      } else {
        setProducts(prev => [...prev, ...allProducts]);
        setDisplayedProducts(prev => [...prev, ...allProducts.slice(0, initialLoadCount)]);
        setHasMore(allProducts.length > initialLoadCount);
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortOrder, minPrice, maxPrice, justVideo, selectedCurrency]);

  // Load more products for lazy loading
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    try {
      const currentDisplayedCount = displayedProducts.length;
      const nextBatch = products.slice(currentDisplayedCount, currentDisplayedCount + 5);
      
      if (nextBatch.length > 0) {
        setDisplayedProducts(prev => [...prev, ...nextBatch]);
        setHasMore(currentDisplayedCount + nextBatch.length < products.length);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [products, displayedProducts.length, hasMore, loadingMore]);

  // Initial load function (separate from loadProducts to avoid dependency issues)
  const initialLoad = useCallback(async (retryCount = 0) => {
    console.log('Initial load function called, retry count:', retryCount);
    setLoading(true);
    setError(null);

    try {
      const apiParams = {
        category: 'all',
        sort_order: 'asc',
        currency: 'USD',
        limit: 100,
        min_price: 0,
        max_price: 100000,
        JustVideo: 0
      };
      
      console.log('Initial load API Parameters:', JSON.stringify(apiParams, null, 2));
      const response = await productService.getProducts(apiParams);
      console.log('Initial load API Response:', response);

      // Handle the response from productService
      let allProducts = [];
      if (response && response.products && Array.isArray(response.products)) {
        allProducts = response.products;
        console.log('Initial load found products:', allProducts.length);
      } else {
        console.log('Initial load no products found in response:', response);
        allProducts = [];
      }

      // If no products found and we haven't retried yet, retry once
      if (allProducts.length === 0 && retryCount < 1) {
        console.log('No products found, retrying in 1 second...');
        setTimeout(() => {
          initialLoad(retryCount + 1);
        }, 1000);
        return;
      }

      setProducts(allProducts);
      setDisplayedProducts(allProducts.slice(0, initialLoadCount));
      setCurrentProductIndex(0);
      setHasMore(allProducts.length > initialLoadCount);
    } catch (err) {
      console.error('Error in initial load:', err);
      // If error and we haven't retried yet, retry once
      if (retryCount < 1) {
        console.log('Error occurred, retrying in 1 second...');
        setTimeout(() => {
          initialLoad(retryCount + 1);
        }, 1000);
        return;
      }
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    console.log('Initial load useEffect triggered, hasInitiallyLoaded:', hasInitiallyLoaded.current);
    if (!hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
      console.log('Starting initial product load...');
      
      // Add a small delay to ensure categories load first
      const timer = setTimeout(() => {
        initialLoad();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [initialLoad]);

  // Handle scroll for lazy loading
  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      // Load more when 80% scrolled
      if (scrollPercentage > 0.8 && hasMore && !loadingMore) {
        loadMoreProducts();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loadMoreProducts]);

  // Handle scroll snap to update current product
  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container) return;

    let isScrolling;
    const handleScroll = () => {
      clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const itemHeight = window.innerHeight;
        const newIndex = Math.round(scrollTop / itemHeight);
        if (newIndex !== currentProductIndex && newIndex < displayedProducts.length) {
          setCurrentProductIndex(newIndex);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentProductIndex, displayedProducts.length]);

  const formatPrice = (price, currency = 'USD') => {
    const symbols = { 'USD': '$', 'EUR': '€', 'ILS': '₪' };
    const symbol = symbols[currency] || '$';
    return `${symbol}${parseFloat(price).toFixed(2)}`;
  };

  const renderStars = (rating, backgroundColor) => {
    const stars = [];
    const numericRating = Number(rating) || 0;
    const fullStars = Math.floor(numericRating);
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars ? '★' : '☆');
    }
    
    // Determine text shadow based on background
    const isLightBackground = backgroundColor.includes('255, 255, 255');
    const textShadow = isLightBackground 
      ? '1px 1px 2px rgba(0, 0, 0, 0.3), 0 0 4px rgba(0, 0, 0, 0.2)' 
      : '1px 1px 2px rgba(255, 255, 255, 0.3), 0 0 4px rgba(255, 255, 255, 0.2)';
    
    return (
      <span style={{
        background: backgroundColor,
        padding: '2px 6px',
        borderRadius: '12px',
        display: 'inline-block',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        textShadow: textShadow
      }}>
        {stars.join('')}
      </span>
    );
  };

  const handleLike = (productIndex) => {
    const product = displayedProducts[productIndex];
    if (!product) return;
    
    const productId = product.product_id;
    setLikedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        console.log('Unliked product:', product.product_title);
      } else {
        newSet.add(productId);
        console.log('Liked product:', product.product_title);
      }
      return newSet;
    });
  };


  const handleShare = async () => {
    const product = displayedProducts[currentProductIndex];
    const shareUrl = product.promotion_link || window.location.href;
    
    try {
      if (navigator.share && navigator.canShare) {
        await navigator.share({
          title: product.product_title,
          text: `Check out this product: ${product.product_title}`,
          url: shareUrl
        });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        console.log('Link copied to clipboard:', shareUrl);
        setToastMessage('Link copied to clipboard!');
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('Link copied to clipboard (fallback):', shareUrl);
        setToastMessage('Link copied to clipboard!');
        setTimeout(() => setToastMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage('Link copied to clipboard!');
        setTimeout(() => setToastMessage(''), 3000);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        setToastMessage('Unable to copy link');
        setTimeout(() => setToastMessage(''), 3000);
      }
    }
  };

  const handleBuyNow = () => {
    const product = displayedProducts[currentProductIndex];
    if (product.promotion_link) {
      window.open(product.promotion_link, '_blank');
    }
  };

  const handleSearch = () => {
    // Clear all products and reset scroll
    setProducts([]);
    setDisplayedProducts([]);
    setCurrentProductIndex(0);
    setLoading(true);
    setError(null);
    
    // Scroll to top
    if (videoContainerRef.current) {
      videoContainerRef.current.scrollTop = 0;
    }
    
    // Reload products with new filter criteria
    loadProducts(true);
    setShowSearchModal(false);
  };

  const handleCurrencyChange = (newCurrency) => {
    console.log('Currency changed from', selectedCurrency, 'to', newCurrency);
    console.log('Current search filters:', {
      category: selectedCategory,
      sortOrder: sortOrder,
      minPrice: minPrice,
      maxPrice: maxPrice,
      justVideo: justVideo
    });
    
    // Update the currency state
    setSelectedCurrency(newCurrency);
    
    // Clear all products and reset scroll
    setProducts([]);
    setDisplayedProducts([]);
    setCurrentProductIndex(0);
    setLoading(true);
    setError(null);
    
    // Scroll to top
    if (videoContainerRef.current) {
      videoContainerRef.current.scrollTop = 0;
    }
    
    // Perform new search with current filters and new currency
    const searchWithNewCurrency = async () => {
      try {
        const apiParams = {
          category: selectedCategory || 'all',
          sort_order: sortOrder,
          currency: newCurrency, // Use the new currency
          limit: 100,
          min_price: minPrice,
          max_price: maxPrice,
          JustVideo: justVideo ? 1 : 0
        };
        
        console.log('Currency change search API Parameters:', JSON.stringify(apiParams, null, 2));
        const response = await productService.getProducts(apiParams);
        console.log('Currency change search API Response:', response);

        // Handle the response from productService
        let allProducts = [];
        if (response && response.products && Array.isArray(response.products)) {
          allProducts = response.products;
          console.log('Currency change search found products:', allProducts.length);
        } else {
          console.log('Currency change search no products found in response:', response);
          allProducts = [];
        }

        setProducts(allProducts);
        setDisplayedProducts(allProducts.slice(0, initialLoadCount));
        setCurrentProductIndex(0);
        setHasMore(allProducts.length > initialLoadCount);
      } catch (err) {
        setError(err.message || 'Failed to load products');
        console.error('Error in currency change search:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Execute the search
    searchWithNewCurrency();
  };

  const getGradientBackground = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return gradients[index % gradients.length];
  };

  const getRotation = (index) => {
    // Rotation effect removed - keeping function for compatibility but returning none
    return 'none';
  };

  if (loading && displayedProducts.length === 0) {
    return (
      <AppContainer>
        <LoadingContainer>
          <div>⏳ Loading products...</div>
        </LoadingContainer>
      </AppContainer>
    );
  }

  if (error && displayedProducts.length === 0) {
    return (
      <AppContainer>
        <ErrorContainer>
          <h2>Error Loading Products</h2>
          <p>{error}</p>
          <RetryButton onClick={() => loadProducts(true)}>
            Retry
          </RetryButton>
        </ErrorContainer>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      {/* Header */}
      <Header 
        onSearchClick={() => setShowSearchModal(true)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Video Container */}
      <VideoContainer ref={videoContainerRef}>
        {displayedProducts.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            color: '#7f8c8d',
            textAlign: 'center',
            padding: '40px'
          }}>
            {loading ? (
              <>
                <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#3b82f6' }}>
                  {translations[selectedLanguage].searching}
                </h2>
                <p style={{ fontSize: '16px', lineHeight: '1.5', maxWidth: '400px' }}>
                  {translations[selectedLanguage].searchingDescription}
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#2c3e50' }}>
                  No Products Available
                </h2>
                <p style={{ fontSize: '16px', lineHeight: '1.5', maxWidth: '400px' }}>
                  No products found matching your search criteria. Try adjusting your filters.
                </p>
              </>
            )}
          </div>
        ) : (
          displayedProducts.map((product, index) => (
          <VideoItem key={product.product_id || index} $bgGradient={getGradientBackground(index)}>
                    <ProductImageContainer>
                      <ImageFrame>
                        <ProductImageCarouselTikTok
                          images={product.product_small_image_urls?.string || product.product_small_image_urls || []}
                          videoUrl={product.product_video_url}
                          autoPlay={true}
                          autoPlayInterval={3000}
                          isInView={index === currentProductIndex}
                          onLike={() => handleLike(index)}
                          onShare={() => handleShare(product)}
                          isLiked={likedProducts.has(product.product_id)}
                        />
                      </ImageFrame>
                    </ProductImageContainer>
            
            <GradientOverlay />
            
            {/* Product Info Overlay */}
            <ProductInfoOverlay>
              <InfoFrame>
                <LandscapeContentWrapper>
                  <ProductTitle 
                    $textColor={getHighContrastTextColor(getGradientBackground(index))}
                  >
                    {product.product_title}
                  </ProductTitle>
                  
                  {/* Price Information */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <ProductPrice $textColor={getAccentColor(getGradientBackground(index), '#4ade80')}>
                      {formatPrice(product.target_sale_price, product.target_original_price_currency)}
                    </ProductPrice>
                    {product.target_original_price && Number(product.target_original_price) > Number(product.target_sale_price) && (
                      <span style={{ 
                        color: getHighContrastTextColor(getGradientBackground(index)) === '#000000' ? '#666666' : '#cccccc', 
                        textDecoration: 'line-through', 
                        fontSize: '0.875rem'
                      }}>
                        {formatPrice(product.target_original_price, product.target_original_price_currency)}
                      </span>
                    )}
                    {product.discount && Number(product.discount) > 0 && (
                      <span style={{ 
                        color: getHighContrastTextColor(getGradientBackground(index)) === '#000000' ? '#dc2626' : '#fca5a5', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        background: getHighContrastTextColor(getGradientBackground(index)) === '#000000' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(252, 165, 165, 0.2)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        boxShadow: getHighContrastTextColor(getGradientBackground(index)) === '#000000' ? '0 2px 8px rgba(220, 38, 38, 0.3)' : '0 2px 8px rgba(252, 165, 165, 0.3)'
                      }}>
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Rating and Sales Volume */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <ProductRating $textColor={getAccentColor(getGradientBackground(index), '#fbbf24')}>
                      {renderStars(product.evaluate_rate, getStarBackgroundColor(getGradientBackground(index)))}
                    </ProductRating>
                    <span style={{ 
                      color: getAccentColor(getGradientBackground(index), '#a3e4d7'), 
                      fontSize: 'clamp(0.6rem, 1.6vw, 0.7rem)'
                    }}>
                      ({(Number(product.evaluate_rate) || 0).toFixed(1)})
                    </span>
                    <OrderVolume $textColor={getAccentColor(getGradientBackground(index), '#a3e4d7')}>
                      {Number(product.lastest_volume) || 0} bought
                    </OrderVolume>
                  </div>

                  {/* Category */}
                  <div style={{ marginBottom: '0.25rem' }}>
                    <span style={{ 
                      background: getHighContrastTextColor(getGradientBackground(index)) === '#000000' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(147, 197, 253, 0.2)', 
                      color: getHighContrastTextColor(getGradientBackground(index)) === '#000000' ? '#2563eb' : '#93c5fd', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
                      boxShadow: getHighContrastTextColor(getGradientBackground(index)) === '#000000' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : '0 2px 8px rgba(147, 197, 253, 0.3)'
                    }}>
                      {product.first_level_category_name}
                    </span>
                  </div>

                  {/* Product ID */}
                  <div style={{ marginBottom: '0.25rem' }}>
                    <span style={{ 
                      color: getHighContrastTextColor(getGradientBackground(index)) === '#000000' ? '#666666' : '#cccccc',
                      fontSize: 'clamp(0.6rem, 1.6vw, 0.7rem)', 
                      opacity: 0.8
                    }}>
                      ID: {product.product_id}
                    </span>
                  </div>
                </LandscapeContentWrapper>
              </InfoFrame>
            </ProductInfoOverlay>

            {/* Buy Now Button - Fixed to Bottom */}
            <BuyNowButtonWrapper>
              <BuyNowButton onClick={handleBuyNow}>
                {translations[selectedLanguage].buyNow}
              </BuyNowButton>
            </BuyNowButtonWrapper>
          </VideoItem>
        ))
        )}
        
        {/* Loading more indicator */}
        {loadingMore && (
          <VideoItem>
            <LoadingContainer>
              <div>Loading more products...</div>
            </LoadingContainer>
          </VideoItem>
        )}
      </VideoContainer>


      {/* Search Modal */}
      <SearchModal $show={showSearchModal}>
        <SearchModalContent>
          <CloseButton onClick={() => setShowSearchModal(false)}>
            ×
          </CloseButton>
          
          <h2 style={{ 
            color: 'white', 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '2rem', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            direction: selectedLanguage === 'en' ? 'ltr' : 'rtl'
          }}>
            {translations[selectedLanguage].searchAndFilter}
          </h2>
          
          <CategorySelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              direction: 'ltr',
              textAlign: 'left'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name} ({category.product_count || 0})
              </option>
            ))}
          </CategorySelect>

          <PriceRangeContainer>
            <PriceInput
              type="number"
              placeholder={translations[selectedLanguage].minPrice}
              value={minPrice === 0 ? '' : minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
              min="0"
              style={{
                direction: selectedLanguage === 'en' ? 'ltr' : 'rtl',
                textAlign: selectedLanguage === 'en' ? 'left' : 'right'
              }}
            />
            <PriceInput
              type="number"
              placeholder={translations[selectedLanguage].maxPrice}
              value={maxPrice === 100000 ? '' : maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 100000)}
              min="0"
              style={{
                direction: selectedLanguage === 'en' ? 'ltr' : 'rtl',
                textAlign: selectedLanguage === 'en' ? 'left' : 'right'
              }}
            />
          </PriceRangeContainer>

          <SortSelect
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              direction: selectedLanguage === 'en' ? 'ltr' : 'rtl',
              textAlign: selectedLanguage === 'en' ? 'left' : 'right'
            }}
          >
            <option value="asc">{translations[selectedLanguage].ascending}</option>
            <option value="desc">{translations[selectedLanguage].descending}</option>
          </SortSelect>

          <ToggleContainer>
            <ToggleSwitch
              type="checkbox"
              checked={justVideo}
              onChange={(e) => setJustVideo(e.target.checked)}
            />
            <ToggleLabel style={{
              direction: selectedLanguage === 'en' ? 'ltr' : 'rtl',
              textAlign: selectedLanguage === 'en' ? 'left' : 'right'
            }}>
              {translations[selectedLanguage].onlyVideos}
            </ToggleLabel>
          </ToggleContainer>
          
          <SearchButtonModal onClick={handleSearch} style={{
            textAlign: 'center',
            direction: selectedLanguage === 'en' ? 'ltr' : 'rtl'
          }}>
            {translations[selectedLanguage].search}
          </SearchButtonModal>
        </SearchModalContent>
      </SearchModal>
      
      {/* Toast Notification */}
      {toastMessage && (
        <Toast>
          {toastMessage}
        </Toast>
      )}
    </AppContainer>
  );
}

export default App;
