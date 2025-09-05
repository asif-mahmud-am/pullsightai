import os
import fnmatch

IGNORED_EXTENSIONS = {
    ".lock", ".log", ".tmp", ".bak", ".iml", ".zip", ".tar", ".gz",
    ".png", ".jpg", ".jpeg", ".gif", ".pdf", ".svg", ".ico", ".mp4", ".mp3",".json"
}

IGNORED_FILES = {
    ".env", ".DS_Store", ".gitignore", ".gitattributes", ".gitmodules",
    "requirements.txt", "Pipfile", "Pipfile.lock", "poetry.lock", "pyproject.lock",
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Gemfile.lock", "Cargo.lock", "composer.lock",
    "README.md", "CHANGELOG.md", "LICENSE", "CONTRIBUTING.md"
}

IGNORED_DIRS = {"node_modules", "dist", "build", "out", ".idea", ".vscode", "pycache", "site_packages"}


def filter_pr_files(ignore_list: list, pr_files: list) -> list:
    """
    Filter PR files based on ignore patterns and predefined ignore rules.
    
    Args:
        ignore_list: List of patterns to ignore (e.g., ["vendor/**", "dist/**", "tests/fixtures/**"])
        pr_files: List of PR file paths to filter
        
    Returns:
        List of PR files that should NOT be ignored
    """
    filtered_files = []
    
    for pr_file in pr_files:
        # Normalize path separators to forward slashes
        normalized_file = pr_file.replace("\\", "/")
        filename = os.path.basename(normalized_file)
        ext = os.path.splitext(filename)[1]
        parts = normalized_file.split("/")
        
        # Check predefined ignore rules
        should_ignore = False
        
        # Check filename against IGNORED_FILES
        if filename in IGNORED_FILES:
            should_ignore = True
            
        # Check extension against IGNORED_EXTENSIONS
        elif ext in IGNORED_EXTENSIONS:
            should_ignore = True
            
        # Check if any directory part is in IGNORED_DIRS
        elif any(part in IGNORED_DIRS for part in parts):
            should_ignore = True
            
        # Check against custom ignore patterns
        else:
            for ignore_pattern in ignore_list:
                # Handle glob patterns like "vendor/**", "dist/**"
                if fnmatch.fnmatch(normalized_file, ignore_pattern):
                    should_ignore = True
                    break
                # Handle directory patterns like "tests/fixtures/**"
                elif ignore_pattern.endswith("/**"):
                    dir_pattern = ignore_pattern[:-3]  # Remove "**"
                    if normalized_file.startswith(dir_pattern + "/") or normalized_file == dir_pattern:
                        should_ignore = True
                        break
                # Handle exact file matches (full path)
                elif normalized_file == ignore_pattern:
                    should_ignore = True
                    break
                # Handle filename-only matches (ignore by filename regardless of path)
                elif filename == ignore_pattern:
                    should_ignore = True
                    break
                # Handle filename with extension patterns like "*.lock", "*.log"
                elif ignore_pattern.startswith("*") and fnmatch.fnmatch(filename, ignore_pattern):
                    should_ignore = True
                    break
        
        # Add file to filtered list if it should NOT be ignored
        if not should_ignore:
            filtered_files.append(pr_file)
    
    return filtered_files
