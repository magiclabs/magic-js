import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export const useInternetConnection = () => {
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    const handleConnectionChange = (connectionInfo: NetInfoState) => {
      setIsConnected(!!connectionInfo.isConnected);
    };

    // Subscribe to connection changes
    return NetInfo.addEventListener(handleConnectionChange);
  }, []);

  return isConnected;
};
