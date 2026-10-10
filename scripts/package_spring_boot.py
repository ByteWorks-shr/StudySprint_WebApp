import os
import zipfile

def package_spring_boot():
    source_dir = 'spring-boot-omnistudy'
    output_filename = 'spring-boot-omnistudy.zip'
    os.makedirs('public', exist_ok=True)
    public_target = os.path.join('public', output_filename)
    root_target = output_filename

    with zipfile.ZipFile(public_target, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, source_dir)
                zf.write(file_path, arcname=rel_path)

    import shutil
    shutil.copyfile(public_target, root_target)
    print(f"Created {output_filename} successfully ({os.path.getsize(public_target)} bytes).")

if __name__ == '__main__':
    package_spring_boot()
