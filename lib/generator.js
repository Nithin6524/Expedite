// generator.js
import path from "path";
import fs from "fs/promises";
import os from "os";
import chalk from "chalk";
import {
    REPO_URL,
    REPO_BRANCH,
    TEMPLATE_PATHS,
    FOLDER_NAMES,
} from "./constants.js";
import {
    checkGitInstalled,
    cloneRepo,
    setupTemplate,
    writeProjectMeta,
    cleanupTempDir,
    createDirIfNotExists,
    getTemplatePath,
} from "./utils.js";


export async function generateProject(config, spinner) {
    if (!checkGitInstalled()) {
        spinner.fail(
            chalk.red("Git is not installed. Please install it and try again.")
        );
        return false;
    }

    const tempDir = path.join(os.tmpdir(), `expedite-${Date.now()}`);
    await createDirIfNotExists(tempDir);

    try {
        spinner.start("Cloning templates...");
        await cloneRepo(REPO_URL, REPO_BRANCH, tempDir);
        spinner.succeed("Templates fetched successfully.");

        const projectDir = path.resolve(config.projectName);
        await createDirIfNotExists(projectDir);

        const frontendDir = path.join(projectDir, FOLDER_NAMES.frontend);
        const backendDir = path.join(projectDir, FOLDER_NAMES.backend);

        const frontendTemplatePath = getTemplatePath(
            TEMPLATE_PATHS.frontend,
            config.frontendStack,
            config.cssFramework
        );
        const backendTemplatePath = getTemplatePath(
            TEMPLATE_PATHS.backend,
            config.backendStack,
            config.database
        );

        const frontendFallback =
            TEMPLATE_PATHS.frontend[config.frontendStack]?.default;
        const backendFallback =
            TEMPLATE_PATHS.backend[config.backendStack]?.default;

        spinner.start(`Setting up ${config.frontendStack} frontend...`);
        await setupTemplate({
            type: "Frontend",
            tempDir,
            templatePath: frontendTemplatePath,
            destDir: frontendDir,
            fallbackPath: frontendFallback,
            spinner,
        });
        spinner.succeed("Frontend setup complete.");

        spinner.start(`Setting up ${config.backendStack} backend...`);
        await setupTemplate({
            type: "Backend",
            tempDir,
            templatePath: backendTemplatePath,
            destDir: backendDir,
            fallbackPath: backendFallback,
            spinner,
        });
        spinner.succeed("Backend setup complete.");

        spinner.start("Writing project configuration...");
        await writeProjectMeta(config, projectDir);
        spinner.succeed("Project configuration saved.");

        return true;
    } catch (err) {
        spinner.fail(chalk.red(`Project generation failed: ${err.message}`));
        return false;
    } finally {
        await cleanupTempDir(tempDir);
    }
}
