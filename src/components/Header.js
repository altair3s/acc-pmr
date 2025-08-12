import React from 'react';
import styled from 'styled-components';
import { FaWheelchair, FaPlane } from 'react-icons/fa';

const HeaderContainer = styled.header`
  background-color: var(--primary-color);
  color: white;
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 2rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
`;

const Header = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <div>
          <Title>
            <Logo>
              <FaWheelchair />
              <FaPlane />
            </Logo>
            GIMAP PMR Assistance
          </Title>
          <Subtitle>Système d'affichage des passagers à mobilité réduite</Subtitle>
        </div>
        <div>
          <CurrentTime />
        </div>
      </HeaderContent>
    </HeaderContainer>
  );
};

// Component to display the current time
const TimeContainer = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
`;

const CurrentTime = () => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TimeContainer>
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </TimeContainer>
  );
};

export default Header;
