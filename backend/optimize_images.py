import os
from PIL import Image

def optimize_images_in_directory(root_dir, max_size_kb=50):
    print(f"Optimizing images in: {root_dir}")
    converted_count = 0
    total_saved_bytes = 0
    
    for dirpath, _, filenames in os.walk(root_dir):
        for f in filenames:
            ext = os.path.splitext(f)[1].lower()
            if ext not in ['.png', '.jpg', '.jpeg']:
                continue
                
            filepath = os.path.join(dirpath, f)
            try:
                size_kb = os.path.getsize(filepath) / 1024
                # Optimize if file size is above threshold
                if size_kb > max_size_kb:
                    webp_path = os.path.splitext(filepath)[0] + '.webp'
                    
                    # Convert to WebP
                    with Image.open(filepath) as img:
                        # Convert RGBA to RGB if saving as WebP/JPEG (WebP supports transparency, but RGB is smaller if no alpha)
                        if img.mode in ('RGBA', 'LA') and ext != '.png':
                            background = Image.new('RGB', img.size, (255, 255, 255))
                            background.paste(img, mask=img.split()[3]) # 3 is alpha
                            img = background
                            
                        # Save as webp with quality=80
                        img.save(webp_path, 'WEBP', quality=80)
                        
                    webp_size = os.path.getsize(webp_path)
                    original_size = os.path.getsize(filepath)
                    
                    if webp_size < original_size:
                        # Success, keep webp
                        saved = original_size - webp_size
                        total_saved_bytes += saved
                        converted_count += 1
                        print(f"Optimized: {f} -> {os.path.basename(webp_path)} (Saved {saved/1024:.1f} KB)")
                        
                        # Remove original file to save space and force WebP usage
                        os.remove(filepath)
                    else:
                        # If webp is larger, discard webp
                        os.remove(webp_path)
                        
            except Exception as e:
                print(f"Error processing {f}: {e}")
                
    print(f"Completed! Converted {converted_count} images. Total space saved: {total_saved_bytes / 1024 / 1024:.2f} MB")

if __name__ == '__main__':
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    
    # Paths to scan
    paths_to_optimize = [
        os.path.join(project_root, 'admin', 'src', 'assets'),
        os.path.join(project_root, 'user', 'src', 'assets'),
        os.path.join(project_root, 'user', 'public')
    ]
    
    for path in paths_to_optimize:
        if os.path.exists(path):
            optimize_images_in_directory(path)
