#!/usr/bin/env python3
"""Optional asset preparation; requires ffmpeg, not an application dependency.

Inputs: the original 3200x2334 Beyond NASA-derived clip and matching poster.
Suppress isolated thin light in the central 1024px ROI, retaining original
pixels wherever the broad accretion disc survives a morphological opening.
Spatial feathering limits the correction to the black-hole centre. No disc
aperture, hard band clip or runtime canvas mask is introduced.
"""
from pathlib import Path
import argparse
import math
import shutil
import subprocess
import tempfile


def filter_graph():
    morph = ','.join(['erosion=coordinates=255'] * 18 + ['dilation=coordinates=255'] * 18)
    return (
        '[0:v]format=gbrp,split[base][roi];'
        '[roi]crop=1024:1024:1088:655,split[detail][morph];'
        f'[morph]{morph},extractplanes=r,lut=\'if(gt(val,10),0,255)\',gblur=sigma=2[signal];'
        '[1:v]format=gray[spatial];'
        '[signal][spatial]blend=all_mode=multiply[mask];'
        '[detail]split[original][black];'
        '[black]lutrgb=r=0:g=0:b=0[void];'
        '[original][void][mask]maskedmerge[clean];'
        '[base][clean]overlay=1088:655:format=rgb,format=rgb24[out]'
    )


def make_spatial_mask(path):
    n = 1024
    pixels = bytearray(n * n)
    for y in range(n):
        for x in range(n):
            radius = math.hypot(x + .5 - n / 2, y + .5 - n / 2)
            t = max(0, min(1, (radius - 320) / 110))
            pixels[y * n + x] = round(255 * (1 - t * t * (3 - 2 * t)))
    path.write_bytes(f'P5\n{n} {n}\n255\n'.encode() + pixels)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--video', type=Path, required=True)
    parser.add_argument('--poster', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    args = parser.parse_args()
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        parser.error('ffmpeg must be available to prepare media assets')
    args.output_dir.mkdir(parents=True, exist_ok=True)
    video = args.output_dir / 'black-hole-motion-clean.mp4'
    poster = args.output_dir / 'black-hole-detail-clean.jpg'
    if args.video.resolve() == video.resolve() or args.poster.resolve() == poster.resolve():
        parser.error('Keep the original inputs separate from the edited outputs')
    with tempfile.TemporaryDirectory(prefix='beyond-inner-ring-') as directory:
        mask = Path(directory) / 'spatial.pgm'
        make_spatial_mask(mask)
        common = [ffmpeg, '-hide_banner', '-loglevel', 'error', '-y']
        subprocess.run(common + ['-i', str(args.video), '-loop', '1', '-i', str(mask),
                       '-filter_complex', filter_graph(), '-map', '[out]', '-an', '-t', '5',
                       '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p',
                       '-movflags', '+faststart', str(video)], check=True)
        subprocess.run(common + ['-i', str(args.poster), '-i', str(mask),
                       '-filter_complex', filter_graph(), '-map', '[out]', '-q:v', '2',
                       '-frames:v', '1', str(poster)], check=True)
    print(f'Prepared {video.name} and {poster.name}')


if __name__ == '__main__':
    main()
