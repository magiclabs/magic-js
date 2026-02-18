import { useEmailLogin } from '../context/EmailLoginContext';
import { useOAuthLogin } from '../context/OAuthLoginContext';

interface UseMfaResult {
  submitMFA: (totp: string) => void;
  lostDevice: () => void;
  submitRecoveryCode: (recoveryCode: string) => void;
  cancelLogin: () => void;
}

export function useMfa(): UseMfaResult {
  const oauthContext = useOAuthLogin();
  const emailContext = useEmailLogin();

  // If the OAuth context has an active MFA flow, use it
  if (oauthContext.isMfaActive) {
    return {
      submitMFA: oauthContext.submitMFA,
      lostDevice: oauthContext.lostDevice,
      submitRecoveryCode: oauthContext.submitRecoveryCode,
      cancelLogin: oauthContext.cancelLogin,
    };
  }

  // Default to the email login context
  return {
    submitMFA: emailContext.submitMFA,
    lostDevice: emailContext.lostDevice,
    submitRecoveryCode: emailContext.submitRecoveryCode,
    cancelLogin: emailContext.cancelLogin,
  };
}
