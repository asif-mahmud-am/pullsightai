import os

IGNORED_EXTENSIONS = {
    ".lock", ".log", ".tmp", ".bak", ".iml", ".zip", ".tar", ".gz",
    ".png", ".jpg", ".jpeg", ".gif", ".pdf", ".svg", ".ico", ".mp4", ".mp3"
}


IGNORED_FILES = {
    ".env", ".DS_Store", ".gitignore", ".gitattributes", ".gitmodules",
    "requirements.txt", "Pipfile", "Pipfile.lock", "poetry.lock", "pyproject.lock",
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Gemfile.lock", "Cargo.lock", "composer.lock",
    "README.md", "CHANGELOG.md", "LICENSE", "CONTRIBUTING.md"
}

IGNORED_DIRS = {"node_modules", "dist", "build", "out", ".idea", ".vscode", "pycache", "site_packages"}


def filter_pr_files(filepath: str) -> bool:
    """Return True if file should be ignored for PR summarization."""
    filename = os.path.basename(filepath)
    ext = os.path.splitext(filename)[1]
    parts = filepath.replace("\\", "/").split("/")

    if filename in IGNORED_FILES:
        return True
    if ext in IGNORED_EXTENSIONS:
        return True
    if any(part in IGNORED_DIRS for part in parts):
        return True
    return False 