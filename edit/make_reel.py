#!/usr/bin/env python3
"""Reel v1: jump-cuts (silence removal), zoom punches, b-roll cutaways, grade, loudness.
usage: make_reel.py TALK.mp4 BROLL.mp4 OUT.mp4
"""
import subprocess, sys

talk, broll, out = sys.argv[1:4]

# speech segments in source time (silences cut, 0.1s padding)
SEGS = [(2.90, 9.74), (9.95, 10.98), (11.23, 27.48), (27.83, 32.79), (33.00, 43.24)]
# zoom punches on the output timeline: (start, end, zoom)
ZOOMS = [(0, 6.84, 1.0), (6.84, 7.87, 1.14), (7.87, 12.0, 1.0), (12.0, 16.5, 1.10),
         (16.5, 20.0, 1.0), (20.0, 24.12, 1.14), (24.12, 29.08, 1.0),
         (29.08, 34.0, 1.10), (34.0, 39.32, 1.0)]
# b-roll cutaways over the voice: (out_start, duration, broll_start)
CUTS = [(4.0, 1.6, 0.0), (13.0, 1.6, 2.6), (20.0, 1.6, 4.4), (33.0, 1.6, 6.6)]
W, H = 1080, 1920

f = []
n = len(SEGS)
for i, (a, b) in enumerate(SEGS):
    f.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}]")
    f.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={b-a-0.03:.3f}:d=0.03[a{i}]")
f.append("".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[vc]")
f.append("".join(f"[a{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1[ac]")

# zoom chunks
zs = len(ZOOMS)
f.append(f"[vc]split={zs}" + "".join(f"[z{i}]" for i in range(zs)))
for i, (s, e, z) in enumerate(ZOOMS):
    zw, zh = int(W * z) // 2 * 2, int(H * z) // 2 * 2
    f.append(f"[z{i}]trim={s}:{e},setpts=PTS-STARTPTS,scale={zw}:{zh}:flags=lanczos,crop={W}:{H}[zz{i}]")
f.append("".join(f"[zz{i}]" for i in range(zs)) + f"concat=n={zs}:v=1:a=0[vz]")

# b-roll
cur = "vz"
f.append(f"[1:v]split={len(CUTS)}" + "".join(f"[r{i}]" for i in range(len(CUTS))))
for i, (t, d, bs) in enumerate(CUTS):
    f.append(f"[r{i}]trim={bs}:{bs+d},setpts=PTS-STARTPTS+{t}/TB,scale={int(W*1.08)//2*2}:{int(H*1.08)//2*2}:flags=lanczos,crop={W}:{H}[b{i}]")
    f.append(f"[{cur}][b{i}]overlay=enable='between(t,{t},{t+d})'[o{i}]")
    cur = f"o{i}"

# grade + audio polish
f.append(f"[{cur}]eq=contrast=1.06:saturation=1.18:gamma=1.02,unsharp=5:5:0.6,format=yuv420p[vout]")
f.append("[ac]highpass=f=80,afftdn=nf=-30,acompressor=threshold=-24dB:ratio=3,loudnorm=I=-14:TP=-1.5:LRA=9[aout]")

cmd = ["ffmpeg", "-y", "-v", "error", "-i", talk, "-i", broll,
       "-filter_complex", ";".join(f), "-map", "[vout]", "-map", "[aout]",
       "-r", "30", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]
subprocess.run(cmd, check=True)
