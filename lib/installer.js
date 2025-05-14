import { execSync } from "child_process";
import path from "path";
import chalk from "chalk";
export async function installDependencies(projectPath, spinner) {
    const frontendDir = path.join(projectPath, "Frontend");
    const backendDir = path.join(projectPath, "Backend");
    try {
        // Install frontend dependencies    spinner.text = 'Installing frontend dependencies...';
        try {
            process.chdir(frontendDir);
            execSync("npm install", { stdio: "ignore" });
        } catch (error) {
            spinner.warn(
                chalk.yellow(
                    `Failed to install frontend dependencies: ${error.message}`
                )
            );
        }
        // Install backend dependencies
        spinner.text = "Installing backend dependencies...";
        try {
            process.chdir(backendDir);
            execSync("npm install", { stdio: "ignore" });
        } catch (error) {
            spinner.warn(
                chalk.yellow(
                    `Failed to install backend dependencies: ${error.message}`
                )
            );
        }
        // Return to original directory    process.chdir(projectPath);
        return true;
    } catch (error) {
        spinner.fail(
            chalk.red(`Dependency installation failed: ${error.message}`)
        );
        return false;
    }
}
