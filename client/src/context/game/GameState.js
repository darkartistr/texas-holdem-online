import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CS_CALL,
  CS_CHECK,
  CS_FOLD,
  CS_JOIN_TABLE,
  CS_LEAVE_TABLE,
  CS_RAISE,
  CS_REBUY,
  CS_SIT_DOWN,
  CS_STAND_UP,
  SC_TABLE_JOINED,
  SC_TABLE_LEFT,
  SC_TABLE_UPDATED,
} from '../../core/actions';
import socketContext from '../websocket/socketContext';
import GameContext from './gameContext';
import logger from '../../utils/logger';

const TURN_TIMEOUT_MS = 15000; // 15 seconds

/**
 * GameState Provider Component
 * Manages game state, table connections, and player actions
 */
const GameState = ({ children }) => {
  const { socket } = useContext(socketContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [seatId, setSeatId] = useState(null);
  const [turn, setTurn] = useState(false);
  const currentTableRef = useRef(currentTable);
  const turnTimeoutRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    currentTableRef.current = currentTable;
  }, [currentTable]);

  // Update turn state when table or seat changes
  useEffect(() => {
    if (currentTable && seatId && currentTable.seats[seatId]) {
      const seatTurn = currentTable.seats[seatId].turn;
      if (turn !== seatTurn) {
        setTurn(seatTurn);
      }
    }
  }, [currentTable, seatId, turn]);

  /**
   * Add message to message history
   */
  const addMessage = useCallback((message) => {
    if (message) {
      setMessages((prevMessages) => [...prevMessages, message]);
    }
  }, []);

  /**
   * Join a poker table
   */
  const joinTable = useCallback((tableId) => {
    if (!socket || !socket.connected) {
      logger.warn('Cannot join table: Socket not connected');
      return;
    }
    logger.socket(CS_JOIN_TABLE, tableId);
    socket.emit(CS_JOIN_TABLE, tableId);
  }, [socket]);

  /**
   * Stand up from current seat
   */
  const standUp = useCallback(() => {
    if (!socket || !socket.connected || !currentTableRef.current?.id) {
      return;
    }
    socket.emit(CS_STAND_UP, currentTableRef.current.id);
    setSeatId(null);
  }, [socket]);

  /**
   * Fold hand
   */
  const fold = useCallback(() => {
    if (!socket || !socket.connected || !currentTableRef.current?.id) {
      return;
    }
    socket.emit(CS_FOLD, currentTableRef.current.id);
  }, [socket]);

  // Handle turn timeout
  useEffect(() => {
    if (turn && !turnTimeoutRef.current) {
      const timeoutId = setTimeout(() => {
        fold();
      }, TURN_TIMEOUT_MS);

      turnTimeoutRef.current = timeoutId;
    } else if (!turn && turnTimeoutRef.current) {
      clearTimeout(turnTimeoutRef.current);
      turnTimeoutRef.current = null;
    }

    return () => {
      if (turnTimeoutRef.current) {
        clearTimeout(turnTimeoutRef.current);
      }
    };
  }, [turn, fold]);

  /**
   * Leave current table
   */
  const leaveTable = useCallback(() => {
    if (!socket || !socket.connected) {
      navigate('/');
      return;
    }

    standUp();

    if (currentTableRef.current?.id) {
      socket.emit(CS_LEAVE_TABLE, currentTableRef.current.id);
    }

    setCurrentTable(null);
    setMessages([]);
    setSeatId(null);
    navigate('/');
  }, [socket, navigate, standUp]);

  /**
   * Sit down at a seat
   */
  const sitDown = useCallback((tableId, seatIdNum, amount) => {
    if (!socket || !socket.connected) {
      logger.warn('Cannot sit down: Socket not connected');
      return;
    }
    logger.socket(CS_SIT_DOWN, { tableId, seatId: seatIdNum, amount });
    socket.emit(CS_SIT_DOWN, { tableId, seatId: seatIdNum, amount });
    setSeatId(seatIdNum);
  }, [socket]);

  /**
   * Rebuy chips
   */
  const rebuy = useCallback((tableId, seatIdNum, amount) => {
    if (!socket || !socket.connected) {
      logger.warn('Cannot rebuy: Socket not connected');
      return;
    }
    logger.socket(CS_REBUY, { tableId, seatId: seatIdNum, amount });
    socket.emit(CS_REBUY, { tableId, seatId: seatIdNum, amount });
  }, [socket]);

  /**
   * Check action
   */
  const check = useCallback(() => {
    if (!socket || !socket.connected || !currentTableRef.current?.id) {
      return;
    }
    socket.emit(CS_CHECK, currentTableRef.current.id);
  }, [socket]);

  /**
   * Call current bet
   */
  const call = useCallback(() => {
    if (!socket || !socket.connected || !currentTableRef.current?.id) {
      return;
    }
    socket.emit(CS_CALL, currentTableRef.current.id);
  }, [socket]);

  /**
   * Raise bet
   */
  const raise = useCallback((amount) => {
    if (!socket || !socket.connected || !currentTableRef.current?.id) {
      return;
    }
    socket.emit(CS_RAISE, { 
      tableId: currentTableRef.current.id, 
      amount: Number(amount) 
    });
  }, [socket]);

  // Register socket event listeners
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleTableUpdated = ({ table, message, from }) => {
      logger.socket(SC_TABLE_UPDATED, { table, message, from });
      if (table) {
        setCurrentTable(table);
      }
      if (message) {
        addMessage(message);
      }
    };

    const handleTableJoined = ({ tables, tableId }) => {
      logger.socket(SC_TABLE_JOINED, { tables, tableId });
      if (tables?.[0]?.currentNumberPlayers > 0) {
        setSeatId(tables[0].currentNumberPlayers);
      }
    };

    const handleTableLeft = ({ tables, tableId }) => {
      logger.socket(SC_TABLE_LEFT, { tables, tableId });
      setCurrentTable(null);
      setMessages([]);
      setSeatId(null);
    };

    socket.on(SC_TABLE_UPDATED, handleTableUpdated);
    socket.on(SC_TABLE_JOINED, handleTableJoined);
    socket.on(SC_TABLE_LEFT, handleTableLeft);

    // Cleanup on unmount or socket change
    return () => {
      socket.off(SC_TABLE_UPDATED, handleTableUpdated);
      socket.off(SC_TABLE_JOINED, handleTableJoined);
      socket.off(SC_TABLE_LEFT, handleTableLeft);
    };
  }, [socket, addMessage]);

  // Handle page unload
  useEffect(() => {
    const handleUnload = () => {
      if (currentTableRef.current) {
        leaveTable();
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [leaveTable]);

  const contextValue = React.useMemo(
    () => ({
      messages,
      currentTable,
      seatId,
      joinTable,
      leaveTable,
      sitDown,
      standUp,
      addMessage,
      fold,
      check,
      call,
      raise,
      rebuy,
    }),
    [messages, currentTable, seatId, joinTable, leaveTable, sitDown, standUp, addMessage, fold, check, call, raise, rebuy]
  );

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export default GameState;
