// NOTE: This module is automatically included at the top of each test file.

import browserEnv from '@ikscodes/browser-env';
import { enableMocks, removeReactDependencies, removeWhatwgUrl } from './mocks';

browserEnv();
enableMocks();

removeReactDependencies();
removeWhatwgUrl();
