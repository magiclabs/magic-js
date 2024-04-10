import { act, renderHook } from '@testing-library/react-native';
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { useInternetConnection } from '../../src/hooks';

beforeAll(() => {
  // @ts-ignore mock resolved value
  NetInfo.getCurrentState.mockResolvedValue({
    type: NetInfoStateType.cellular,
    isConnected: true,
    isInternetReachable: true,
    details: {
      isConnectionExpensive: true,
      cellularGeneration: '4g',
    },
  });
});

describe('useInternetConnection', () => {
  it('should initialize with true when connected', async () => {
    const { result } = renderHook(() => useInternetConnection());

    expect(result.current).toBe(true);
  });

  it('should call the listener when the connection changes', async () => {
    NetInfo.addEventListener = jest.fn();

    const { result } = renderHook(() => useInternetConnection());

    // Initial render, assuming it's connected
    expect(result.current).toBe(true);

    // Simulate a change in connection status
    act(() => {
      // @ts-ignore mock calls
      NetInfo.addEventListener.mock.calls[0][0]({
        type: 'cellular',
        isConnected: false,
        isInternetReachable: true,
        details: {
          isConnectionExpensive: true,
        },
      });
    });

    // Wait for the next tick of the event loop to allow state update
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0)); // or setImmediate
    });

    // Check if the hook state has been updated
    expect(result.current).toBe(false);
  });
});
