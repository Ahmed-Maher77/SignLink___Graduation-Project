import os
import sys
from distutils.sysconfig import get_python_lib

def find_augmentations_file():
    site_packages = get_python_lib()
    for root, dirs, files in os.walk(site_packages):
        if root.endswith(os.path.join("pytorchvideo", "transforms")) and "augmentations.py" in files:
            return os.path.join(root, "augmentations.py")
    return None

def fix_import_line(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    already_fixed = any("import torchvision.transforms.functional as F_t" in line for line in lines)
    if already_fixed:
        print(f"✅ Already fixed: {file_path}")
        return

    modified = False
    new_lines = []
    for line in lines:
        if "import torchvision.transforms.functional_tensor as F_t" in line:
            new_lines.append("import torchvision.transforms.functional as F_t\n")
            modified = True
        else:
            new_lines.append(line)

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"✅ Fix applied to: {file_path}")
    else:
        print(f"ℹ️ No matching import found in: {file_path}. Nothing changed.")

if __name__ == "__main__":
    path = find_augmentations_file()
    if path:
        fix_import_line(path)
    else:
        print("❌ Could not find augmentations.py in the current environment.")
