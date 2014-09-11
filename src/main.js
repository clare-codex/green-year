// src/main.js

import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import chalk from 'chalk';

const execPromise = promisify(exec);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Executes a shell command and returns its output.
 * Now accepts an options object to be passed to exec.
 * @param {string} command - The shell command to execute.
 * @param {object} options - The options object for child_process.exec.
 * @returns {Promise<string>} The stdout from the command.
 */
async function runGitCommand(command, options = {}) {
    try {
        const { stdout, stderr } = await execPromise(command, options);
        if (stderr && command.includes('commit')) {
            console.error(chalk.yellow(`stderr from git: ${stderr}`));
        }
        return stdout;
    } catch (error) {
        console.error(chalk.red(`Failed to execute command: ${command}`), error);
        throw error;
    }
}

export async function createFakeCommits(startDateStr, endDateStr, repoPath = '.', minCommits = 1, maxCommits = 5) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
        console.error(chalk.red('Invalid date range. Please ensure the start date is not later than the end date.'));
        return;
    }
    
    const originalPath = process.cwd();
    try {
        process.chdir(repoPath);
        console.log(chalk.blue(`Switched to directory: ${process.cwd()}`));
    } catch (err) {
        console.error(chalk.red(`Could not access repository path: ${repoPath}`));
        return;
    }

    const spinner = ora('Generating commit history...').start();
    let currentDate = new Date(startDate);
    let totalCommitCount = 0;

    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString();
        const commitsForThisDay = getRandomInt(minCommits, maxCommits);

        for (let i = 1; i <= commitsForThisDay; i++) {
            const commitMessage = `feat: update on ${currentDate.toISOString().slice(0, 10)} (${i}/${commitsForThisDay})`;
            const fileContent = `${dateString} - commit #${i}`;

            await runGitCommand(`echo "${fileContent}" > commit.log`);
            await runGitCommand('git add commit.log');

            const commitCommand = `git commit -m "${commitMessage}"`;
            const commitOptions = {
                env: {
                    ...process.env,
                    'GIT_AUTHOR_DATE': dateString,
                    'GIT_COMMITTER_DATE': dateString
                }
            };

            await runGitCommand(commitCommand, commitOptions);
            
            totalCommitCount++;
        }
        
        spinner.text = `Generated ${totalCommitCount} commits... Current Date: ${chalk.green(currentDate.toISOString().slice(0, 10))}`;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    spinner.succeed(chalk.green.bold(`Successfully generated ${totalCommitCount} commits!`));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.cyan('1. Add your remote repository: git remote add origin <your-repo-url>'));
    console.log(chalk.cyan('2. Force push to the remote repository: git push -u origin main --force'));

    process.chdir(originalPath);
}