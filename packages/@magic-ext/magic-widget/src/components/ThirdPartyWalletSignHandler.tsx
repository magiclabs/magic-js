/**
 * This component should be rendered within the WagmiProvider context
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useSendTransaction, useSignMessage, useSignTypedData } from 'wagmi';
import { ThirdPartyWalletSignRequest, ThirdPartyWalletSignResponse } from '@magic-sdk/types';
import { getExtensionInstance } from 'src/extension';

interface ThirdPartyWalletSignHandlerProps {
  /** Whether the handler is enabled (should be true after successful SIWE login) */
  enabled?: boolean;
}

export function ThirdPartyWalletSignHandler({ enabled = true }: ThirdPartyWalletSignHandlerProps) {
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { signTypedDataAsync } = useSignTypedData();
  const { sendTransactionAsync } = useSendTransaction();

  signMessageAsync({
    message: 'Hello, world!',
    account: '0x1234567890123456789012345678901234567890',
  });

  // Use refs to avoid stale closures in the handler
  const signMessageAsyncRef = useRef(signMessageAsync);
  const signTypedDataAsyncRef = useRef(signTypedDataAsync);
  const sendTransactionAsyncRef = useRef(sendTransactionAsync);

  useEffect(() => {
    signMessageAsyncRef.current = signMessageAsync;
    signTypedDataAsyncRef.current = signTypedDataAsync;
    sendTransactionAsyncRef.current = sendTransactionAsync;
  }, [signMessageAsync, signTypedDataAsync, sendTransactionAsync]);

  /**
   * Handle a signing request from the iframe
   */
  const handleSignRequest = useCallback(
    async (request: ThirdPartyWalletSignRequest): Promise<ThirdPartyWalletSignResponse> => {
      const { requestId, method, params } = request;

      try {
        let result: string;

        switch (method) {
          case 'personal_sign': {
            // personal_sign params: [message, address]
            const [message] = params as [string, string];
            result = await signMessageAsyncRef.current({ message });
            break;
          }

          case 'eth_sign': {
            // eth_sign params: [address, message]
            const [, message] = params as [string, string];
            result = await signMessageAsyncRef.current({ message });
            break;
          }

          case 'eth_signTypedData':
          case 'eth_signTypedData_v3':
          case 'eth_signTypedData_v4': {
            // eth_signTypedData params: [address, typedData] or [typedData, address] for v1
            let typedData: any;
            if (method === 'eth_signTypedData') {
              // V1: [typedData, address]
              [typedData] = params as [any, string];
            } else {
              // V3/V4: [address, typedData]
              [, typedData] = params as [string, string | object];
            }

            // Parse typed data if it's a string
            const parsedTypedData = typeof typedData === 'string' ? JSON.parse(typedData) : typedData;

            // Extract the necessary fields for wagmi's signTypedData
            result = await signTypedDataAsyncRef.current({
              domain: parsedTypedData.domain,
              types: parsedTypedData.types,
              primaryType: parsedTypedData.primaryType,
              message: parsedTypedData.message,
            });
            break;
          }

          case 'eth_signTransaction': {
            // eth_signTransaction is not directly supported by most wallets via wagmi
            // The wallet would need to expose raw transaction signing capability
            throw new Error('eth_signTransaction requires direct wallet access. Use eth_sendTransaction instead.');
          }

          case 'eth_sendTransaction': {
            // eth_sendTransaction params: [transaction]
            const [transaction] = params as [any];
            const txResult = await sendTransactionAsyncRef.current({
              to: transaction.to,
              value: transaction.value ? BigInt(transaction.value) : undefined,
              data: transaction.data,
              gas: transaction.gas ? BigInt(transaction.gas) : undefined,
              gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
              maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : undefined,
              maxPriorityFeePerGas: transaction.maxPriorityFeePerGas
                ? BigInt(transaction.maxPriorityFeePerGas)
                : undefined,
            });
            result = txResult;
            break;
          }

          default:
            throw new Error(`Unsupported signing method: ${method}`);
        }

        return {
          requestId,
          result,
        };
      } catch (error) {
        console.error('Third-party wallet signing error:', error);
        return {
          requestId,
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Signing failed',
          },
        };
      }
    },
    [],
  );

  useEffect(() => {
    if (!enabled || !isConnected) {
      return;
    }

    const extension = getExtensionInstance();
    const unsubscribe = extension.registerSignHandler(handleSignRequest);

    return unsubscribe;
  }, [enabled, isConnected, handleSignRequest]);

  return null;
}

export default ThirdPartyWalletSignHandler;
