import { useEmailLogin } from '../context/EmailLoginContext';
import { useOAuthLogin } from '../context/OAuthLoginContext';
import { useSmsLogin } from '../context/SmsLoginContext';

interface UseMfaResult {
  submitMFA: (totp: string) => void;
  lostDevice: () => void;
  submitRecoveryCode: (recoveryCode: string) => void;
  cancelLogin: () => void;
}

export function useMfa(): UseMfaResult {
  const oauthContext = useOAuthLogin();
  const emailContext = useEmailLogin();
  const smsContext = useSmsLogin();

  // If the OAuth context has an active MFA flow, use it
  if (oauthContext.isMfaActive) {
    return {
      submitMFA: oauthContext.submitMFA,
      lostDevice: oauthContext.lostDevice,
      submitRecoveryCode: oauthContext.submitRecoveryCode,
      cancelLogin: oauthContext.cancelLogin,
    };
  }

  // Use SMS context for MFA if SMS login is active
  if (smsContext.isSmsLoginActive) {
    return {
      submitMFA: smsContext.submitMFA,
      lostDevice: smsContext.lostDevice,
      submitRecoveryCode: smsContext.submitRecoveryCode,
      cancelLogin: smsContext.cancelLogin,
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
