import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { productService } from './services/productService';
import ProductImageCarouselTikTok from './components/ProductImageCarouselTikTok';
import { imageCache } from './utils/imageCache';
import heartIcon from './icons/heart.svg';
import heartOnIcon from './icons/heart-on.svg';
import starIcon from './icons/star.svg';
import soldIcon from './icons/sold.svg';
import fashionIcon from './icons/fashion.svg';
import shoeIcon from './icons/shoe.svg';
import jewelryIcon from './icons/jewelry.svg';
import carIcon from './icons/car.svg';
import mobileIcon from './icons/mobile.svg';
import cartIcon from './icons/cart.svg';
import miniLogoIcon from './icons/Mini_Logo.svg';

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: #000;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: 0;
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
  width: 100vw;
  height: 100vh;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: none;
  overflow: hidden;
  margin: 0;
`;

const ProductImage = styled.img`
  object-fit: cover;
  width: 90%;
  height: 90%;
  border-radius: 1rem;
`;

const ImageFrame = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Scene UI overlays (to match reference image)
const SideActions = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  z-index: 20;
`;

const ActionCircle = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => (props.$active ? '#ff6b6b' : '#111')};
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  transition: transform 0.2s ease, background 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:hover { transform: translateY(-2px) scale(1.05); background: #fff; }
  &:focus { outline: none; box-shadow: 0 10px 30px rgba(0,0,0,0.25); }
  &:active { outline: none; box-shadow: 0 10px 30px rgba(0,0,0,0.25); }
`;

const ActionCount = styled.div`
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
`;

const NonInteractiveCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
  color: #111;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  pointer-events: none; /* not touchable */
`;

const ProductInfoCard = styled.div`
  position: absolute;
  left: 16px;
  right: 96px;
  bottom: 112px;
  background: rgba(7, 33, 33, 0.2);
  color: #fff;
  border-radius: 5px;
  padding: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 18px 50px rgba(0,0,0,0.35);
  backdrop-filter: blur(3px);
  display: flex;
  flex-direction: column;
`;

const ProductTitleText = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 700;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

const PriceNew = styled.span`
  color: #4ecdc4;
  font-size: 18px;
  font-weight: 800;
`;

const PriceOld = styled.span`
  color: #f59e9e;
  text-decoration: line-through;
  font-size: 14px;
`;

const BuyBtn = styled.button`
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: #fff;
  border: none;
  padding: 12px 22px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 24px rgba(78,205,196,0.35);
  align-self: flex-start;
  margin-top: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(78,205,196,0.5); }
`;

const QuickReturn = styled.button`
  position: absolute;
  right: 16px;
  bottom: 120px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(0,0,0,0.8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:focus { outline: none; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
  &:active { outline: none; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
`;

const BottomBar = styled.div`
  position: fixed;
  left: 0; 
  right: 0; 
  bottom: 0;
  height: 80px;
  min-height: 80px;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
  z-index: 25;
  width: 100%;
  max-width: 100vw;
  overflow: visible;
  box-sizing: border-box;
`;

const BottomCats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 64px;
  padding: 8px 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
  
  /* Enable horizontal scroll on mobile if needed */
  @media (max-width: 480px) {
    gap: 6px;
    padding: 8px 4px;
    min-height: 56px;
  }
`;

const CatBtn = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  border: 1px solid rgb(255, 255, 255);
  background: rgba(255, 255, 255, 0.87);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
  position: relative;
  z-index: 30;

  &:hover { transform: translateY(-2px) scale(1.05); background: rgba(78,205,196,0.9); }
  &:focus { outline: none; box-shadow: none; }
  &:active { outline: none; box-shadow: none; }
  
  &.active {
    border: 2px solid rgba(78, 205, 196, 1);
    box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.3), 0 0 0 5px rgba(78, 205, 196, 0.15);
    background: rgba(78, 205, 196, 0.95);
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    min-width: 40px;
    
    &.active {
      box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.3), 0 0 0 4px rgba(78, 205, 196, 0.15);
    }
  }
`;

const BottomSearch = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(78,205,196,0.95);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 10px 30px rgba(78,205,196,0.4);
  flex-shrink: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
  position: relative;
  z-index: 30;

  &:focus { outline: none; box-shadow: 0 10px 30px rgba(78,205,196,0.4); }
  &:active { outline: none; box-shadow: 0 10px 30px rgba(78,205,196,0.4); }

  &:hover { transform: translateY(-2px) scale(1.05); }
  
  &.active {
    border: 2px solid rgba(78, 205, 196, 1);
    box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.3), 0 0 0 5px rgba(78, 205, 196, 0.15), 0 10px 30px rgba(78,205,196,0.4);
    background: rgba(78, 205, 196, 1);
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    min-width: 40px;
    
    &.active {
      box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.3), 0 0 0 4px rgba(78, 205, 196, 0.15), 0 10px 30px rgba(78,205,196,0.4);
    }
  }
`;

const BottomShowAll = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  background: linear-gradient(135deg, #ff8c42,rgb(218, 255, 53));
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4);
  flex-shrink: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  padding: 4px;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  z-index: 30;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0);
  }

  &:focus { outline: none; box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4); }
  &:active { 
    outline: none; 
    box-shadow: 0 10px 30px rgba(255, 140, 66, 0.4);
    transform: none;
  }

  &:hover:not(.active) { 
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 12px 35px rgba(255, 140, 66, 0.5);
    img {
      filter: brightness(0) drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
    }
  }
  
  &.active {
    border: 2px solid rgba(255, 140, 66, 1);
    box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.3), 0 0 0 5px rgba(255, 140, 66, 0.15), 0 10px 30px rgba(255, 140, 66, 0.4);
    transform: none;
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    min-width: 40px;
    
    &.active {
      box-shadow: 0 0 0 2px rgba(255, 140, 66, 0.3), 0 0 0 4px rgba(255, 140, 66, 0.15), 0 10px 30px rgba(255, 140, 66, 0.4);
    }
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
  const [searchKeyword, setSearchKeyword] = useState(''); // New state for search keyword
  
  // Header states
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');
  const [activeButton, setActiveButton] = useState(null); // 'category', 'showAll', 'search'
  const [activeCategoryButton, setActiveCategoryButton] = useState(null); // Track which category button is active
  
  const videoContainerRef = useRef(null);
  const initialLoadCount = 5;
  const hasInitiallyLoaded = useRef(false);
  const productRefs = useRef({}); // Refs for IntersectionObserver
  const [productsInView, setProductsInView] = useState(new Set()); // Track which products are in view
  
  // Global loading counter for all products
  useEffect(() => {
    const logInterval = setInterval(() => {
      // Count all img and video elements that are currently loading
      const allImages = document.querySelectorAll('img[src]');
      const allVideos = document.querySelectorAll('video[src]');
      let loadingImages = 0;
      let loadingVideos = 0;
      
      allImages.forEach(img => {
        if (!img.complete) loadingImages++;
      });
      
      allVideos.forEach(video => {
        if (video.readyState < 3) loadingVideos++; // 3 = HAVE_FUTURE_DATA
      });
      
      if (loadingImages > 0 || loadingVideos > 0) {
        console.log(`[App] Global Status - Loading: ${loadingImages} images, ${loadingVideos} videos | Total products: ${displayedProducts.length}, In view: ${productsInView.size}`);
      }
    }, 3000); // Log every 3 seconds
    
    return () => clearInterval(logInterval);
  }, [displayedProducts.length, productsInView.size]);

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
        limit: 150,
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
          // Next product preloading is handled by useEffect that watches currentProductIndex
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentProductIndex, displayedProducts.length]);

  // IntersectionObserver to detect products in viewport
  useEffect(() => {
    if (displayedProducts.length === 0) return;

    const observerOptions = {
      root: videoContainerRef.current,
      rootMargin: '0px',
      threshold: [0.5] // Product must be at least 50% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const productIndex = parseInt(entry.target.dataset.productIndex);
        if (isNaN(productIndex)) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Only the product that is currently in view (IntersectionObserver) should load all images
          setProductsInView(prev => {
            const newSet = new Set();
            newSet.add(productIndex); // Only add current product
            return newSet;
          });
        } else {
          // Remove product from in-view set when it goes out of view
          setProductsInView(prev => {
            const newSet = new Set(prev);
            newSet.delete(productIndex);
            return newSet;
          });
        }
      });
    }, observerOptions);

    // Observe all product containers
    Object.values(productRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [displayedProducts.length]);

  // Preload first media (video or image) of next product only
  // Store in a ref to prevent re-creating on every render
  const nextProductPreloadRef = useRef(new Map()); // Track which products have been preloaded (Map<index, imageUrl>)
  
  useEffect(() => {
    // Always preload next product's first image immediately
    const nextIndex = currentProductIndex + 1;
    
    if (nextIndex < displayedProducts.length) {
      const nextProduct = displayedProducts[nextIndex];
      const preloadKey = `${nextIndex}_${nextProduct?.product_id || nextIndex}`;
      
      // Skip if already preloaded
      if (nextProductPreloadRef.current.has(preloadKey)) {
        return;
      }
      
      // If next product has video, preload video (video is the first media)
      if (nextProduct && nextProduct.product_video_url) {
        console.log(`[App] Preloading video for next product (index ${nextIndex}): ${nextProduct.product_video_url.substring(0, 50)}...`);
        const video = document.createElement('video');
        video.src = nextProduct.product_video_url;
        video.preload = 'metadata'; // Only load metadata, not full video
        video.load();
        nextProductPreloadRef.current.set(preloadKey, nextProduct.product_video_url);
        return; // Don't load first image if video exists
      }
      
      // If no video, preload first image
      if (nextProduct && nextProduct.product_small_image_urls) {
        const images = Array.isArray(nextProduct.product_small_image_urls) 
          ? nextProduct.product_small_image_urls 
          : (nextProduct.product_small_image_urls?.string || []);
        
        // Preload only first image of next product (not all images)
        if (images.length > 0 && images[0]) {
          const firstImageUrl = images[0];
          
          // Check if already cached
          if (imageCache.isCached(firstImageUrl)) {
            console.log(`[App] ✓ Next product first image already cached (index ${nextIndex}): ${firstImageUrl.substring(0, 50)}...`);
            nextProductPreloadRef.current.set(preloadKey, firstImageUrl);
            return;
          }
          
          console.log(`[App] Preloading first image for next product (index ${nextIndex}): ${firstImageUrl.substring(0, 50)}...`);
          
          // Use imageCache to preload and cache the image
          imageCache.preloadImage(firstImageUrl).then((cachedImg) => {
            if (cachedImg) {
              console.log(`[App] ✓ Preloaded and cached first image for next product (index ${nextIndex}): ${firstImageUrl.substring(0, 50)}...`);
            } else {
              console.warn(`[App] ✗ Failed to preload first image for next product (index ${nextIndex}): ${firstImageUrl.substring(0, 50)}...`);
            }
            nextProductPreloadRef.current.set(preloadKey, firstImageUrl);
          });
        }
      }
    }
  }, [currentProductIndex, displayedProducts]);
  
  // Clear preload tracking when products change significantly
  useEffect(() => {
    // Only clear if products array length changes significantly (new search, etc.)
    nextProductPreloadRef.current.clear();
  }, [displayedProducts.length]);

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

  const handleSearch = async () => {
    // Validate search keyword
    if (!searchKeyword || !searchKeyword.trim()) {
      setToastMessage(selectedLanguage === 'en' ? 'Please enter a search keyword' : selectedLanguage === 'ar' ? 'يرجى إدخال كلمة البحث' : 'אנא הזן מילת חיפוש');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    
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
    
    // Search products using the new search endpoint
    try {
      const response = await productService.searchProducts(searchKeyword.trim(), {
        sort_order: sortOrder,
        currency: selectedCurrency,
        limit: 100,
        min_price: minPrice > 0 ? minPrice : undefined,
        max_price: maxPrice < 100000 ? maxPrice : undefined
      });
      
      // Transform products to match the expected format
      const transformedProducts = (response.products || []).map(product => {
        // Parse discount percentage
        let discountPercentage = 0;
        if (product.discount) {
          const discountStr = String(product.discount).replace('%', '').trim();
          discountPercentage = parseFloat(discountStr) || 0;
        }
        
        // Parse rating
        let rating = 0;
        if (product.evaluate_rate) {
          rating = parseFloat(product.evaluate_rate) || 0;
        } else if (product.rating_weighted) {
          rating = parseFloat(product.rating_weighted) || 0;
        } else if (product.rating) {
          rating = parseFloat(product.rating) || 0;
        }
        
        return {
          product_id: product.product_id,
          product_title: product.custom_title || product.product_title || '',
          product_main_image_url: product.product_main_image_url || '',
          target_sale_price: product.target_sale_price || product.sale_price || '0',
          target_original_price: product.target_original_price || product.original_price || '0',
          discount: product.discount || '0%',
          evaluate_rate: rating,
          shop_name: product.shop_name || '',
          promotion_link: product.promotion_link || product.product_detail_url || '',
          product_video_url: product.product_video_url || '',
          product_small_image_urls: product.product_small_image_urls || {},
          first_level_category_name: product.first_level_category_name || '',
          lastest_volume: product.lastest_volume || 0
        };
      });

      setProducts(transformedProducts);
      setDisplayedProducts(transformedProducts.slice(0, initialLoadCount));
      setCurrentProductIndex(0);
      setHasMore(transformedProducts.length > initialLoadCount);
      setShowSearchModal(false);
      setActiveButton('search');
    } catch (err) {
      console.error('Error searching products:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        baseURL: err.config?.baseURL
      });
      
      // Only set error if we have no products to show
      // If we have some products, just show toast
      if (displayedProducts.length === 0) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to search products';
        setError(errorMessage);
        setToastMessage(errorMessage);
        setTimeout(() => setToastMessage(''), 5000);
      } else {
        // We have some products, just show toast
        const errorMessage = err.response?.data?.message || err.message || 'Some products may not have loaded';
        setToastMessage(errorMessage);
        setTimeout(() => setToastMessage(''), 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowAllProducts = useCallback(async () => {
    console.log('Show all products clicked');
    setActiveButton('showAll');
    setActiveCategoryButton(null); // Clear category button selection
    setLoading(true);
    setError(null);
    setSelectedCategory('');
    setCurrentProductIndex(0);
    setMinPrice(0);
    setMaxPrice(100000);
    setJustVideo(false);
    setSortOrder('asc');

    // Scroll to top
    if (videoContainerRef.current) {
      videoContainerRef.current.scrollTop = 0;
    }

    try {
      const response = await productService.getAllProducts(selectedCurrency);
      console.log('All products response:', response);

      // Transform products to match the expected format
      const transformedProducts = (response.products || []).map(product => {
        // Parse discount percentage
        let discountPercentage = 0;
        if (product.discount) {
          const discountStr = String(product.discount).replace('%', '').trim();
          discountPercentage = parseFloat(discountStr) || 0;
        }
        
        // Parse rating
        let rating = 0;
        if (product.evaluate_rate) {
          rating = parseFloat(product.evaluate_rate) || 0;
        } else if (product.rating_weighted) {
          rating = parseFloat(product.rating_weighted) || 0;
        } else if (product.rating) {
          rating = parseFloat(product.rating) || 0;
        }
        
        return {
          product_id: product.product_id,
          product_title: product.custom_title || product.product_title || '',
          product_main_image_url: product.product_main_image_url || '',
          target_sale_price: product.target_sale_price || product.sale_price || '0',
          target_original_price: product.target_original_price || product.original_price || '0',
          discount: product.discount || '0%',
          evaluate_rate: rating,
          shop_name: product.shop_name || '',
          promotion_link: product.promotion_link || product.product_detail_url || '',
          product_video_url: product.product_video_url || '',
          product_small_image_urls: product.product_small_image_urls || {},
          first_level_category_name: product.first_level_category_name || '',
          lastest_volume: product.lastest_volume || 0
        };
      });

      setProducts(transformedProducts);
      setDisplayedProducts(transformedProducts.slice(0, initialLoadCount));
      setCurrentProductIndex(0);
      setHasMore(transformedProducts.length > initialLoadCount);
    } catch (err) {
      setError(err.message || 'Failed to load all products');
      console.error('Error loading all products:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCurrency]);

  const handleCategoryClick = useCallback(async (category) => {
    console.log('Category clicked:', category);
    setActiveButton('category');
    setActiveCategoryButton(category); // Track which category button is clicked
    // Map category labels to API category names
    const categoryMap = {
      'car': 'Automobiles, Parts & Accessories'
    };
    
    // Use mapped category if available, otherwise use the label directly
    const apiCategory = categoryMap[category] || category;
    
    // Set the selected category
    setSelectedCategory(apiCategory);
    
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
    
    // Load products directly with the new category
    try {
      const apiParams = {
        category: apiCategory,
        sort_order: sortOrder,
        currency: selectedCurrency,
        limit: 100,
        min_price: minPrice,
        max_price: maxPrice,
        JustVideo: justVideo ? 1 : 0
      };
      
      console.log('Category click API Parameters:', JSON.stringify(apiParams, null, 2));
      const response = await productService.getProducts(apiParams);
      console.log('Category click API Response:', response);

      // Handle the response from productService
      let allProducts = [];
      if (response && response.products && Array.isArray(response.products)) {
        allProducts = response.products;
        console.log('Category click found products:', allProducts.length);
      } else {
        console.log('Category click no products found in response:', response);
        allProducts = [];
      }

      setProducts(allProducts);
      setDisplayedProducts(allProducts.slice(0, initialLoadCount));
      setCurrentProductIndex(0);
      setHasMore(allProducts.length > initialLoadCount);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      console.error('Error in category click:', err);
    } finally {
      setLoading(false);
    }
  }, [sortOrder, minPrice, maxPrice, justVideo, selectedCurrency, initialLoadCount]);

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

  if (error && displayedProducts.length === 0 && !loading) {
    return (
      <AppContainer>
        <ErrorContainer>
          <h2>Error Loading Products</h2>
          <p>{error}</p>
          <RetryButton onClick={() => {
            setError(null);
            loadProducts(true);
          }}>
            Retry
          </RetryButton>
        </ErrorContainer>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
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
          displayedProducts.map((product, index) => {
            // Create ref for IntersectionObserver
            const productRef = (el) => {
              if (el) {
                el.dataset.productIndex = index;
                productRefs.current[index] = el;
              } else {
                delete productRefs.current[index];
              }
            };

            // اولویت‌بندی لود تصاویر:
            // 1. اولویت اول: تصویر اصلی یا ویدیو کارت فعلی
            // 2. اولویت دوم: تصویر اصلی یا ویدیو کارت بعدی
            // 3. اولویت سوم: سایر تصاویر کارت فعلی
            // 4. اولویت چهارم: سایر تصاویر کارت بعدی
            
            const isCurrentlyInView = productsInView.has(index);
            const nextIndex = currentProductIndex + 1;
            
            // تعیین اولویت برای هر کارت
            let loadPriority = 0; // 0 = no priority, 1 = highest, 4 = lowest
            let shouldLoadFirstImage = false;
            let shouldLoadAllImages = false;
            
            if (index === currentProductIndex) {
              // کارت فعلی: اولویت 1 برای تصویر اصلی، اولویت 3 برای سایر تصاویر
              shouldLoadFirstImage = true; // Priority 1
              shouldLoadAllImages = isCurrentlyInView; // Priority 3 - سایر تصاویر کارت فعلی
              loadPriority = 1;
            } else if (index === nextIndex) {
              // کارت بعدی: اولویت 2 برای تصویر اصلی، اولویت 4 برای سایر تصاویر
              shouldLoadFirstImage = true; // Priority 2
              shouldLoadAllImages = true; // Priority 4 - سایر تصاویر کارت بعدی
              loadPriority = 2;
            }
            
            // Debug logging
            if (index === currentProductIndex) {
              console.log(`[App] Product ${index} is CURRENT - Priority 1: Main image/video, Priority 3: Other images (${shouldLoadAllImages ? 'YES' : 'NO'})`);
            } else if (index === nextIndex) {
              console.log(`[App] Product ${index} is NEXT - Priority 2: Main image/video, Priority 4: Other images (YES)`);
            }
            
            return (
            <VideoItem 
              key={product.product_id || index} 
              $bgGradient={getGradientBackground(index)}
              ref={productRef}
            >
                    <ProductImageContainer>
                      <ImageFrame>
                        <ProductImageCarouselTikTok
                          images={product.product_small_image_urls?.string || product.product_small_image_urls || []}
                          videoUrl={product.product_video_url}
                          autoPlay={true}
                          autoPlayInterval={3000}
                          isInView={index === currentProductIndex}
                          showActions={false}
                          shouldLoadAllImages={shouldLoadAllImages}
                          shouldLoadFirstImage={shouldLoadFirstImage}
                          loadPriority={loadPriority}
                        />
                      </ImageFrame>
                    </ProductImageContainer>
            {/* Side actions */}
            {(() => { const liked = likedProducts.has(product.product_id); return (
            <SideActions>
              <button 
                onClick={() => handleLike(index)} 
                aria-label="like" 
                aria-pressed={liked}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  padding: 0, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onFocus={(e) => e.target.style.outline = 'none'}
                onMouseDown={(e) => e.target.style.outline = 'none'}
              >
                <img src={liked ? heartOnIcon : heartIcon} alt="like" width="28" height="28" style={{ display: 'block' }} />
              </button>
              {(() => { 
                let r;
                // Handle evaluate_rate which might be a string with % sign (e.g., "100.0%")
                if (product.evaluate_rate !== undefined) {
                  const rateStr = String(product.evaluate_rate).replace('%', '').trim();
                  r = Number(rateStr);
                  // Convert from percentage (0-100) to 0-5 scale
                  if (Number.isFinite(r) && r > 5) {
                    r = r / 20; // 100% = 5 stars, so divide by 20
                  }
                } else if (product.rating !== undefined) {
                  r = Number(product.rating);
                } else {
                  r = NaN;
                }
                const hasR = Number.isFinite(r) && r >= 0;
                return (
                <div aria-label="rating" role="img" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <img src={starIcon} alt="star" width="24" height="24" style={{ display: 'block' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)' }}>{hasR ? r.toFixed(1) : 'no rate'}</span>
                </div>
              ); 
              })()}
              {(() => {
                const salesCount = Number(product.lastest_volume) || 0;
                const hasSales = salesCount > 0;
                return (
                  <div aria-label="bag" role="img" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {hasSales ? (
                      <>
                        <img src={soldIcon} alt="sold" width="28" height="28" style={{ display: 'block' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', textShadow: '0 2px 10px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.6)' }}>{salesCount.toLocaleString('en-US')}</span>
                      </>
                    ) : (
                      <img src={soldIcon} alt="sold" width="28" height="28" style={{ display: 'block' }} />
                    )}
                  </div>
                );
              })()}
            </SideActions>
            ); })()}

            {/* Quick return */}
            <QuickReturn onClick={() => videoContainerRef.current && (videoContainerRef.current.scrollTop = 0)} aria-label="back-to-top">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </QuickReturn>

            {/* Product card */}
            <ProductInfoCard>
              <ProductTitleText>{product.product_title || 'Premium Bluetooth Headphones'}</ProductTitleText>
              <PriceRow>
                <PriceNew>{formatPrice(product.target_sale_price ?? product.current_price ?? 95, product.target_original_price_currency)}</PriceNew>
                {(product.target_original_price || product.original_price) && (Number(product.target_original_price || product.original_price) > Number(product.target_sale_price || product.current_price || 0)) && (
                  <PriceOld>{formatPrice(product.target_original_price || product.original_price, product.target_original_price_currency)}</PriceOld>
                )}
              </PriceRow>
              <BuyBtn onClick={() => handleBuyNow()}>
                <img src={cartIcon} alt="cart" width="18" height="18" style={{ display: 'block' }} />
                Buy Now
              </BuyBtn>
            </ProductInfoCard>
          </VideoItem>
            );
          })
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

      {/* Bottom bar */}
      <BottomBar>
        <BottomCats>
          {[
            { icon: fashionIcon, label: 'fashion' },
            { icon: shoeIcon, label: 'shoe' },
            { icon: jewelryIcon, label: 'jewelry' },
            { icon: carIcon, label: 'car' },
            { icon: mobileIcon, label: 'mobile' }
          ].map((cat, i) => (
            <CatBtn 
              key={i} 
              aria-label={cat.label} 
              onClick={() => handleCategoryClick(cat.label)}
              className={activeCategoryButton === cat.label ? 'active' : ''}
            >
              <img src={cat.icon} alt={cat.label} width="20" height="20" style={{ display: 'block' }} />
            </CatBtn>
          ))}
          <BottomShowAll 
            onClick={handleShowAllProducts} 
            aria-label="show-all-products" 
            title="Show All Products"
            className={activeButton === 'showAll' ? 'active' : ''}
          >
            <img src={miniLogoIcon} alt="Show All Products" />
          </BottomShowAll>
          <BottomSearch 
            onClick={() => {
              setActiveButton('search');
              setActiveCategoryButton(null);
              setShowSearchModal(true);
            }} 
            aria-label="open-search"
            className={activeButton === 'search' ? 'active' : ''}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" /><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" /></svg>
          </BottomSearch>
        </BottomCats>
      </BottomBar>

      {/* Search Modal */}
      <SearchModal $show={showSearchModal}>
        <SearchModalContent>
          <CloseButton onClick={() => {
            setShowSearchModal(false);
            // Don't reset activeButton here - keep it active if search was applied
          }}>
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
          
          {/* Search Keyword Input */}
          <SearchInput
            type="text"
            placeholder={selectedLanguage === 'en' ? 'Search products...' : selectedLanguage === 'ar' ? 'ابحث عن المنتجات...' : 'חפש מוצרים...'}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            style={{
              direction: selectedLanguage === 'en' ? 'ltr' : 'rtl',
              textAlign: selectedLanguage === 'en' ? 'left' : 'right'
            }}
          />
          
          {/* Category Select - Hidden */}
          <CategorySelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              display: 'none' // Hide category select
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
