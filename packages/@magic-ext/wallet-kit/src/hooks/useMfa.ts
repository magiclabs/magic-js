import { useEmailLogin } from '../context/EmailLoginContext';
import { useOAuthLogin } from '../context/OAuthLoginContext';
import { useSmsLogin } from '../context/SmsLoginContext';
import { usePasskeyLogin } from '../context/PasskeyLoginContext';

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
  const passkeyContext = usePasskeyLogin();

  // If the OAuth context has an active MFA flow, use it
  if (oauthContext.isMfaActive) {
    return {
      submitMFA: oauthContext.submitMFA,
      lostDevice: oauthContext.lostDevice,
      submitRecoveryCode: oauthContext.submitRecoveryCode,
      cancelLogin: oauthContext.cancelLogin,
    };
  }

  // Use Passkey context for MFA if passkey login is active
  if (passkeyContext.isPasskeyLoginActive) {
    return {
      submitMFA: passkeyContext.submitMFA,
      lostDevice: passkeyContext.lostDevice,
      submitRecoveryCode: passkeyContext.submitRecoveryCode,
      cancelLogin: passkeyContext.cancelLogin,
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
