import { useCallback, useRef } from 'react';
import { getExtensionInstance, CreateChannelAPIResponse, StatusAPIResponse } from '../extension';
import { useWidgetConfig } from '../context/WidgetConfigContext';
import { WidgetAction } from '../reducer';
import { FarcasterLoginResult } from '../types';
import { FarcasterLoginEventEmit } from '@magic-sdk/types';
import { isMobile, isMainFrame } from '../utils/device';

export interface UseFarcasterLoginResult {
  startFarcasterLogin: () => void;
  cancel: () => void;
  retry: () => void;
}

export function useFarcasterLogin(dispatch: React.Dispatch<WidgetAction>): UseFarcasterLoginResult {
  const { handleSuccess, handleError } = useWidgetConfig();
  const handleRef = useRef<ReturnType<typeof getExtensionInstance.prototype.loginWithFarcaster> | null>(null);

  const startFarcasterLogin = useCallback(() => {
    const extension = getExtensionInstance();
    const handle = extension.loginWithFarcaster();
    handleRef.current = handle;

    handle.on('channel', (channel: CreateChannelAPIResponse) => {
      dispatch({ type: 'FARCASTER_CHANNEL_RECEIVED', url: channel.url });

      // On mobile in the main frame, auto-redirect to the Farcaster app
      if (isMobile() && isMainFrame()) {
        window.location.href = channel.url;
      }
    });

    handle.on('success', (data: StatusAPIResponse) => {
      // The handle resolves with the DID token
      handle
        .then((didToken: string) => {
          const result: FarcasterLoginResult = {
            method: 'farcaster',
            didToken,
            farcaster: {
              fid: data.fid,
              username: data.username,
              displayName: data.displayName,
              pfpUrl: data.pfpUrl,
              bio: data.bio,
            },
          };
          dispatch({ type: 'FARCASTER_SUCCESS', username: data.username });
          handleSuccess(result);
        })
        .catch(() => {
          // DID token resolution failed, but the Farcaster auth succeeded
          // Still show success with whatever we have
          dispatch({ type: 'FARCASTER_SUCCESS', username: data.username });
        });
    });

    handle.on('failed', (error: Error) => {
      dispatch({ type: 'FARCASTER_FAILED', error: error?.message || 'Farcaster login failed' });
      handleError(error instanceof Error ? error : new Error('Farcaster login failed'));
    });
  }, [dispatch, handleSuccess, handleError]);

  const cancel = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.emit(FarcasterLoginEventEmit.Cancel);
      handleRef.current = null;
    }
    dispatch({ type: 'GO_TO_LOGIN' });
  }, [dispatch]);

  const retry = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.emit(FarcasterLoginEventEmit.Cancel);
      handleRef.current = null;
    }
    dispatch({ type: 'SELECT_FARCASTER' });
  }, [dispatch]);

  return {
    startFarcasterLogin,
    cancel,
    retry,
  };
}
