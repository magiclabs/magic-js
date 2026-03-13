import { useEmailLogin } from '../context/EmailLoginContext';
import { useOAuthLogin } from '../context/OAuthLoginContext';
import { useSmsLogin } from '../context/SmsLoginContext';

interface UseCancelLoginResult {
  cancelLogin: () => void;
}

export function useCancelLogin(): UseCancelLoginResult {
  const oauthContext = useOAuthLogin();
  const emailContext = useEmailLogin();
  const smsContext = useSmsLogin();

  // If the OAuth context has an active MFA flow, use it
  if (oauthContext.isMfaActive) {
    return {
      cancelLogin: oauthContext.cancelLogin,
    };
  }

  // Use SMS context for MFA if SMS login is active
  if (smsContext.isSmsLoginActive) {
    return {
      cancelLogin: smsContext.cancelLogin,
    };
  }

  // Default to the email login context
  return {
    cancelLogin: emailContext.cancelLogin,
  };
}
