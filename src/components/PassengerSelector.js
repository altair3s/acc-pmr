import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// Composants stylisés
const SelectorContainer = styled.div`
  margin-bottom: 1.2rem;
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const SelectStyled = styled.select`
  appearance: none;
  background-color: #f8f9fa;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23495057' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  color: #495057;
  display: block;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 0.8rem 2.5rem 0.8rem 1rem;
  transition: all 0.2s ease-in-out;
  width: 100%;
  
  &:focus {
    border-color: #0056b3;
    box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.25);
    outline: none;
  }
  
  &:hover {
    border-color: #ced4da;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  color: #495057;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  
  &::before {
    content: "";
    width: 1.2rem;
    height: 1.2rem;
    margin-right: 0.75rem;
    border: 3px solid #e9ecef;
    border-top-color: #0056b3;
    border-radius: 50%;
    animation: spinner 0.8s linear infinite;
  }
  
  @keyframes spinner {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(220, 53, 69, 0.1);
  border-left: 4px solid #dc3545;
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
`;

// Fonction pour trier alphabétiquement par lastName
const sortByLastName = (a, b) => {
  const lastNameA = (a.lastName || '').toLowerCase();
  const lastNameB = (b.lastName || '').toLowerCase();
  
  // Tri principal par nom
  const nameComparison = lastNameA.localeCompare(lastNameB);
  
  // Si les noms sont identiques, trier par prénom
  if (nameComparison === 0) {
    const firstNameA = (a.firstName || '').toLowerCase();
    const firstNameB = (b.firstName || '').toLowerCase();
    return firstNameA.localeCompare(firstNameB);
  }
  
  return nameComparison;
};

// Composant principal
const PassengerSelector = ({ onSelect }) => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPassengerId, setSelectedPassengerId] = useState('');

  useEffect(() => {
    // Fonction pour charger les passagers depuis les données mockées
    const loadMockData = () => {
      console.log("Chargement des données de démo...");
      const mockData = [
        { 
          id: 'passenger-1',
          idMission: 'M12345',
          idPax: 'P001',
          statut: 'En attente',
          lastName: 'Dupont', 
          firstName: 'Jean', 
          status: 'WCHR',
          ssr2: 'BLND',
          terminalDepart: 'T2E',
          airline: 'Air France', 
          flightNumber: 'AF1234',
          destination: 'CDG',
          departureTime: '10:30',
          satelliteDepart: 'S3'
        },
        { 
          id: 'passenger-2',
          idMission: 'M67890',
          idPax: 'P002',
          statut: 'En attente',
          lastName: 'Martin', 
          firstName: 'Sophie', 
          status: 'WCHS',
          ssr2: '',
          terminalDepart: 'T2F',
          airline: 'Lufthansa', 
          flightNumber: 'LH5678',
          destination: 'FRA',
          departureTime: '14:15',
          satelliteDepart: 'S4'
        },
        { 
          id: 'passenger-3',
          idMission: 'M13579',
          idPax: 'P003',
          statut: 'En attente',
          lastName: 'Garcia', 
          firstName: 'Maria', 
          status: 'WCHC',
          ssr2: 'DEAF',
          terminalDepart: 'T2G',
          airline: 'Iberia', 
          flightNumber: 'IB9101',
          destination: 'MAD',
          departureTime: '16:45',
          satelliteDepart: 'S1'
        },
        { 
          id: 'passenger-4',
          idMission: 'M24680',
          idPax: 'P004',
          statut: 'En attente',
          lastName: 'Smith', 
          firstName: 'John', 
          status: 'WCHR',
          ssr2: '',
          terminalDepart: 'T2E',
          airline: 'British Airways', 
          flightNumber: 'BA1121',
          destination: 'LHR',
          departureTime: '18:00',
          satelliteDepart: 'S3'
        }
      ];
      
      // Trier les données par nom de famille
      const sortedData = [...mockData].sort(sortByLastName);
      setPassengers(sortedData);
      setLoading(false);
    };

    // Fonction pour charger les données depuis l'API Google Sheets
    const fetchFromAPI = async () => {
      try {
        // SOLUTION TEMPORAIRE: valeurs hardcodées pour le développement
        // IMPORTANT: À remplacer par les variables d'environnement en production
        const SHEET_ID = process.env.REACT_APP_SHEET_ID ;
        const SHEET_RANGE = process.env.REACT_APP_SHEET_RANGE;
        
        // ATTENTION: Remplacez cette valeur par votre clé API Google
        const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || 'VOTRE_CLE_API_ICI';
        
        console.log("Tentative de chargement depuis l'API...");
        console.log("API_KEY définie:", !!API_KEY && API_KEY !== 'VOTRE_CLE_API_ICI');
        
        if (!API_KEY || API_KEY === 'VOTRE_CLE_API_ICI') {
          console.warn("Clé API non définie, utilisation des données de démo à la place");
          loadMockData();
          return;
        }
        
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
        console.log("URL de l'API (partielle):", url.substring(0, url.indexOf('?')));
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error("Erreur de réponse API:", response.status, response.statusText);
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.values && Array.isArray(data.values)) {
          console.log(`${data.values.length} entrées trouvées dans la feuille`);

          const generateUniqueId = () => {
          return `passenger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
          
          // Adaptation selon votre format de Google Sheet
          // Id Mission,Id PAX départ,Statut,lastName,firstName,status,SSR2,Terminal départ,airline,flightNumber,destination,departureTime,Satellite Départ, GO-ACC
          const sheetPassengers = data.values.map((row, index) => ({
            id: generateUniqueId(),
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
            goAcc: row[13] || '',
            scanTime: new Date().toISOString()
          }));
          
          // Trier les passagers par nom de famille
          const sortedPassengers = [...sheetPassengers].sort(sortByLastName);
          setPassengers(sortedPassengers);
        } else {
          console.error("Format de données incorrect reçu de l'API", data);
          throw new Error("Format de données incorrect ou feuille vide");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des passagers:", error);
        console.warn("Utilisation des données de démo à la place");
        loadMockData();
      } finally {
        setLoading(false);
      }
    };

    // Essayer d'abord l'API, puis utiliser les données mockées en cas d'échec
    fetchFromAPI();
  }, []);

  const handleChange = (e) => {
    const passengerId = e.target.value;
    setSelectedPassengerId(passengerId);
    
    if (passengerId) {
      const selected = passengers.find(p => p.id === passengerId);
      if (selected && onSelect) onSelect(selected);
    } else if (onSelect) {
      onSelect(null);
    }
  };

  if (loading) {
    return (
      <LoadingIndicator>Chargement des passagers...</LoadingIndicator>
    );
  }

  return (
    <SelectorContainer>
      <SelectStyled
        value={selectedPassengerId}
        onChange={handleChange}
        aria-label="Sélectionner un passager"
      >
        <option value="">Sélectionner un passager</option>
        {passengers.map((passenger) => (
          <option key={passenger.id} value={passenger.id}>
            {passenger.lastName} {passenger.firstName} - {passenger.flightNumber} - {passenger.departureTime}
          </option>
        ))}
      </SelectStyled>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </SelectorContainer>
  );
};

PassengerSelector.propTypes = {
  onSelect: PropTypes.func.isRequired
};

export default PassengerSelector;