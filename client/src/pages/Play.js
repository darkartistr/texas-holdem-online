import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Container from '../components/layout/Container';
import Button from '../components/buttons/Button';
import gameContext from '../context/game/gameContext';
import socketContext from '../context/websocket/socketContext';
import globalContext from '../context/global/globalContext';
import PokerTable from '../components/game/PokerTable';
import { RotateDevicePrompt } from '../components/game/RotateDevicePrompt';
import { PositionedUISlot } from '../components/game/PositionedUISlot';
import { PokerTableWrapper } from '../components/game/PokerTableWrapper';
import { Seat } from '../components/game/Seat/Seat';
import { InfoPill } from '../components/game/InfoPill';
import { GameUI } from '../components/game/GameUI';
import { GameStateInfo } from '../components/game/GameStateInfo';
import BrandingImage from '../components/game/BrandingImage';
import PokerCard from '../components/game/PokerCard';
import background from '../assets/img/background.png';
import LoadingScreen from '../components/loading/LoadingScreen';
import { CS_FETCH_LOBBY_INFO } from '../core/actions';
import logger from '../utils/logger';
import './Play.scss';

/**
 * Play Page Component
 * Main game interface for playing Texas Hold'em poker
 */
const Play = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, reconnect } = useContext(socketContext);
  const { walletAddress: contextWallet, setWalletAddress, setLobbyReady, lobbyReady, userName, id } = useContext(globalContext);
  // Use location state or localStorage fallback (context may not have updated yet after login)
  const walletAddress = contextWallet || location.state?.walletAddress || localStorage.getItem('playWalletAddress') || '';

  // Trigger connection when landing on Play (socket may have failed during login)
  useEffect(() => {
    if (!walletAddress || !reconnect) return;
    const t = setTimeout(() => {
      if (!socket?.connected) reconnect(true);
    }, 1000);
    return () => clearTimeout(t);
  }, [walletAddress, socket?.connected, reconnect]);
  const {
    messages,
    currentTable,
    seatId,
    joinTable,
    leaveTable,
    sitDown,
    standUp,
    fold,
    check,
    call,
    raise,
  } = useContext(gameContext);

  const [bet, setBet] = useState(0);
  const [minLoadTimeElapsed, setMinLoadTimeElapsed] = useState(false);
  const [hasJoinedTable, setHasJoinedTable] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const hasRegisteredRef = useRef(false);

  // Ensure minimum 1-second loading screen after login
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadTimeElapsed(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show error if stuck loading (25s to allow socket reconnection attempts)
  useEffect(() => {
    if (!walletAddress || currentTable) return;

    const timer = setTimeout(() => {
      setLoadError(
        !socket?.connected
          ? 'Connection failed. Ensure both servers are running (npm start) and you see "Server is running on port 7777" in the terminal. Then click Retry.'
          : 'Taking longer than expected. The server may be busy.',
      );
    }, 25000);

    return () => clearTimeout(timer);
  }, [walletAddress, currentTable, socket?.connected]);

  // Sync walletAddress to context if we got it from location/localStorage
  useEffect(() => {
    if (walletAddress && !contextWallet && setWalletAddress) {
      setWalletAddress(walletAddress);
    }
  }, [walletAddress, contextWallet, setWalletAddress]);

  // Register player when socket connects (once per play session)
  useEffect(() => {
    if (!walletAddress) {
      navigate('/');
      return;
    }
    if (!socket?.connected || hasRegisteredRef.current) return;

    hasRegisteredRef.current = true;
    const username = userName || walletAddress || `Player_${id || 'Guest'}`;
    logger.info('Registering player:', { walletAddress, username });

    socket.emit(CS_FETCH_LOBBY_INFO, {
      walletAddress,
      socketId: socket.id,
      gameId: 'demo-game',
      username,
    });
  }, [socket, walletAddress, userName, id, navigate]);

  // Join table only after server confirms registration (SC_RECEIVE_LOBBY_INFO)
  useEffect(() => {
    if (!lobbyReady || !socket?.connected || hasJoinedTable) return;

    logger.info('Lobby ready, joining table');
    setHasJoinedTable(true);
    joinTable(1);
  }, [lobbyReady, socket?.connected, hasJoinedTable, joinTable]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hasRegisteredRef.current = false;
      setLobbyReady?.(false);
      if (socket?.connected) {
        leaveTable();
      }
    };
  }, [socket, setLobbyReady, leaveTable]);

  // Update bet amount based on table state
  useEffect(() => {
    if (!currentTable) return;

    if (currentTable.callAmount > currentTable.minBet) {
      setBet(currentTable.callAmount);
    } else if (currentTable.pot > 0) {
      setBet(currentTable.minRaise);
    } else {
      setBet(currentTable.minBet);
    }
  }, [currentTable]);

  // Memoize container styles
  const containerStyles = useMemo(
    () => ({
      backgroundImage: `url(${background})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
      backgroundColor: 'black',
    }),
    []
  );

  const loadingContainerStyles = useMemo(
    () => ({
      ...containerStyles,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    }),
    [containerStyles]
  );

  // Show error state with retry option
  if (loadError) {
    return (
      <Container
        fullHeight
        style={loadingContainerStyles}
        className="play-area"
      >
        <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
          <p style={{ marginBottom: '1rem' }}>{loadError}</p>
          <Button
            onClick={() => {
              setLoadError(null);
              setHasJoinedTable(false);
              hasRegisteredRef.current = false;
              reconnect?.(true);
            }}
            primary
          >
            Retry Connection
          </Button>
        </div>
      </Container>
    );
  }

  // Show loading screen while waiting for table to join
  if (!minLoadTimeElapsed || !currentTable) {
    return (
      <Container
        fullHeight
        style={loadingContainerStyles}
        className="play-area"
      >
        <LoadingScreen />
      </Container>
    );
  }

  return (
    <>
      <RotateDevicePrompt />
      <Container
        fullHeight
        style={containerStyles}
        className="play-area"
      >
        {currentTable && (
          <>
            <PositionedUISlot
              top="2vh"
              left="1.5rem"
              scale="0.65"
              style={{ zIndex: '50' }}
            >
              <Button small secondary onClick={leaveTable}>
                Leave
              </Button>
            </PositionedUISlot>
          </>
        )}
        <PokerTableWrapper>
          <PokerTable />
          {currentTable && (
            <>
              <PositionedUISlot
                top="-5%"
                left="0"
                scale="0.55"
                origin="top left"
              >
                <Seat
                  seatNumber={1}
                  currentTable={currentTable}
                  sitDown={sitDown}
                />
              </PositionedUISlot>
              <PositionedUISlot
                top="-5%"
                right="2%"
                scale="0.55"
                origin="top right"
              >
                <Seat
                  seatNumber={2}
                  currentTable={currentTable}
                  sitDown={sitDown}
                />
              </PositionedUISlot>
              <PositionedUISlot
                bottom="15%"
                right="2%"
                scale="0.55"
                origin="bottom right"
              >
                <Seat
                  seatNumber={3}
                  currentTable={currentTable}
                  sitDown={sitDown}
                />
              </PositionedUISlot>
              <PositionedUISlot bottom="8%" scale="0.55" origin="bottom center">
                <Seat
                  seatNumber={4}
                  currentTable={currentTable}
                  sitDown={sitDown}
                />
              </PositionedUISlot>
              <PositionedUISlot
                bottom="15%"
                left="0"
                scale="0.55"
                origin="bottom left"
              >
                <Seat
                  seatNumber={5}
                  currentTable={currentTable}
                  sitDown={sitDown}
                />
              </PositionedUISlot>
              <PositionedUISlot
                top="-25%"
                scale="0.55"
                origin="top center"
                style={{ zIndex: '1' }}
              >
                <BrandingImage></BrandingImage>
              </PositionedUISlot>
              <PositionedUISlot
                width="100%"
                origin="center center"
                scale="0.60"
                style={{
                  display: 'flex',
                  textAlign: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {currentTable.board && currentTable.board.length > 0 && (
                  <>
                    {currentTable.board.map((card, index) => (
                      <PokerCard key={index} card={card} />
                    ))}
                  </>
                )}
              </PositionedUISlot>
              <PositionedUISlot top="-5%" scale="0.60" origin="bottom center">
                {messages && messages.length > 0 && (
                  <>
                    <InfoPill>{messages[messages.length - 1]}</InfoPill>
                    {currentTable.winMessages.length > 0 && (
                      <InfoPill>
                        {
                          currentTable.winMessages[
                            currentTable.winMessages.length - 1
                          ]
                        }
                      </InfoPill>
                    )}
                  </>
                )}
              </PositionedUISlot>
              <PositionedUISlot top="12%" scale="0.60" origin="center center">
                {currentTable.winMessages.length === 0 && (
                  <GameStateInfo currentTable={currentTable} />
                )}
              </PositionedUISlot>
            </>
          )}
        </PokerTableWrapper>

        {currentTable &&
          currentTable.seats[seatId] &&
          currentTable.seats[seatId].turn && (
            <GameUI
              currentTable={currentTable}
              seatId={seatId}
              bet={bet}
              setBet={setBet}
              raise={raise}
              standUp={standUp}
              fold={fold}
              check={check}
              call={call}
            />
          )}
      </Container>
    </>
  )
}

export default Play
