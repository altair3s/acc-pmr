import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import PropTypes from 'prop-types';
import { 
  FaPlane, 
  FaClock, 
  FaUser,
  FaCalendarPlus,
  FaCrown,
  FaWalking,
  FaTrashAlt
} from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const blinkFast = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const blinkSlow = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const walkingAnimation = keyframes`
  0% { transform: translateX(-3px) scale(1); }
  25% { transform: translateX(0px) scale(1.05); }
  50% { transform: translateX(3px) scale(1); }
  75% { transform: translateX(0px) scale(1.05); }
  100% { transform: translateX(-3px) scale(1); }
`;

const agentEnRouteAppear = keyframes`
  0% { 
    opacity: 0; 
    transform: translateX(-20px) scale(0.8); 
  }
  50% { 
    opacity: 0.8; 
    transform: translateX(5px) scale(1.1); 
  }
  100% { 
    opacity: 1; 
    transform: translateX(0) scale(1); 
  }
`;

// Styled Components
const PassengerCardContainer = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
  margin-bottom: 0.75rem;
  transition: transform 0.2s ease;
  display: ${props => props.$isPassed ? 'none' : 'block'}; /* Masquer les vols passés */
  position: relative;
`;

const PassengerCardContent = styled.div`
  background-color: ${props => {
    if (props.$isSkyPriority) return '#e0f0ff';
    const { $timeDiffData } = props;
    return $timeDiffData.minutes < 60 ? 'rgba(220, 53, 69, 0.1)' : 'white';
  }};
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  cursor: pointer;
  
  /* Couleur du liseré selon le délai */
  border-left: 6px solid ${props => {
    const { $timeDiffData } = props;
    if ($timeDiffData.minutes >= 90) return '#198754'; // Vert
    if ($timeDiffData.minutes >= 60) return '#ffc107'; // Orange
    return '#dc3545'; // Rouge
  }};
  
  /* Animation de clignotement selon le délai */
  ${props => {
    const { $timeDiffData } = props;
    if ($timeDiffData.minutes < 60) {
      return css`animation: ${blinkFast} 1.3s ease-in-out infinite;`;
    } else if ($timeDiffData.minutes < 90) {
      return css`animation: ${blinkSlow} 1.7s ease-in-out infinite;`;
    }
    return '';
  }}
  
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

const FlightNumber = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
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

const AgentEnRouteIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(25, 135, 84, 0.1);
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  margin-left: 0.75rem;
  border: 1px solid #198754;
  
  ${props => props.$isNewlyAdded ? css`
    animation: ${agentEnRouteAppear} 0.8s ease-out, ${blinkSlow} 2s ease-in-out 3;
  ` : css`
    animation: ${fadeIn} 0.5s ease-out;
  `}
`;

const AgentEnRouteText = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #198754;
`;

const WalkingIcon = styled(FaWalking)`
  color: #198754;
  animation: ${walkingAnimation} 1.2s infinite ease-in-out;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  /* Couleur de l'horaire selon les délais */
  color: ${props => {
    const { $timeDiffData } = props;
    if ($timeDiffData.minutes >= 90) return '#198754'; // Vert
    if ($timeDiffData.minutes >= 60) return '#ffc107'; // Orange
    return '#dc3545'; // Rouge
  }};
`;

const AddedTimeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  margin-left: 1rem;
`;

const SkyPriorityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(255, 0, 0, 1);
  border: 1px solid #FFD700;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  margin-right: 0.5rem;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 50%;
  right: -3rem;
  transform: translateY(-50%);
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  
  ${PassengerCardContainer}:hover & {
    opacity: 1;
  }
  
  &:hover {
    background-color: #c82333;
    transform: translateY(-50%) scale(1.1);
  }
`;

// Fonction utilitaire pour extraire l'heure
const extractTimeHHMM = (timeString) => {
  if (!timeString) return "??:??";
  
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  const dateTimeMatch = timeString.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\s+(\d{1,2}):(\d{2})/);
  if (dateTimeMatch) {
    return `${dateTimeMatch[4]}:${dateTimeMatch[5]}`;
  }
  
  const isoMatch = timeString.match(/T(\d{2}):(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}:${isoMatch[2]}`;
  }
  
  return timeString;
};

// Fonction pour calculer la différence de temps en minutes
const calculateTimeDifference = (departureTime, currentTime) => {
  const timeHHMM = extractTimeHHMM(departureTime);
  if (!timeHHMM || timeHHMM === "??:??") return 120; // Valeur par défaut: 2h
  
  try {
    const [hours, minutes] = timeHHMM.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return 120;
    }
    
    const now = currentTime;
    const departureDate = new Date();
    departureDate.setHours(hours, minutes, 0, 0);
    
    // Si l'heure de départ est déjà passée aujourd'hui, considérer qu'elle est pour demain
    if (departureDate < now) {
      departureDate.setDate(departureDate.getDate() + 1);
    }
    
    const diffMs = departureDate - now;
    const diffMinutes = diffMs / (1000 * 60);
    
    return diffMinutes;
  } catch (e) {
    return 120;
  }
};

// Fonction pour vérifier si un vol est déjà passé
const isFlightPassed = (departureTime, currentTime) => {
  const timeHHMM = extractTimeHHMM(departureTime);
  if (!timeHHMM || timeHHMM === "??:??") return false;
  
  try {
    const [hours, minutes] = timeHHMM.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return false;
    }
    
    const now = currentTime;
    const departureDate = new Date();
    departureDate.setHours(hours, minutes, 0, 0);
    
    return departureDate < now;
  } catch (e) {
    return false;
  }
};

const PassengerItem = ({ passenger, onToggleSkyPriority, onRemove }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isNewlyAddedAgent, setIsNewlyAddedAgent] = useState(false);
  const [agentEnRouteKey, setAgentEnRouteKey] = useState(0);
  const newlyAddedTimerRef = useRef(null);
  const prevGoAccRef = useRef(passenger?.goAcc || '');

  // Données sécurisées du passager
  const safePassenger = {
    id: passenger.id,
    lastName: passenger.lastName || 'Sans nom',
    firstName: passenger.firstName || '',
    flightNumber: passenger.flightNumber || 'N/A',
    status: passenger.status || passenger.ssr1 || 'WCHR',
    departureTime: passenger.departureTime || '',
    addedAt: passenger.addedAt || new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    isSkyPriority: passenger.isSkyPriority || false,
    goAcc: passenger.goAcc || '',
    idPax: passenger.idPax
  };

  // Mise à jour de l'heure actuelle toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calcul des données de temps
  const timeDiffData = React.useMemo(() => {
    const minutes = calculateTimeDifference(safePassenger.departureTime, currentTime);
    return {
      minutes,
      isUrgent: minutes < 60,
      isWarning: minutes >= 60 && minutes < 90,
      isNormal: minutes >= 90
    };
  }, [safePassenger.departureTime, currentTime]);

  // Vérifier si le vol est passé
  const isPassed = React.useMemo(() => {
    return isFlightPassed(safePassenger.departureTime, currentTime);
  }, [safePassenger.departureTime, currentTime]);

  // Vérifier si un agent est en route
  const isAgentEnRoute = safePassenger.goAcc && safePassenger.goAcc.trim() !== '';
  
  // Afficher l'heure de départ
  const displayTime = extractTimeHHMM(safePassenger.departureTime);

  // Surveillance des changements de goAcc
  useEffect(() => {
    const currentGoAcc = passenger?.goAcc || '';
    const prevGoAcc = prevGoAccRef.current;
    
    // Détecter un changement de vide vers rempli
    if (prevGoAcc.trim() === '' && currentGoAcc.trim() !== '') {
      console.log(`🚶 Animation déclenchée pour ${safePassenger.lastName}: "${currentGoAcc}"`);
      
      setIsNewlyAddedAgent(true);
      setAgentEnRouteKey(prev => prev + 1);
      
      if (newlyAddedTimerRef.current) {
        clearTimeout(newlyAddedTimerRef.current);
      }
      
      newlyAddedTimerRef.current = setTimeout(() => {
        setIsNewlyAddedAgent(false);
      }, 5000);
    }
    // Détecter un changement de rempli vers vide
    else if (prevGoAcc.trim() !== '' && currentGoAcc.trim() === '') {
      console.log(`🛑 Agent retiré pour ${safePassenger.lastName}`);
      setIsNewlyAddedAgent(false);
      if (newlyAddedTimerRef.current) {
        clearTimeout(newlyAddedTimerRef.current);
      }
    }
    
    prevGoAccRef.current = currentGoAcc;
  }, [passenger?.goAcc, safePassenger.lastName]);

  // Écouter les événements depuis PassengerList
  useEffect(() => {
    const handleAgentStatusChange = (event) => {
      const { passengerId, idPax, hasAgent, isInitial, isNew, isRemoved } = event.detail;
      
      if (passengerId === safePassenger.id || idPax === safePassenger.idPax) {
        console.log(`🎬 Événement reçu pour ${safePassenger.lastName}:`, {
          hasAgent, isInitial, isNew, isRemoved
        });
        
        if (hasAgent && (isInitial || isNew)) {
          setIsNewlyAddedAgent(true);
          setAgentEnRouteKey(prev => prev + 1);
          
          if (newlyAddedTimerRef.current) {
            clearTimeout(newlyAddedTimerRef.current);
          }
          
          newlyAddedTimerRef.current = setTimeout(() => {
            setIsNewlyAddedAgent(false);
          }, isInitial ? 3000 : 5000);
          
        } else if (isRemoved) {
          setIsNewlyAddedAgent(false);
          if (newlyAddedTimerRef.current) {
            clearTimeout(newlyAddedTimerRef.current);
          }
        }
      }
    };
    
    window.addEventListener('agentStatusChanged', handleAgentStatusChange);
    
    return () => {
      window.removeEventListener('agentStatusChanged', handleAgentStatusChange);
    };
  }, [safePassenger.id, safePassenger.idPax, safePassenger.lastName]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (newlyAddedTimerRef.current) {
        clearTimeout(newlyAddedTimerRef.current);
      }
    };
  }, []);

  // Gestionnaire de suppression
  const handleRemove = (e) => {
    e.stopPropagation(); // Empêcher le clic sur la carte
    if (onRemove) {
      onRemove(safePassenger.id);
    }
  };

  // Gestionnaire de clic pour SkyPriority
  const handleCardClick = () => {
    if (onToggleSkyPriority) {
      onToggleSkyPriority(safePassenger.id);
    }
  };

  // Log pour debug
  console.log(`🎭 Rendu ${safePassenger.lastName}:`, {
    goAcc: safePassenger.goAcc,
    isAgentEnRoute: isAgentEnRoute,
    isNewlyAddedAgent: isNewlyAddedAgent,
    agentEnRouteKey: agentEnRouteKey,
    timeDiffMinutes: timeDiffData.minutes,
    isPassed: isPassed
  });

  return (
    <PassengerCardContainer $isPassed={isPassed}>
      <PassengerCardContent 
        $isSkyPriority={safePassenger.isSkyPriority}
        $timeDiffData={timeDiffData}
        onClick={handleCardClick}
      >
        <MainInfo>
          <FlightInfo>
            <FaPlane size={20} color="#0056b3" />
            <FlightDetails>
              <FlightNumber>{safePassenger.flightNumber}</FlightNumber>
            </FlightDetails>
          </FlightInfo>
          
          <PassengerInfo>
            <FaUser size={14} color="#212529" />
            <PassengerName>
              {safePassenger.lastName} {safePassenger.firstName}
            </PassengerName>
          </PassengerInfo>

          <StatusContainer>
            <StatusBadge $status={safePassenger.status}>
              {safePassenger.status}
            </StatusBadge>
            
            {/* Indicateur d'agent en route */}
            {isAgentEnRoute && (
              <AgentEnRouteIndicator 
                key={`agent-${safePassenger.id}-${agentEnRouteKey}`}
                $isNewlyAdded={isNewlyAddedAgent}
              >
                <WalkingIcon />
                <AgentEnRouteText>Agent en route</AgentEnRouteText>
              </AgentEnRouteIndicator>
            )}
          </StatusContainer>
        </MainInfo>
        
        <TimeInfo>
          {safePassenger.isSkyPriority && (
            <SkyPriorityBadge>
              <FaCrown size={16} color="#FFD700" />
              <span style={{color: '#fdfcfcff', fontWeight: 600}}>SkyPriority</span>
            </SkyPriorityBadge>
          )}
          
          <DepartureTimeDisplay $timeDiffData={timeDiffData}>
            <FaClock size={18} />
            {displayTime}
          </DepartureTimeDisplay>
          
          <AddedTimeContainer>
            <FaCalendarPlus size={14} />
            Ajouté à {safePassenger.addedAt}
          </AddedTimeContainer>
        </TimeInfo>
      </PassengerCardContent>
      
      {/* Bouton de suppression */}
      <RemoveButton 
        onClick={handleRemove}
        aria-label="Retirer le passager de la liste"
        title="Retirer le passager de la liste"
      >
        <FaTrashAlt size={14} />
      </RemoveButton>
    </PassengerCardContainer>
  );
};

PassengerItem.propTypes = {
  passenger: PropTypes.shape({
    id: PropTypes.string,
    lastName: PropTypes.string,
    firstName: PropTypes.string,
    status: PropTypes.string,
    ssr1: PropTypes.string,
    flightNumber: PropTypes.string,
    departureTime: PropTypes.string,
    addedAt: PropTypes.string,
    isSkyPriority: PropTypes.bool,
    goAcc: PropTypes.string,
    idPax: PropTypes.string
  }).isRequired,
  onToggleSkyPriority: PropTypes.func,
  onRemove: PropTypes.func
};

export default PassengerItem;