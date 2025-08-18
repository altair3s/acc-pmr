import React from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  FaTimes, 
  FaUserFriends, 
  FaSearch, 
  FaWalking, 
  FaCrown, 
  FaClock, 
  FaTrashAlt,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaLightbulb,
  FaBug,
  FaQuestionCircle,
  FaRocket,
  FaHeart,
  FaUserPlus,
  FaUserCheck,
  FaClipboardList,
  FaRoute,
  FaHandsHelping
} from 'react-icons/fa';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: scale(0.9) translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: ${fadeIn} 0.3s ease-out;
  padding: 1rem;
`;

const Modal = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideIn} 0.4s ease-out;
  position: relative;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
  color: white;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    transform: rotate(15deg);
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TitleIcon = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 0.8rem;
  display: flex;
  align-items: center;
  animation: ${pulse} 2s infinite;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const Content = styled.div`
  padding: 0;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
`;

const Section = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
`;

const SectionIcon = styled.div`
  background: linear-gradient(135deg, #0056b3, #004494);
  color: white;
  border-radius: 12px;
  padding: 0.8rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 86, 179, 0.3);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.$color || '#0056b3'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div`
  color: ${props => props.$color || '#0056b3'};
  font-size: 1.5rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
`;

const CardContent = styled.div`
  color: #495057;
  line-height: 1.6;
`;

const StepList = styled.ol`
  margin: 1rem 0;
  padding-left: 1.5rem;
`;

const StepItem = styled.li`
  margin-bottom: 0.8rem;
  line-height: 1.6;
  color: #495057;
  
  strong {
    color: #0056b3;
    font-weight: 600;
  }
`;

const ColorDemo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
`;

const ColorBadge = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props => props.$color};
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ColorLabel = styled.span`
  font-size: 0.9rem;
  color: #495057;
`;

const TipBox = styled.div`
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  border-left: 4px solid #2196f3;
`;

const TipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
`;

const TipTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1976d2;
`;

const TipContent = styled.div`
  color: #424242;
  line-height: 1.6;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
`;

const FeatureIcon = styled.div`
  color: #0056b3;
  font-size: 1.2rem;
`;

const FeatureText = styled.span`
  color: #495057;
  font-weight: 500;
`;

const ProcessFlow = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem 0;
  border: 2px solid #dee2e6;
`;

const FlowStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FlowIcon = styled.div`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
`;

const FlowContent = styled.div`
  flex: 1;
`;

const FlowTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
`;

const FlowDescription = styled.p`
  margin: 0;
  color: #495057;
  line-height: 1.6;
`;

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderContent>
            <Title>
              <TitleIcon>
                <FaQuestionCircle size={24} />
              </TitleIcon>
              Guide d'utilisation Accueil PMR
            </Title>
            <CloseButton onClick={onClose}>
              <FaTimes size={18} />
            </CloseButton>
          </HeaderContent>
        </Header>

        <Content>
          {/* Vue d'ensemble */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <FaRocket size={20} />
              </SectionIcon>
              <SectionTitle>Vue d'ensemble</SectionTitle>
            </SectionHeader>
            
            <CardContent>
              Cette application vous permet de gérer efficacement les passagers PMR 
              en temps réel avec synchronisation automatique. 
              Suivez les statuts, animations d'agents en route, et priorités SkyPriority.
            </CardContent>

            <FeatureGrid>
              <FeatureItem>
                <FeatureIcon><FaUserFriends /></FeatureIcon>
                <FeatureText>Gestion des passagers PMR</FeatureText>
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon><FaUserPlus /></FeatureIcon>
                <FeatureText>Ajout manuel de passagers</FeatureText>
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon><FaWalking /></FeatureIcon>
                <FeatureText>Suivi des agents en route</FeatureText>
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon><FaCrown /></FeatureIcon>
                <FeatureText>Gestion SkyPriority</FeatureText>
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon><FaUserCheck /></FeatureIcon>
                <FeatureText>Marquage PMR assisté</FeatureText>
              </FeatureItem>
              <FeatureItem>
                <FeatureIcon><FaSyncAlt /></FeatureIcon>
                <FeatureText>Synchronisation automatique</FeatureText>
              </FeatureItem>
            </FeatureGrid>
          </Section>

          {/* Démarche de traitement */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <FaRoute size={20} />
              </SectionIcon>
              <SectionTitle>Démarche de traitement à l'espace accueil</SectionTitle>
            </SectionHeader>

            <ProcessFlow>
              <FlowStep>
                <FlowIcon>1</FlowIcon>
                <FlowContent>
                  <FlowTitle>🔍 Identification du passager</FlowTitle>
                  <FlowDescription>
                    Le passager se présente à l'espace accueil. Vérifiez son identité et ses besoins d'assistance 
                    en consultant sa carte dans l'application. Le code couleur indique l'urgence.
                  </FlowDescription>
                </FlowContent>
              </FlowStep>

              <FlowStep>
                <FlowIcon>2</FlowIcon>
                <FlowContent>
                  <FlowTitle>📋 Évaluation des besoins</FlowTitle>
                  <FlowDescription>
                    Confirmez le type d'assistance PMR (WCHR/WCHS/WCHC). Si le passager n'est pas dans la liste, 
                    utilisez "Ajouter passager" pour l'enregistrer manuellement avec ses informations de vol.
                  </FlowDescription>
                </FlowContent>
              </FlowStep>

              <FlowStep>
                <FlowIcon>3</FlowIcon>
                <FlowContent>
                  <FlowTitle>⭐ Gestion des priorités</FlowTitle>
                  <FlowDescription>
                    Marquez le passager SkyPriority si nécessaire (clic sur la carte). 
                    Priorisez les cartes rouges (moins de 60 min) et orange (60-90 min).
                  </FlowDescription>
                </FlowContent>
              </FlowStep>

              <FlowStep>
                <FlowIcon>4</FlowIcon>
                <FlowContent>
                  <FlowTitle>📞 Coordination avec l'agent</FlowTitle>
                  <FlowDescription>
                    Surveillez l'animation "Agent en route" qui apparaît automatiquement quand 
                    le jalon GO-ACC est activé. Coordinonnez l'assistance selon les besoins.
                  </FlowDescription>
                </FlowContent>
              </FlowStep>

              <FlowStep>
                <FlowIcon>5</FlowIcon>
                <FlowContent>
                  <FlowTitle>✅ Finalisation de l'assistance</FlowTitle>
                  <FlowDescription>
                    Une fois l'assistance terminée, cliquez sur "PMR Assisté" pour marquer 
                    le passager comme pris en charge. Il disparaîtra automatiquement de la liste.
                  </FlowDescription>
                </FlowContent>
              </FlowStep>
            </ProcessFlow>
          </Section>

          {/* Mode d'emploi */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <FaCheckCircle size={20} />
              </SectionIcon>
              <SectionTitle>Mode d'emploi</SectionTitle>
            </SectionHeader>

            <Grid>
              <Card $color="#28a745">
                <CardHeader>
                  <CardIcon $color="#28a745"><FaSearch /></CardIcon>
                  <CardTitle>1. Ajouter un passager (liste)</CardTitle>
                </CardHeader>
                <CardContent>
                  <StepList>
                    <StepItem><strong>Cliquez</strong> sur le menu déroulant "Sélectionner un passager"</StepItem>
                    <StepItem><strong>Choisissez</strong> le passager dans la liste</StepItem>
                    <StepItem>Le passager <strong>apparaît automatiquement</strong> dans la liste</StepItem>
                  </StepList>
                </CardContent>
              </Card>

              <Card $color="#007bff">
                <CardHeader>
                  <CardIcon $color="#007bff"><FaUserPlus /></CardIcon>
                  <CardTitle>2. Ajouter un passager (manuel)</CardTitle>
                </CardHeader>
                <CardContent>
                  <StepList>
                    <StepItem><strong>Cliquez</strong> sur "Ajouter passager" dans le menu</StepItem>
                    <StepItem><strong>Remplissez</strong> le formulaire (nom, vol, date/heure, type PMR)</StepItem>
                    <StepItem><strong>Validez</strong> pour créer la carte passager</StepItem>
                  </StepList>
                </CardContent>
              </Card>

              <Card $color="#ffc107">
                <CardHeader>
                  <CardIcon $color="#ffc107"><FaCrown /></CardIcon>
                  <CardTitle>3. Gérer SkyPriority</CardTitle>
                </CardHeader>
                <CardContent>
                  <StepList>
                    <StepItem><strong>Cliquez</strong> sur la carte d'un passager</StepItem>
                    <StepItem>Le badge <strong>"SkyPriority"</strong> apparaît/disparaît</StepItem>
                  </StepList>
                </CardContent>
              </Card>

              <Card $color="#28a745">
                <CardHeader>
                  <CardIcon $color="#28a745"><FaUserCheck /></CardIcon>
                  <CardTitle>4. Marquer PMR assisté</CardTitle>
                </CardHeader>
                <CardContent>
                  <StepList>
                    <StepItem><strong>Survolez</strong> la carte du passager</StepItem>
                    <StepItem><strong>Cliquez</strong> sur le bouton vert "PMR Assisté"</StepItem>
                    <StepItem>Le passager <strong>disparaît automatiquement</strong> après 5 secondes</StepItem>
                  </StepList>
                </CardContent>
              </Card>

              <Card $color="#dc3545">
                <CardHeader>
                  <CardIcon $color="#dc3545"><FaTrashAlt /></CardIcon>
                  <CardTitle>5. Supprimer un passager</CardTitle>
                </CardHeader>
                <CardContent>
                  <StepList>
                    <StepItem><strong>Survolez</strong> la carte du passager</StepItem>
                    <StepItem><strong>Cliquez</strong> sur l'icône poubelle rouge</StepItem>
                    <StepItem><strong>Confirmez</strong> la suppression</StepItem>
                  </StepList>
                </CardContent>
              </Card>

              <Card $color="#17a2b8">
                <CardHeader>
                  <CardIcon $color="#17a2b8"><FaWalking /></CardIcon>
                  <CardTitle>6. Suivre les agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <StepList>
                    <StepItem>L'animation <strong>"Agent en route"</strong> se déclenche automatiquement</StepItem>
                    <StepItem>Quand le champ <strong>GO-ACC</strong> est rempli dans la Google Sheet</StepItem>
                    <StepItem>L'animation <strong>disparaît</strong> si le champ est vidé</StepItem>
                  </StepList>
                </CardContent>
              </Card>
            </Grid>
          </Section>

          {/* Codes couleurs */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <FaInfoCircle size={20} />
              </SectionIcon>
              <SectionTitle>Codes couleurs & Urgence</SectionTitle>
            </SectionHeader>

            <Grid>
              <Card $color="#28a745">
                <CardHeader>
                  <CardIcon $color="#28a745"><FaClock /></CardIcon>
                  <CardTitle>Situation normale</CardTitle>
                </CardHeader>
                <CardContent>
                  <ColorDemo>
                    <ColorBadge $color="#28a745" />
                    <ColorLabel><strong>Vert</strong> - Plus de 90 minutes avant le départ</ColorLabel>
                  </ColorDemo>
                  <p>✅ Aucune urgence, temps suffisant pour l'assistance.</p>
                </CardContent>
              </Card>

              <Card $color="#ffc107">
                <CardHeader>
                  <CardIcon $color="#ffc107"><FaExclamationTriangle /></CardIcon>
                  <CardTitle>Attention requise</CardTitle>
                </CardHeader>
                <CardContent>
                  <ColorDemo>
                    <ColorBadge $color="#ffc107" />
                    <ColorLabel><strong>Orange</strong> - 60 à 90 minutes avant le départ</ColorLabel>
                  </ColorDemo>
                  <p>⚠️ Clignotement lent - Préparation de l'assistance recommandée.</p>
                </CardContent>
              </Card>

              <Card $color="#dc3545">
                <CardHeader>
                  <CardIcon $color="#dc3545"><FaExclamationTriangle /></CardIcon>
                  <CardTitle>Situation urgente</CardTitle>
                </CardHeader>
                <CardContent>
                  <ColorDemo>
                    <ColorBadge $color="#dc3545" />
                    <ColorLabel><strong>Rouge</strong> - Moins de 60 minutes avant le départ</ColorLabel>
                  </ColorDemo>
                  <p>🚨 Clignotement rapide - Assistance prioritaire requise !</p>
                </CardContent>
              </Card>
            </Grid>
          </Section>

          {/* Conseils et astuces */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <FaLightbulb size={20} />
              </SectionIcon>
              <SectionTitle>Conseils & Astuces</SectionTitle>
            </SectionHeader>

            <TipBox>
              <TipHeader>
                <FaLightbulb color="#2196f3" />
                <TipTitle>Optimisation du workflow</TipTitle>
              </TipHeader>
              <TipContent>
                <ul>
                  <li><strong>Priorisez</strong> les passagers avec cartes rouges (moins de 60 min)</li>
                  <li><strong>Utilisez SkyPriority</strong> pour marquer les VIP ou cas spéciaux</li>
                  <li><strong>Surveillez</strong> les animations "Agent en route" pour éviter les doublons</li>
                  <li><strong>Rafraîchissez manuellement</strong> si nécessaire avec le bouton "Actualiser"</li>
                  <li><strong>Ajoutez manuellement</strong> les passagers non présents dans la liste</li>
                </ul>
              </TipContent>
            </TipBox>

            <TipBox>
              <TipHeader>
                <FaHeart color="#e91e63" />
                <TipTitle>Efficacité maximale</TipTitle>
              </TipHeader>
              <TipContent>
                <ul>
                  <li><strong>Coordination</strong> avec les agents via le jalon GO-ACC</li>
                  <li><strong>Surveillez</strong> les compteurs de passagers pour la charge de travail</li>
                  <li><strong>Les vols passés</strong> disparaissent automatiquement (sans délai)</li>
                  <li><strong>Marquez "PMR Assisté"</strong> dès la prise en charge terminée</li>
                </ul>
              </TipContent>
            </TipBox>
          </Section>

          {/* Résolution des problèmes */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <FaBug size={20} />
              </SectionIcon>
              <SectionTitle>Résolution des problèmes</SectionTitle>
            </SectionHeader>

            <Grid>
              <Card $color="#dc3545">
                <CardHeader>
                  <CardIcon $color="#dc3545"><FaBug /></CardIcon>
                  <CardTitle>Problèmes courants</CardTitle>
                </CardHeader>
                <CardContent>
                  <strong>❌ Passagers n'apparaissent pas :</strong>
                  <ul>
                    <li>Vérifiez la connexion Internet</li>
                    <li>Actualisez avec le bouton "Actualiser"</li>
                    <li>Vérifiez la STD et la date du vol</li>
                    <li>Utilisez l'ajout manuel si nécessaire</li>
                  </ul>
                </CardContent>
              </Card>

              <Card $color="#ffc107">
                <CardHeader>
                  <CardIcon $color="#ffc107"><FaExclamationTriangle /></CardIcon>
                  <CardTitle>Animation manquante</CardTitle>
                </CardHeader>
                <CardContent>
                  <strong>⚠️ "Agent en route" ne s'affiche pas :</strong>
                  <ul>
                    <li>Vérifiez que le jalon GO-ACC est bien activé</li>
                    <li>Attendez le prochain rafraîchissement (10s)</li>
                    <li>Actualisez manuellement</li>
                  </ul>
                </CardContent>
              </Card>

              <Card $color="#28a745">
                <CardHeader>
                  <CardIcon $color="#28a745"><FaCheckCircle /></CardIcon>
                  <CardTitle>Performance optimale</CardTitle>
                </CardHeader>
                <CardContent>
                  <strong>✅ Pour une meilleure performance :</strong>
                  <ul>
                    <li>Utilisez MS Edge récent</li>
                    <li>Gardez l'onglet actif</li>
                    <li>Évitez de surcharger la liste</li>
                    <li>Marquez "PMR Assisté" régulièrement</li>
                  </ul>
                </CardContent>
              </Card>
            </Grid>
          </Section>

          {/* Support */}
          <Section>
            <SectionHeader>
              <SectionIcon>
                <FaHeart size={20} />
              </SectionIcon>
              <SectionTitle>Support & Contact</SectionTitle>
            </SectionHeader>

            <CardContent>
              <p>
                <strong>🎯 Version :</strong> 3.0 - Accueil PMR avec ajout manuel<br/>
                <strong>⚡ Fonctionnalités :</strong> Synchronisation temps réel, animations, gestion SkyPriority, ajout manuel, marquage PMR assisté<br/>
                <strong>🔄 Rafraîchissement :</strong> Automatique toutes les 10 secondes<br/>
                <strong>🧹 Nettoyage :</strong> Vols passés supprimés immédiatement<br/>
              </p>
              
              <TipBox>
                <TipHeader>
                  <FaRocket color="#4caf50" />
                  <TipTitle>Application moderne</TipTitle>
                </TipHeader>
                <TipContent>
                  Cette application a été conçue pour optimiser la gestion des passagers PMR aux points accueil,
                  avec une interface moderne et intuitive. Pour toute suggestion ou amélioration, 
                  utilisez le bouton "Signaler" dans le menu !
                </TipContent>
              </TipBox>
            </CardContent>
          </Section>
        </Content>
      </Modal>
    </Overlay>
  );
};

export default HelpModal;