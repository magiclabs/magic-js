import chalk from 'chalk';

/**
 * Prints a labeled separator to create a nice visual
 * distinction between sections of script output.
 */
export function printSeparator(label: string) {
  console.log(chalk`\n{dim ❮❮❮} ${label} {dim ❯❯❯}\n`);
}
