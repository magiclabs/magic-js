/**
 * List of restricted domains that should be blocked
 * @type {Array<string>}
 */
const restrictedDomains: Array<string> = ['.cu', '.ir', '.kp', '.sy', '.gob.ve'];

/**
 * Function to check if an email belongs to a sanctioned domain
 * @param {string} email - The email address to be checked
 * @returns {boolean} - Returns true if the email is allowed, false otherwise
 */
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

/**
 * Returns `true` if the given `source` is an email address, `false` otherwise.
 */
export function isValidEmail(source?: string | null) {
  if (!source) return false;

  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(source);
}
