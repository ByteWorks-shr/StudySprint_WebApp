import os
import zipfile

IGNORED_DIRS = {'node_modules', '.git', 'dist', '.cache', '__pycache__'}
IGNORED_FILES = {'.DS_Store', 'bun.lock'}

def make_zip():
    output_filename = 'OmniStudy-source-code.zip'
    os.makedirs('public', exist_ok=True)
    public_target = os.path.join('public', output_filename)
    root_target = output_filename

    # We will generate into public/OmniStudy-source-code.zip
    with zipfile.ZipFile(public_target, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk('.'):
            # Prune ignored directories in-place
            dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith('.')]
            
            for file in files:
                if file in IGNORED_FILES or file.endswith('.zip'):
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, '.')
                if rel_path.startswith('public/' + output_filename):
                    continue
                zf.write(file_path, arcname=rel_path)

    # Also copy to root
    import shutil
    shutil.copyfile(public_target, root_target)
    print(f"Created {output_filename} successfully ({os.path.getsize(public_target)} bytes).")

if __name__ == '__main__':
    make_zip()
