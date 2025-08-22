import React, { useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { FaBarcode, FaPlus, FaRandom } from 'react-icons/fa';

const ScannerContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  margin: 1rem auto;
  max-width: 1200px;
`;

const Title = styled.h3`
  color: var(--primary-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(0, 86, 179, 0.25);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23212529' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(0, 86, 179, 0.25);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #004494;
  }

  &:disabled {
    background-color: var(--secondary-color);
    cursor: not-allowed;
  }
`;

const RandomButton = styled(Button)`
  background-color: var(--secondary-color);

  &:hover {
    background-color: #5a6268;
  }
`;

// Sample data for random passenger generation
const airlines = ['AF', 'LH', 'BA', 'KL', 'IB', 'AZ', 'SN', 'LX', 'OS', 'TP'];
const destinations = ['CDG', 'LHR', 'FRA', 'AMS', 'MAD', 'FCO', 'BRU', 'ZRH', 'VIE', 'LIS'];
const statuses = ['WCHR', 'WCHS', 'WCHC', 'DEAF', 'BLIND'];
const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Isabelle', 'François', 'Claire', 'Michel', 'Anne'];
const lastNames = ['Dupont', 'Martin', 'Bernard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre'];

const ScannerSimulator = ({ passengers, setPassengers }) => {
  const [formData, setFormData] = useState({
    airline: '',
    flightNumber: '',
    departureTime: '',
    destination: '',
    lastName: '',
    firstName: '',
    status: 'WCHR',
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Generate random passenger data
  const generateRandomPassenger = () => {
    // Generate random departure time (between now and 6 hours from now)
    const now = new Date();
    const randomMinutes = Math.floor(Math.random() * 360); // 0 to 360 minutes (6 hours)
    const departureTime = new Date(now.getTime() + randomMinutes * 60000);
    
    // Format departure time for input field
    const formattedDepartureTime = departureTime.toISOString().slice(0, 16);
    
    // Generate random flight number
    const randomFlightNumber = Math.floor(Math.random() * 9000) + 1000; // 1000 to 9999
    
    // Set random passenger data
    setFormData({
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      flightNumber: randomFlightNumber.toString(),
      departureTime: formattedDepartureTime,
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create new passenger object
    const newPassenger = {
      id: uuidv4(),
      scanTime: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      ...formData
    };
    
    // Call onScan function to add new passenger
 setPassengers(prevPassengers => [...prevPassengers, newPassenger]);
    
    // Reset form
    setFormData({
      airline: '',
      flightNumber: '',
      departureTime: '',
      destination: '',
      lastName: '',
      firstName: '',
      status: 'WCHR',
    });
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.airline &&
      formData.flightNumber &&
      formData.departureTime &&
      formData.destination &&
      formData.lastName &&
      formData.firstName
    );
  };

  return (
    <ScannerContainer>
      <Title>
        <FaBarcode />
        Simulateur de scanner de carte d'embarquement
      </Title>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="airline">Compagnie</Label>
          <Input
            type="text"
            id="airline"
            name="airline"
            value={formData.airline}
            onChange={handleChange}
            placeholder="ex: AF"
            maxLength="2"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="flightNumber">N° Vol</Label>
          <Input
            type="text"
            id="flightNumber"
            name="flightNumber"
            value={formData.flightNumber}
            onChange={handleChange}
            placeholder="ex: 1234"
            maxLength="4"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="departureTime">Heure de départ</Label>
          <Input
            type="datetime-local"
            id="departureTime"
            name="departureTime"
            value={formData.departureTime}
            onChange={handleChange}
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="destination">Destination</Label>
          <Input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="ex: CDG"
            maxLength="3"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="lastName">Nom</Label>
          <Input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="ex: Dupont"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="ex: Jean"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="status">Statut</Label>
          <Select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="WCHR">WCHR</option>
            <option value="WCHS">WCHS</option>
            <option value="WCHC">WCHC</option>
            <option value="DEAF">DEAF</option>
            <option value="BLIND">BLIND</option>
          </Select>
        </FormGroup>
        
        <ButtonGroup>
          <Button type="submit" disabled={!isFormValid()}>
            <FaPlus />
            Ajouter passager
          </Button>
          <RandomButton type="button" onClick={generateRandomPassenger}>
            <FaRandom />
            Générer aléatoire
          </RandomButton>
        </ButtonGroup>
      </Form>
    </ScannerContainer>
  );
};

export default ScannerSimulator;
