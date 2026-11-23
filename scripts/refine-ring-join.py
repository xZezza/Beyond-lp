#!/usr/bin/env python3
"""Remove the small surviving ring/disc join from the already cleaned NASA clip.

Offline, local-only preparation using ffmpeg and Python's standard library.
The narrow join is replaced by the smooth boundary between its two unchanged
neighbours. No application-time crop, aperture or additional dependency.
"""
import argparse
from pathlib import Path
import subprocess
import tempfile

X,Y,W,H=1280,1080,200,320
LEFT,RIGHT=70,125
SIZE=W*H*3


def refine(data):
    pixels=bytearray(data)
    def boundary(x):
        return next((y for y in range(H) if pixels[(y*W+x)*3]>40),H)
    a,b=boundary(LEFT),boundary(RIGHT)
    if a==H or b==H:
        return bytes(pixels)
    for x in range(LEFT+1,RIGHT):
        u=(x-LEFT)/(RIGHT-LEFT)
        edge=a+(b-a)*u
        side=min(1,min(x-LEFT,RIGHT-x)/5)
        side=side*side*(3-2*side)
        for y in range(min(H,int(edge)+1)):
            t=max(0,min(1,(edge-y)/3))
            alpha=side*t*t*(3-2*t)
            if alpha==0:continue
            i=(y*W+x)*3
            for c in range(3):pixels[i+c]=round(pixels[i+c]*(1-alpha))
    return bytes(pixels)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--video',type=Path,required=True)
    parser.add_argument('--poster',type=Path,required=True)
    parser.add_argument('--output-dir',type=Path,required=True)
    args=parser.parse_args();args.output_dir.mkdir(parents=True,exist_ok=True)
    common=['ffmpeg','-hide_banner','-loglevel','error','-y']
    crop=f'crop={W}:{H}:{X}:{Y}'
    with tempfile.TemporaryDirectory(prefix='beyond-join-') as directory:
        patch=Path(directory)/'join.mkv'
        decode=subprocess.Popen(common+['-i',str(args.video),'-vf',crop,'-f','rawvideo','-pix_fmt','rgb24','pipe:1'],stdout=subprocess.PIPE)
        encode=subprocess.Popen(common+['-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate','30','-i','pipe:0','-c:v','ffv1',str(patch)],stdin=subprocess.PIPE)
        frames=0
        while True:
            data=decode.stdout.read(SIZE)
            if not data:break
            if len(data)!=SIZE:raise RuntimeError('Incomplete media frame')
            encode.stdin.write(refine(data));frames+=1
        decode.stdout.close();encode.stdin.close()
        if decode.wait() or encode.wait():raise RuntimeError('Media preparation failed')
        if frames!=150:raise RuntimeError(f'Expected the 150-frame derived clip, got {frames}')
        subprocess.run(common+['-i',str(args.video),'-i',str(patch),'-filter_complex',f'[0:v][1:v]overlay={X}:{Y}:format=rgb','-an','-t','5','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(args.output_dir/'black-hole-motion-refined.mp4')],check=True)
        data=subprocess.check_output(common+['-i',str(args.poster),'-vf',crop,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','pipe:1'])
        poster_patch=Path(directory)/'join.rgb';poster_patch.write_bytes(refine(data))
        subprocess.run(common+['-i',str(args.poster),'-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}','-i',str(poster_patch),'-filter_complex',f'[0:v][1:v]overlay={X}:{Y}:format=rgb','-frames:v','1','-q:v','2',str(args.output_dir/'black-hole-detail-refined.jpg')],check=True)
    print(f'Refined the join in {frames} frames and matching poster.')

if __name__=='__main__':main()
