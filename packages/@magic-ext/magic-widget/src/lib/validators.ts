const restrictedDomains: Array<string> = ['.cu', '.ir', '.kp', '.sy', '.gob.ve'];

export function isSanctionedEmail(email: string): boolean {
  if (!email) {
    return false;
  }

  const lowerEmail = email.toLowerCase();
  const blockedDomain = restrictedDomains.find(domain => lowerEmail.endsWith(domain));

  if (blockedDomain) {
    return true;
  }

  return false;
}

export function isValidEmail(source?: string | null) {
  if (!source) return false;

  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(source);
}
