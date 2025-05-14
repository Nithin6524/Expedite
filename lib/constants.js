// Repository and template information
export const REPO_URL = "https://github.com/Nithin6524/expedite-templates";
export const REPO_BRANCH = "main";

// Template paths
export const TEMPLATE_PATHS = {
    frontend: {
        React: {
            "Tailwind CSS": "templates/frontend/react/tailwind",
            Bootstrap: "templates/frontend/react/bootstrap",
            // Fallback if specific CSS framework not available
            default: "templates/frontend/react/scss",
        },
        Vue: {
            "Tailwind CSS": "templates/frontend/vue/tailwind",
            Bootstrap: "templates/frontend/vue/bootstrap",
            // Fallback if specific CSS framework not available
            default: "templates/frontend/vue/scss",
        },
    },
    backend: {
        "Express.js": {
            MongoDB: "templates/backend/express/mongodb",
            PostgreSQL: "templates/backend/express/postgresql",
            MySQL: "templates/backend/express/mysql",
            // Fallback if specific database not available
            default: "templates/backend/express/mongodb",
        },
        Django: {
            PostgreSQL: "templates/backend/django/postgresql",
            MySQL: "templates/backend/django/mysql",
            // Fallback if specific database not available
            default: "templates/backend/django/postgresql",
        },
    },
};

// Folder names
export const FOLDER_NAMES = {
    frontend: "Frontend",
    backend: "Backend",
};
