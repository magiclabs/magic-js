import chalk from 'chalk';
import execa from 'execa';
import { prompt } from 'enquirer';
import isCI from 'is-ci';

export interface PnpmWorkspace {
  location: string;
  name: string;
  workspaceDependencies: string[];
}

/**
 * Returns metadata for the workspaces in this respository.
 */
export async function getAllWorkspaces(): Promise<PnpmWorkspace[]> {
  const subprocess = await execa('pnpm', ['ls', '--json', '--depth', '-1']);
  const workspacesData = JSON.parse(subprocess.stdout);
  
  const workspaces = workspacesData
    .filter((pkg: any) => pkg.name !== 'magic-sdk-monorepo')
    .map((pkg: any) => ({
      name: pkg.name,
      location: pkg.path.replace(`${process.cwd()}/`, ''),
      workspaceDependencies: Object.keys(pkg.dependencies || {})
        .filter((dep) => workspacesData.some((ws: any) => ws.name === dep))
        .map((dep) => workspacesData.find((ws: any) => ws.name === dep)?.path.replace(`${process.cwd()}/`, ''))
        .filter(Boolean)
    }));

  return workspaces;
}

/**
 * Prompts for a package query and returns the result. If the user has already
 * been prompted for a package query, the saved query is returned (attached also
 * to `process.env.PKG`).
 */
export async function promptForPackage(options: { allowAll?: boolean } = {}) {
  if (process.env.PKG) return process.env.PKG;
  if (isCI) return '*';
  const { allowAll = true } = options;

  const packages = (await getAllWorkspaces()).map((i) => i.name);

  const extPkgs = packages.filter((i) => i.includes('@magic-ext'));
  const sdkPkgs = packages
    .filter((i) => i.includes('@magic-sdk') || i === 'magic-sdk')
    // sort `magic-sdk` first
    .sort((i) => (i.startsWith('@') ? 0 : -1));

  const sep = { role: 'separator' };

  const { pkg } = await prompt<any>({
    type: 'autocomplete',
    name: 'pkg',
    message: 'Select a workspace:',
    choices: [allowAll && { name: 'all', value: '*' }, allowAll && sep, ...sdkPkgs, sep, ...extPkgs, sep].filter(
      Boolean,
    ),
    initial: allowAll ? '*' : 'magic-sdk',
  } as any);

  process.env.PKG = pkg;

  return pkg;
}

/**
 * Gets a listing of packages in the workspace
 * (narrowed by the given `pkgQuery`).
 */
export async function getPackages(pkgQuery: string) {
  const workspaces = await getAllWorkspaces();

  const entrypoints = workspaces
    .filter((i) => i.name === pkgQuery || pkgQuery === '*')
    .filter((_, i, arr) => {
      if (pkgQuery !== '*') return true;
      return arr.every((workspace) => {
        return !workspace.workspaceDependencies.includes(workspaces[i].location);
      });
    });

  const recursiveDependencyReducer = (acc: PnpmWorkspace[], workspace: PnpmWorkspace) => {
    const result = [
      ...acc,
      ...workspace.workspaceDependencies.map((i) => workspaces.find((j) => j.location === i)).filter(Boolean),
    ] as PnpmWorkspace[];

    const nextDependencies = workspace.workspaceDependencies
      .map((location) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        return workspaces.find((ws) => ws.location === location);
      })
      .filter(Boolean) as PnpmWorkspace[];

    if (nextDependencies.length) {
      return nextDependencies.reduce(recursiveDependencyReducer, result);
    }

    return [...new Set(result)];
  };

  const dependencies = entrypoints.reduce(recursiveDependencyReducer, []);

  const packages = [...dependencies, ...entrypoints].sort((a, b) => {
    if (a.workspaceDependencies.includes(b.location)) return 1;
    if (b.workspaceDependencies.includes(a.location)) return -1;
    return 0;
  });

  return {
    entrypoints: entrypoints.map((i) => i.name),
    dependencies: dependencies.map((i) => i.name),
    packages: packages.map((i) => i.name),
    workspaces: packages,
  };
}

/**
 * Log the given `packages` (a string of package names in the workspace).
 */
export function printPackages(packages: string[]) {
  console.log(
    packages
      .slice()
      .sort()
      .map((cfgPath) => {
        const prefix = chalk`{gray packages/}`;
        return `${prefix}${cfgPath}`;
      })
      .reduce((prev, next, i) => {
        if (i === 0) return chalk`${prev}    {gray -} ${next}`;
        return chalk`${prev}\n    {gray -} ${next}`;
      }, ''),
  );
}
