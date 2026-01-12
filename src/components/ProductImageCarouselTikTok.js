import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { imageCache } from '../utils/imageCache';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0;
`;

const CarouselImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(${props => {
    if (props.$isDragging) {
      // During drag: calculate position based on current index and drag offset
      const baseOffset = (props.$index - props.$currentIndex) * 100;
      // Convert drag offset from pixels to percentage
      const dragOffsetPercent = props.$containerWidth > 0 
        ? (props.$dragOffset / props.$containerWidth) * 100 
        : 0;
      return `${baseOffset + dragOffsetPercent}%`;
    }
    // Normal state: show current image at 0%, previous at -100%, next at 100%
    const offset = (props.$index - props.$currentIndex) * 100;
    return `${offset}%`;
  }});
  opacity: ${props => {
    // Show current, previous, and next images during drag or when active
    if (props.$isDragging) {
      const diff = Math.abs(props.$index - props.$currentIndex);
      return diff <= 1 ? 1 : 0; // Show current, previous, and next
    }
    return props.$active ? 1 : 0;
  }};
  transition: ${props => props.$isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'};
  will-change: transform;
`;

const CarouselVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(${props => {
    if (props.$isDragging) {
      const baseOffset = (props.$index - props.$currentIndex) * 100;
      const dragOffsetPercent = props.$containerWidth > 0 
        ? (props.$dragOffset / props.$containerWidth) * 100 
        : 0;
      return `${baseOffset + dragOffsetPercent}%`;
    }
    const offset = (props.$index - props.$currentIndex) * 100;
    return `${offset}%`;
  }});
  opacity: ${props => {
    if (props.$isDragging) {
      const diff = Math.abs(props.$index - props.$currentIndex);
      return diff <= 1 ? 1 : 0;
    }
    return props.$active ? 1 : 0;
  }};
  transition: ${props => props.$isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'};
  will-change: transform;
`;

const VideoOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 6;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const CarouselDots = styled.div`
  position: absolute;
  bottom: clamp(12px, 2vh, 20px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: clamp(6px, 1.2vw, 8px);
  z-index: 25;
  pointer-events: auto;
  
  @media (max-width: 480px) {
    bottom: clamp(10px, 1.8vh, 15px);
  }
  
  @media (min-width: 769px) {
    bottom: clamp(15px, 2.5vh, 25px);
  }
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ffffff;
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  right: clamp(0.25rem, 1.5vw, 0.5rem);
  top: clamp(0.25rem, 1.5vw, 0.5rem);
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 1.5vw, 0.5rem);
  z-index: 15;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: clamp(0.15rem, 1vw, 0.25rem);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: scale(1.1);
  }

  &.liked {
    color: #ff6b6b;
  }
`;

// Video Controls Components


const ProductImageCarouselTikTok = ({ 
  images = [], 
  videoUrl = null, 
  autoPlay = true,
  autoPlayInterval = 3000,
  isInView = true,
  onLike = () => {},
  onShare = () => {},
  isLiked = false,
  showActions = true,
  shouldLoadAllImages = false, // New prop: only load all images when product is in view
  shouldLoadFirstImage = true, // New prop: allow loading first image (for current and next product)
  loadPriority = 0 // New prop: priority level (1=current main, 2=next main, 3=current others, 4=next others)
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Video control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Lazy loading state - track which images are loaded
  const [loadedImages, setLoadedImages] = useState(new Set());
  const loadingImagesRef = useRef(new Set()); // Track images currently loading
  const loadingVideosRef = useRef(new Set()); // Track videos currently loading
  const imageLoadFlagsRef = useRef(new Map()); // Track loading flags for each image (to cancel)
  const videoLoadFlagsRef = useRef(new Map()); // Track loading flags for each video
  
  // Global image cache - shared across all components to prevent re-downloading
  // Check if image is already loaded in browser cache
  const checkImageCache = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      // If image is in browser cache, onload fires immediately
      if (img.complete) {
        resolve(true);
      }
    });
  };
  
  const videoRef = useRef(null);
  const carouselRef = useRef(null);
  const containerWidthRef = useRef(0);
  
  // Log loading status periodically
  useEffect(() => {
    const logInterval = setInterval(() => {
      const totalLoading = loadingImagesRef.current.size + loadingVideosRef.current.size;
      const totalLoaded = loadedImages.size;
      if (totalLoading > 0 || totalLoaded > 0) {
        console.log(`[ProductImageCarousel] Status - Loading: ${loadingImagesRef.current.size} images, ${loadingVideosRef.current.size} videos | Loaded: ${totalLoaded} images`);
      }
    }, 2000); // Log every 2 seconds
    
    return () => clearInterval(logInterval);
  }, [loadedImages]);

  // Create combined array: video first (if exists), then images
  const mediaItems = videoUrl ? [videoUrl, ...images] : images;
  const isVideoActive = videoUrl && currentIndex === 0;
  
  // Check if current media item is loaded
  const getCurrentMediaUrl = () => {
    if (isVideoActive) return videoUrl;
    const imageIndex = videoUrl ? currentIndex - 1 : currentIndex;
    if (imageIndex >= 0 && imageIndex < images.length) {
      return images[imageIndex];
    }
    return null;
  };
  
  const currentMediaUrl = getCurrentMediaUrl();
  const isCurrentMediaLoaded = isVideoActive 
    ? true // Video loading is handled separately
    : (currentMediaUrl ? loadedImages.has(currentMediaUrl) : false);

  // Cancel all non-priority image loads when shouldLoadFirstImage changes
  // BUT: Don't cancel first image loads - they should always load for current and next product
  useEffect(() => {
    if (!shouldLoadFirstImage) {
      // Cancel all image loads except first image if product is no longer priority
      imageLoadFlagsRef.current.forEach((flag, imageUrl) => {
        // Don't cancel first image - it should load for current/next products
        if (images[0] === imageUrl) return;
        
        if (!loadingImagesRef.current.has(imageUrl)) return;
        flag.cancelled = true; // Mark as cancelled
        loadingImagesRef.current.delete(imageUrl);
        imageLoadFlagsRef.current.delete(imageUrl);
        console.log(`[ProductImageCarousel] Cancelled non-priority image load: ${imageUrl.substring(0, 50)}...`);
      });
    }
  }, [shouldLoadFirstImage, images]);

  // Load first media (video or image) with priority:
  // Priority 1: Current card main image/video (loadPriority = 1, immediate)
  // Priority 2: Next card main image/video (loadPriority = 2, small delay)
  useEffect(() => {
    if (!shouldLoadFirstImage) return;
    
    // Determine priority and delay
    const priorityLevel = loadPriority === 1 ? 'Priority 1 (Current card main)' : 
                          loadPriority === 2 ? 'Priority 2 (Next card main)' : 
                          'Unknown priority';
    const loadDelay = loadPriority === 2 ? 50 : 0; // 50ms delay for next card to ensure current loads first
    
    // If product has video, load video first (video is the first media item)
    if (videoUrl) {
      if (!loadingVideosRef.current.has(videoUrl)) {
        loadingVideosRef.current.add(videoUrl);
        console.log(`[ProductImageCarousel] Starting to load video (${priorityLevel}): ${videoUrl.substring(0, 50)}...`);
        // Video will be loaded by the video element itself when rendered
      }
      return; // Don't load first image if video exists (video is first)
    }
    
    // If no video, load first image
    if (images.length === 0) return;
    
    const firstImage = images[0];
    if (firstImage && !loadedImages.has(firstImage) && !loadingImagesRef.current.has(firstImage)) {
      // Cancel any existing load for this image
      const existingFlag = imageLoadFlagsRef.current.get(firstImage);
      if (existingFlag) {
        existingFlag.cancelled = true;
      }
      
      loadingImagesRef.current.add(firstImage);
      const loadFlag = { cancelled: false };
      imageLoadFlagsRef.current.set(firstImage, loadFlag);
      
      console.log(`[ProductImageCarousel] Starting to load first image (${priorityLevel}): ${firstImage.substring(0, 50)}...`);
      
      // Check if image is already cached
      if (imageCache.isCached(firstImage)) {
        console.log(`[ProductImageCarousel] ✓ First image found in cache (${priorityLevel}): ${firstImage.substring(0, 50)}...`);
        setLoadedImages(prev => {
          const newSet = new Set(prev);
          newSet.add(firstImage);
          return newSet;
        });
        loadingImagesRef.current.delete(firstImage);
        imageLoadFlagsRef.current.delete(firstImage);
        return;
      }
      
      // Load with delay based on priority
      setTimeout(() => {
        // Preload using cache system
        imageCache.preloadImage(firstImage).then((cachedImg) => {
          const flag = imageLoadFlagsRef.current.get(firstImage);
          if (flag && flag.cancelled) return;
          
          if (cachedImg) {
            loadingImagesRef.current.delete(firstImage);
            imageLoadFlagsRef.current.delete(firstImage);
            setLoadedImages(prev => {
              const newSet = new Set(prev);
              newSet.add(firstImage);
              return newSet;
            });
            console.log(`[ProductImageCarousel] ✓ Loaded first image from cache (${priorityLevel}): ${firstImage.substring(0, 50)}...`);
          }
        });
        
        // Also load directly for immediate display
        const img = new Image();
        img.src = firstImage;
        img.onload = () => {
          const flag = imageLoadFlagsRef.current.get(firstImage);
          if (flag && flag.cancelled) return; // Don't process if cancelled
          loadingImagesRef.current.delete(firstImage);
          imageLoadFlagsRef.current.delete(firstImage);
          setLoadedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(firstImage);
            return newSet;
          });
          console.log(`[ProductImageCarousel] ✓ Loaded first image (${priorityLevel}): ${firstImage.substring(0, 50)}...`);
        };
        img.onerror = () => {
          const flag = imageLoadFlagsRef.current.get(firstImage);
          if (flag && flag.cancelled) return; // Don't process if cancelled
          loadingImagesRef.current.delete(firstImage);
          imageLoadFlagsRef.current.delete(firstImage);
          console.warn(`[ProductImageCarousel] ✗ Failed to load first image (${priorityLevel}): ${firstImage.substring(0, 50)}...`);
        };
      }, loadDelay);
    }
  }, [images, shouldLoadFirstImage, videoUrl, loadedImages, loadPriority]); // Run when images, shouldLoadFirstImage, videoUrl, or loadPriority changes

  // Cancel all non-priority image loads when shouldLoadAllImages changes
  useEffect(() => {
    if (!shouldLoadAllImages) {
      // Cancel all additional image loads if product is no longer priority
      imageLoadFlagsRef.current.forEach((flag, imageUrl) => {
        // Don't cancel first image (it's handled separately)
        if (images[0] === imageUrl) return;
        
        if (loadingImagesRef.current.has(imageUrl)) {
          flag.cancelled = true; // Mark as cancelled
          loadingImagesRef.current.delete(imageUrl);
          imageLoadFlagsRef.current.delete(imageUrl);
          console.log(`[ProductImageCarousel] Cancelled non-priority image load: ${imageUrl.substring(0, 50)}...`);
        }
      });
    }
  }, [shouldLoadAllImages, images]);

  // Load all other images based on priority:
  // Priority 3: Other images of current card (shouldLoadAllImages = true, loadPriority = 1)
  // Priority 4: Other images of next card (shouldLoadAllImages = true, loadPriority = 2)
  useEffect(() => {
    // Only load other images if shouldLoadAllImages is true
    if (!shouldLoadAllImages || images.length === 0) {
      // Cancel any ongoing loads for additional images
      images.forEach((imageUrl, index) => {
        if (index === 0) return; // Don't cancel first image
        const flag = imageLoadFlagsRef.current.get(imageUrl);
        if (flag && loadingImagesRef.current.has(imageUrl)) {
          flag.cancelled = true;
          loadingImagesRef.current.delete(imageUrl);
          imageLoadFlagsRef.current.delete(imageUrl);
          console.log(`[ProductImageCarousel] Cancelled image load (not priority): ${imageUrl.substring(0, 50)}...`);
        }
      });
      return;
    }
    
    // Determine priority level for logging
    const priorityLevel = loadPriority === 1 ? 'Priority 3 (Current card other images)' : 
                          loadPriority === 2 ? 'Priority 4 (Next card other images)' : 
                          'Unknown priority';
    
    console.log(`[ProductImageCarousel] Loading other images - ${priorityLevel} (${images.length - 1} additional images)`);
    
    // Load additional images based on priority
    images.forEach((imageUrl, index) => {
      // Skip first image (already loaded or will be loaded separately)
      if (index === 0) return;
      
      if (imageUrl && !loadedImages.has(imageUrl) && !loadingImagesRef.current.has(imageUrl)) {
        // Check if image is already cached
        if (imageCache.isCached(imageUrl)) {
          console.log(`[ProductImageCarousel] ✓ Image ${index + 1} found in cache (${priorityLevel}): ${imageUrl.substring(0, 50)}...`);
          if (shouldLoadAllImages) {
            setLoadedImages(prev => {
              const newSet = new Set(prev);
              newSet.add(imageUrl);
              return newSet;
            });
          }
          return;
        }
        
        // Cancel any existing load for this image
        const existingFlag = imageLoadFlagsRef.current.get(imageUrl);
        if (existingFlag) {
          existingFlag.cancelled = true;
        }
        
        loadingImagesRef.current.add(imageUrl);
        const loadFlag = { cancelled: false };
        imageLoadFlagsRef.current.set(imageUrl, loadFlag);
        
        console.log(`[ProductImageCarousel] Starting to load image ${index + 1} (${priorityLevel}): ${imageUrl.substring(0, 50)}...`);
        
        // Use cache system to preload with delay based on priority
        // Priority 3 (current card) loads immediately
        // Priority 4 (next card) loads with a small delay to ensure priority 3 loads first
        const loadDelay = loadPriority === 2 ? 100 : 0; // 100ms delay for next card images
        
        setTimeout(() => {
          imageCache.preloadImage(imageUrl).then((cachedImg) => {
            const flag = imageLoadFlagsRef.current.get(imageUrl);
            if (flag && flag.cancelled) return;
            if (!shouldLoadAllImages) return;
            
            if (cachedImg) {
              loadingImagesRef.current.delete(imageUrl);
              imageLoadFlagsRef.current.delete(imageUrl);
              setLoadedImages(prev => {
                const newSet = new Set(prev);
                newSet.add(imageUrl);
                return newSet;
              });
              console.log(`[ProductImageCarousel] ✓ Loaded image ${index + 1} from cache (${priorityLevel}): ${imageUrl.substring(0, 50)}...`);
            }
          });
          
          // Also load directly for immediate display
          const img = new Image();
          img.src = imageUrl;
          img.onload = () => {
            const flag = imageLoadFlagsRef.current.get(imageUrl);
            if (flag && flag.cancelled) return; // Don't process if cancelled
            loadingImagesRef.current.delete(imageUrl);
            imageLoadFlagsRef.current.delete(imageUrl);
            if (shouldLoadAllImages) {
              setLoadedImages(prev => {
                const newSet = new Set(prev);
                newSet.add(imageUrl);
                return newSet;
              });
              console.log(`[ProductImageCarousel] ✓ Loaded image ${index + 1} (${priorityLevel}): ${imageUrl.substring(0, 50)}...`);
            } else {
              console.log(`[ProductImageCarousel] ✗ Image loaded but no longer priority, discarding: ${imageUrl.substring(0, 50)}...`);
            }
          };
          img.onerror = () => {
            const flag = imageLoadFlagsRef.current.get(imageUrl);
            if (flag && flag.cancelled) return; // Don't process if cancelled
            loadingImagesRef.current.delete(imageUrl);
            imageLoadFlagsRef.current.delete(imageUrl);
            console.warn(`[ProductImageCarousel] ✗ Failed to load image ${index + 1} (${priorityLevel}): ${imageUrl.substring(0, 50)}...`);
          };
        }, loadDelay);
      }
    });
  }, [shouldLoadAllImages, images, loadedImages, loadPriority]);

  // Load next/previous image when user navigates to it
  // Only if product is in view (shouldLoadAllImages is true) or is currently visible (isInView)
  // BUT: First image should always load for current and next product (handled separately)
  useEffect(() => {
    // If all images should be loaded (product in view - IntersectionObserver), skip this - they're handled by the other effect
    if (shouldLoadAllImages || images.length === 0) return;
    
    // Only load individual images if product is currently visible (isInView)
    // This is for when user manually navigates through images
    if (!isInView) {
      // Cancel any ongoing loads for additional images (not first image)
      imageLoadFlagsRef.current.forEach((flag, imageUrl) => {
        // Don't cancel first image - it should always load for current/next products
        if (images[0] === imageUrl) return;
        
        if (loadingImagesRef.current.has(imageUrl)) {
          flag.cancelled = true; // Mark as cancelled
          loadingImagesRef.current.delete(imageUrl);
          imageLoadFlagsRef.current.delete(imageUrl);
        }
      });
      return;
    }
    
    // Only load additional images if product is current (isInView = true)
    // First image is handled separately and always loads for current/next products
    const imageIndex = videoUrl ? currentIndex - 1 : currentIndex;
    if (imageIndex >= 0 && imageIndex < images.length) {
      const imageUrl = images[imageIndex];
      // Skip first image - it's handled separately and always loads
      if (imageIndex === 0) return;
      
      if (imageUrl && !loadedImages.has(imageUrl) && !loadingImagesRef.current.has(imageUrl)) {
        // Check if image is already cached
        if (imageCache.isCached(imageUrl)) {
          console.log(`[ProductImageCarousel] ✓ Image on navigation found in cache: ${imageUrl.substring(0, 50)}...`);
          if (isInView) {
            setLoadedImages(prev => {
              const newSet = new Set(prev);
              newSet.add(imageUrl);
              return newSet;
            });
          }
          return;
        }
        
        // Cancel any existing load for this image
        const existingFlag = imageLoadFlagsRef.current.get(imageUrl);
        if (existingFlag) {
          existingFlag.cancelled = true;
        }
        
        loadingImagesRef.current.add(imageUrl);
        const loadFlag = { cancelled: false };
        imageLoadFlagsRef.current.set(imageUrl, loadFlag);
        
        console.log(`[ProductImageCarousel] Starting to load image on navigation (PRIORITY) (index ${imageIndex}): ${imageUrl.substring(0, 50)}...`);
        
        // Use cache system
        imageCache.preloadImage(imageUrl).then((cachedImg) => {
          const flag = imageLoadFlagsRef.current.get(imageUrl);
          if (flag && flag.cancelled) return;
          if (!isInView) return;
          
          if (cachedImg) {
            loadingImagesRef.current.delete(imageUrl);
            imageLoadFlagsRef.current.delete(imageUrl);
            setLoadedImages(prev => {
              const newSet = new Set(prev);
              newSet.add(imageUrl);
              return newSet;
            });
            console.log(`[ProductImageCarousel] ✓ Loaded image on navigation from cache: ${imageUrl.substring(0, 50)}...`);
          }
        });
        
        // Also load directly for immediate display
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const flag = imageLoadFlagsRef.current.get(imageUrl);
          if (flag && flag.cancelled) return;
          loadingImagesRef.current.delete(imageUrl);
          imageLoadFlagsRef.current.delete(imageUrl);
          // Only add if product is still in view
          if (isInView) {
            setLoadedImages(prev => {
              const newSet = new Set(prev);
              newSet.add(imageUrl);
              return newSet;
            });
            console.log(`[ProductImageCarousel] ✓ Loaded image on navigation: ${imageUrl.substring(0, 50)}...`);
          }
        };
        img.onerror = () => {
          const flag = imageLoadFlagsRef.current.get(imageUrl);
          if (flag && flag.cancelled) return;
          loadingImagesRef.current.delete(imageUrl);
          imageLoadFlagsRef.current.delete(imageUrl);
          console.warn(`[ProductImageCarousel] ✗ Failed to load image on navigation: ${imageUrl.substring(0, 50)}...`);
        };
      }
    }
  }, [currentIndex, images, videoUrl, shouldLoadAllImages, isInView, loadedImages]);

  // Handle video playback when in view and video is active
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isCleanedUp = false;

    if (isVideoActive && isInView) {
      video.muted = isMuted;
      video.volume = 1.0; // Always set volume to maximum
      
      // Auto-play when video comes into view
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!isCleanedUp) {
              setIsPlaying(true);
            }
          })
          .catch((error) => {
            // Only log if it's not an AbortError
            if (error.name !== 'AbortError') {
              console.error('Video play error:', error);
            }
          });
      }
    } else {
      // Auto-pause when video goes out of view
      video.pause();
      if (!isCleanedUp) {
        setIsPlaying(false);
      }
    }

    return () => {
      isCleanedUp = true;
    };
  }, [isVideoActive, isInView, isMuted]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoActive) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isVideoActive]);

  // Auto-hide controls disabled - controls stay visible

  // Handle auto-play for media carousel - only when product is in view and current media is loaded
  useEffect(() => {
    // Disable auto-play if:
    // 1. Auto-play is disabled
    // 2. Product has video (videos handle their own playback)
    // 3. Only one media item
    // 4. Product is not in view (isInView is false)
    // 5. Current media is not loaded yet (wait for it to load)
    if (!isAutoPlay || mediaItems.length <= 1 || videoUrl || !isInView || !isCurrentMediaLoaded) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex === mediaItems.length - 1 ? 0 : prevIndex + 1;
        // Check if next media is loaded before switching
        const nextImageIndex = videoUrl ? nextIndex - 1 : nextIndex;
        if (nextIndex === 0 && videoUrl) {
          // Next is video, it's always available
          return nextIndex;
        } else if (nextImageIndex >= 0 && nextImageIndex < images.length) {
          const nextImageUrl = images[nextImageIndex];
          // Only switch if next image is loaded
          if (loadedImages.has(nextImageUrl)) {
            return nextIndex;
          } else {
            // Next image not loaded, wait
            console.log(`[ProductImageCarousel] Waiting for image ${nextImageIndex + 1} to load before switching...`);
            return prevIndex; // Stay on current image
          }
        }
        return nextIndex;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [mediaItems.length, isAutoPlay, autoPlayInterval, videoUrl, isInView, isCurrentMediaLoaded, loadedImages, images]);

  // Video control functions
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            // Only log if it's not an AbortError
            if (error.name !== 'AbortError') {
              console.error('Video play error:', error);
            }
          });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgressClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      console.log('Progress click:', { clickX, rectWidth: rect.width, percentage, newTime, duration });
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      console.log('Progress click failed:', { hasVideo: !!videoRef.current, duration });
    }
  };

  // Add touch support for progress bar
  const handleProgressTouchStart = (e) => {
    e.stopPropagation();
    isDragging.current = true;
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, touchX / rect.width));
      const newTime = percentage * duration;
      console.log('Touch start:', { touchX, rectWidth: rect.width, percentage, newTime, duration });
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      console.log('Touch start failed:', { hasVideo: !!videoRef.current, duration });
    }
  };

  const handleProgressTouchMove = (e) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, touchX / rect.width));
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressTouchEnd = (e) => {
    e.stopPropagation();
    isDragging.current = false;
  };


  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoClick = () => {
    // Toggle play/pause when clicking on video
    togglePlayPause();
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    setIsAutoPlay(false); // Stop auto-play when user manually navigates
  };

  const goToPrevious = () => {
    if (mediaItems.length <= 1) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? mediaItems.length - 1 : prevIndex - 1
    );
    setIsAutoPlay(false); // Stop auto-play when user manually navigates
  };

  const goToNext = () => {
    if (mediaItems.length <= 1) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === mediaItems.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlay(false); // Stop auto-play when user manually navigates
  };

  // Touch handlers for drag functionality with smooth transition
  const handleTouchStart = (e) => {
    if (mediaItems.length <= 1) return;
    
    const touch = e.touches ? e.touches[0] : e;
    setTouchStart(touch.clientX);
    setTouchEnd(null);
    setDragOffset(0);
    setIsDragging(true);
    setIsAutoPlay(false); // Stop auto-play when user starts dragging
    
    // Get container width for percentage calculation
    if (carouselRef.current) {
      containerWidthRef.current = carouselRef.current.offsetWidth;
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !touchStart || mediaItems.length <= 1) return;
    
    const touch = e.touches ? e.touches[0] : e;
    const currentX = touch.clientX;
    const diff = currentX - touchStart;
    
    // Calculate drag offset (limit to prevent over-dragging)
    const maxDrag = containerWidthRef.current * 0.5; // Max 50% of container width
    const limitedDiff = Math.max(-maxDrag, Math.min(maxDrag, diff));
    setDragOffset(limitedDiff);
    setTouchEnd(currentX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !touchStart) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    
    if (mediaItems.length <= 1) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    
    const distance = touchStart - (touchEnd || touchStart);
    const threshold = containerWidthRef.current * 0.25; // 25% of container width
    
    // Determine if we should switch to next/previous
    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        // Swiped left (dragged right) - go to next
        goToNext();
      } else {
        // Swiped right (dragged left) - go to previous
        goToPrevious();
      }
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Mouse handlers for desktop drag support
  const handleMouseDown = (e) => {
    if (mediaItems.length <= 1) return;
    e.preventDefault();
    handleTouchStart(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleTouchMove(e);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleTouchEnd();
    }
  };

  // Add global mouse event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, touchStart, touchEnd]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mediaItems.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mediaItems.length]);

  if (!images || images.length === 0) {
    return (
      <CarouselContainer>
        <CarouselImage
          src="https://via.placeholder.com/320x384/000000/ffffff?text=No+Image"
          alt="No image available"
          $active={true}
        />
      </CarouselContainer>
    );
  }

  return (
    <CarouselContainer 
      ref={carouselRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{ userSelect: 'none', touchAction: 'pan-y' }}
    >
      {/* Show video if it's the current active item and should be loaded */}
      {isVideoActive && shouldLoadFirstImage && (
        <CarouselVideo
          ref={videoRef}
          src={videoUrl}
          $active={currentIndex === 0}
          $index={0}
          $currentIndex={currentIndex}
          $isDragging={isDragging}
          $dragOffset={dragOffset}
          $containerWidth={containerWidthRef.current}
          muted={isMuted}
          loop
          playsInline
          preload={shouldLoadFirstImage ? "auto" : "none"}
          onLoadStart={() => {
            if (!loadingVideosRef.current.has(videoUrl)) {
              loadingVideosRef.current.add(videoUrl);
              console.log(`[ProductImageCarousel] Video load started: ${videoUrl.substring(0, 50)}...`);
            }
          }}
          onLoadedData={() => {
            loadingVideosRef.current.delete(videoUrl);
            console.log(`[ProductImageCarousel] ✓ Video loaded: ${videoUrl.substring(0, 50)}...`);
          }}
          onClick={handleVideoClick}
          onError={() => {
            loadingVideosRef.current.delete(videoUrl);
            console.error(`[ProductImageCarousel] ✗ Video failed to load: ${videoUrl.substring(0, 50)}...`);
            // Move to next item if video fails
            goToNext();
          }}
        />
      )}
      
      {/* Show images - render loaded images and adjacent images during drag */}
      {images.map((imageUrl, index) => {
        const imageIndex = videoUrl ? index + 1 : index; // Adjust index if video exists
        const isLoaded = loadedImages.has(imageUrl);
        const isCurrent = currentIndex === imageIndex;
        const diff = Math.abs(imageIndex - currentIndex);
        
        // During drag, show current, previous, and next images (even if not fully loaded)
        // Otherwise, only show current image if loaded
        const shouldShow = isDragging 
          ? (diff <= 1) // Show current, previous, and next during drag
          : (isCurrent && isLoaded); // Only show current if loaded
        
        if (!shouldShow) {
          return null;
        }
        
        // Show loading placeholder if not loaded
        if (!isLoaded) {
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '14px',
                transform: isDragging 
                  ? `translateX(${((imageIndex - currentIndex) * 100) + (containerWidthRef.current > 0 ? (dragOffset / containerWidthRef.current) * 100 : 0)}%)`
                  : `translateX(${(imageIndex - currentIndex) * 100}%)`,
                opacity: isDragging ? (diff <= 1 ? 1 : 0) : (isCurrent ? 1 : 0),
                transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
                willChange: 'transform'
              }}
            >
              <style>{`
                @keyframes loading {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
              `}</style>
              Loading image {index + 1}...
            </div>
          );
        }
        
        return (
          <CarouselImage
            key={index}
            src={imageUrl}
            alt={`Product image ${index + 1}`}
            $active={isCurrent}
            $index={imageIndex}
            $currentIndex={currentIndex}
            $isDragging={isDragging}
            $dragOffset={dragOffset}
            $containerWidth={containerWidthRef.current}
            loading="lazy"
          />
        );
      })}
      
      {/* Show dots for all media items */}
      {mediaItems.length > 1 && (
        <CarouselDots>
          {mediaItems.map((_, index) => (
            <Dot
              key={index}
              $active={index === currentIndex}
              onClick={() => handleDotClick(index)}
              style={{
                background: index === 0 && videoUrl ? 
                  (currentIndex === 0 ? '#ff6b6b' : 'rgba(255, 107, 107, 0.5)') : 
                  (currentIndex === index ? '#ffffff' : 'rgba(255, 255, 255, 0.5)')
              }}
            />
          ))}
        </CarouselDots>
      )}
      
      {/* Action Buttons - Inside Carousel (optional) */}
      {showActions && (
        <ActionButtons>
          <div>
            <ActionButton 
              onClick={onLike}
              className={isLiked ? 'liked' : ''}
            >
              <svg width="clamp(20px, 6vw, 24px)" height="clamp(20px, 6vw, 24px)" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </ActionButton>
          </div>
          <div>
            <ActionButton onClick={onShare}>
              <svg width="clamp(20px, 6vw, 24px)" height="clamp(20px, 6vw, 24px)" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
            </ActionButton>
          </div>
        </ActionButtons>
      )}
    </CarouselContainer>
  );
};

export default ProductImageCarouselTikTok;
