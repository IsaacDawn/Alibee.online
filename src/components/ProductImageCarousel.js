import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
`;

const CarouselImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  opacity: ${props => props.active ? 1 : 0};
  transition: opacity 0.5s ease-in-out;
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
  z-index: 3;

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
  z-index: 2;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ffffff;
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
`;

const ProductImageCarousel = ({ 
  images = [], 
  videoUrl = null, 
  discount = 0,
  autoPlay = true,
  autoPlayInterval = 3000 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlay, autoPlayInterval]);

  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleVideoClick = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  if (!images || images.length === 0) {
    return (
      <CarouselContainer>
        <CarouselImage
          src="https://via.placeholder.com/400x300/bdc3c7/ffffff?text=No+Image"
          alt="No image available"
          active={true}
        />
        {discount > 0 && (
          <DiscountBadge>
            -{discount}%
          </DiscountBadge>
        )}
      </CarouselContainer>
    );
  }

  return (
    <CarouselContainer>
      {images.map((imageUrl, index) => (
        <CarouselImage
          key={index}
          src={imageUrl}
          alt={`Product image ${index + 1}`}
          active={index === currentImageIndex}
        />
      ))}
      
      {videoUrl && (
        <VideoOverlay onClick={handleVideoClick}>
          ▶️
        </VideoOverlay>
      )}

      {discount > 0 && (
        <DiscountBadge>
          -{discount}%
        </DiscountBadge>
      )}

      {images.length > 1 && (
        <CarouselDots>
          {images.map((_, index) => (
            <Dot
              key={index}
              active={index === currentImageIndex}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </CarouselDots>
      )}
    </CarouselContainer>
  );
};

export default ProductImageCarousel;
