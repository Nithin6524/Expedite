import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";
// Check if git is installed
export function checkGitInstalled() {
    try {
        execSync("git --version", { stdio: "ignore" });
        return true;
    } catch (error) {
        return false;
    }
}
// Create directory if it doesn't exist
export async function createDirIfNotExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch (error) {
        await fs.mkdir(dirPath, { recursive: true });
    }
}
// Clone repository to temporary directory
export async function cloneRepo(repoUrl, branch, targetDir) {
    try {
        execSync(
            `git clone --depth 1 --branch ${branch} ${repoUrl} ${targetDir}`,
            { stdio: "ignore" }
        );
        return true;
    } catch (error) {
        console.error(
            chalk.red(`Failed to clone repository: ${error.message}`)
        );
        return false;
    }
}
// Copy directory recursively
export async function copyDir(src, dest) {
    await createDirIfNotExists(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}
// Clean up temporary directory
export async function cleanupTempDir(tempDir) {
    try {
        await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
        console.error(
            chalk.yellow(
                `Warning: Failed to clean up temporary directory: ${error.message}`
            )
        );
    }
}
// Get template path with fallback
export function getTemplatePath(templates, stack, framework) {
    if (templates[stack] && templates[stack][framework]) {
        return templates[stack][framework];
    } else if (templates[stack] && templates[stack].default) {
        return templates[stack].default;
    } else {
        return null;
    }
}


export async function setupTemplate({
    type,
    tempDir,
    templatePath,
    destDir,
    fallbackPath,
    spinner,
}) {
    if (!templatePath) {
        spinner.warn(chalk.yellow(`No template path provided for ${type}.`));
        await createDirIfNotExists(destDir);
        return;
    }

    const src = path.join(tempDir, templatePath);

    try {
        await fs.access(src);
        await copyDir(src, destDir);
    } catch (err) {
        spinner.warn(
            chalk.yellow(
                `${type} template not found. Trying fallback template...`
            )
        );
        try {
            await fs.access(path.join(tempDir, fallbackPath));
            await copyDir(path.join(tempDir, fallbackPath), destDir);
        } catch {
            spinner.warn(
                chalk.yellow(
                    `No suitable ${type} template found. Creating empty dir.`
                )
            );
            await createDirIfNotExists(destDir);
        }
    }
}

export async function writeProjectMeta(config, projectDir) {
    const configFile = {
        projectName: config.projectName,
        frontend: {
            framework: config.frontendStack,
            cssFramework: config.cssFramework,
        },
        backend: {
            framework: config.backendStack,
            database: config.database,
        },
        generatedAt: new Date().toISOString(),
    };

    await fs.writeFile(
        path.join(projectDir, "expedite.json"),
        JSON.stringify(configFile, null, 2)
    );
}
