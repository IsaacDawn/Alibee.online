import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiCheck, FiVideo, FiVideoOff, FiList } from 'react-icons/fi';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
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
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: #fff;
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #333;
  border-radius: 12px;
  color: #fff;
  padding: 12px 16px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: #555;
  }

  &:focus {
    outline: none;
    border-color: #4ecdc4;
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #333;
  border-radius: 12px;
  color: #fff;
  padding: 12px 16px;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: #555;
  }

  &:focus {
    outline: none;
    border-color: #4ecdc4;
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
  }

  &::placeholder {
    color: #666;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid #333;
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 16px;
`;

const Toggle = styled.div`
  position: relative;
  width: 60px;
  height: 32px;
  background: ${props => props.active ? '#4ecdc4' : '#333'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: ${props => props.active ? '32px' : '4px'};
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
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

const FilterModal = ({ filters, categories, onClose, onApply, onShowAll }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleChange = (field) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      category: '',
      sort_order: 'asc',
      currency: 'USD',
      limit: 100,
      min_price: 0,
      max_price: 1000000,
      JustVideo: 0
    });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Filter Products</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Category</Label>
            <Select
              value={localFilters.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Sort By</Label>
            <Select
              value={localFilters.sort_order}
              onChange={(e) => handleInputChange('sort_order', e.target.value)}
            >
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Price Range</Label>
            <InputGroup>
              <Input
                type="number"
                placeholder="Minimum Price"
                value={localFilters.min_price}
                onChange={(e) => handleInputChange('min_price', parseInt(e.target.value) || 0)}
                min="0"
              />
              <span style={{ color: '#666' }}>to</span>
              <Input
                type="number"
                placeholder="Maximum Price"
                value={localFilters.max_price}
                onChange={(e) => handleInputChange('max_price', parseInt(e.target.value) || 1000000)}
                min="0"
              />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <Label>Number of Products</Label>
            <Select
              value={localFilters.limit}
              onChange={(e) => handleInputChange('limit', parseInt(e.target.value))}
            >
              <option value={50}>50 products</option>
              <option value={100}>100 products</option>
              <option value={200}>200 products</option>
              <option value={500}>500 products</option>
            </Select>
          </FormGroup>

          <ToggleContainer>
            <ToggleLabel>
              {localFilters.JustVideo ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
              Only products with video
            </ToggleLabel>
            <Toggle
              active={localFilters.JustVideo === 1}
              onClick={() => handleToggleChange('JustVideo')}
            />
          </ToggleContainer>

          <ButtonContainer>
            <Button type="button" className="secondary" onClick={handleReset}>
              Reset
            </Button>
            {onShowAll && (
              <Button 
                type="button" 
                className="secondary" 
                onClick={() => {
                  onShowAll();
                  onClose();
                }}
                style={{ background: 'linear-gradient(45deg, #8b5cf6, #6366f1)' }}
              >
                <FiList size={16} />
                Show All
              </Button>
            )}
            <Button type="submit" className="primary">
              <FiCheck size={16} />
              Apply Filter
            </Button>
          </ButtonContainer>
        </FormContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default FilterModal;
