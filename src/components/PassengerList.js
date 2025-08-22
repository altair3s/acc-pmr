import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import PassengerItem from './PassengerItem';
import PassengerSelector from './PassengerSelector';
import { FaUserFriends, FaCrown, FaSyncAlt } from 'react-icons/fa';
import { appendSelectedPassenger, deleteRowByUuid, updateSelectedPassenger } from '../services/SelectedPaxService';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const ListContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
  padding: 1.5rem;
  background-color: #f8f9fa;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: white;
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
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PassengerCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  color: white;
`;

const SkyPriorityCounter = styled(PassengerCounter)`
  background-color: hsl(0, 96.80%, 48.80%);
`;

const CountNumber = styled.span`
  font-size: 1.3rem;
  font-weight: 500;
`;

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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ListContent = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyList = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyText = styled.h3`
  color: #6c757d;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
`;

// ✅ NOUVELLES FONCTIONS UTILITAIRES POUR GO-ACC ET GO-LIEU
// Fonction pour vérifier si un agent est en route (GO-ACC OU GO-LIEU rempli)
const isAgentEnRoute = (passenger) => {
  const hasGoAcc = passenger.goAcc && passenger.goAcc.trim() !== '';
  const hasGoLieu = passenger.goLieu && passenger.goLieu.trim() !== '';
  return hasGoAcc || hasGoLieu;
};

// Fonction pour obtenir le nom de l'agent (priorité à GO-ACC, sinon GO-LIEU)
const getAgentName = (passenger) => {
  if (passenger.goAcc && passenger.goAcc.trim() !== '') {
    return passenger.goAcc.trim();
  }
  if (passenger.goLieu && passenger.goLieu.trim() !== '') {
    return passenger.goLieu.trim();
  }
  return '';
};

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

// ✅ FONCTION DE PARSING MISE À JOUR POUR INCLURE GO-LIEU
const parseSheetData = (values) => {
  if (!values || !Array.isArray(values) || values.length === 0) {
    return {};
  }

  console.log("🔄 RAFRAÎCHISSEMENT - Analyse des données Sheet:");
  console.log("Nombre de lignes:", values.length);

  const sheetDataMap = {};
  
  for (let i = 1; i < values.length; i++) { // Ignorer les en-têtes
    const row = values[i];
    
    // Gérer les points-virgules
    let processedRow = row;
    if (row.length === 1 && String(row[0]).includes(';')) {
      processedRow = String(row[0]).split(';').map(cell => cell.trim());
    }
    
    // ✅ AJUSTEMENT: Étendre pour inclure GO-LIEU (colonne 7)
    if (processedRow.length >= 7) {
      const idPax = String(processedRow[0] || '').trim();
      const lastName = String(processedRow[1] || '').trim();
      const firstName = String(processedRow[2] || '').trim();
      const flightNumber = String(processedRow[3] || '').trim();
      const departureTime = String(processedRow[4] || '').trim();
      const goLieu = String(processedRow[5] || '').trim(); // ✅ NOUVEAU: GO-LIEU
      const goAcc = String(processedRow[6] || '').trim();
      const ssr1 = String(processedRow[7] || '').trim();

      
      if (idPax && lastName) {
        sheetDataMap[idPax] = {
          idPax,
          lastName,
          firstName,
          flightNumber,
          departureTime,
          goLieu, // ✅ NOUVEAU CHAMP
          goAcc,
          ssr1
          
        };
        
        // ✅ LOGS AMÉLIORÉS: Inclure GO-LIEU
        if (lastName.toUpperCase().includes('AWAD') || 
            lastName.toUpperCase().includes('FRANCO') ||
            lastName.toUpperCase().includes('MULLER')) {
          console.log(`🔄 ${lastName} dans Sheet:`, {
            idPax,
            goAcc: `"${goAcc}"`,
            goLieu: `"${goLieu}"`, // ✅ NOUVEAU DANS LES LOGS
            ssr1: `"${ssr1}"`
          });
        }
      }
    }
  }
  
  console.log(`🔄 Sheet mappé: ${Object.keys(sheetDataMap).length} passagers`);
  return sheetDataMap;
};

// Fonction utilitaire pour extraire date et heure
const extractDateTimeInfo = (timeString) => {
  if (!timeString) return { date: "", time: "??:??", fullDateTime: null };
  
  console.log(`🔍 Analyse du departureTime: "${timeString}"`);
  
  // Format DD/MM/YYYY HH:MM ou DD-MM-YYYY HH:MM (PRIORITAIRE)
  const dateTimeMatch = timeString.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\s+(\d{1,2}):(\d{2})/);
  if (dateTimeMatch) {
    const day = dateTimeMatch[1].padStart(2, '0');
    const month = dateTimeMatch[2].padStart(2, '0');
    const year = dateTimeMatch[3].length === 2 ? `20${dateTimeMatch[3]}` : dateTimeMatch[3];
    const hours = dateTimeMatch[4].padStart(2, '0');
    const minutes = dateTimeMatch[5];
    
    const fullDateTime = new Date(year, month - 1, day, hours, minutes);
    
    return {
      date: `${day}/${month}`,
      time: `${hours}:${minutes}`,
      fullDateTime
    };
  }
  
  // Format HH:MM seulement - PAS DE DATE
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    const today = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const fullDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    
    return {
      date: "",
      time: timeString,
      fullDateTime
    };
  }
  
  return { date: "", time: timeString, fullDateTime: null };
};

const PassengerList = ({ passengers: initialPassengers, setPassengers }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef(null);
  const agentStatusRef = useRef({}); // ✅ MODIFIÉ: Suivi des statuts GO-ACC ET GO-LIEU
  
  const passengers = initialPassengers || [];
  const updatePassengers = setPassengers || (() => {});
  
  // Calculer les compteurs (seulement les vols non passés)
  const now = new Date();
  const activePassengers = passengers.filter(p => {
    const timeHHMM = extractTimeHHMM(p.departureTime);
    if (!timeHHMM || timeHHMM === "??:??") return true;
    
    try {
      const [hours, minutes] = timeHHMM.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return true;
      
      const departureDate = new Date();
      departureDate.setHours(hours, minutes, 0, 0);
      
      return departureDate >= now; // Vols futurs seulement
    } catch (e) {
      return true;
    }
  });
  
  const activeCount = activePassengers.length;
  const skyPriorityCount = activePassengers.filter(p => p.isSkyPriority).length;

  // ✅ FONCTION DE RAFRAÎCHISSEMENT MISE À JOUR POUR GO-ACC ET GO-LIEU
  const refreshData = async () => {
    if (passengers.length === 0) {
      console.log("⏭️ Pas de passagers, pas de rafraîchissement");
      return;
    }
    
    try {
      setIsRefreshing(true);
      console.log("🔄 Rafraîchissement en cours...");
      
      // Configuration - ✅ MISE À JOUR POUR INCLURE GO-LIEU
      const SHEET_ID = process.env.REACT_APP_SHEET_ID || '1p5Pbkam5yhXMcA7HoaksPlslf9Y9Z8X9ZLFLpUz-r_w';
      const SHEET_RANGE = process.env.REACT_APP_SHEET_RANGE || 'Jalons!A1:I5000'; // ✅ ÉTENDU À LA COLONNE I POUR GO-LIEU
      const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
      
      if (!API_KEY) {
        console.warn("⚠️ Pas de clé API - rafraîchissement impossible");
        return;
      }
      
      // Appel API
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const sheetDataMap = parseSheetData(data.values);
      
      // ✅ LOGIQUE DE MISE À JOUR AMÉLIORÉE POUR TOUS LES CHAMPS
      let hasChanges = false;
      const updatedPassengers = passengers.map(passenger => {
        const sheetEntry = sheetDataMap[passenger.idPax];
        
        if (sheetEntry) {
          // ✅ VÉRIFICATION DE TOUS LES CHAMPS CRITIQUES
          const currentGoAcc = String(passenger.goAcc || '').trim();
          const newGoAcc = String(sheetEntry.goAcc || '').trim();
          const currentGoLieu = String(passenger.goLieu || '').trim();
          const newGoLieu = String(sheetEntry.goLieu || '').trim();
          const currentDepartureTime = String(passenger.departureTime || '').trim();
          const newDepartureTime = String(sheetEntry.departureTime || '').trim();
          const currentFlightNumber = String(passenger.flightNumber || '').trim();
          const newFlightNumber = String(sheetEntry.flightNumber || '').trim();
          
          // ✅ DÉTECTION DES CHANGEMENTS POUR TOUS LES CHAMPS
          const goAccChanged = currentGoAcc !== newGoAcc;
          const goLieuChanged = currentGoLieu !== newGoLieu;
          const departureTimeChanged = currentDepartureTime !== newDepartureTime;
          const flightNumberChanged = currentFlightNumber !== newFlightNumber;
          
          if (goAccChanged || goLieuChanged || departureTimeChanged || flightNumberChanged) {
            hasChanges = true;
            
            // ✅ LOGS DÉTAILLÉS POUR TOUS LES CHANGEMENTS
            const changes = [];
            if (goAccChanged) changes.push(`GO-ACC: "${currentGoAcc}" → "${newGoAcc}"`);
            if (goLieuChanged) changes.push(`GO-LIEU: "${currentGoLieu}" → "${newGoLieu}"`);
            if (departureTimeChanged) changes.push(`HEURE: "${currentDepartureTime}" → "${newDepartureTime}"`);
            if (flightNumberChanged) changes.push(`VOL: "${currentFlightNumber}" → "${newFlightNumber}"`);
            
            console.log(`🔄 Changements détectés pour ${passenger.lastName}:`, changes.join(', '));
            
            // ✅ ÉVÉNEMENT AMÉLIORÉ AVEC INFORMATIONS SUR LES DEUX CHAMPS
            if (goAccChanged || goLieuChanged) {
              const wasAgentEnRoute = isAgentEnRoute(passenger);
              const updatedPassengerTemp = { ...passenger, goAcc: newGoAcc, goLieu: newGoLieu };
              const isNowAgentEnRoute = isAgentEnRoute(updatedPassengerTemp);
              
              // Déclencher l'événement d'animation si l'état de l'agent change
              if (!wasAgentEnRoute && isNowAgentEnRoute) {
                setTimeout(() => {
                  const event = new CustomEvent('agentStatusChanged', {
                    detail: {
                      passengerId: passenger.id,
                      idPax: passenger.idPax,
                      hasAgent: isNowAgentEnRoute,
                      isNew: true,
                      isRemoved: false,
                      agentName: getAgentName(updatedPassengerTemp),
                      changeSource: goAccChanged ? 'GO-ACC' : 'GO-LIEU'
                    }
                  });
                  window.dispatchEvent(event);
                  console.log(`🎬 Événement dispatché pour ${passenger.lastName} (${getAgentName(updatedPassengerTemp)})`);
                }, 100);
              }
            }
          }

          // ✅ MISE À JOUR DES DONNÉES VERS LA FEUILLE DE COMPTOIR
          if (passenger.selectedUuid) {
            try {
              updateSelectedPassenger(passenger.selectedUuid, { 
                goAcc: newGoAcc || '',
                goLieu: newGoLieu || '',
                departureTime: newDepartureTime || '',
                flightNumber: newFlightNumber || ''
              });
            } catch (_) {}
          }
          
          // ✅ RETOURNER LE PASSAGER AVEC TOUS LES CHAMPS MIS À JOUR
          return {
            ...passenger,
            goAcc: newGoAcc,
            goLieu: newGoLieu,
            departureTime: newDepartureTime,
            flightNumber: newFlightNumber,
            lastName: sheetEntry.lastName || passenger.lastName,
            firstName: sheetEntry.firstName || passenger.firstName
          };
        }
        
        return passenger;
      });
      
      if (hasChanges) {
        console.log("✅ Mise à jour des passagers avec changements");
        updatePassengers(updatedPassengers);
      } else {
        console.log("ℹ️ Aucun changement détecté");
      }
      
    } catch (error) {
      console.error("❌ Erreur rafraîchissement:", error);
    } finally {
      setIsRefreshing(false);
    }
  };


  // ✅ GESTIONNAIRE DE SÉLECTION INCHANGÉ (FONCTIONNALITÉS EXISTANTES CONSERVÉES)
  const handlePassengerSelect = async (passenger) => {
    if (passenger) {
      // ... tes logs + vérif doublon

      const now = new Date();
      const newPassenger = {
        ...passenger,
        id: `passenger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        addedAt: now.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }),
        isSkyPriority: false,
        goLieu: passenger.goLieu || '' // ✅ NOUVEAU: S'assurer que goLieu est inclus
      };

      try {
        const { uuid } = await appendSelectedPassenger(newPassenger);
        const withPersist = { ...newPassenger, selectedUuid: uuid };
        updatePassengers([...passengers, withPersist]);
      } catch (err) {
        console.error('❌ Echec append selected_pax:', err);
        return;
      }

      // ... animation éventuelle inchangée
    }
  };

  // ✅ GESTIONNAIRE SKYPRIORITY INCHANGÉ
  const handleToggleSkyPriority = (passengerId) => {
    const pax = passengers.find(p => p.id === passengerId);
    if (!pax) return;

    const newVal = !pax.isSkyPriority;
    const updated = passengers.map(p =>
      p.id === passengerId ? { ...p, isSkyPriority: newVal } : p
    );
    updatePassengers(updated);

    // push en arrière-plan vers la feuille
    if (pax.selectedUuid) {
      try {
        updateSelectedPassenger(pax.selectedUuid, { isSkyPriority: newVal });
      } catch (_) {}
    }
  };

  // ✅ GESTIONNAIRE DE SUPPRESSION INCHANGÉ
  const handleRemovePassenger = (passengerId) => {
    console.log("🗑️ Suppression du passager:", passengerId);
    const pax = passengers.find(p => p.id === passengerId);

    // UI immédiate
    const updated = passengers.filter(p => p.id !== passengerId);
    updatePassengers(updated);

    // Fire-and-forget (pas d'attente, pas d'erreur bloquante)
    if (pax?.selectedUuid) deleteRowByUuid(pax.selectedUuid);
  };

  // ✅ EFFET DE RAFRAÎCHISSEMENT AUTOMATIQUE INCHANGÉ
  useEffect(() => {
    if (passengers.length > 0) {
      console.log("🔄 Démarrage du rafraîchissement automatique");
      
      // Premier rafraîchissement
      setTimeout(refreshData, 2000);
      
      // Rafraîchissement périodique
      refreshIntervalRef.current = setInterval(refreshData, 10000);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [passengers.length]);

  // ✅ GESTIONNAIRE ASSISTANCE INCHANGÉ
  const handleMarkAsAssisted = (passengerId) => {
    console.log("✅ Marquage PMR assisté:", passengerId);
    const now = new Date();
    const updated = passengers.map(p =>
      p.id === passengerId ? { 
        ...p, 
        isAssisted: true,
        assistedAt: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      } : p
    );
    updatePassengers(updated);
    
    // Retirer automatiquement après 5 secondes
    setTimeout(() => {
      const filtered = passengers.filter(p => p.id !== passengerId);
      updatePassengers(filtered);
      console.log(`🗑️ Passager assisté retiré automatiquement: ${passengerId}`);
    }, 5000);
  };

  // ✅ TRI INCHANGÉ
  const sortedPassengers = [...passengers].sort((a, b) => {
    const timeA = extractTimeHHMM(a.departureTime);
    const timeB = extractTimeHHMM(b.departureTime);

    if (!timeA && !timeB) return 0;
    if (!timeA) return 1; // Les passagers sans heure passent après
    if (!timeB) return -1;

    const [hoursA, minutesA] = timeA.split(':').map(Number);
    const [hoursB, minutesB] = timeB.split(':').map(Number);

    const dateA = new Date();
    dateA.setHours(hoursA, minutesA, 0, 0);

    const dateB = new Date();
    dateB.setHours(hoursB, minutesB, 0, 0);

    return dateA - dateB; // Chronologique croissant
  });

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
          
          <SkyPriorityCounter>
            <FaCrown size={20} color="#FFD700" />
            <CountNumber>{skyPriorityCount}</CountNumber>
            <span>SkyPriority</span>
          </SkyPriorityCounter>
          
          <RefreshButton onClick={refreshData} disabled={isRefreshing}>
            <FaSyncAlt className={isRefreshing ? 'fa-spin' : ''} />
            {isRefreshing ? 'Synchronisation...' : 'Actualiser'}
          </RefreshButton>
        </SelectorSection>
      </ListHeader>
      
      {passengers.length > 0 ? (
        <ListContent>
          {sortedPassengers.map((passenger) => (
          <PassengerItem 
            key={passenger.id}
            passenger={passenger} 
            onToggleSkyPriority={handleToggleSkyPriority}
            onMarkAsAssisted={handleMarkAsAssisted}
            onRemove={handleRemovePassenger}
            extractDateTimeInfo={extractDateTimeInfo}
          />
          ))}
        </ListContent>
      ) : (
        <EmptyList>
          <EmptyText>Aucun passager PMR enregistré</EmptyText>
        </EmptyList>
      )}
    </ListContainer>
  );
};

export default PassengerList;