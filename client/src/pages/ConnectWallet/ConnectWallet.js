import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import globalContext from './../../context/global/globalContext';
import LoadingScreen from '../../components/loading/LoadingScreen';
import Landing from '../Landing';
import socketContext from '../../context/websocket/socketContext';
import { CS_FETCH_LOBBY_INFO } from '../../core/actions';
import logger from '../../utils/logger';
import './ConnectWallet.scss';

const ConnectWallet = () => {
  const { setWalletAddress } = useContext(globalContext)
   
  const { socket } = useContext(socketContext)
  const navigate = useNavigate()
  const location = useLocation()
  const useQuery = () => new URLSearchParams(location.search);
  let query = useQuery()
  const [isConnecting, setIsConnecting] = useState(true)

  useEffect(() => {
    const walletAddress = query.get('walletAddress')
    const gameId = query.get('gameId')
    const username = query.get('username')
    
    // If no query params, show landing page immediately
    if (!walletAddress || !gameId || !username) {
      setIsConnecting(false)
      return
    }

    // Wait for socket connection
    if (socket === null) {
      // Socket not initialized yet, wait a bit
      const timer = setTimeout(() => {
        setIsConnecting(false)
      }, 5000) // Wait max 5 seconds
      return () => clearTimeout(timer)
    }

    if (socket.connected === true) {
      logger.info('Connecting with wallet:', { walletAddress, gameId, username });
      setWalletAddress(walletAddress);
      socket.emit(CS_FETCH_LOBBY_INFO, { 
        walletAddress, 
        socketId: socket.id, 
        gameId, 
        username 
      });
      navigate('/play');
    } else {
      // Socket exists but not connected yet
      const handleConnect = () => {
        logger.info('Socket connected, emitting lobby info');
        setWalletAddress(walletAddress);
        socket.emit(CS_FETCH_LOBBY_INFO, { 
          walletAddress, 
          socketId: socket.id, 
          gameId, 
          username 
        });
        navigate('/play');
        socket.off('connect', handleConnect);
      };

      socket.on('connect', handleConnect);

      // Timeout if connection takes too long
      const timer = setTimeout(() => {
        setIsConnecting(false)
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'Could not connect to the server. Please check if the server is running.',
        })
      }, 10000)

      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, location.search, navigate, setWalletAddress])

  // Show loading screen only if connecting with query params
  if (isConnecting) {
    return (
      <>
        <LoadingScreen />
      </>
    )
  }

  // Show landing page if no query params or connection failed
  return <Landing />
}

export default ConnectWallet
