import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import PassengerItem from './PassengerItem';
import PassengerSelector from './PassengerSelector';
import { 
  FaSort, 
  FaSortUp, 
  FaSortDown, 
  FaFilter, 
  FaSearch, 
  FaUserFriends, 
  FaPlane, 
  FaClock, 
  FaMapMarkerAlt,
  FaTrashAlt,
  FaExclamationTriangle,
  FaTimes,
  FaCheck,
  FaCrown,
  FaSyncAlt,
  FaVolumeUp,
  FaVolumeMute,
  FaBell
} from 'react-icons/fa';

const generateUniqueId = () => {
  return `passenger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Fonction utilitaire pour extraire uniquement l'heure de départ au format HH:MM
const extractTimeHHMM = (timeString) => {
  if (!timeString) return "time not specified";
  
  // Format déjà HH:MM
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Format avec date complète (comme "jj/mm/aaaa hh:mm")
  const dateTimeMatch = timeString.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\s+(\d{1,2}):(\d{2})/);
  if (dateTimeMatch) {
    return `${dateTimeMatch[4]}:${dateTimeMatch[5]}`;
  }
  
  // Format ISO ou similaire contenant T et heure
  const isoMatch = timeString.match(/T(\d{2}):(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}:${isoMatch[2]}`;
  }
  
  return timeString; // Retourner le texte original si aucun format reconnu
};

// Fonction utilitaire pour la synthèse vocale
const speakText = (text, lang = 'en-US', volume = 1, rate = 0.7, pitch = 1) => {
  // Vérifier si l'API Speech est disponible
  if ('speechSynthesis' in window) {
    // Arrêter toute voix en cours
    window.speechSynthesis.cancel();
    
    // Créer un nouvel objet SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance();
    
    // Définir le texte et les paramètres
    utterance.text = text;
    utterance.lang = lang;
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    // Sélectionner la voix d'Emma si disponible
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Si les voix ne sont pas encore chargées, attendre qu'elles le soient
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        const emmaVoice = voices.find(voice => voice.name.includes("Emma"));
        if (emmaVoice) {
          utterance.voice = emmaVoice;
        }
        window.speechSynthesis.speak(utterance);
      };
    } else {
      // Si les voix sont déjà chargées
      const emmaVoice = voices.find(voice => voice.name.includes("Emma"));
      if (emmaVoice) {
        utterance.voice = emmaVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
    
    return true;
  } else {
    console.warn("Speech Synthesis API is not available in this browser");
    return false;
  }
};

// Fonction pour jouer un jingle audio avant le message vocal
const playJingleThenSpeak = (messageText, lang = 'en-US', volume = 2, rate = 0.9, pitch = 1) => {
  return new Promise((resolve, reject) => {
    try {
      // Créer un élément audio pour le jingle
      const jingle = new Audio();
      
      // Définir la source du jingle
      jingle.src = process.env.PUBLIC_URL + '/audio/airport-jingle.mp3';
      
      // Régler le volume du jingle
      jingle.volume = 0.7; // Un peu plus bas que le message vocal
      
      // Événement quand le jingle est chargé
      jingle.oncanplaythrough = () => {
        console.log("Jingle chargé, démarrage de la lecture...");
        
        // Commencer la lecture du jingle
        jingle.play()
          .catch(err => {
            console.error("Erreur lors de la lecture du jingle:", err);
            // En cas d'erreur, continuer quand même avec le message vocal
            speakText(messageText, lang, volume, rate, pitch);
            resolve(true);
          });
      };
      
      // Événement de fin de jingle
      jingle.onended = () => {
        console.log("Jingle terminé, lecture du message vocal...");
        
        // Petite pause après le jingle avant de commencer le message
        setTimeout(() => {
          // Lire le message vocal
          const speechResult = speakText(messageText, lang, volume, rate, pitch);
          resolve(speechResult);
        }, 500); // Attendre 500ms après le jingle avant de commencer à parler
      };
      
      // Gestion des erreurs de chargement
      jingle.onerror = (err) => {
        console.error("Erreur lors du chargement du jingle:", err);
        // En cas d'erreur, continuer quand même avec le message vocal
        speakText(messageText, lang, volume, rate, pitch);
        resolve(true);
      };
      
    } catch (error) {
      console.error("Erreur lors de la lecture du jingle:", error);
      // En cas d'erreur, essayer quand même de lire le message vocal
      try {
        speakText(messageText, lang, volume, rate, pitch);
        resolve(true);
      } catch (speechError) {
        console.error("Erreur lors de la lecture vocale:", speechError);
        reject(speechError);
      }
    }
  });
};

// Fonction pour générer un message vocal personnalisé
const generateVoiceMessage = (passenger) => {
  // Extraire seulement l'heure de départ
  const departureTime = extractTimeHHMM(passenger.departureTime);
  
  let message = `Your attention please. Passenger ${passenger.firstName || ''} ${passenger.lastName || ''}`;
  
  // Personnalisation selon le statut
  if (passenger.isSkyPriority) {
    message += ", SkyPriority passenger";
  }
  
  // Ajout des informations de l'agent
  if (passenger.goAcc) {
    message += `, the agent in charge of your assistance is on his way to meet you`;
  } else {
    message += ", an agent is on his way to assist you";
  }
  
  // Ajout des informations de vol avec seulement l'heure
  message += `. Your flight ${passenger.flightNumber} to ${passenger.destination} is scheduled to depart at ${departureTime}. We wish you a pleasant flight.`;
  
  return message;
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const alertFadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

// Conteneur principal optimisé pour TV
const ListContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
  padding: 1.5rem;
  background-color: #f8f9fa;
  position: relative;
`;

// Header pour TV (plus compact)
const ListHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: white;
  letter-spacing: -0.02em;
`;

const TitleIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0.6rem;
  color: white;
`;

const SelectorSection = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

// Badge de comptage animé
const PassengerCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  color: white;
  transition: all 0.3s ease;
  animation: ${slideIn} 0.3s ease-out;
`;

// Nouveau Badge pour compter les passagers SkyPriority
const SkyPriorityCounter = styled(PassengerCounter)`
  background-color: hsl(0, 96.80%, 48.80%);
`;

const CountNumber = styled.span`
  font-size: 1.3rem;
  font-weight: 500;
`;

// Bouton de rafraîchissement
const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

// Bouton de contrôle audio
const AudioToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.enabled ? '#0056b3' : 'rgba(0, 0, 0, 0.7)'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.enabled ? '#004494' : 'rgba(0, 0, 0, 0.9)'};
    transform: translateY(-2px);
  }
`;

// Bouton de test de la voix d'Emma
const EmmaVoiceTestButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #6c5ce7;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: #5541d7;
    transform: translateY(-2px);
  }
`;

// Contrôles de filtrage et de tri (plus compacts)
const ControlsSection = styled.div`
  margin-bottom: 1rem;
`;

const SortControlsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const SortTitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 250px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #0056b3;
    box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.1);
  }
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  padding: 0.2rem 0.4rem;
  width: 100%;
  font-size: 0.9rem;
  color: #495057;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const SearchIcon = styled.div`
  color: #adb5bd;
  display: flex;
  align-items: center;
`;

const SortControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background-color: ${props => props.active ? '#0056b3' : 'white'};
  color: ${props => props.active ? 'white' : '#495057'};
  border: 1px solid ${props => props.active ? '#0056b3' : '#e9ecef'};
  font-weight: ${props => props.active ? '600' : '500'};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  
  &:hover {
    background-color: ${props => props.active ? '#004494' : 'rgba(0, 86, 179, 0.05)'};
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

// Message d'état pour la liste vide
const EmptyList = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyIcon = styled.div`
  color: #adb5bd;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;

const EmptyText = styled.h3`
  color: #6c757d;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

// Conteneur de la liste optimisé pour TV
const ListContent = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
`;

// Wrapper pour chaque passager avec bouton de suppression
const PassengerItemWrapper = styled.div`
  position: relative;
  margin-bottom: 0.75rem;
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
  
  ${PassengerItemWrapper}:hover & {
    opacity: 1;
  }
  
  &:hover {
    background-color: #c82333;
    transform: translateY(-50%) scale(1.1);
  }
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

const ConfirmButton = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  background-color: ${props => props.danger ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  
  &:hover {
    background-color: ${props => props.danger ? '#c82333' : '#5a6268'};
    transform: translateY(-2px);
  }
`;

// Fonction utilitaire pour vérifier si un vol est passé
const isFlightPassed = (departureTime) => {
  // Fonction d'aide pour extraire l'heure au format HH:MM
  const extractTimeHHMM = (timeString) => {
    if (!timeString) return null;
    
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
    
    return null;
  };
  
  const timeHHMM = extractTimeHHMM(departureTime);
  if (!timeHHMM) return false;
  
  try {
    const [hours, minutes] = timeHHMM.split(':').map(Number);
    const now = new Date();
    const departureDate = new Date();
    departureDate.setHours(hours, minutes, 0, 0);
    
    return departureDate < now;
  } catch (e) {
    return false;
  }
};

const PassengerList = ({ passengers: initialPassengers, setPassengers }) => {
  // État pour le tri et le filtrage
  const [sortField, setSortField] = useState('departureTime');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCount, setActiveCount] = useState(0);
  const [skyPriorityCount, setSkyPriorityCount] = useState(0); // Compteur SkyPriority
  const [isRefreshing, setIsRefreshing] = useState(false); // État pour le rafraîchissement
  const [refreshCounter, setRefreshCounter] = useState(0); // Compteur de rafraîchissement
  
  // État pour l'activation audio
  const [audioEnabled, setAudioEnabled] = useState(false);
  // État pour suivre si la voix d'Emma a été trouvée
  const [emmaVoiceFound, setEmmaVoiceFound] = useState(false);
  
  // État pour l'alerte de confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [passengerToRemove, setPassengerToRemove] = useState(null);
  
  // Référence pour suivre l'état des agents en route pour chaque passager
  const agentStatusRef = useRef({});
  
  // Référence pour le polling des données (rafraîchissement)
  const pollingIntervalRef = useRef(null);
  
  // Intervalle de rafraîchissement en millisecondes (10 secondes)
  const REFRESH_INTERVAL = 10000;
  
  // Utilisation des props externes ou des états locaux
  const passengers = initialPassengers || [];
  const updatePassengers = setPassengers || (() => {});
  
  // Effet pour vérifier si l'audio était précédemment activé et vérifier la voix d'Emma
  useEffect(() => {
    // Vérifier si l'audio était précédemment activé
    const savedAudioState = localStorage.getItem('audioEnabled') === 'true';
    setAudioEnabled(savedAudioState);
    
    // Vérifier si la voix d'Emma est disponible
    checkEmmaVoiceAvailability();
    
    // Ajouter un écouteur pour l'événement voiceschanged
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = checkEmmaVoiceAvailability;
      
      // Nettoyage lors du démontage du composant
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);
  
  // Fonction pour vérifier si la voix d'Emma est disponible
  const checkEmmaVoiceAvailability = () => {
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      
      // Chercher la voix d'Emma
      const emmaVoice = voices.find(voice => 
        voice.name.includes("Emma")
      );
      
      if (emmaVoice) {
        console.log(`Voix d'Emma trouvée: ${emmaVoice.name} (${emmaVoice.lang})`);
        setEmmaVoiceFound(true);
      } else {
        console.log("Voix d'Emma non trouvée. Voix disponibles:", voices.map(v => v.name).join(", "));
        setEmmaVoiceFound(false);
      }
    }
  };
  
  // Fonction pour basculer l'état d'activation audio
  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    localStorage.setItem('audioEnabled', newState.toString());
    
    // Jouer un son test si activé
    if (newState) {
      testAudio();
    }
  };
  
  // Fonction pour tester le son avec la voix d'Emma
  const testAudio = () => {
    try {
      const testJingle = new Audio(`${process.env.PUBLIC_URL}/audio/airport-jingle.mp3`);
      testJingle.volume = 0.5;
      testJingle.play()
        .then(() => {
          console.log("Test audio réussi!");
          // Utiliser la voix d'Emma pour le message de test
          setTimeout(() => {
            const testMessage = "The audio is now enabled. You will receive voice alerts with the Emma voice.";
            speakText(testMessage, 'en-US', 1, 0.9, 1);
          }, 1000);
        })
        .catch(err => {
          console.error("Échec du test audio:", err);
          alert("Impossible de jouer le son. Veuillez vérifier les paramètres de votre navigateur.");
        });
    } catch (error) {
      console.error("Erreur lors du test audio:", error);
    }
  };
  
  // Fonction pour tester spécifiquement la voix d'Emma
  const testEmmaVoiceSpecifically = () => {
    const testMessage = "This is a test of the Microsoft Emma voice. Your attention please, passengers. The flight to Paris is now boarding at gate 42.";
    speakText(testMessage, 'en-US', 1, 0.9, 1);
  };
  
  // Fonction pour déclencher une alerte vocale pour un passager
  const triggerAgentAlert = (passenger) => {
    if (!passenger) {
      console.error("Impossible de déclencher l'alerte vocale: passager manquant");
      return;
    }
    
    // Si l'audio n'est pas activé, ne pas déclencher d'alerte vocale
    if (!audioEnabled) {
      console.log("Audio désactivé, aucune alerte vocale déclenchée");
      return;
    }
    
    console.log(`DÉCLENCHEMENT DE L'ALERTE VOCALE pour ${passenger.lastName}, agent: ${passenger.goAcc}`);
    
    try {
      // Générer un message personnalisé
      const message = generateVoiceMessage(passenger);
      
      // Déclencher l'alerte vocale avec un délai pour être sûr que tout est prêt
      setTimeout(() => {
        // Utiliser la nouvelle fonction qui joue le jingle avant le message
        playJingleThenSpeak(message)
          .then(success => {
            console.log("Résultat de l'alerte vocale avec jingle:", success ? "Succès" : "Échec");
          })
          .catch(err => {
            console.error("Erreur lors de la lecture de l'alerte vocale:", err);
          });
      }, 100);
    } catch (error) {
      console.error("Erreur lors du déclenchement de l'alerte vocale:", error);
    }
  };
  
  // Fonction pour surveiller les changements dans les valeurs de goAcc
  const monitorAgentStatus = (passengersList) => {
    if (!passengersList || !Array.isArray(passengersList)) return;
    
    console.log("Surveillance des changements d'agents...");
    
    let changesDetected = false;
    
    passengersList.forEach(passenger => {
      const passengerId = passenger.id;
      const currentAgentStatus = passenger.goAcc && passenger.goAcc.trim() !== '';
      
      // Pour le débogage, loguer l'état actuel
      console.log(`Vérification de ${passenger.lastName} (ID: ${passengerId}):`);
      console.log(`  - goAcc: "${passenger.goAcc}"`);
      console.log(`  - État précédent: ${agentStatusRef.current[passengerId]}`);
      console.log(`  - État actuel: ${currentAgentStatus}`);
      
      // Si c'est un nouveau passager, initialiser son statut
      if (agentStatusRef.current[passengerId] === undefined) {
        console.log(`  - Initialisation pour ${passenger.lastName}: ${currentAgentStatus}`);
        agentStatusRef.current[passengerId] = currentAgentStatus;
        
        // Si un agent est déjà assigné, déclencher l'alerte vocale
        if (currentAgentStatus) {
          console.log(`  - ALERTE: Agent déjà en route pour le nouveau passager`);
          triggerAgentAlert(passenger);
          changesDetected = true;
        }
      } 
      // Si l'agent est maintenant en route alors qu'il ne l'était pas avant
      else if (currentAgentStatus && !agentStatusRef.current[passengerId]) {
        console.log(`  - CHANGEMENT: Agent maintenant en route!`);
        
        // Déclencher l'alerte vocale
        triggerAgentAlert(passenger);
        changesDetected = true;
        
        // Mettre à jour la référence
        agentStatusRef.current[passengerId] = true;
      }
    });
    
    // Nettoyage des références pour les passagers qui ne sont plus dans la liste
    const currentIds = new Set(passengersList.map(p => p.id));
    Object.keys(agentStatusRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        console.log(`Suppression de la référence pour l'ID ${id} (passager supprimé)`);
        delete agentStatusRef.current[id];
      }
    });
    
    // Afficher un résumé
    if (changesDetected) {
      console.log("Des changements d'agents ont été détectés et les alertes ont été déclenchées");
    } else {
      console.log("Aucun changement d'agent détecté");
    }
  };
  
  // Fonction pour afficher l'état actuel dans la console (débogage)
  const debugAgentStatus = (passengersList) => {
    console.log("==== Statut des agents ====");
    console.log("État de référence:", JSON.stringify(agentStatusRef.current));
    
    if (passengersList && Array.isArray(passengersList)) {
      passengersList.forEach(p => {
        console.log(`Passager ${p.lastName} (ID: ${p.id}): goAcc = "${p.goAcc}", référence = ${agentStatusRef.current[p.id]}`);
      });
    }
    
    console.log("========================");
  };
  
  // Fonction pour récupérer les données depuis la Google Sheet
  const fetchPassengersData = async () => {
    let hasChanges = false;
    
    try {
      // Récupérer les identifiants et les clés API
      const SHEET_ID = process.env.REACT_APP_SHEET_ID || '1gNR8Xy6xoqJiJQBm-aizhwAtI6qdqjEGUcyL56lFj1U';
      const SHEET_RANGE = process.env.REACT_APP_SHEET_RANGE || 'OzionR!A2:O'; // S'assurer que la plage inclut GO-ACC
      const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
      
      if (!API_KEY || API_KEY === 'VOTRE_CLE_API_ICI') {
        console.warn("Clé API non définie, impossible de rafraîchir les données");
        return false; // Retourner false car aucun changement n'a été détecté
      }
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.values && Array.isArray(data.values)) {
        console.log(`${data.values.length} entrées trouvées dans la feuille`);
        
        // Adapter les données de la feuille selon votre structure
  const sheetPassengers = data.values.map((row, index) => {
    const sheetEntry = {
      sheetId: `sheet-${index}`,
      idMission: row[0] || '',
      idPax: row[1] || '',
      statut: row[2] || '',
      lastName: row[3] || '',
      firstName: row[4] || '',
      status: row[5] || '',
      ssr2: row[6] || '',
      terminalDepart: row[7] || '',
      airline: row[8] || '',
      flightNumber: row[9] || '',
      destination: row[10] || '',
      departureTime: row[11] || '',
      satelliteDepart: row[12] || '',
      goAcc: row[13] || '' // Assurez-vous que l'index correspond à GO-ACC
    };
    const previousPassenger = passengers.find(p => p.idPax === sheetEntry.idPax);

    return {
      ...sheetEntry,
      ...(previousPassenger || {}) // garde addedAt, id, isSkyPriority, etc.
    };
  });
        
        // Débogage
        console.log("=== RAFRAÎCHISSEMENT AUTOMATIQUE ===");
        console.log(`Heure actuelle: ${new Date().toLocaleTimeString()}`);
        console.log(`Nombre d'entrées dans la Google Sheet: ${sheetPassengers.length}`);
        console.log(`Nombre de passagers dans l'app: ${passengers.length}`);
        
        // Mettre à jour les données des passagers existants avec les nouvelles informations de la feuille
        if (passengers && passengers.length > 0) {
          // Créer un mapping pour une recherche rapide des données de la feuille
          const sheetDataMap = {};
          sheetPassengers.forEach(sp => {
            // Utiliser idPax comme clé unique pour faire correspondre les entrées
            if (sp.idPax) {
              sheetDataMap[sp.idPax] = sp;
            }
          });
          
          // Vérification préalable des changements
          const changes = [];
          
          // Détecter les modifications sans mettre à jour immédiatement
          passengers.forEach(p => {
            if (p.idPax) {
              const sheetEntry = sheetDataMap[p.idPax];
              if (sheetEntry && p.goAcc !== sheetEntry.goAcc) {
                hasChanges = true;
                changes.push({
                  id: p.id,
                  name: p.lastName,
                  oldValue: p.goAcc,
                  newValue: sheetEntry.goAcc
                });
              }
            }
          });
          
          // Afficher les changements détectés
          if (changes.length > 0) {
            console.log("CHANGEMENTS DÉTECTÉS dans les valeurs GO-ACC:");
            changes.forEach(change => {
              console.log(`- ${change.name}: "${change.oldValue}" -> "${change.newValue}"`);
            });
          } else {
            console.log("Aucun changement détecté dans les valeurs GO-ACC");
          }
          
          // Mettre à jour les passagers existants avec les nouvelles données
          if (hasChanges) {
            const updatedPassengers = passengers.map(p => {
              // Trouver l'entrée correspondante dans les données de la feuille
              const sheetEntry = p.idPax ? sheetDataMap[p.idPax] : null;
              
              if (sheetEntry && p.goAcc !== sheetEntry.goAcc) {
                console.log(`Mise à jour de ${p.lastName}: goAcc "${p.goAcc}" -> "${sheetEntry.goAcc}"`);
                
                // Retourner un passager mis à jour
                return {
                  ...p,
                  goAcc: sheetEntry.goAcc
                };
              }
              // Sinon, retourner le passager sans modification
              return p;
            });
            
            console.log("Mise à jour du state avec les nouvelles données");
            
            // Important: Mise à jour de l'état avec les passagers modifiés
            updatePassengers(updatedPassengers);
            
            // Surveillance immédiate pour les alertes vocales (indépendamment du state React)
            // Note: Transmettre les passagers mis à jour directement, ne pas utiliser le state
            setTimeout(() => {
              for (const p of updatedPassengers) {
                const oldStatus = agentStatusRef.current[p.id] || false;
                const newStatus = p.goAcc && p.goAcc.trim() !== '';
                
                if (newStatus && !oldStatus) {
                  console.log(`ALERTE VOCALE pour ${p.lastName}, agent: ${p.goAcc}`);
                  triggerAgentAlert(p);
                  agentStatusRef.current[p.id] = true;
                }
              }
            }, 100);
          }
        }
        
        return hasChanges; // Retourner si des changements ont été détectés
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
    
    return false;
  };
  
  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      console.log("Rafraîchissement des données...", new Date().toLocaleTimeString());
      
      // Appeler la fonction de récupération des données depuis la Google Sheet
      const changesDetected = await fetchPassengersData();
      
      // Incrémenter le compteur pour déclencher le useEffect qui surveille les changements
      setRefreshCounter(prev => prev + 1);
      
      if (changesDetected) {
        console.log("Des changements ont été détectés et appliqués");
      } else {
        console.log("Aucun changement détecté");
      }
      
      console.log("Rafraîchissement terminé");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Effet pour démarrer le polling des données
  useEffect(() => {
    console.log("Initialisation du système de rafraîchissement...");
    
    // Surveiller les passagers initiaux
    if (passengers.length > 0) {
      console.log("Passagers initiaux détectés, initialisation de la surveillance");
      monitorAgentStatus(passengers);
      debugAgentStatus(passengers);
    }
    
    // Effectuer un premier rafraîchissement immédiatement
    console.log("Premier rafraîchissement immédiat...");
    setTimeout(() => {
      refreshData();
    }, 1000);
    
    // Configurer l'intervalle de rafraîchissement périodique
    console.log(`Configuration du rafraîchissement toutes les ${REFRESH_INTERVAL/1000} secondes`);
    pollingIntervalRef.current = setInterval(() => {
      console.log("Rafraîchissement périodique déclenché");
      refreshData();
    }, REFRESH_INTERVAL);
    
    // Nettoyage à la destruction du composant
    return () => {
      console.log("Nettoyage du système de rafraîchissement");
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []); // Uniquement au montage du composant
  
  // Effet pour surveiller les changements de passengers
  useEffect(() => {
    if (passengers.length > 0) {
      console.log("Passagers mis à jour, vérification des changements...");
      monitorAgentStatus(passengers);
    }
    
    // Mettre à jour les compteurs
    updateActiveCount();
  }, [passengers]); // Se déclenche à chaque changement de la liste des passagers
  
  // Effet pour surveiller le compteur de rafraîchissement
  useEffect(() => {
    if (refreshCounter > 0) {
      console.log(`Rafraîchissement #${refreshCounter} terminé`);
    }
  }, [refreshCounter]);
  
  // Effet pour mettre à jour le compteur de passagers actifs à intervalles réguliers
  useEffect(() => {
    // Mettre à jour le compteur immédiatement
    updateActiveCount();
    
    // Et aussi toutes les 30 secondes pour tenir compte des vols qui deviennent "passés"
    const countInterval = setInterval(() => {
      updateActiveCount();
    }, 30000);
    
    return () => clearInterval(countInterval);
  }, [passengers]);
  
  // Fonction pour mettre à jour le compteur de passagers actifs
  const updateActiveCount = () => {
    const activePassengers = passengers.filter(p => !isFlightPassed(p.departureTime));
    setActiveCount(activePassengers.length);
    
    // Mettre à jour le compteur SkyPriority
    const skyPriorityPassengers = activePassengers.filter(p => p.isSkyPriority);
    setSkyPriorityCount(skyPriorityPassengers.length);
  };
  
  // Gestionnaire pour le changement du champ de recherche
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Gestionnaire pour le clic sur un bouton de tri
  const handleSort = (field) => {
    if (sortField === field) {
      // Basculer la direction si même champ
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Définir un nouveau champ et par défaut en ordre croissant
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Obtenir l'icône de tri en fonction de l'état actuel
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Fonction pour gérer la sélection d'un passager
  const handlePassengerSelect = (passenger) => {
    if (passenger) {
      // Get current time once and store it as a fixed value
      const now = new Date();
      
      const newPassenger = {
        ...passenger,
        id: generateUniqueId(),
        date: now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        departureTime: passenger.departureTime || '',
        scanTime: now.toISOString(),
        addedAt: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isSkyPriority: false
      };
      
      // Ajouter le nouveau passager à la liste
      const updatedPassengers = [...passengers, newPassenger];
      updatePassengers(updatedPassengers);
      
      // Initialiser le statut de l'agent pour ce passager
      const hasAgent = newPassenger.goAcc && newPassenger.goAcc.trim() !== '';
      agentStatusRef.current[newPassenger.id] = hasAgent;
      
      // Si l'agent est déjà en route, déclencher l'alerte vocale
      if (hasAgent) {
        // Vérifier que passenger.goAcc contient bien une valeur et l'afficher dans la console
        console.log("Nouveau passager avec agent:", newPassenger.lastName, "- Agent:", newPassenger.goAcc);
        triggerAgentAlert(newPassenger);
      }
      
      // Mettre à jour le compteur immédiatement
      setTimeout(updateActiveCount, 50);
    }
  };

  // Fonction pour basculer le statut SkyPriority d'un passager
  const handleToggleSkyPriority = (passengerId) => {
    const updated = passengers.map(p =>
      p.id === passengerId ? { ...p, isSkyPriority: !p.isSkyPriority } : p
    );
    updatePassengers(updated);
    
    // Mettre à jour les compteurs après la modification
    setTimeout(updateActiveCount, 50);
  };
  
  // Gestionnaire pour ouvrir la confirmation de suppression
  const handleOpenRemoveConfirmation = (passenger) => {
    setPassengerToRemove(passenger);
    setShowConfirmation(true);
  };
  
  // Gestionnaire pour annuler la suppression
  const handleCancelRemove = () => {
    setShowConfirmation(false);
    setPassengerToRemove(null);
  };
  
  // Fonction pour confirmer la suppression d'un passager
  const handleConfirmRemove = () => {
    if (passengerToRemove) {
      const updatedPassengers = passengers.filter(passenger => passenger.id !== passengerToRemove.id);
      updatePassengers(updatedPassengers);
      
      // Supprimer les références de ce passager
      delete agentStatusRef.current[passengerToRemove.id];
      
      // Fermer la confirmation
      setShowConfirmation(false);
      setPassengerToRemove(null);
      
      // Mettre à jour le compteur immédiatement
      setTimeout(updateActiveCount, 50);
    }
  };

  // Filtrer les passagers en fonction de la recherche
  const filteredPassengers = passengers.filter(passenger => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (passenger.lastName || '').toLowerCase().includes(query) ||
      (passenger.firstName || '').toLowerCase().includes(query) ||
      (passenger.airline || '').toLowerCase().includes(query) ||
      (passenger.flightNumber || '').toLowerCase().includes(query) ||
      (passenger.destination || '').toLowerCase().includes(query) ||
      (passenger.status || '').toLowerCase().includes(query)
    );
  });

  // Trier les passagers filtrés
  const sortedPassengers = [...filteredPassengers].sort((a, b) => {
    let comparison = 0;
    
    try {
      switch (sortField) {
        case 'departureTime':
  const timeA = extractTimeHHMM(a.departureTime);
  const timeB = extractTimeHHMM(b.departureTime);

  const [hoursA, minutesA] = timeA.split(':').map(Number);
  const [hoursB, minutesB] = timeB.split(':').map(Number);

  const totalMinutesA = (isNaN(hoursA) ? 0 : hoursA) * 60 + (isNaN(minutesA) ? 0 : minutesA);
  const totalMinutesB = (isNaN(hoursB) ? 0 : hoursB) * 60 + (isNaN(minutesB) ? 0 : minutesB);

  comparison = totalMinutesA - totalMinutesB;
  break;

        case 'airline':
          comparison = String(a.airline || '').localeCompare(String(b.airline || ''));
          break;
        case 'destination':
          comparison = String(a.destination || '').localeCompare(String(b.destination || ''));
          break;
        case 'status':
          comparison = String(a.status || '').localeCompare(String(b.status || ''));
          break;
        default:
          comparison = 0;
      }
    } catch (error) {
      console.error("Erreur lors du tri:", error);
      comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Afficher uniquement les vols non passés
  const displayPassengers = sortedPassengers.filter(p => !isFlightPassed(p.departureTime));

  return (
    <ListContainer>
      <ListHeader>
        <TitleSection>
          <TitleIcon>
            <FaUserFriends size={20} />
          </TitleIcon>
          <Title>Passagers PMR en attente d'assistance</Title>
        </TitleSection>
        
        <SelectorSection>
          <PassengerSelector onSelect={handlePassengerSelect} />
          <PassengerCounter>
            <FaUserFriends size={20} />
            <CountNumber>{activeCount}</CountNumber>
            <span>passagers</span>
          </PassengerCounter>
          
          {/* Compteur SkyPriority */}
          <SkyPriorityCounter>
            <FaCrown size={20} color="#FFD700" />
            <CountNumber>{skyPriorityCount}</CountNumber>
            <span>SkyPriority</span>
          </SkyPriorityCounter>
          
          {/* Bouton de rafraîchissement manuel */}
          <RefreshButton onClick={refreshData} disabled={isRefreshing}>
            <FaSyncAlt size={14} />
            <span>{isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir'}</span>
          </RefreshButton>
          
          {/* Bouton d'activation/désactivation audio */}
          <AudioToggleButton 
            onClick={toggleAudio}
            enabled={audioEnabled}
            title={audioEnabled ? "Désactiver les annonces sonores" : "Activer les annonces sonores"}
          >
            {audioEnabled ? (
              <>
                <FaVolumeUp size={14} />
                <span>Son activé</span>
                {emmaVoiceFound && <small style={{ marginLeft: '5px', opacity: 0.8 }}>(Emma)</small>}
              </>
            ) : (
              <>
                <FaVolumeMute size={14} />
                <span>Son désactivé</span>
              </>
            )}
          </AudioToggleButton>
        </SelectorSection>
      </ListHeader>
      
      {/* Bouton de test de la voix d'Emma (visible uniquement si le son est activé) */}
      {audioEnabled && (
        <div style={{ marginBottom: '1rem' }}>
          <EmmaVoiceTestButton onClick={testEmmaVoiceSpecifically}>
            <FaBell size={14} />
            <span>Test de la voix d'Emma</span>
          </EmmaVoiceTestButton>
          {!emmaVoiceFound && (
            <div style={{ color: '#d63031', marginTop: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
              <FaExclamationTriangle size={12} style={{ marginRight: '5px' }} />
              <span>La voix Microsoft Emma n'a pas été trouvée sur votre système. Une voix alternative en anglais sera utilisée.</span>
            </div>
          )}
        </div>
      )}
      
      <ControlsSection>
        <SortControlsHeader>
          <SortTitle>
            <FaFilter size={12} /> Filtrer et trier les passagers
          </SortTitle>
          
          <SearchBox>
            <SearchIcon>
              <FaSearch size={12} />
            </SearchIcon>
            <SearchInput 
              type="text" 
              placeholder="Rechercher un passager..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </SearchBox>
        </SortControlsHeader>
        
        <SortControls>
          <SortButton 
            active={sortField === 'departureTime'} 
            onClick={() => handleSort('departureTime')}
          >
            <FaClock size={12} />
            Heure de départ {getSortIcon('departureTime')}
          </SortButton>
          
          <SortButton 
            active={sortField === 'airline'} 
            onClick={() => handleSort('airline')}
          >
            <FaPlane size={12} />
            Compagnie {getSortIcon('airline')}
          </SortButton>
          
          <SortButton 
            active={sortField === 'destination'} 
            onClick={() => handleSort('destination')}
          >
            <FaMapMarkerAlt size={12} />
            Destination {getSortIcon('destination')}
          </SortButton>
          
          <SortButton 
            active={sortField === 'status'} 
            onClick={() => handleSort('status')}
          >
            Status {getSortIcon('status')}
          </SortButton>
        </SortControls>
      </ControlsSection>
      
      {displayPassengers.length > 0 ? (
        <ListContent>
          {displayPassengers.map((passenger) => (
            <PassengerItemWrapper key={passenger.id}>
              <PassengerItem 
                passenger={passenger} 
                onToggleSkyPriority={handleToggleSkyPriority}
              />
              <RemoveButton 
                onClick={() => handleOpenRemoveConfirmation(passenger)}
                aria-label="Retirer le passager de la liste"
                title="Retirer le passager de la liste"
              >
                <FaTrashAlt size={14} />
              </RemoveButton>
            </PassengerItemWrapper>
          ))}
        </ListContent>
      ) : (
        <EmptyList>
          <EmptyIcon>
            <FaUserFriends />
          </EmptyIcon>
          <EmptyText>Aucun passager PMR enregistré</EmptyText>
        </EmptyList>
      )}
      
      {/* Alerte de confirmation de suppression */}
      {showConfirmation && passengerToRemove && (
        <ConfirmationOverlay>
          <ConfirmationDialog>
            <ConfirmationHeader>
              <WarningIcon>
                <FaExclamationTriangle />
              </WarningIcon>
              <ConfirmationTitle>Confirmation de suppression</ConfirmationTitle>
            </ConfirmationHeader>
            
            <ConfirmationMessage>
              Êtes-vous sûr de vouloir retirer ce passager de la liste ? Cette action est irréversible.
            </ConfirmationMessage>
            
            <PassengerDetails>
              <DetailRow>
                <DetailLabel>Passager:</DetailLabel>
                <DetailValue>{passengerToRemove.lastName} {passengerToRemove.firstName}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Vol:</DetailLabel>
                <DetailValue>{passengerToRemove.airline} {passengerToRemove.flightNumber}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Destination:</DetailLabel>
                <DetailValue>{passengerToRemove.destination}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Départ:</DetailLabel>
                <DetailValue>{passengerToRemove.departureTime}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Status:</DetailLabel>
                <DetailValue>{passengerToRemove.status}</DetailValue>
              </DetailRow>
              {passengerToRemove.goAcc && (
                <DetailRow>
                  <DetailLabel>Agent en route:</DetailLabel>
                  <DetailValue>{passengerToRemove.goAcc}</DetailValue>
                </DetailRow>
              )}
            </PassengerDetails>
            
            <ButtonGroup>
              <ConfirmButton onClick={handleCancelRemove}>
                <FaTimes size={14} /> Annuler
              </ConfirmButton>
              <ConfirmButton danger onClick={handleConfirmRemove}>
                <FaCheck size={14} /> Confirmer
              </ConfirmButton>
            </ButtonGroup>
          </ConfirmationDialog>
        </ConfirmationOverlay>
      )}
    </ListContainer>
  );
};

export default PassengerList;
