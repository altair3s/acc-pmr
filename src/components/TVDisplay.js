import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';
import { 
  FaUserFriends, 
  FaPlane, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser,
  FaCrown,
  FaWalking
} from 'react-icons/fa';

// Importation de l'image SkyPriority
import SkyLogo from '../assets/images/skyprio.png'; // adapte le chemin si besoin

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const blinkSlow = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
`;

const blinkFast = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
`;

// Animation pour le bonhomme qui marche
const walkingAnimation = keyframes`
  0% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  100% { transform: translateX(-5px); }
`;

// Couleurs
const COLORS = {
  green: '#198754',
  orange: '#ffc107',
  red: '#dc3545',
  gray: '#6c757d',
  lightRed: 'rgba(220, 53, 69, 0.1)',
  white: 'white',
  primary: '#0056b3',
  skyBlue: '#e0f0ff', // Couleur de fond pour SkyPriority
};

// Conteneurs
const TVContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  animation: ${fadeIn} 0.5s ease-out;
`;

const TVHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const CounterBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 0.7rem 1.2rem;
  font-weight: 700;
`;

// Compteur pour SkyPriority
const SkyPriorityBadge = styled(CounterBadge)`
  background-color: hsla(0, 98.20%, 57.30%, 0.97);
`;

const CountNumber = styled.span`
  font-size: 1.8rem;
  font-weight: 600;
`;

const CurrentTime = styled.div`
  font-size: 1.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

// Liste optimisée pour TV
const PassengerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// Card pour l'affichage TV (optimisé pour lisibilité)
const PassengerCard = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
  background-color: ${props => {
    if (props.$isSkyPriority) return COLORS.skyBlue;
    return props.$isUrgent ? COLORS.lightRed : COLORS.white;
  }};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.2rem 1.5rem;
  
  /* Animation de clignotement selon le délai */
  animation: ${props => {
    if (props.$isUrgent) return blinkFast;
    if (props.$isWarning) return blinkSlow;
    return 'none';
  }} ${props => props.$isUrgent ? '1.2s' : '1.7s'} ease-in-out infinite;
  
  /* Liseret de couleur */
  border-left: 8px solid ${props => {
    if (props.$isUrgent) return COLORS.red;
    if (props.$isWarning) return COLORS.orange;
    return COLORS.green;
  }};
  
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardMainInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
`;

const FlightInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 180px;
`;

const FlightDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Airline = styled.span`
  font-weight: 700;
  font-size: 1.4rem;
  color: ${COLORS.primary};
`;

const FlightNumber = styled.span`
  font-weight: 600;
  font-size: 1.3rem;
  color: #495057;
`;

const DestinationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 150px;
`;

const DestinationValue = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${COLORS.primary};
`;

const PassengerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 300px;
`;

const PassengerName = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Conteneur pour le statut et l'agent en route
const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
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
  width: 100px;
  text-align: center;
`;

// Indicateur d'agent en route
const AgentEnRouteIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(25, 135, 84, 0.1);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  border: 1px solid ${COLORS.green};
`;

const AgentEnRouteText = styled.span`
  font-size: 1rem;
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
  gap: 1.5rem;
`;

const DateDisplay = styled.div`
  font-size: 1.4rem;
  color: #6c757d;
  font-weight: 500;
`;

const DepartureTimeDisplay = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${props => {
    if (props.$isUrgent) return COLORS.red;
    if (props.$isWarning) return COLORS.orange;
    return COLORS.green;
  }};
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const FooterBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #343a40;
  color: white;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
`;

const FooterText = styled.div`
  opacity: 0.8;
`;

// Composant pour afficher le logo SkyPriority
const SkyPriorityLogo = styled.img`
  height: 45px;
  margin-left: 0.5rem;
  border-Radius: 15px;
`;

// Fonctions utilitaires
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
  return null;
};

const calculateTimeDifference = (departureTime, currentTime) => {
  // Extraire l'heure au format HH:MM
  const timeHHMM = extractTimeHHMM(departureTime);
  if (!timeHHMM) return 120; // Valeur par défaut: 2h
  
  try {
    // Diviser en heures et minutes
    const [hours, minutes] = timeHHMM.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
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

const isFlightPassed = (departureTime, currentTime) => {
  const timeHHMM = extractTimeHHMM(departureTime);
  if (!timeHHMM) return false;
  
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

// Composant principal
const TVDisplay = ({ passengers }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeString, setTimeString] = useState('');
  
  // Mettre à jour l'heure actuelle et le format d'affichage
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // Format de l'heure (HH:MM:SS)
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${hours}:${minutes}:${seconds}`);
    };
    
    // Mettre à jour l'heure chaque seconde
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Filtrer les passagers pour n'afficher que ceux qui sont pertinents
  const displayPassengers = passengers
    .filter(p => !isFlightPassed(p.departureTime, currentTime))
    .sort((a, b) => {
      // Trier par heure de départ
      try {
        const timeA = extractTimeHHMM(a.departureTime);
        const timeB = extractTimeHHMM(b.departureTime);
        
        if (timeA && timeB) {
          const [hoursA, minutesA] = timeA.split(':').map(Number);
          const [hoursB, minutesB] = timeB.split(':').map(Number);
          
          return hoursA - hoursB || minutesA - minutesB;
        }
      } catch (e) {}
      
      // Fallback à la comparaison standard
      return String(a.departureTime || '').localeCompare(String(b.departureTime || ''));
    });
  
  // Compter le nombre de passagers SkyPriority
  const skyPriorityCount = displayPassengers.filter(p => p.isSkyPriority).length;
  
  // Auto-refresh de la page toutes les minutes pour maintenir la liste à jour
  useEffect(() => {
    const refreshPage = () => {
      window.location.reload();
    };
    
    // Rafraîchir la page toutes les 60 secondes
    const refreshInterval = setInterval(refreshPage, 60000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Date actuelle formatée pour l'affichage
  const currentDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(currentTime);
  
  return (
    <TVContainer>
      <TVHeader>
        <HeaderTitle>
          <FaUserFriends size={32} />
          Passagers en attente d'assistance
        </HeaderTitle>
        
        <HeaderInfo>
          <CounterBadge>
            <FaUserFriends size={22} />
            <CountNumber>{displayPassengers.length}</CountNumber>
            <span>passagers</span>
          </CounterBadge>
          
          {/* Compteur SkyPriority */}
          <SkyPriorityBadge>
            <FaCrown size={22} color="#FFD700" />
            <CountNumber>{skyPriorityCount}</CountNumber>
            <span>SkyPriority</span>
          </SkyPriorityBadge>
          
          <CurrentTime>
            <FaClock size={22} />
            {timeString}
          </CurrentTime>
        </HeaderInfo>
      </TVHeader>
      
      <PassengerList>
        {displayPassengers.length > 0 ? (
          displayPassengers.map(passenger => {
            // Calculer le temps restant avant départ
            const timeDiff = calculateTimeDifference(passenger.departureTime, currentTime);
            const isUrgent = timeDiff < 60;
            const isWarning = timeDiff >= 60 && timeDiff < 90;
            
            // Extraire l'heure au format HH:MM pour l'affichage
            const displayTime = extractTimeHHMM(passenger.departureTime) || passenger.departureTime || "??:??";
            
            // Créer une version "safe" du passager avec valeurs par défaut
            const safePassenger = {
              ...passenger,
              lastName: passenger.lastName || 'Sans nom',
              firstName: passenger.firstName || '',
              airline: passenger.airline || 'N/A',
              flightNumber: passenger.flightNumber || 'N/A',
              status: passenger.status || 'WCHR',
              destination: passenger.destination || 'N/A',
              date: passenger.date || currentDate,
              isSkyPriority: passenger.isSkyPriority || false,
              goAcc: passenger.goAcc || ''
            };
            
            // Vérifier si un agent est en route
            const isAgentEnRoute = safePassenger.goAcc && safePassenger.goAcc.trim() !== '';
            
            return (
              <PassengerCard 
                key={passenger.id} 
                $isUrgent={isUrgent}
                $isWarning={isWarning}
                $isSkyPriority={safePassenger.isSkyPriority}
              >
                <CardMainInfo>
                  {/* Compagnie + Vol */}
                  <FlightInfo>
                    <FaPlane size={24} color={COLORS.primary} />
                    <FlightDetails>
                      <Airline>{safePassenger.airline}</Airline>
                      <FlightNumber>{safePassenger.flightNumber}</FlightNumber>
                    </FlightDetails>
                  </FlightInfo>
                  
                  {/* Destination */}
                  <DestinationInfo>
                    <FaMapMarkerAlt size={18} color={COLORS.primary} />
                    <DestinationValue>{safePassenger.destination}</DestinationValue>
                  </DestinationInfo>
                  
                  {/* Passager + Statut */}
                  <PassengerInfo>
                    <FaUser size={18} color="#212529" />
                    <PassengerName>
                      {safePassenger.lastName} {safePassenger.firstName}
                    </PassengerName>
                  </PassengerInfo>
                  
                  {/* Statut + Indicateur Agent en route */}
                  <StatusContainer>
                    <StatusBadge $status={safePassenger.status}>
                      {safePassenger.status}
                    </StatusBadge>
                    
                    {/* Indicateur d'agent en route */}
                    {isAgentEnRoute && (
                      <AgentEnRouteIndicator>
                        <WalkingIcon />
                        <AgentEnRouteText>Agent en route</AgentEnRouteText>
                      </AgentEnRouteIndicator>
                    )}
                  </StatusContainer>
                  {safePassenger.isSkyPriority && (
                      <SkyPriorityLogo src={SkyLogo} alt="SkyPriority" />
                    )}
                </CardMainInfo>
                
                {/* Heure et Date */}
                <TimeInfo>
                  
                  <DepartureTimeDisplay 
                    $isUrgent={isUrgent}
                    $isWarning={isWarning}
                  >
                    <FaClock size={20} />
                    {displayTime}
                  </DepartureTimeDisplay>
                </TimeInfo>
              </PassengerCard>
            );
          })
        ) : (
          <EmptyMessage>
            <FaUserFriends size={48} />
            <h2>Aucun passager PMR en attente</h2>
          </EmptyMessage>
        )}
      </PassengerList>
      
      <FooterBar>
        <FooterText>Mise à jour automatique toutes les minutes</FooterText>
        <FooterText>{currentDate}</FooterText>
      </FooterBar>
    </TVContainer>
  );
};

// Message quand la liste est vide
const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 12px;
  color: #6c757d;
  gap: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

TVDisplay.propTypes = {
  passengers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      lastName: PropTypes.string,
      firstName: PropTypes.string,
      status: PropTypes.string,
      airline: PropTypes.string,
      flightNumber: PropTypes.string,
      destination: PropTypes.string,
      departureTime: PropTypes.string,
      date: PropTypes.string,
      isSkyPriority: PropTypes.bool,
      goAcc: PropTypes.string // Ajout du champ goAcc pour l'agent en route
    })
  ).isRequired
};

export default TVDisplay;