export function isMajorVersionAtLeast(version: string, majorVersion: number): boolean {
  // Split the version string into major, minor, and patch versions
  const [major] = version.split('.').map(Number);

  // Check if the major version is at least the required major version
  return major >= majorVersion;
}
