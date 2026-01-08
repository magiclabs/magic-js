import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

// Reown project ID
export const projectId = '141e0e0e531b47a47d662bca4eb70fae';

// Supported networks
export const networks = [mainnet, sepolia] as [AppKitNetwork, ...AppKitNetwork[]];

// Set up the Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

