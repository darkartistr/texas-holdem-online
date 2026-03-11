import React, { useState, useMemo } from 'react';
import GlobalContext from './globalContext';

/**
 * Global State Provider Component
 * Manages global application state (user info, tables, players, etc.)
 */
const GlobalState = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [email, setEmail] = useState(null);
  const [chipsAmount, setChipsAmount] = useState(null);
  const [tables, setTables] = useState(null);
  const [players, setPlayers] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [lobbyReady, setLobbyReady] = useState(false);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      isLoading,
      setIsLoading,
      userName,
      setUserName,
      email,
      setEmail,
      chipsAmount,
      setChipsAmount,
      id,
      setId,
      tables,
      setTables,
      players,
      setPlayers,
      walletAddress,
      setWalletAddress,
      lobbyReady,
      setLobbyReady,
    }),
    [
      isLoading,
      userName,
      email,
      chipsAmount,
      id,
      tables,
      players,
      walletAddress,
      lobbyReady,
    ]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalState;
