// lib/prompts.js
import figlet from "figlet";
import gradient from "gradient-string";
import boxen from "boxen";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import ora from "ora";
import { generateProject } from "./generator.js";
import { installDependencies } from "./installer.js";

export async function runPrompts() {
    // 1. Render the banner
    const banner = figlet.textSync("Expedite", {
        horizontalLayout: "default",
        verticalLayout: "default",
    });

    // 2. Apply custom gradient and box it
    const customGradient = gradient([
        '#FFBB65',        // orange/gold
        { r: 0, g: 255, b: 200 }, // teal
        'rgb(161, 161, 248)',     // light blue
        '#6A5ACD'         // slate blue
    ]);
    
    const coloredBanner = customGradient(banner);
    const box = boxen(coloredBanner, {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
    });

    console.log(box);

    // 3. Welcome message with gradient
    const welcomeText = "⚡ Welcome to Expedite — Full-stack Project scaffolding tool!";
    console.log(customGradient(welcomeText));

    // Load compatibility matrix
    const matrix = await loadCompatibilityMatrix();
    
    // Run the interactive prompts
    const answers = await promptUserChoices(matrix);
    
    // Confirm choices
    const confirmed = await confirmChoices(answers);
    
    if (confirmed) {
        // Show spinner while generating project
        const spinner = ora({
            text: 'Initializing project scaffolding...',
            color: 'cyan'
        }).start();
        
        // Generate project
        const success = await generateProject(answers, spinner);
        
        if (success) {
            // Install dependencies
            spinner.text = 'Installing dependencies...';
            await installDependencies(path.resolve(answers.projectName), spinner);
            
            spinner.succeed(chalk.green('Project successfully generated!'));
            
            // Show next steps
            showNextSteps(answers.projectName);
        } else {
            spinner.fail(chalk.red('Project generation failed.'));
            process.exit(1);
        }
    } else {
        console.log(chalk.yellow("Project generation cancelled. Please run the command again to start over."));
        process.exit(0);
    }
    
    return answers;
}

async function loadCompatibilityMatrix() {
    try {
        const matrixPath = path.resolve('lib/compatability_matrix.json');
        const data = await fs.readFile(matrixPath, 'utf8');
        return JSON.parse(data).compatibility_matrix;
    } catch (error) {
        console.error(chalk.red('Error loading compatibility matrix:'), error);
        process.exit(1);
    }
}

async function promptUserChoices(matrix) {
    const questions = [
        {
            type: 'input',
            name: 'projectName',
            message: 'What is your project name?',
            default: 'my-fullstack-app'
        },
        {
            type: 'list',
            name: 'frontendStack',
            message: 'Select your frontend framework:',
            choices: matrix.frontend.stacks
        },
        {
            type: 'list',
            name: 'cssFramework',
            message: 'Select your CSS framework:',
            choices: (answers) => {
                const compatibleCss = Object.entries(matrix.frontend.frontend_compatibility[answers.frontendStack])
                    .filter(([_, isCompatible]) => isCompatible)
                    .map(([framework]) => framework);
                return compatibleCss;
            }
        },
        {
            type: 'list',
            name: 'backendStack',
            message: 'Select your backend framework:',
            choices: matrix.backend.stacks
        },
        {
            type: 'list',
            name: 'database',
            message: 'Select your database:',
            choices: (answers) => {
                const compatibleDbs = Object.entries(matrix.backend.backend_compatibility[answers.backendStack])
                    .filter(([_, isCompatible]) => isCompatible)
                    .map(([db]) => db);
                return compatibleDbs;
            }
        }
    ];

    return inquirer.prompt(questions);
}

async function confirmChoices(choices) {
    console.log("\n" + chalk.cyan("Your project configuration:"));
    console.log(chalk.cyan("─".repeat(30)));
    
    Object.entries(choices).forEach(([key, value]) => {
        console.log(`${chalk.cyan(key)}: ${chalk.white(value)}`);
    });
    
    console.log(chalk.cyan("─".repeat(30)));
    
    const { confirmed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message: 'Do you want to generate a project with these settings?',
            default: true
        }
    ]);
    
    return confirmed;
}

function showNextSteps(projectName) {
    console.log('\n' + chalk.green('✓') + ' Your new project is ready!');
    console.log(chalk.cyan(`\nNext steps:`));
    console.log(chalk.white(`  1. cd ${projectName}`));
    console.log(chalk.white('  2. Start the frontend:'));
    console.log(chalk.white('     cd Frontend && npm start'));
    console.log(chalk.white('  3. Start the backend:'));
    console.log(chalk.white('     cd Backend && npm start'));
}
