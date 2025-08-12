import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import * as echarts from 'echarts';
import { 
  FaChartBar, 
  FaUserFriends, 
  FaClock, 
  FaPlane, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Couleurs
const COLORS = {
  primary: '#0056b3',
  secondary: '#6c757d',
  success: '#198754',
  warning: '#ffc107',
  danger: '#dc3545',
  light: '#f8f9fa',
  dark: '#343a40',
  wchr: '#198754',
  wchs: '#ffc107',
  wchc: '#dc3545',
  other: '#6c757d'
};

// Styles pour la page de statistiques
const StatsContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  animation: ${fadeIn} 0.5s ease-out;
`;

const StatsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const HeaderTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LastRefresh = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
`;

// Cartes récapitulatives
const SummaryCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: ${fadeIn} 0.5s ease-out;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.secondary};
  margin: 0;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background-color: ${props => props.color || COLORS.primary};
  opacity: 0.5;
  border-radius: 12px;
  color: white;
`;

const CardValue = styled.div`
  font-size: 2.5rem;
  font-weight: 600;
  color: ${props => props.color || COLORS.primary};
  line-height: 1;
  margin-bottom: 0.5rem;
`;

const CardTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.isUp ? COLORS.success : props.isDown ? COLORS.danger : COLORS.secondary};
`;

// Grille de graphiques
const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ChartTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.dark};
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
`;

// Message quand les statistiques sont vides
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
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
  }
`;

// Fonction utilitaire pour extraire l'heure au format HH:MM
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

const StatsPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRefreshTime, setLastRefreshTime] = useState('');
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs pour les charts ECharts
  const hourChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const airlineChartRef = useRef(null);
  const terminalChartRef = useRef(null);
  
  // Mettre à jour l'heure actuelle
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // Format de l'heure pour affichage
      const options = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      };
      setLastRefreshTime(now.toLocaleString('fr-FR', options));
    };
    
    // Mettre à jour l'heure immédiatement puis toutes les 30 secondes
    updateTime();
    const interval = setInterval(updateTime, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Charger les données depuis l'API Google Sheets
  useEffect(() => {
    const fetchData = async () => {
      try {
        // SOLUTION TEMPORAIRE: valeurs hardcodées pour le développement
        // IMPORTANT: À remplacer par les variables d'environnement en production
        const SHEET_ID = process.env.REACT_APP_SHEET_ID || '1gNR8Xy6xoqJiJQBm-aizhwAtI6qdqjEGUcyL56lFj1U';
        const SHEET_RANGE = process.env.REACT_APP_SHEET_RANGE || 'OzionR!A2:M';
        
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
          
          // Adaptation selon votre format de Google Sheet
          // Id Mission,Id PAX départ,Statut,lastName,firstName,status,SSR2,Terminal départ,airline,flightNumber,destination,departureTime,Satellite Départ
          const sheetPassengers = data.values.map((row, index) => ({
            id: `passenger-${index}`,
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
            scanTime: new Date().toISOString() // Simuler une heure de scan pour le calcul du temps moyen
          }));
          
          setPassengers(sheetPassengers);
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

    // Fonction pour charger les données mockées si l'API ne fonctionne pas
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
          satelliteDepart: 'S3',
          scanTime: new Date().toISOString()
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
          satelliteDepart: 'S4',
          scanTime: new Date().toISOString()
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
          satelliteDepart: 'S1',
          scanTime: new Date().toISOString()
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
          satelliteDepart: 'S3',
          scanTime: new Date().toISOString()
        }
      ];
      
      setPassengers(mockData);
      setLoading(false);
    };

    fetchData();
  }, []);
  
  // Filtrer les passagers actifs
  const activePassengers = passengers.filter(p => !isFlightPassed(p.departureTime, currentTime));
  
  // Calculer les statistiques
  const calculateStats = () => {
    if (!passengers.length) return null;
    
    // Statistiques par statut
    const statusCounts = {
      'WCHR': 0,
      'WCHS': 0,
      'WCHC': 0,
      'Autre': 0
    };
    
    const airlineCounts = {};
    const destinationCounts = {};
    const terminalCounts = {};
    const hourCounts = Array(24).fill(0);
    
    let totalWithStatus = 0;
    let totalWithAirline = 0;
    let totalWithDestination = 0;
    let totalWithTerminal = 0;
    
    passengers.forEach(passenger => {
      // Compter par statut PMR
      const status = passenger.status;
      if (status) {
        if (['WCHR', 'WCHS', 'WCHC'].includes(status)) {
          statusCounts[status]++;
        } else {
          statusCounts['Autre']++;
        }
        totalWithStatus++;
      }
      
      // Compter par compagnie
      const airline = passenger.airline;
      if (airline) {
        airlineCounts[airline] = (airlineCounts[airline] || 0) + 1;
        totalWithAirline++;
      }
      
      // Compter par destination
      const destination = passenger.destination;
      if (destination) {
        destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
        totalWithDestination++;
      }
      
      // Compter par terminal de départ
      const terminal = passenger.terminalDepart;
      if (terminal) {
        terminalCounts[terminal] = (terminalCounts[terminal] || 0) + 1;
        totalWithTerminal++;
      }
      
      // Compter par heure de départ
      const timeHHMM = extractTimeHHMM(passenger.departureTime);
      if (timeHHMM) {
        const hour = parseInt(timeHHMM.split(':')[0]);
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          hourCounts[hour]++;
        }
      }
    });
    
    // Convertir les comptages en arrays pour le tri et calculer les pourcentages
    const statusStats = Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ 
        status, 
        count,
        percentage: totalWithStatus ? Math.round((count / totalWithStatus) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    const airlineStats = Object.entries(airlineCounts)
      .map(([airline, count]) => ({ 
        airline, 
        count,
        percentage: totalWithAirline ? Math.round((count / totalWithAirline) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    const destinationStats = Object.entries(destinationCounts)
      .map(([destination, count]) => ({ 
        destination, 
        count,
        percentage: totalWithDestination ? Math.round((count / totalWithDestination) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    const terminalStats = Object.entries(terminalCounts)
      .map(([terminal, count]) => ({ 
        terminal, 
        count,
        percentage: totalWithTerminal ? Math.round((count / totalWithTerminal) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    // Statistiques par heure
    const hourStats = hourCounts.map((count, hour) => ({
      hour,
      count
    }));
    
    return {
      totalPassengers: passengers.length,
      activePassengers: activePassengers.length,
      statusStats,
      airlineStats,
      destinationStats,
      terminalStats,
      hourStats
    };
  };
  
  // Initialiser et mettre à jour les graphiques ECharts
  useEffect(() => {
    if (loading || !passengers.length) return;
    
    const stats = calculateStats();
    if (!stats) return;
    
    // Graphique des heures
    if (hourChartRef.current) {
      const hourChart = echarts.init(hourChartRef.current);
      
      // Simuler des données plus variées pour la démo
      const demoData = Array(24).fill(0).map((_, i) => {
        if (i >= 6 && i <= 23) {
          // Heures de journée: activité variable
          return Math.floor(Math.random() * 30) + (i >= 10 && i <= 18 ? 40 : 5);
        } else {
          // Nuit: peu d'activité
          return Math.floor(Math.random() * 5);
        }
      });
      
      const hourChartOption = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} passagers'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: Array.from({ length: 24 }).map((_, i) => `${i}h`),
          axisLabel: {
            rotate: 45,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          minInterval: 1
        },
        series: [{
          data: Array.from({ length: 24 }).map((_, hour) => {
            // En mode démo, utiliser des données simulées
            if (process.env.NODE_ENV === 'development' && stats.hourStats.every(h => h.count < 3)) {
              return demoData[hour];
            }
            // Sinon utiliser les données réelles
            const hourData = stats.hourStats.find(h => h.hour === hour);
            return hourData ? hourData.count : 0;
          }),
          type: 'bar',
          itemStyle: {
            color: COLORS.primary
          }
        }]
      };
      
      hourChart.setOption(hourChartOption);
      
      // Redimensionnement
      const resizeChart = () => {
        hourChart.resize();
      };
      window.addEventListener('resize', resizeChart);
      
      return () => {
        window.removeEventListener('resize', resizeChart);
        hourChart.dispose();
      };
    }
  }, [loading, passengers, hourChartRef]);
  
  // Graphique du statut PMR
  useEffect(() => {
    if (loading || !passengers.length || !statusChartRef.current) return;
    
    const stats = calculateStats();
    if (!stats) return;
    
    const statusChart = echarts.init(statusChartRef.current);
    
    // Données de démo pour une meilleure représentation
    const demoData = [
      { name: 'WCHR', value: 641, percentage: 54 },
      { name: 'WCHS', value: 466, percentage: 39 },
      { name: 'Autre', value: 47, percentage: 4 },
      { name: 'WCHC', value: 41, percentage: 3 }
    ];
    
    const useData = process.env.NODE_ENV === 'development' && stats.statusStats.length < 3 
      ? demoData 
      : stats.statusStats;
    
    const statusChartOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        data: useData.map(stat => stat.status || stat.name)
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: useData.map(stat => ({
          name: stat.status || stat.name,
          value: stat.count || stat.value,
          itemStyle: {
            color: (stat.status || stat.name) === 'WCHR' ? COLORS.wchr :
                   (stat.status || stat.name) === 'WCHS' ? COLORS.wchs :
                   (stat.status || stat.name) === 'WCHC' ? COLORS.wchc :
                   COLORS.other
          }
        }))
      }]
    };
    
    statusChart.setOption(statusChartOption);
    
    // Redimensionnement
    const resizeChart = () => {
      statusChart.resize();
    };
    window.addEventListener('resize', resizeChart);
    
    return () => {
      window.removeEventListener('resize', resizeChart);
      statusChart.dispose();
    };
  }, [loading, passengers, statusChartRef]);
  
  // Graphique des compagnies
  useEffect(() => {
    if (loading || !passengers.length || !airlineChartRef.current) return;
    
    const stats = calculateStats();
    if (!stats) return;
    
    const airlineChart = echarts.init(airlineChartRef.current);
    
    // Données de démo
    const demoAirlines = [
      { airline: 'Air France', count: 367, percentage: 31 },
      { airline: 'Lufthansa', count: 219, percentage: 18 },
      { airline: 'British Airways', count: 186, percentage: 15 },
      { airline: 'Iberia', count: 124, percentage: 10 },
      { airline: 'KLM', count: 98, percentage: 8 }
    ];
    
    const top5Airlines = process.env.NODE_ENV === 'development' && stats.airlineStats.length < 3
      ? demoAirlines
      : stats.airlineStats.slice(0, 5);
    
    const airlineChartOption = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} passagers'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        minInterval: 1
      },
      yAxis: {
        type: 'category',
        data: top5Airlines.map(airline => airline.airline),
        axisLabel: {
          interval: 0,
          rotate: 0
        }
      },
      series: [{
        data: top5Airlines.map(airline => airline.count),
        type: 'bar',
        itemStyle: {
          color: COLORS.primary
        }
      }]
    };
    
    airlineChart.setOption(airlineChartOption);
    
    // Redimensionnement
    const resizeChart = () => {
      airlineChart.resize();
    };
    window.addEventListener('resize', resizeChart);
    
    return () => {
      window.removeEventListener('resize', resizeChart);
      airlineChart.dispose();
    };
  }, [loading, passengers, airlineChartRef]);
  
  // Graphique des terminaux
  useEffect(() => {
    if (loading || !passengers.length || !terminalChartRef.current) return;
    
    const stats = calculateStats();
    if (!stats) return;
    
    const terminalChart = echarts.init(terminalChartRef.current);
    
    // Données de démo
    const demoTerminals = [
      { terminal: 'Terminal 1', count: 432, percentage: 36 },
      { terminal: 'Terminal 2E', count: 321, percentage: 27 },
      { terminal: 'Terminal 2F', count: 186, percentage: 15 },
      { terminal: 'Terminal 2G', count: 124, percentage: 10 },
      { terminal: 'Terminal 3', count: 98, percentage: 8 }
    ];
    
    const top5Terminals = process.env.NODE_ENV === 'development' && stats.terminalStats.length < 3
      ? demoTerminals
      : stats.terminalStats.slice(0, 5);
    
    const terminalChartOption = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} passagers'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        minInterval: 1
      },
      yAxis: {
        type: 'category',
        data: top5Terminals.map(terminal => terminal.terminal),
        axisLabel: {
          interval: 0,
          rotate: 0
        }
      },
      series: [{
        data: top5Terminals.map(terminal => terminal.count),
        type: 'bar',
        itemStyle: {
          color: '#9C27B0'
        }
      }]
    };
    
    terminalChart.setOption(terminalChartOption);
    
    // Redimensionnement
    const resizeChart = () => {
      terminalChart.resize();
    };
    window.addEventListener('resize', resizeChart);
    
    return () => {
      window.removeEventListener('resize', resizeChart);
      terminalChart.dispose();
    };
  }, [loading, passengers, terminalChartRef]);
  
  if (loading) {
    return (
      <StatsContainer>
        <StatsHeader>
          <HeaderTitle>
            <FaChartBar size={28} />
            Statistiques PMR
          </HeaderTitle>
        </StatsHeader>
        <EmptyMessage>
          <div>Chargement des données...</div>
        </EmptyMessage>
      </StatsContainer>
    );
  }
  
  const stats = calculateStats();
  
  if (!stats) {
    return (
      <StatsContainer>
        <StatsHeader>
          <HeaderTitle>
            <FaChartBar size={28} />
            Statistiques PMR
          </HeaderTitle>
          <LastRefresh>
            <FaCalendarAlt size={14} />
            Dernière mise à jour: {lastRefreshTime}
          </LastRefresh>
        </StatsHeader>
        
        <EmptyMessage>
          <FaChartBar size={48} />
          <h2>Aucune donnée disponible pour les statistiques</h2>
          <p>La feuille Google Sheet est vide ou inaccessible</p>
        </EmptyMessage>
      </StatsContainer>
    );
  }
  
  return (
    <StatsContainer>
      <StatsHeader>
        <HeaderTitle>
          <FaChartBar size={28} />
          Statistiques PMR
        </HeaderTitle>
        <LastRefresh>
          <FaCalendarAlt size={14} />
          Dernière mise à jour: {lastRefreshTime}
        </LastRefresh>
      </StatsHeader>
      
      {/* Cartes récapitulatives */}
      <SummaryCardsGrid>
        <SummaryCard>
          <CardHeader>
            <CardTitle>Total des passagers</CardTitle>
            <CardIcon color={COLORS.primary}>
              <FaUserFriends size={24} />
            </CardIcon>
          </CardHeader>
          <CardValue color={COLORS.primary}>{stats.totalPassengers}</CardValue>
        </SummaryCard>
        
        <SummaryCard>
          <CardHeader>
            <CardTitle>Passagers en attente d'assistance</CardTitle>
            <CardIcon color={COLORS.success}>
              <FaUserFriends size={24} />
            </CardIcon>
          </CardHeader>
          <div style={{ display: 'fl ex', flexDirection: 'column' }}>
            <CardValue color={COLORS.success}>{stats.activePassengers}</CardValue>
            <CardTrend isUp={stats.activePassengers > stats.totalPassengers / 2}>
              {stats.activePassengers > stats.totalPassengers / 2 ? <FaArrowUp /> : <FaArrowDown />}
              {Math.round((stats.activePassengers / stats.totalPassengers) * 100)}% du total
            </CardTrend>
          </div>
        </SummaryCard>
      </SummaryCardsGrid>
      
      {/* Graphiques principaux */}
      <ChartsGrid>
        {/* Distribution par heure */}
        <ChartCard>
          <ChartTitle>
            <FaClock size={18} />
            Distribution par heure de départ
          </ChartTitle>
          <ChartContainer ref={hourChartRef} />
        </ChartCard>
        
        {/* Distribution par statut */}
        <ChartCard>
          <ChartTitle>
            <FaUserFriends size={18} />
            Distribution par statut
          </ChartTitle>
          <ChartContainer ref={statusChartRef} />
        </ChartCard>
        
        {/* Top compagnies aériennes */}
        <ChartCard>
          <ChartTitle>
            <FaPlane size={18} />
            Top compagnies aériennes
          </ChartTitle>
          <ChartContainer ref={airlineChartRef} />
        </ChartCard>
        
        {/* Distribution par terminal */}
        <ChartCard>
          <ChartTitle>
            <FaMapMarkerAlt size={18} />
            Distribution par terminal
          </ChartTitle>
          <ChartContainer ref={terminalChartRef} />
        </ChartCard>
      </ChartsGrid>
    </StatsContainer>
  );
};

export default StatsPage;