import { getDefaultKeyAlias } from '@sbaiahmed1/react-native-biometrics';
import { DPOP_KEY_ALIAS_SUFFIX } from '../constants';

export const getDpopAlias = async () => {
  // Each client integrating our SDK gets unique defaultAlias based on their bundle id or package name
  // We append our own suffix to the defaultAlias
  const defaultAlias = await getDefaultKeyAlias();
  const DPOP_KEY_ALIAS = `${defaultAlias}.${DPOP_KEY_ALIAS_SUFFIX}`;

  return DPOP_KEY_ALIAS;
};
