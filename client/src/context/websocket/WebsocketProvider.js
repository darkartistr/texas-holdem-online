import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import SocketContext from './socketContext';
import io from 'socket.io-client';
import {
  CS_DISCONNECT,
  SC_PLAYERS_UPDATED,
  SC_RECEIVE_LOBBY_INFO,
  SC_TABLES_UPDATED,
} from '../../core/actions';
import globalContext from '../global/globalContext';
import config from '../../clientConfig';
import logger from '../../utils/logger';

/**
 * WebSocket Provider Component
 * Manages Socket.IO connection and provides socket context to children
 */
const WebSocketProvider = ({ children }) => {
  const { setTables, setPlayers, setChipsAmount, setLobbyReady } = useContext(globalContext);
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const socketRef = useRef(null);

  /**
   * Cleanup function to disconnect socket
   */
  const cleanUp = useCallback(() => {
    if (socketRef.current) {
      try {
        socketRef.current.emit(CS_DISCONNECT);
        socketRef.current.close();
      } catch (error) {
        logger.error('Error during socket cleanup:', error);
      }
    }

    if (window.socket) {
      delete window.socket;
    }

    setSocket(null);
    setSocketId(null);
    setPlayers(null);
    setTables(null);
    setConnectionStatus('disconnected');
  }, [setPlayers, setTables]);

  /**
   * Register socket event callbacks
   */
  const registerCallbacks = useCallback((socketInstance) => {
    socketInstance.on('connect', () => {
      logger.info('WebSocket connected:', socketInstance.id);
      setSocket(socketInstance);
      setSocketId(socketInstance.id);
      setConnectionStatus('connected');
    });

    socketInstance.on('connect_error', (error) => {
      logger.error('WebSocket connection error:', error);
      setConnectionStatus('error');
    });

    socketInstance.on('disconnect', (reason) => {
      logger.info('WebSocket disconnected:', reason);
      setSocket(null);
      setSocketId(null);
      setConnectionStatus('disconnected');
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      logger.info(`WebSocket reconnected after ${attemptNumber} attempts`);
      setConnectionStatus('connected');
    });

    socketInstance.on('reconnect_error', (error) => {
      logger.error('WebSocket reconnection error:', error);
      setConnectionStatus('error');
    });

    socketInstance.on(SC_RECEIVE_LOBBY_INFO, ({ tables, players, socketId, amount }) => {
      logger.socket(SC_RECEIVE_LOBBY_INFO, { tables, players, socketId });
      setSocketId(socketId);
      setChipsAmount(amount);
      setTables(tables);
      setPlayers(players);
      setLobbyReady?.(true);
    });

    socketInstance.on(SC_PLAYERS_UPDATED, (players) => {
      logger.socket(SC_PLAYERS_UPDATED, players);
      setPlayers(players);
    });

    socketInstance.on(SC_TABLES_UPDATED, (tables) => {
      logger.socket(SC_TABLES_UPDATED, tables);
      setTables(tables);
    });
  }, [setChipsAmount, setTables, setPlayers, setLobbyReady]);

  /**
   * Initialize socket connection
   */
  const connect = useCallback((forceNew = false) => {
    if (socketRef.current?.connected && !forceNew) {
      return socketRef.current;
    }

    if (forceNew && socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
    }

    try {
      const newSocket = io(config.socketURI, {
        path: '/socket.io',
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 20,
        timeout: 10000,
      });

      socketRef.current = newSocket;
      window.socket = newSocket;
      registerCallbacks(newSocket);

      return newSocket;
    } catch (error) {
      logger.error('Failed to create socket connection:', error);
      setConnectionStatus('error');
      return null;
    }
  }, [registerCallbacks]);

  // Initialize connection on mount
  useEffect(() => {
    if (!socketRef.current) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      cleanUp();
    };
  }, [connect, cleanUp]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => cleanUp();
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [cleanUp]);

  return (
    <SocketContext.Provider 
      value={{ 
        socket, 
        socketId, 
        connectionStatus,
        cleanUp,
        reconnect: connect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default WebSocketProvider;
