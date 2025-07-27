import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import PropTypes from 'prop-types';
import { 
  FaPlane, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser,
  FaCalendarPlus,
  FaCrown,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaWalking
} from 'react-icons/fa';

// Importation de l'image SkyPriority (ajustez le chemin selon votre structure)
import SkyLogo from '../assets/images/skyprio.png'; // adapte le chemin si besoin

// Animations optimisées
const blinkSlow = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const blinkFast = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const alertFadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

// Animation pour le bonhomme qui marche
const walkingAnimation = keyframes`
  0% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  100% { transform: translateX(-5px); }
`;

// Constantes pour les couleurs
const COLORS = {
  green: '#198754',
  orange: '#ffc107',
  red: '#dc3545',
  gray: '#6c757d',
  lightRed: 'rgba(220, 53, 69, 0.1)',
  white: 'white',
  blue: '#0056b3'
};

// Fonction pour extraire l'heure au format HH:MM à partir de différents formats
const extractTimeHHMM = (timeString) => {
  if (!timeString) return null;
  
  // Cas 1: Format déjà HH:MM
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Cas 2: Format avec date complète (comme "jj/mm/aaaa hh:mm")
  const dateTimeMatch = timeString.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\s+(\d{1,2}):(\d{2})/);
  if (dateTimeMatch) {
    return `${dateTimeMatch[4]}:${dateTimeMatch[5]}`;
  }
  
  // Cas 3: Format ISO ou similaire contenant T et heure
  const isoMatch = timeString.match(/T(\d{2}):(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}:${isoMatch[2]}`;
  }
  
  // Aucun format reconnu
  console.error("Format d'heure non reconnu:", timeString);
  return null;
};

// Utilitaires pour calculer les différences de temps - optimisé pour format HH:MM
const calculateTimeDifference = (departureTime, currentTime) => {
  // Extraire l'heure au format HH:MM
  const timeHHMM = extractTimeHHMM(departureTime);
  if (!timeHHMM) return 120; // Valeur par défaut: 2h
  
  try {
    // Diviser en heures et minutes
    const [hours, minutes] = timeHHMM.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.error("Heures ou minutes invalides:", hours, minutes);
      return 120; // Valeur par défaut en cas d'erreur: 2h
    }
    
    // Créer des dates pour comparaison
    const now = currentTime;
    const departureDate = new Date();
    departureDate.setHours(hours, minutes, 0, 0);
    
    // Si l'heure de départ est déjà passée aujourd'hui, considérer qu'elle est pour demain
    if (departureDate < now) {
      departureDate.setDate(departureDate.getDate() + 1);
    }
    
    // Calculer la différence en minutes
    const diffMs = departureDate - now;
    const diffMinutes = diffMs / (1000 * 60);
    
    return diffMinutes;
  } catch (e) {
    console.error("Erreur de calcul de différence de temps:", e);
    return 120; // Valeur par défaut en cas d'erreur: 2h
  }
};

// Vérifier si un vol est déjà passé
const isFlightPassed = (departureTime, currentTime) => {
  // Extraire l'heure au format HH:MM
  const timeHHMM = extractTimeHHMM(departureTime);
  if (!timeHHMM) return false; // Par défaut, considérer comme non passé
  
  try {
    // Diviser en heures et minutes
    const [hours, minutes] = timeHHMM.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return false;
    }
    
    // Créer des dates pour comparaison
    const now = currentTime;
    const departureDate = new Date();
    departureDate.setHours(hours, minutes, 0, 0);
    
    // Vérifier si l'heure de départ est passée, en tenant compte uniquement d'aujourd'hui
    // Un vol est considéré comme passé si l'heure actuelle dépasse l'heure de départ
    return departureDate < now;
  } catch (e) {
    console.error("Erreur de vérification si le vol est passé:", e);
    return false;
  }
};

// COMPOSANTS STYLED

// Card Container compact pour TV
const PassengerCardContainer = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
  margin-bottom: 0.75rem;
  transition: transform 0.2s ease;
  display: ${props => props.$isPassed ? 'none' : 'block'}; /* Masquer les vols passés */
  position: relative;
`;

// Styled components avec $ pour les props transientes
const PassengerCardContent = styled.div`
  background-color: ${props => {
  if (props.$isSkyPriority) return '#e0f0ff'; // azur
  const { $timeDiffData } = props;
  return $timeDiffData.minutes < 60 ? COLORS.lightRed : COLORS.white;
}};
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1rem;
  position: relative;
  overflow: hidden;
  display: block; /* Afficher toutes les cartes */
  
  /* Animation de clignotement selon le délai */
  animation: ${props => {
    const { $timeDiffData } = props;
    if ($timeDiffData.minutes < 60) {
      return css`${blinkFast} 1.3s ease-in-out infinite`;
    } else if ($timeDiffData.minutes < 90) {
      return css`${blinkSlow} 1.7s ease-in-out infinite`;
    }
    return 'none';
  }};
  
  /* Mise à jour des couleurs et des liserets selon les délais */
  border-left: 6px solid ${props => {
    const { $timeDiffData } = props;
    if ($timeDiffData.minutes >= 90) return COLORS.green;
    if ($timeDiffData.minutes >= 60) return COLORS.orange;
    return COLORS.red;
  }};
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  cursor: pointer; /* Indique que c'est cliquable */
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const MainInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 300px;
`;

const FlightInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 140px;
`;

const FlightDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Airline = styled.span`
  font-weight: 700;
  font-size: 1.2rem;
  color: #0056b3;
`;

const FlightNumber = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
  color: #495057;
`;

const DestinationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 120px;
`;

const DestinationValue = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: #0056b3;
`;

const PassengerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 220px;
`;

const PassengerName = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #212529;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  background-color: ${props => {
    switch (String(props.$status || '').toLowerCase()) {
      case 'wchr': return 'rgba(25, 135, 84, 0.2)';
      case 'wchs': return 'rgba(255, 193, 7, 0.2)';
      case 'wchc': return 'rgba(220, 53, 69, 0.2)';
      default: return 'rgba(108, 117, 125, 0.2)';
    }
  }};
  color: ${props => {
    switch (String(props.$status || '').toLowerCase()) {
      case 'wchr': return '#198754';
      case 'wchs': return '#856404';
      case 'wchc': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  width: 70px;
`;

// Nouveau composant pour l'indicateur d'agent en route, positionné à côté du statut
const AgentEnRouteIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(25, 135, 84, 0.1);
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  margin-left: 0.75rem;
  border: 1px solid ${COLORS.green};
`;

const AgentEnRouteText = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${COLORS.green};
`;

// Icône animée du bonhomme qui marche
const WalkingIcon = styled(FaWalking)`
  color: ${COLORS.green};
  animation: ${walkingAnimation} 1.5s infinite ease-in-out;
  font-size: 1.25rem;
`;

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DepartureTimeDisplay = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  
  /* Mise à jour des couleurs de l'horaire selon les délais */
  color: ${props => {
    const { $timeDiffData } = props;
    if ($timeDiffData.minutes >= 90) return COLORS.green;
    if ($timeDiffData.minutes >= 60) return COLORS.orange;
    return COLORS.red;
  }};
  
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateDisplay = styled.div`
  font-size: 1.3rem;
  color: #6c757d;
  font-weight: 500;
`;

// Nouveau composant pour l'heure d'ajout
const AddedTimeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  margin-left: 1rem;
`;

// Composants pour l'alerte de confirmation
const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${css`${fadeIn} 0.3s ease-out`};
`;

const ConfirmationDialog = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: ${alertFadeIn} 0.3s ease-out;
`;

const ConfirmationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const WarningIcon = styled.div`
  color: #ffc107;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const ConfirmationTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #212529;
`;

const ConfirmationMessage = styled.p`
  font-size: 1rem;
  color: #495057;
  margin-bottom: 1.5rem;
`;

const PassengerDetails = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #0056b3;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  width: 120px;
  color: #495057;
`;

const DetailValue = styled.span`
  color: #212529;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const SkyPriorityStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.$isSkyPriority ? 'rgba(0, 86, 179, 0.1)' : 'rgba(108, 117, 125, 0.1)'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const SkyPriorityIcon = styled.div`
  color: ${props => props.$isSkyPriority ? '#FFD700' : '#adb5bd'};
  display: flex;
  align-items: center;
`;

const SkyPriorityText = styled.span`
  font-weight: 600;
  color: ${props => props.$isSkyPriority ? '#0056b3' : '#6c757d'};
`;

const ConfirmButton = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  background-color: ${props => props.$primary ? '#0056b3' : '#6c757d'};
  color: white;
  border: none;
  
  &:hover {
    background-color: ${props => props.$primary ? '#004494' : '#5a6268'};
    transform: translateY(-2px);
  }
`;

// COMPOSANT PRINCIPAL
const PassengerItem = ({ passenger, onToggleSkyPriority }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Référence pour suivre l'état précédent de goAcc - SUPPRIMÉ, CAR GÉRÉ DANS PASSENGERLIST
  // const prevAgentEnRouteRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Créer une version "safe" du passager avec valeurs par défaut
  const safePassenger = {
    id: passenger.id,
    lastName: passenger.lastName || 'Sans nom',
    firstName: passenger.firstName || '',
    airline: passenger.airline || 'N/A',
    flightNumber: passenger.flightNumber || 'N/A',
    status: passenger.status || 'WCHR',
    destination: passenger.destination || 'N/A',
    departureTime: passenger.departureTime || '',
    date: passenger.date || new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    }),
    addedAt: passenger.addedAt || new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }),
    isSkyPriority: passenger.isSkyPriority || false,
    goAcc: passenger.goAcc || '' // Champ pour l'agent en route
  };
  
  // Vérifier si un agent est en route (GO-ACC n'est pas vide)
  const isAgentEnRoute = safePassenger.goAcc && safePassenger.goAcc.trim() !== '';
  
  // SUPPRESSION DU USEEFFECT QUI SURVEILLAIT GOAAC ET DÉCLENCHAIT L'ALERTE VOCALE
  // Cette fonctionnalité est maintenant gérée uniquement dans PassengerList.js
  
  // Vérifier si le vol est déjà passé
  const isPassed = useMemo(() => {
    return isFlightPassed(safePassenger.departureTime, currentTime);
  }, [safePassenger.departureTime, currentTime]);
  
  // Récupérer l'heure au format HH:MM pour l'affichage
  const displayTime = useMemo(() => {
    const extractedTime = extractTimeHHMM(safePassenger.departureTime);
    return extractedTime || safePassenger.departureTime || "??:??";
  }, [safePassenger.departureTime]);
  
  // Calcul optimisé des différences de temps (une seule fois par rendu)
  const timeDiffData = useMemo(() => {
    const minutes = calculateTimeDifference(safePassenger.departureTime, currentTime);
    return {
      minutes,
      isUrgent: minutes < 60,
      isWarning: minutes >= 60 && minutes < 90,
      isNormal: minutes >= 90
    };
  }, [safePassenger.departureTime, currentTime]);

  // Gestionnaire de clic sur la carte du passager
  const handleCardClick = () => {
    setShowConfirmation(true);
  };

  // Gestionnaire pour confirmer le changement de statut SkyPriority
  const handleConfirmSkyPriority = () => {
    if (onToggleSkyPriority) {
      onToggleSkyPriority(safePassenger.id);
    }
    setShowConfirmation(false);
  };

  // Gestionnaire pour annuler le changement
  const handleCancelSkyPriority = () => {
    setShowConfirmation(false);
  };

  // Pour l'affichage public sur TV, on n'affiche que les infos essentielles
  return (
    <>
      <PassengerCardContainer $isPassed={isPassed}>
        <PassengerCardContent 
          $timeDiffData={timeDiffData} 
          $isSkyPriority={safePassenger.isSkyPriority}
          onClick={handleCardClick}
        >
          <MainInfo>
            <FlightInfo>
              <FaPlane size={20} color="#0056b3" />
              <FlightDetails>
                <Airline>{safePassenger.airline}</Airline>
                <FlightNumber>{safePassenger.flightNumber}</FlightNumber>
              </FlightDetails>
              
            </FlightInfo>
            
            {/* Destination */}
            <DestinationContainer>
              <FaMapMarkerAlt size={14} color="#0056b3" />
              <DestinationValue>{safePassenger.destination}</DestinationValue>
            </DestinationContainer>
            
            {/* Passager + Statut */}
            <PassengerInfo>
              <FaUser size={14} color="#212529" />
              <PassengerName>
                {safePassenger.lastName} {safePassenger.firstName}
              </PassengerName>
            </PassengerInfo>

            {/* Statut + Indicateur Agent en route */}
            <StatusContainer>
              <StatusBadge $status={safePassenger.status}>
                {safePassenger.status}
              </StatusBadge>
              
              {/* Indicateur d'agent en route intégré à la card */}
              {isAgentEnRoute && (
                <AgentEnRouteIndicator>
                  <WalkingIcon />
                  <AgentEnRouteText>Agent en route</AgentEnRouteText>
                </AgentEnRouteIndicator>
              )}
            </StatusContainer>
          </MainInfo>
          
          {/* Heure et Date */}
          <TimeInfo>
          {safePassenger.isSkyPriority && (
                <img src={SkyLogo} alt="SkyPriority" style={{ height: '40px', borderRadius:'10px' }} />
              )}
            <DepartureTimeDisplay $timeDiffData={timeDiffData}>
              <FaClock size={18} />
              {displayTime}
            </DepartureTimeDisplay>
            
            {/* Ajout de l'heure d'ajout du passager */}
            <AddedTimeContainer>
              <FaCalendarPlus size={14} />
              Ajouté à {safePassenger.addedAt}
            </AddedTimeContainer>
          </TimeInfo>
        </PassengerCardContent>
      </PassengerCardContainer>

      {/* Alerte de confirmation pour SkyPriority */}
      {showConfirmation && (
        <ConfirmationOverlay>
          <ConfirmationDialog>
            <ConfirmationHeader>
              <WarningIcon>
                <FaExclamationTriangle />
              </WarningIcon>
              <ConfirmationTitle>Confirmation de changement de statut</ConfirmationTitle>
            </ConfirmationHeader>
            
            <ConfirmationMessage>
              Souhaitez-vous modifier le statut SkyPriority de ce passager ?
            </ConfirmationMessage>
            
            <PassengerDetails>
              <DetailRow>
                <DetailLabel>Passager:</DetailLabel>
                <DetailValue>{safePassenger.lastName} {safePassenger.firstName}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Vol:</DetailLabel>
                <DetailValue>{safePassenger.airline} {safePassenger.flightNumber}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Destination:</DetailLabel>
                <DetailValue>{safePassenger.destination}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Départ:</DetailLabel>
                <DetailValue>{displayTime}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Agent en route:</DetailLabel>
                <DetailValue>{isAgentEnRoute ? safePassenger.goAcc : 'Non'}</DetailValue>
              </DetailRow>
            </PassengerDetails>
            
            <SkyPriorityStatus $isSkyPriority={safePassenger.isSkyPriority}>
              <SkyPriorityIcon $isSkyPriority={safePassenger.isSkyPriority}>
                <FaCrown size={18} />
              </SkyPriorityIcon>
              <SkyPriorityText $isSkyPriority={safePassenger.isSkyPriority}>
                {safePassenger.isSkyPriority 
                  ? "Ce passager est actuellement SkyPriority" 
                  : "Ce passager n'est pas SkyPriority"}
              </SkyPriorityText>
            </SkyPriorityStatus>
            
            <ButtonGroup>
              <ConfirmButton onClick={handleCancelSkyPriority}>
                <FaTimes size={14} /> Annuler
              </ConfirmButton>
              <ConfirmButton $primary onClick={handleConfirmSkyPriority}>
                <FaCheck size={14} /> 
                {safePassenger.isSkyPriority ? "Retirer SkyPriority" : "Ajouter SkyPriority"}
              </ConfirmButton>
            </ButtonGroup>
          </ConfirmationDialog>
        </ConfirmationOverlay>
      )}
    </>
  );
};

// Mise à jour des PropTypes
PassengerItem.propTypes = {
  passenger: PropTypes.shape({
    id: PropTypes.string,
    lastName: PropTypes.string,
    firstName: PropTypes.string,
    status: PropTypes.string,
    airline: PropTypes.string,
    flightNumber: PropTypes.string,
    destination: PropTypes.string,
    departureTime: PropTypes.string,
    date: PropTypes.string,
    addedAt: PropTypes.string,
    isSkyPriority: PropTypes.bool,
    goAcc: PropTypes.string // Champ pour vérifier si un agent est en route
  }).isRequired,
  onToggleSkyPriority: PropTypes.func
};

export default PassengerItem;