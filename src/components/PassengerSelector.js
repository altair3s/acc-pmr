import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// Styled Components
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

// Fonction utilitaire pour analyser les données de la Google Sheet
const parseSheetData = (values) => {
  if (!values || !Array.isArray(values) || values.length === 0) {
    return [];
  }

  console.log("📊 ANALYSE DES DONNÉES Google Sheet:");
  console.log("Nombre total de lignes:", values.length);
  console.log("Première ligne (en-têtes):", values[0]);
  console.log("Deuxième ligne (exemple):", values[1]);
  console.log("Troisième ligne (exemple):", values[2]);

  const passengers = [];
  
  // Commencer à partir de la ligne 1 (ignorer les en-têtes)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    
    // Vérifier si c'est une ligne avec des points-virgules dans une seule cellule
    let processedRow = row;
    if (row.length === 1 && String(row[0]).includes(';')) {
      processedRow = String(row[0]).split(';').map(cell => cell.trim());
      console.log(`🔧 Ligne ${i + 1} divisée (points-virgules):`, processedRow);
    }
    
    // Vérifier qu'on a assez de colonnes
    if (processedRow.length >= 6) {
      const passenger = {
        id: `passenger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        // Structure: Id Pax D | Nom | Prénom | Num Vol D | STD | GO-ACC | SSR1 | Terminal D
        idPax: String(processedRow[0] || '').trim(),
        lastName: String(processedRow[1] || '').trim(),
        firstName: String(processedRow[2] || '').trim(),
        flightNumber: String(processedRow[3] || '').trim(),
        departureTime: String(processedRow[4] || '').trim(),
        goAcc: String(processedRow[5] || '').trim(),
        ssr1: String(processedRow[6] || '').trim(),
        terminalDepart: String(processedRow[7] || '').trim(),
        status: String(processedRow[6] || 'WCHR').trim(), // Utiliser SSR1 comme status
        airline: '', // Pas disponible
        destination: '' // Pas disponible
      };
      
      // Log pour les passagers avec certains noms (debug)
      if (passenger.lastName && (
        passenger.lastName.toUpperCase().includes('AWAD') ||
        passenger.lastName.toUpperCase().includes('FRANCO') ||
        passenger.lastName.toUpperCase().includes('MULLER')
      )) {
        console.log(`🎯 Passager trouvé: ${passenger.lastName}`, {
          ligne: i + 1,
          rowOriginal: row,
          rowProcessed: processedRow,
          idPax: passenger.idPax,
          goAcc: `"${passenger.goAcc}"`,
          ssr1: `"${passenger.ssr1}"`
        });
      }
      
      passengers.push(passenger);
    }
  }
  
  console.log(`✅ Total passagers traités: ${passengers.length}`);
  return passengers;
};

// Fonction de tri alphabétique
const sortByLastName = (a, b) => {
  const lastNameA = (a.lastName || '').toLowerCase();
  const lastNameB = (b.lastName || '').toLowerCase();
  
  const nameComparison = lastNameA.localeCompare(lastNameB);
  
  if (nameComparison === 0) {
    const firstNameA = (a.firstName || '').toLowerCase();
    const firstNameB = (b.firstName || '').toLowerCase();
    return firstNameA.localeCompare(firstNameB);
  }
  
  return nameComparison;
};

const PassengerSelector = ({ onSelect }) => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPassengerId, setSelectedPassengerId] = useState('');

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        // Configuration
        const SHEET_ID = process.env.REACT_APP_SHEET_ID || '1p5Pbkam5yhXMcA7HoaksPlslf9Y9Z8X9ZLFLpUz-r_w';
        const SHEET_RANGE = process.env.REACT_APP_SHEET_RANGE || 'Jalons!A1:H5000';
        const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
        
        console.log("🔧 PassengerSelector Configuration:", {
          SHEET_ID,
          SHEET_RANGE,
          API_KEY_DEFINED: !!API_KEY
        });
        
        if (!API_KEY) {
          throw new Error("Clé API Google non définie");
        }
        
        // Appel API
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Traitement des données
        const passengersData = parseSheetData(data.values);
        const sortedPassengers = [...passengersData].sort(sortByLastName);
        
        setPassengers(sortedPassengers);
        setError(null);
        
      } catch (err) {
        console.error("❌ Erreur PassengerSelector:", err);
        setError(err.message);
        setPassengers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPassengers();
  }, []);

  const handleChange = (e) => {
    const passengerId = e.target.value;
    setSelectedPassengerId(passengerId);
    
    if (passengerId) {
      const selected = passengers.find(p => p.id === passengerId);
      if (selected && onSelect) {
        console.log("✅ Passager sélectionné:", {
          nom: `${selected.lastName} ${selected.firstName}`,
          idPax: selected.idPax,
          goAcc: `"${selected.goAcc}"`,
          ssr1: `"${selected.ssr1}"`
        });
        onSelect(selected);
      }
    } else if (onSelect) {
      onSelect(null);
    }
  };

  if (loading) {
    return <LoadingIndicator>Chargement des passagers...</LoadingIndicator>;
  }

  if (error) {
    return <ErrorMessage>Erreur: {error}</ErrorMessage>;
  }

  return (
    <SelectorContainer>
  <SelectStyled
    value={selectedPassengerId}
    onChange={handleChange}
    aria-label="Sélectionner un passager"
  >
    <option value="">
      Sélectionner un passager ({passengers.length})
    </option>
    {passengers.map((passenger) => (
      <option key={passenger.id} value={passenger.id}>
        {passenger.lastName} {passenger.firstName} - {passenger.flightNumber} - {passenger.departureTime}
      </option>
    ))}
  </SelectStyled>
</SelectorContainer>

  );
};

PassengerSelector.propTypes = {
  onSelect: PropTypes.func.isRequired
};

export default PassengerSelector;