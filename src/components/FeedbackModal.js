import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaTimes, FaPaperPlane, FaExclamationTriangle, FaBug, FaLightbulb, FaCommentDots } from 'react-icons/fa';

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
  max-width: 600px;
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
  margin-bottom: 1.5rem;
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
`;

const TypeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const TypeOption = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#007bff' : '#e9ecef'};
  background-color: ${props => props.selected ? '#f0f8ff' : 'white'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    border-color: ${props => props.selected ? '#007bff' : '#007bff'};
    background-color: ${props => props.selected ? '#f0f8ff' : '#f8f9fa'};
  }
`;

const TypeIcon = styled.div`
  font-size: 1.5rem;
  color: ${props => props.selected ? '#007bff' : '#6c757d'};
`;

const TypeLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${props => props.selected ? '#007bff' : '#333'};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
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
  background-color: #28a745;
  color: white;
  
  &:hover {
    background-color: #218838;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const CharCount = styled.span`
  font-size: 0.8rem;
  color: ${props => props.warning ? '#dc3545' : '#6c757d'};
  text-align: right;
  display: block;
  margin-top: 0.25rem;
`;

const FEEDBACK_TYPES = [
  {
    id: 'bug',
    label: 'Bug / Erreur',
    icon: FaBug,
    placeholder: 'Décrivez le problème technique rencontré (erreur d\'affichage, fonctionnalité qui ne marche pas, etc.)'
  },
  {
    id: 'improvement',
    label: 'Amélioration',
    icon: FaLightbulb,
    placeholder: 'Proposez une amélioration ou une nouvelle fonctionnalité qui faciliterait votre travail'
  },
  {
    id: 'issue',
    label: 'Dysfonctionnement',
    icon: FaExclamationTriangle,
    placeholder: 'Signalez un dysfonctionnement dans le processus ou l\'organisation'
  },
  {
    id: 'other',
    label: 'Autre',
    icon: FaCommentDots,
    placeholder: 'Autres remarques, questions ou commentaires'
  }
];

const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
  const [feedbackType, setFeedbackType] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 500;
  const currentLength = description.length;
  const isOverLimit = currentLength > maxLength;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackType || !description.trim() || isOverLimit) {
      return;
    }
    
    setIsSubmitting(true);
    
    const feedbackData = {
      type: feedbackType,
      description: description.trim(),
      userEmail: userEmail.trim(),
      timestamp: new Date().toISOString(),
      destinataire: 'g3s.data1@gmail.com'
    };
    
    try {
      // Appel simple vers le parent
      await onSubmit(feedbackData);
      
      // Reset form
      setFeedbackType('');
      setDescription('');
      setUserEmail('');
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      alert('❌ Erreur lors de l\'envoi. Contactez support-pmr@votre-compagnie.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFeedbackType('');
      setDescription('');
      setUserEmail('');
      onClose();
    }
  };

  const selectedType = FEEDBACK_TYPES.find(type => type.id === feedbackType);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaCommentDots />
            Signaler un problème ou une amélioration
          </ModalTitle>
          <CloseButton onClick={handleClose} disabled={isSubmitting}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Type de signalement *</Label>
            <TypeSelector>
              {FEEDBACK_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isSelected = feedbackType === type.id;
                
                return (
                  <TypeOption
                    key={type.id}
                    type="button"
                    selected={isSelected}
                    onClick={() => setFeedbackType(type.id)}
                  >
                    <TypeIcon selected={isSelected}>
                      <IconComponent />
                    </TypeIcon>
                    <TypeLabel selected={isSelected}>
                      {type.label}
                    </TypeLabel>
                  </TypeOption>
                );
              })}
            </TypeSelector>
          </FormGroup>

          <FormGroup>
            <Label>Description détaillée *</Label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={selectedType?.placeholder || 'Décrivez votre signalement en détail...'}
              maxLength={maxLength + 50} // Permet de dépasser pour afficher l'avertissement
              required
            />
            <CharCount warning={isOverLimit}>
              {currentLength}/{maxLength} caractères
              {isOverLimit && ' - Limite dépassée'}
            </CharCount>
          </FormGroup>

          <FormGroup>
            <Label>Votre email (optionnel)</Label>
            <Input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="votre.email@exemple.com"
            />
            <small style={{ color: '#6c757d', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
              📧 Votre signalement sera envoyé à : <strong>support-pmr@votre-compagnie.com</strong><br/>
              💡 Votre email nous permettra de vous recontacter si nécessaire
            </small>
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
              disabled={!feedbackType || !description.trim() || isOverLimit || isSubmitting}
            >
              <FaPaperPlane />
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
            </SubmitButton>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FeedbackModal;