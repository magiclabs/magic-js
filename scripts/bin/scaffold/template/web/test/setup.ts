// NOTE: This module is automatically included at the top of each test file.
import browserEnv from '@ikscodes/browser-env';
import { mockConsole } from "../../../../../utils/mock-console";

browserEnv();
beforeEach(() => {
    mockConsole();
});
