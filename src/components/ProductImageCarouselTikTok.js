import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 1rem;
  aspect-ratio: 1 / 1;
`;

const CarouselImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  top: 0;
  left: 0;
  opacity: ${props => props.$active ? 1 : 0};
  transition: opacity 0.5s ease-in-out;
  aspect-ratio: 1 / 1;
`;

const CarouselVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  position: absolute;
  top: 0;
  left: 0;
  opacity: ${props => props.$active ? 1 : 0};
  transition: opacity 0.5s ease-in-out;
  aspect-ratio: 1 / 1;
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
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 8;
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

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 12;
  opacity: 0.7;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &.left {
    left: 10px;
  }

  &.right {
    right: 10px;
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
const VideoControls = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.3s ease;
  z-index: 100;
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  border-radius: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 320px;
`;


const PlayPauseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  z-index: 101;
  position: relative;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const MuteButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  z-index: 101;
  position: relative;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const TimeDisplay = styled.span`
  color: white;
  font-size: 0.7rem;
  font-weight: 400;
  min-width: 45px;
  text-align: center;
  z-index: 101;
  position: relative;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
`;

const ProgressContainer = styled.div`
  flex: 1;
  min-width: 80px;
  height: 18px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 9px;
  cursor: pointer;
  position: relative;
  margin: 0 0.5rem;
  z-index: 101;
  display: flex;
  align-items: center;
  padding: 0 3px;
  touch-action: none;
  user-select: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  /* Increase touch area */
  &::before {
    content: '';
    position: absolute;
    top: -12px;
    left: 0;
    right: 0;
    bottom: -12px;
    background: transparent;
    cursor: pointer;
    touch-action: none;
    z-index: 102;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.4);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ProgressBar = styled.div`
  height: 14px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 7px;
  width: ${props => props.$progress || 0}%;
  transition: width 0.1s ease;
  position: relative;
  margin: 2px 0;
  pointer-events: none;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);

  &::after {
    content: '';
    position: absolute;
    right: -7px;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 0 2px #3b82f6;
    border: 2px solid white;
    cursor: grab;
    pointer-events: none;
    transition: all 0.2s ease;
    
    &:active {
      cursor: grabbing;
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5), 0 0 0 3px #3b82f6;
    }
  }
`;


const ProductImageCarouselTikTok = ({ 
  images = [], 
  videoUrl = null, 
  autoPlay = true,
  autoPlayInterval = 3000,
  isInView = true,
  onLike = () => {},
  onShare = () => {},
  isLiked = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Video control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  
  const videoRef = useRef(null);
  const carouselRef = useRef(null);
  const isDragging = useRef(false);

  // Create combined array: video first (if exists), then images
  const mediaItems = videoUrl ? [videoUrl, ...images] : images;
  const isVideoActive = videoUrl && currentIndex === 0;

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

  // Handle auto-play for media carousel
  useEffect(() => {
    // Disable auto-play if product has video
    if (!isAutoPlay || mediaItems.length <= 1 || videoUrl) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === mediaItems.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [mediaItems.length, isAutoPlay, autoPlayInterval, videoUrl]);

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
    setShowControls(true);
    // Toggle play/pause when clicking on video
    togglePlayPause();
  };

  // Auto-show controls when video is active and keep them visible
  useEffect(() => {
    if (isVideoActive) {
      setShowControls(true);
    }
  }, [isVideoActive]);

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

  // Touch handlers for swipe functionality
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

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
    >
      {/* Show video if it's the current active item */}
      {isVideoActive && (
        <CarouselVideo
          ref={videoRef}
          src={videoUrl}
          $active={true}
          muted={isMuted}
          loop
          playsInline
          onClick={handleVideoClick}
          onError={() => {
            console.error('Video failed to load:', videoUrl);
            // Move to next item if video fails
            goToNext();
          }}
        />
      )}
      
      {/* Show images */}
      {images.map((imageUrl, index) => {
        const imageIndex = videoUrl ? index + 1 : index; // Adjust index if video exists
        return (
          <CarouselImage
            key={index}
            src={imageUrl}
            alt={`Product image ${index + 1}`}
            $active={currentIndex === imageIndex}
          />
        );
      })}
      
      {/* Navigation buttons - show if more than one media item */}
      {mediaItems.length > 1 && (
        <>
          <NavigationButton 
            className="left" 
            onClick={goToPrevious}
            aria-label="Previous media"
          >
            ‹
          </NavigationButton>
          <NavigationButton 
            className="right" 
            onClick={goToNext}
            aria-label="Next media"
          >
            ›
          </NavigationButton>
        </>
      )}

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
      
      {/* Video Controls - Only show when video is active */}
      {isVideoActive && (
        <VideoControls $show={showControls}>
          <PlayPauseButton onClick={togglePlayPause}>
            {isPlaying ? (
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </PlayPauseButton>
          
          <MuteButton onClick={toggleMute}>
            {isMuted ? (
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : (
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </MuteButton>
          
          <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
          
          <ProgressContainer 
            onClick={handleProgressClick}
            onTouchStart={handleProgressTouchStart}
            onTouchMove={handleProgressTouchMove}
            onTouchEnd={handleProgressTouchEnd}
          >
            <ProgressBar $progress={(currentTime / duration) * 100} />
          </ProgressContainer>
          
          <TimeDisplay>{formatTime(duration)}</TimeDisplay>
        </VideoControls>
      )}

      {/* Action Buttons - Inside Carousel */}
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
    </CarouselContainer>
  );
};

export default ProductImageCarouselTikTok;
