#!/usr/bin/env node

// bin/green-year.js
// This is entry
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import { createFakeCommits } from '../src/main.js';

console.log(chalk.green.bold('=== Green Year CLI ==='));

yargs(hideBin(process.argv))
  .command(
    '$0 <startDate> <endDate>', 
    'Generates fake Git commits in a specified date range with random frequency.', 
    (yargs) => {
      return yargs
        .positional('startDate', {
          describe: 'Start date (YYYY-MM-DD)',
          type: 'string',
        })
        .positional('endDate', {
          describe: 'End date (YYYY-MM-DD)',
          type: 'string',
        })
        .option('repo', {
            alias: 'r',
            type: 'string',
            description: 'Path to the Git repository',
            default: '.'
        })
        .option('min', {
            type: 'number',
            description: 'Minimum commits per day',
            default: 1
        })
        .option('max', {
            type: 'number',
            description: 'Maximum commits per day',
            default: 5
        });
    }, 
    async (argv) => {
      if (argv.min > argv.max) {
          console.error(chalk.red('Error: --min value cannot be greater than --max value.'));
          return;
      }
      if (argv.startDate && argv.endDate) {
        await createFakeCommits(argv.startDate, argv.endDate, argv.repo, argv.min, argv.max);
      }
    }
  )
  .demandCommand(1, 'You need to provide a command.')
  .help()
  .alias('help', 'h')
  .alias('version', 'v')
  .strict()
  .parse();