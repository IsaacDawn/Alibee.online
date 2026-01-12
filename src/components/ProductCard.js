import React, { useState } from 'react';
import styled from 'styled-components';
import { FiExternalLink, FiShare2, FiHeart, FiPlay } from 'react-icons/fi';

const CardContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  min-height: 400px;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  background: #333;
  aspect-ratio: 1 / 1;
  
  /* Mobile (portrait/vertical): square based on width */
  /* Width is 100% of container, height automatically equals width */
  width: 100%;
  
  /* Desktop (landscape/horizontal): square based on height */
  /* Height is constrained, width automatically equals height via aspect-ratio */
  @media (min-width: 769px) {
    width: auto;
    height: min(50vh, 500px);
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  @media (min-width: 1200px) {
    height: min(45vh, 600px);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${CardContainer}:hover & {
    transform: scale(1.05);
  }
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

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
`;

const LikeButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;

  &:hover {
    background: rgba(255, 107, 107, 0.8);
    transform: scale(1.1);
  }

  &.liked {
    background: #ff6b6b;
    color: white;
  }
`;

const ContentContainer = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProductTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StoreName = styled.p`
  font-size: 14px;
  color: #888;
  margin: 0;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  color: ${props => props.filled ? '#ffd700' : '#333'};
  font-size: 16px;
`;

const RatingText = styled.span`
  font-size: 14px;
  color: #888;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
`;

const CurrentPrice = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #4ecdc4;
`;

const OriginalPrice = styled.div`
  font-size: 16px;
  color: #888;
  text-decoration: line-through;
`;

const CurrencySymbol = styled.span`
  font-size: 14px;
  margin-left: 2px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &.primary {
    background: linear-gradient(45deg, #4ecdc4, #44a08d);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid #333;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: #555;
    }
  }
`;

const ProductCard = ({ product, currency, language }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price, currencyCode) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'ILS': '₪'
    };
    
    const symbol = symbols[currencyCode] || '$';
    return `${symbol}${parseFloat(price).toFixed(2)}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} filled>★</Star>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} filled>★</Star>);
      } else {
        stars.push(<Star key={i}>☆</Star>);
      }
    }
    return stars;
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleViewProduct = () => {
    if (product.product_url) {
      window.open(product.product_url, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.title,
        url: product.product_url
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(product.product_url);
      // You could show a toast notification here
    }
  };

  const discountPercentage = product.discount_percentage 
    ? Math.round(product.discount_percentage) 
    : null;

  return (
    <CardContainer className="fade-in">
      <ImageContainer>
        {product.image_url && (
          <ProductImage
            src={product.image_url}
            alt={product.title}
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        )}
        
        {product.has_video && (
          <VideoOverlay>
            <FiPlay />
          </VideoOverlay>
        )}

        {discountPercentage && (
          <DiscountBadge>
            -{discountPercentage}%
          </DiscountBadge>
        )}

        <LikeButton 
          className={isLiked ? 'liked' : ''}
          onClick={handleLike}
        >
          <FiHeart fill={isLiked ? 'currentColor' : 'none'} />
        </LikeButton>
      </ImageContainer>

      <ContentContainer>
        <ProductTitle>{product.title}</ProductTitle>
        
        {product.store_name && (
          <StoreName>{product.store_name}</StoreName>
        )}
        
        {product.rating && (
          <RatingContainer>
            <Stars>
              {renderStars(product.rating)}
            </Stars>
            <RatingText>({product.rating.toFixed(1)})</RatingText>
          </RatingContainer>
        )}
        
        <PriceContainer>
          <CurrentPrice>
            {formatPrice(product.current_price, currency)}
            <CurrencySymbol>{currency}</CurrencySymbol>
          </CurrentPrice>
          {product.original_price && product.original_price > product.current_price && (
            <OriginalPrice>
              {formatPrice(product.original_price, currency)}
            </OriginalPrice>
          )}
        </PriceContainer>
        
        <ActionButtons>
          <ActionButton className="primary" onClick={handleViewProduct}>
            <FiExternalLink size={16} />
            View Product
          </ActionButton>
          <ActionButton className="secondary" onClick={handleShare}>
            <FiShare2 size={16} />
            Share
          </ActionButton>
        </ActionButtons>
      </ContentContainer>
    </CardContainer>
  );
};

export default ProductCard;
