import os

EXCLUDE_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv",
    "dist", "build", ".idea", ".vscode"
}

EXCLUDE_FILES = {
    ".DS_Store"
}

OUTPUT_FILE = "REPO_MAP.md"


def generate_tree(start_path, prefix=""):
    lines = []
    items = sorted(os.listdir(start_path))
    items = [i for i in items if i not in EXCLUDE_DIRS and i not in EXCLUDE_FILES]

    for index, item in enumerate(items):
        path = os.path.join(start_path, item)
        connector = "├── " if index < len(items) - 1 else "└── "

        lines.append(prefix + connector + item)

        if os.path.isdir(path):
            extension = "│   " if index < len(items) - 1 else "    "
            lines.extend(generate_tree(path, prefix + extension))

    return lines


def write_markdown():
    tree_lines = generate_tree(".")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("# 📁 Project Repository Structure\n\n")
        f.write("This document represents the complete structure of the project repository.\n\n")
        f.write("```bash\n")
        f.write(".\n")
        for line in tree_lines:
            f.write(line + "\n")
        f.write("```\n\n")

        f.write("## 📌 Description\n")
        f.write("- Organized DevOps pipeline structure\n")
        f.write("- Separate modules for Docker, Terraform, Kubernetes, Ansible, and CI/CD\n")
        f.write("- Follows industry-level modular architecture\n")


if __name__ == "__main__":
    write_markdown()
    print(f"✅ Repo map generated successfully in {OUTPUT_FILE}")