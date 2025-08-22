// Gestionnaire de déconnexion
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; // Import de la configuration Firebase
import PassengerList from './components/PassengerList';
import ScannerSimulator from './components/ScannerSimulator';
import TVDisplay from './components/TVDisplay';
import StatsPage from './components/StatsPage';
import LoginPage from './components/LoginPage';
import HelpModal from './components/HelpModal';
import FeedbackModal from './components/FeedbackModal';
import AddPassengerModal from './components/AddPassengerModal';
import emailjs from '@emailjs/browser';
// Importation des icônes
import { 
  FaUserFriends, 
  FaSignOutAlt,
  FaUser,
  FaSpinner,
  FaQuestionCircle,
  FaCommentDots,
  FaUserPlus
} from 'react-icons/fa';

// Styles globaux améliorés
const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #8b45ff;
    --primary-light: #6366f1;
    --primary-dark: #7c3aed;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --light-color: #f8fafc;
    --dark-color: #1e293b;
    --border-color: #e2e8f0;
    --border-radius: 0.75rem;
    --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    --transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #1e293b;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: var(--transition);
  }
  
  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }
`;

// Composant de chargement
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #8b45ff 0%, #6366f1 50%, #3b82f6 100%);
  color: white;
  gap: 1.5rem;
`;

const LoadingSpinner = styled.div`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.9;
`;

// Styled components pour le layout de l'application
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 1rem;
  background: rgba(139, 69, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(139, 69, 255, 0.2);
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.9rem;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: var(--transition);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 0.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

const NavButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--secondary-color);
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  transition: var(--transition);
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: rgba(139, 69, 255, 0.1);
    color: var(--primary-color);
    transform: translateY(-2px);
    
    &::before {
      left: 100%;
    }
  }
  
  &.active {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(139, 69, 255, 0.3);
  }
`;

const NavActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--secondary-color);
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  transition: var(--transition);
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
  background: none;
  border: none;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: rgba(139, 69, 255, 0.1);
    color: var(--primary-color);
    transform: translateY(-2px);
    
    &::before {
      left: 100%;
    }
  }
`;

const FeedbackNavButton = styled(NavActionButton)`
  &:hover {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
  }
`;

const AddPassengerNavButton = styled(NavActionButton)`
  &:hover {
    background: rgba(0, 123, 255, 0.1);
    color: #007bff;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const Footer = styled.footer`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--secondary-color);
  padding: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
`;

// Composant de navigation
const Navigation = ({ onOpenHelp, onOpenFeedback, onOpenAddPassenger }) => {
  const location = useLocation();
  
  return (
    <Nav>
      <NavButton to="/" className={location.pathname === '/' ? 'active' : ''}>
        <FaUserFriends size={16} /> Passagers
      </NavButton>
      
      <AddPassengerNavButton onClick={onOpenAddPassenger}>
        <FaUserPlus size={16} /> Ajouter passager
      </AddPassengerNavButton>
      
      <FeedbackNavButton onClick={onOpenFeedback}>
        <FaCommentDots size={16} /> Signaler
      </FeedbackNavButton>
      
      <NavActionButton onClick={onOpenHelp}>
        <FaQuestionCircle size={16} /> Aide
      </NavActionButton>
    </Nav>
  );
};

const generateUniqueId = () => {
  return `passenger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Composant principal
const App = () => {
  // États pour l'authentification
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // État pour stocker les passagers
  const [passengers, setPassengers] = useState([]);
  
  // États pour les modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAddPassengerModal, setShowAddPassengerModal] = useState(false);
  
  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  // Charger les données depuis le localStorage au démarrage (seulement si connecté)
  useEffect(() => {
    if (user) {
      const savedPassengers = localStorage.getItem(`pmr-passengers-${user.uid}`);
      if (savedPassengers) {
        try {
          setPassengers(JSON.parse(savedPassengers));
        } catch (error) {
          console.error('Erreur lors du chargement des passagers:', error);
        }
      }
    }
  }, [user]);
  
  // Sauvegarder les données dans le localStorage à chaque modification (avec uid utilisateur)
  useEffect(() => {
    if (user && passengers.length > 0) {
      localStorage.setItem(`pmr-passengers-${user.uid}`, JSON.stringify(passengers));
    }
  }, [passengers, user]);
  
  // Gestionnaire pour ajouter un passager depuis le scanner
  const handleScan = (newPassenger) => {
    const passengerWithTime = {
      ...newPassenger,
      addedAt: newPassenger.addedAt || new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    }
    const passengerWithConsistentId = {
    ...newPassenger,
    id: generateUniqueId(),
    addedAt: newPassenger.addedAt || new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
    // ✅ CORRECTION: Ne plus ajouter ici, laisser PassengerList gérer
    // Le scanner doit juste transmettre les données, pas les ajouter directement
    console.log("📱 Passager reçu du scanner:", newPassenger);
    // Pas d'ajout ici - sera géré par PassengerList via onScan

     setPassengers(prevPassengers => [...prevPassengers, passengerWithConsistentId, passengerWithTime]);
  };
  
  // Gestionnaire d'ajout de passager manuel
  const handleAddPassenger = (newPassengerData) => {
    console.log("➕ Ajout passager manuel:", newPassengerData);
    
    const now = new Date();
    const newPassenger = {
      ...newPassengerData,
      id: `passenger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedAt: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    
    setPassengers(prevPassengers => [...prevPassengers, newPassenger]);
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPassengers([]); // Vider les données locales
      localStorage.getItem(`pmr-passengers-${user?.uid}`);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Gestionnaire de feedback avec EmailJS
  const handleSubmitFeedback = async (feedbackData) => {
    console.log("💬 Feedback soumis:", feedbackData);
    
    try {
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
      
      if (!serviceId || !templateId || !publicKey) {
        throw new Error('Configuration EmailJS incomplète');
      }
      
      const templateParams = {
        to_email: 'support-pmr@votre-compagnie.com',
        feedback_type: feedbackData.type,
        message: feedbackData.description,
        user_email: feedbackData.userEmail || user.email,
        timestamp: new Date(feedbackData.timestamp).toLocaleString('fr-FR'),
        subject: `[PMR] ${feedbackData.type} - Nouveau signalement`
      };
      
      const result = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log('✅ Email envoyé avec succès:', result);
      alert('✅ Votre signalement a été envoyé avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur envoi EmailJS:', error);
      
      const subject = encodeURIComponent(`[PMR] ${feedbackData.type} - Signalement`);
      const body = encodeURIComponent(`
Type: ${feedbackData.type}
Date: ${new Date(feedbackData.timestamp).toLocaleString('fr-FR')}

Description:
${feedbackData.description}

Contact: ${feedbackData.userEmail || user.email}
      `);
      
      window.open(`mailto:support-pmr@votre-compagnie.com?subject=${subject}&body=${body}`);
      alert('⚠️ Votre client email va s\'ouvrir avec le signalement pré-rempli.');
    }
  };
  
  // Gestionnaire de succès de connexion
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };
  
  // Affichage du loader pendant la vérification de l'auth
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner>
          <FaSpinner size={32} />
        </LoadingSpinner>
        <LoadingText>Vérification de l'authentification...</LoadingText>
      </LoadingContainer>
    );
  }
  
  // Si l'utilisateur n'est pas connecté, afficher la page de login
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }
  
  // Application principale pour les utilisateurs connectés
  return (
    <Router>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <HeaderContent>
            <Logo>
              <FaUserFriends size={24} />
              PMR Assistant
            </Logo>
            
            <Navigation 
              onOpenHelp={() => setShowHelpModal(true)}
              onOpenFeedback={() => setShowFeedbackModal(true)}
              onOpenAddPassenger={() => setShowAddPassengerModal(true)}
            />
            
            <HeaderActions>
              <UserInfo>
                <FaUser size={14} />
                {user.displayName || user.email}
              </UserInfo>
              
              <LogoutButton onClick={handleLogout}>
                <FaSignOutAlt size={14} />
                Déconnexion
              </LogoutButton>
            </HeaderActions>
          </HeaderContent>
        </Header>
        
        <MainContent>
          <Routes>
            {/* Page principale - Liste des passagers */}
            <Route 
              path="/" 
              element={<PassengerList passengers={passengers} setPassengers={setPassengers} />} 
            />
            
            {/* Simulateur de scanner */}
            <Route 
              path="/scanner" 
              element={<ScannerSimulator passengers={passengers} setPassengers={setPassengers} onScan={handleScan} />} 
            />
            
            {/* Affichage pour TV */}
            <Route 
              path="/tv" 
              element={<TVDisplay passengers={passengers} />} 
            />
            
            {/* Page de statistiques - Passer les passagers en props */}
            <Route 
              path="/stats" 
              element={<StatsPage passengersFromList={passengers} />} 
            />
          </Routes>
        </MainContent>
        
        <Footer>
          &copy; {new Date().getFullYear()} Altair Airport Solutions - Système d'assistance PMR
        </Footer>
        
        {/* Modals */}
        <HelpModal 
          isOpen={showHelpModal} 
          onClose={() => setShowHelpModal(false)} 
        />
        
        <FeedbackModal 
          isOpen={showFeedbackModal} 
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleSubmitFeedback}
        />
        
        <AddPassengerModal 
          isOpen={showAddPassengerModal} 
          onClose={() => setShowAddPassengerModal(false)}
          onSubmit={handleAddPassenger}
        />
      </AppContainer>
    </Router>
  );
};

export default App;