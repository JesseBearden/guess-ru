#!/usr/bin/env python3
"""
Silhouette Generator Script

Takes a headshot image and generates a corresponding silhouette image.
The silhouette is created by removing the background and filling the 
subject with a solid color.

Requirements:
    pip install rembg pillow

Usage:
    python generate_silhouette.py input.jpg output.png
    python generate_silhouette.py input.jpg output.png --color "#1a1a2e"
    python generate_silhouette.py --batch input_folder output_folder
"""

import argparse
import sys
from pathlib import Path

try:
    from rembg import remove
    from PIL import Image
    import io
except ImportError:
    print("Missing required packages. Install them with:")
    print("  pip install rembg pillow")
    sys.exit(1)


def generate_silhouette(
    input_path: str,
    output_path: str,
    silhouette_color: tuple = (26, 26, 46),  # Dark navy blue
    background_color: tuple = (255, 255, 255, 0),  # Transparent
) -> bool:
    """
    Generate a silhouette from an input image.
    
    Args:
        input_path: Path to the input image
        output_path: Path to save the silhouette
        silhouette_color: RGB tuple for the silhouette fill color
        background_color: RGBA tuple for the background (default transparent)
    
    Returns:
        True if successful, False otherwise
    """
    try:
        # Load the input image
        input_image = Image.open(input_path)
        
        # Remove the background using rembg
        # This returns an image with transparent background
        output_bytes = remove(input_image)
        
        # If rembg returns bytes, convert to image
        if isinstance(output_bytes, bytes):
            no_bg_image = Image.open(io.BytesIO(output_bytes))
        else:
            no_bg_image = output_bytes
        
        # Ensure we have RGBA mode
        if no_bg_image.mode != 'RGBA':
            no_bg_image = no_bg_image.convert('RGBA')
        
        # Get the alpha channel (mask of the subject)
        alpha = no_bg_image.split()[3]
        
        # Create a new image with the silhouette color
        silhouette = Image.new('RGBA', no_bg_image.size, background_color)
        
        # Create a solid color image for the silhouette
        solid_color = Image.new('RGBA', no_bg_image.size, (*silhouette_color, 255))
        
        # Composite using the alpha mask
        silhouette = Image.composite(solid_color, silhouette, alpha)
        
        # Save the result
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        silhouette.save(output_path, 'PNG')
        
        print(f"✓ Generated silhouette: {output_path}")
        return True
        
    except Exception as e:
        print(f"✗ Error processing {input_path}: {e}")
        return False


def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color string to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def process_batch(input_folder: str, output_folder: str, silhouette_color: tuple):
    """Process all images in a folder."""
    input_path = Path(input_folder)
    output_path = Path(output_folder)
    
    if not input_path.exists():
        print(f"Error: Input folder '{input_folder}' does not exist")
        return
    
    # Supported image extensions
    extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'}
    
    # Find all images
    images = [f for f in input_path.iterdir() 
              if f.is_file() and f.suffix.lower() in extensions]
    
    if not images:
        print(f"No images found in '{input_folder}'")
        return
    
    print(f"Processing {len(images)} images...")
    
    success_count = 0
    for img_path in images:
        output_file = output_path / f"{img_path.stem}.png"
        if generate_silhouette(str(img_path), str(output_file), silhouette_color):
            success_count += 1
    
    print(f"\nCompleted: {success_count}/{len(images)} images processed successfully")


def main():
    parser = argparse.ArgumentParser(
        description='Generate silhouette images from headshots',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s headshot.jpg silhouette.png
  %(prog)s headshot.jpg silhouette.png --color "#1a1a2e"
  %(prog)s --batch ./headshots ./silhouettes
  %(prog)s --batch ./headshots ./silhouettes --color "#000000"
        """
    )
    
    parser.add_argument(
        'input',
        nargs='?',
        help='Input image path (or input folder with --batch)'
    )
    parser.add_argument(
        'output',
        nargs='?',
        help='Output image path (or output folder with --batch)'
    )
    parser.add_argument(
        '--color', '-c',
        default='#1a1a2e',
        help='Silhouette color in hex format (default: #1a1a2e - dark navy)'
    )
    parser.add_argument(
        '--batch', '-b',
        action='store_true',
        help='Process all images in input folder'
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.input or not args.output:
        parser.print_help()
        sys.exit(1)
    
    # Parse color
    try:
        silhouette_color = hex_to_rgb(args.color)
    except ValueError:
        print(f"Error: Invalid color format '{args.color}'. Use hex format like #1a1a2e")
        sys.exit(1)
    
    # Process
    if args.batch:
        process_batch(args.input, args.output, silhouette_color)
    else:
        if not Path(args.input).exists():
            print(f"Error: Input file '{args.input}' does not exist")
            sys.exit(1)
        
        success = generate_silhouette(args.input, args.output, silhouette_color)
        sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
