import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaTimes, FaUserPlus, FaUser, FaPlane, FaClock, FaCalendarAlt } from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(-50px) scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
`;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: ${slideIn} 0.3s ease-out;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
    color: #333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &::placeholder {
    color: #6c757d;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CancelButton = styled(Button)`
  background-color: #6c757d;
  color: white;
  
  &:hover {
    background-color: #5a6268;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #007bff;
  color: white;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const RequiredMark = styled.span`
  color: #dc3545;
  margin-left: 0.25rem;
`;

const AddPassengerModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    flightNumber: '',
    departureDate: '',
    departureTime: '',
    status: 'WCHR'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Supprimer l'erreur si le champ est rempli
    if (errors[name] && value.trim()) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est obligatoire';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est obligatoire';
    }
    
    if (!formData.flightNumber.trim()) {
      newErrors.flightNumber = 'Le numéro de vol est obligatoire';
    }
    
    if (!formData.departureDate) {
      newErrors.departureDate = 'La date de départ est obligatoire';
    }
    
    if (!formData.departureTime) {
      newErrors.departureTime = 'L\'heure de départ est obligatoire';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Créer l'objet passager selon le format attendu
      const newPassenger = {
        idPax: `MANUAL-${Date.now()}`,
        lastName: formData.lastName.trim().toUpperCase(),
        firstName: formData.firstName.trim(),
        flightNumber: formData.flightNumber.trim().toUpperCase(),
        departureTime: `${formData.departureDate.split('-').reverse().join('/')} ${formData.departureTime}`, // Convertir YYYY-MM-DD en DD/MM/YYYY
        status: formData.status,
        ssr1: formData.status,
        goAcc: '', // Pas d'agent au début
        isSkyPriority: false,
        isAssisted: false,
        assistedAt: null
      };
      
      await onSubmit(newPassenger);
      
      // Reset form
      setFormData({
        lastName: '',
        firstName: '',
        flightNumber: '',
        departureDate: '',
        departureTime: '',
        status: 'WCHR'
      });
      setErrors({});
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du passager:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        lastName: '',
        firstName: '',
        flightNumber: '',
        departureDate: '',
        departureTime: '',
        status: 'WCHR'
      });
      setErrors({});
      onClose();
    }
  };

  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaUserPlus />
            Ajouter un passager PMR
          </ModalTitle>
          <CloseButton onClick={handleClose} disabled={isSubmitting}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <FaUser />
              Nom <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="DUPONT"
              maxLength={50}
              required
            />
            {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <FaUser />
              Prénom <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Jean"
              maxLength={50}
              required
            />
            {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <FaPlane />
              Numéro de vol <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="text"
              name="flightNumber"
              value={formData.flightNumber}
              onChange={handleInputChange}
              placeholder="AF1234"
              maxLength={10}
              required
            />
            {errors.flightNumber && <ErrorMessage>{errors.flightNumber}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <FaCalendarAlt />
              Date de départ <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleInputChange}
              min={today}
              required
            />
            {errors.departureDate && <ErrorMessage>{errors.departureDate}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <FaClock />
              Heure de départ <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="time"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleInputChange}
              required
            />
            {errors.departureTime && <ErrorMessage>{errors.departureTime}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              Type d'assistance PMR
            </Label>
            <Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="WCHR">WCHR</option>
              <option value="WCHS">WCHS</option>
              <option value="WCHC">WCHC</option>
              <option value="BLIND">BLIND</option>
              <option value="DEAF">DEAF</option>
              <option value="DPNA">DPNA</option>
            </Select>
          </FormGroup>

          <ButtonGroup>
            <CancelButton 
              type="button" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </CancelButton>
            
            <SubmitButton 
              type="submit"
              disabled={isSubmitting}
            >
              <FaUserPlus />
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter le passager'}
            </SubmitButton>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddPassengerModal;