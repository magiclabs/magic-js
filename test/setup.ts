// NOTE: This modles is automatically included at the top of each test file.

import browserEnv from '@ikscodes/browser-env';
import { enableMocks, mockReactDependencies, mockWhatwgUrl } from './mocks';

browserEnv();
enableMocks();

mockReactDependencies();
mockWhatwgUrl();
