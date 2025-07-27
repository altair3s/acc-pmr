// LoginPage.js - Page de connexion avec Firebase
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase'; // Import corrigé
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaGoogle,
  FaPlane,
  FaUserPlus,
  FaSignInAlt,
  FaKey,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaCog
} from 'react-icons/fa';

// Animations sophistiquées
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(1deg); }
  66% { transform: translateY(5px) rotate(-1deg); }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(139, 69, 255, 0.3), 
                0 0 40px rgba(139, 69, 255, 0.15);
  }
  50% { 
    box-shadow: 0 0 30px rgba(139, 69, 255, 0.5), 
                0 0 60px rgba(139, 69, 255, 0.25);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Conteneur principal
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  background-size: 400% 400%;
  animation: ${shimmer} 15s ease infinite;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at bottom right, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

// Éléments de décoration flottants
const FloatingElement = styled.div`
  position: absolute;
  opacity: 0.1;
  color: white;
  font-size: ${props => props.size || '2rem'};
  animation: ${float} ${props => props.duration || '6s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  top: ${props => props.top || '20%'};
  left: ${props => props.left || '10%'};
`;

// Carte de connexion ultra-moderne
const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15),
              0 8px 32px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.6);
  animation: ${fadeInUp} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: ${shimmer} 3s infinite;
  }
`;

// Header de la carte
const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const LogoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #8b45ff 0%, #6366f1 50%, #3b82f6 100%);
  border-radius: 20px;
  color: white;
  margin-right: 1rem;
  box-shadow: 0 8px 25px rgba(139, 69, 255, 0.4);
  animation: ${pulseGlow} 4s ease-in-out infinite;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
    animation: ${float} 6s ease-in-out infinite;
  }
`;

const AppTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.02em;
`;

const AppSubtitle = styled.p`
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
  margin: 0.5rem 0 0 0;
`;

const WelcomeText = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const WelcomeSubtext = styled.p`
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
  font-weight: 500;
`;

// Alerte de configuration Firebase
const ConfigAlert = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #dc2626;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

// Formulaire
const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  z-index: 2;
  transition: all 0.3s ease;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  &:focus {
    outline: none;
    border-color: #8b45ff;
    box-shadow: 0 0 0 4px rgba(139, 69, 255, 0.1);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.95);
  }
  
  &:focus + ${InputIcon} {
    color: #8b45ff;
    transform: scale(1.1);
  }
  
  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  z-index: 2;
  
  &:hover {
    color: #64748b;
    background: rgba(100, 116, 139, 0.1);
  }
`;

// Messages d'erreur et de succès
const Message = styled.div`
  padding: 1rem 1.2rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  animation: ${fadeInUp} 0.3s ease-out;
  
  ${props => props.type === 'error' && `
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.2);
  `}
  
  ${props => props.type === 'success' && `
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.2);
  `}
`;

// Boutons
const Button = styled.button`
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:not(:disabled):hover {
    transform: translateY(-3px);
  }
  
  &:not(:disabled):active {
    transform: translateY(-1px);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #8b45ff 0%, #6366f1 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(139, 69, 255, 0.3);
  
  &:not(:disabled):hover {
    box-shadow: 0 8px 30px rgba(139, 69, 255, 0.4);
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.9);
  color: #475569;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  
  &:not(:disabled):hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const GoogleButton = styled(Button)`
  background: linear-gradient(135deg, #ea4335 0%, #d33b2c 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(234, 67, 53, 0.3);
  
  &:not(:disabled):hover {
    box-shadow: 0 8px 30px rgba(234, 67, 53, 0.4);
  }
`;

// Liens et textes
const LinkButton = styled.button`
  background: none;
  border: none;
  color: #8b45ff;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(139, 69, 255, 0.1);
    transform: translateY(-1px);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  }
  
  span {
    color: #94a3b8;
    font-weight: 500;
    font-size: 0.9rem;
    white-space: nowrap;
  }
`;

const ToggleText = styled.p`
  text-align: center;
  margin: 1.5rem 0 0 0;
  color: #64748b;
  font-size: 0.9rem;
  
  button {
    color: #8b45ff;
    background: none;
    border: none;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    
    &:hover {
      color: #6366f1;
    }
  }
`;

const LoadingSpinner = styled.div`
  animation: ${spin} 1s linear infinite;
`;

// Composant principal
const LoginPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  // Vérifier la configuration Firebase
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);

  useEffect(() => {
    setFirebaseConfigured(isFirebaseConfigured());
  }, []);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    if (!firebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && onLoginSuccess) {
        onLoginSuccess(user);
      }
    });

    return () => unsubscribe();
  }, [onLoginSuccess, firebaseConfigured]);

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firebaseConfigured) {
      setError('Firebase n\'est pas configuré. Vérifiez vos variables d\'environnement.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess('Connexion réussie !');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess('Compte créé avec succès !');
      }
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Aucun compte trouvé avec cette adresse e-mail.');
          break;
        case 'auth/wrong-password':
          setError('Mot de passe incorrect.');
          break;
        case 'auth/email-already-in-use':
          setError('Cette adresse e-mail est déjà utilisée.');
          break;
        case 'auth/weak-password':
          setError('Le mot de passe doit contenir au moins 6 caractères.');
          break;
        case 'auth/invalid-email':
          setError('Adresse e-mail invalide.');
          break;
        case 'auth/network-request-failed':
          setError('Erreur de connexion réseau. Vérifiez votre connexion internet.');
          break;
        default:
          setError('Une erreur est survenue. Veuillez réessayer.');
          console.error('Erreur Firebase:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec Google
  const handleGoogleLogin = async () => {
    if (!firebaseConfigured) {
      setError('Firebase n\'est pas configuré. Vérifiez vos variables d\'environnement.');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setSuccess('Connexion avec Google réussie !');
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Connexion annulée par l\'utilisateur.');
      } else {
        setError('Erreur lors de la connexion avec Google.');
      }
      console.error('Erreur Google Auth:', error);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialisation du mot de passe
  const handlePasswordReset = async () => {
    if (!email) {
      setError('Veuillez saisir votre adresse e-mail pour réinitialiser le mot de passe.');
      return;
    }

    if (!firebaseConfigured) {
      setError('Firebase n\'est pas configuré. Vérifiez vos variables d\'environnement.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('E-mail de réinitialisation envoyé !');
    } catch (error) {
      setError('Erreur lors de l\'envoi de l\'e-mail de réinitialisation.');
      console.error('Erreur reset password:', error);
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setSuccess('Déconnexion réussie !');
    } catch (error) {
      setError('Erreur lors de la déconnexion.');
      console.error('Erreur logout:', error);
    }
  };

  // Si l'utilisateur est connecté, afficher le profil
  if (user) {
    return (
      <LoginContainer>
        {/* Éléments décoratifs flottants */}
        <FloatingElement size="3rem" duration="8s" delay="0s" top="10%" left="15%">
          <FaPlane />
        </FloatingElement>
        <FloatingElement size="2rem" duration="6s" delay="2s" top="20%" left="80%">
          <FaUser />
        </FloatingElement>
        <FloatingElement size="2.5rem" duration="10s" delay="4s" top="70%" left="10%">
          <FaCheckCircle />
        </FloatingElement>
        <FloatingElement size="1.5rem" duration="7s" delay="1s" top="80%" left="85%">
          <FaLock />
        </FloatingElement>

        <LoginCard>
          <LoginHeader>
            <LogoContainer>
              <LogoIcon>
                <FaPlane size={24} />
              </LogoIcon>
              <div>
                <AppTitle>PMR Assistant</AppTitle>
                <AppSubtitle>Système de gestion PMR</AppSubtitle>
              </div>
            </LogoContainer>
            <WelcomeText>Bienvenue !</WelcomeText>
            <WelcomeSubtext>Vous êtes connecté en tant que</WelcomeSubtext>
          </LoginHeader>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '1.5rem'
            }}>
              <FaCheckCircle style={{ color: '#059669', marginBottom: '0.5rem', fontSize: '1.5rem' }} />
              <p style={{ margin: 0, color: '#059669', fontWeight: '600' }}>
                {user.email}
              </p>
            </div>
            
            <PrimaryButton onClick={handleLogout} type="button">
              <FaSignInAlt />
              Se déconnecter
            </PrimaryButton>
          </div>

          {success && (
            <Message type="success">
              <FaCheckCircle />
              {success}
            </Message>
          )}

          {error && (
            <Message type="error">
              <FaExclamationTriangle />
              {error}
            </Message>
          )}
        </LoginCard>
      </LoginContainer>
    );
  }

  return (
    <LoginContainer>
      {/* Éléments décoratifs flottants */}
      <FloatingElement size="3rem" duration="8s" delay="0s" top="10%" left="15%">
        <FaPlane />
      </FloatingElement>
      <FloatingElement size="2rem" duration="6s" delay="2s" top="20%" left="80%">
        <FaUser />
      </FloatingElement>
      <FloatingElement size="2.5rem" duration="10s" delay="4s" top="70%" left="10%">
        <FaUserPlus />
      </FloatingElement>
      <FloatingElement size="1.5rem" duration="7s" delay="1s" top="80%" left="85%">
        <FaLock />
      </FloatingElement>

      <LoginCard>
        <LoginHeader>
          <LogoContainer>
            <LogoIcon>
              <FaPlane size={24} />
            </LogoIcon>
            <div>
              <AppTitle>PMR Assistant</AppTitle>
              <AppSubtitle>Système de gestion Accueil PMR</AppSubtitle>
            </div>
          </LogoContainer>
          <WelcomeText>{isLogin ? 'Connexion' : 'Créer un compte'}</WelcomeText>
          <WelcomeSubtext>
            {isLogin 
}
          </WelcomeSubtext>
        </LoginHeader>

        {/* Alerte de configuration Firebase */}
        {!firebaseConfigured && (
          <ConfigAlert>
            <FaCog />
            Firebase n'est pas configuré. Veuillez remplir vos variables d'environnement dans le fichier .env
          </ConfigAlert>
        )}

        <LoginForm onSubmit={handleSubmit}>
          <InputGroup>
            <InputContainer>
              <Input
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!firebaseConfigured}
              />
              <InputIcon>
                <FaUser size={16} />
              </InputIcon>
            </InputContainer>
          </InputGroup>

          <InputGroup>
            <InputContainer>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!firebaseConfigured}
              />
              <InputIcon>
                <FaLock size={16} />
              </InputIcon>
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={!firebaseConfigured}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </PasswordToggle>
            </InputContainer>
          </InputGroup>

          {error && (
            <Message type="error">
              <FaExclamationTriangle />
              {error}
            </Message>
          )}

          {success && (
            <Message type="success">
              <FaCheckCircle />
              {success}
            </Message>
          )}

          <PrimaryButton type="submit" disabled={loading || !firebaseConfigured}>
            {loading ? (
              <LoadingSpinner>
                <FaSpinner />
              </LoadingSpinner>
            ) : (
              <>
                {isLogin ? <FaSignInAlt /> : <FaUserPlus />}
                {isLogin ? 'Se connecter' : 'Créer le compte'}
              </>
            )}
          </PrimaryButton>

          {isLogin && (
            <div style={{ textAlign: 'center' }}>

            </div>
          )}


        </LoginForm>

          &copy; {new Date().getFullYear()} Altair Airport Solutions - Système d'assistance PMR
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;