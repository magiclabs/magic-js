import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

const DEFAULT_PROJECT_ID = 'ce9c27dd61e602ccdc9c536b6d624c63';

export const networks = [mainnet, sepolia] as [AppKitNetwork, ...AppKitNetwork[]];

export function createWagmiConfig(projectId?: string) {
  const resolvedProjectId = projectId ?? DEFAULT_PROJECT_ID;
  const wagmiAdapter = new WagmiAdapter({
    projectId: resolvedProjectId,
    networks,
  });

  return {
    projectId: resolvedProjectId,
    wagmiAdapter,
    wagmiConfig: wagmiAdapter.wagmiConfig,
  };
}
