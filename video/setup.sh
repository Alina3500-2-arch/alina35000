#!/usr/bin/env bash
# Ставит ffmpeg в сессию (статическая сборка, без root-пакетов).
set -e
pip install -q imageio-ffmpeg
python3 - <<'PY'
import imageio_ffmpeg, os, pathlib
src = imageio_ffmpeg.get_ffmpeg_exe()
dst = pathlib.Path.home() / ".local" / "bin"
dst.mkdir(parents=True, exist_ok=True)
link = dst / "ffmpeg"
if link.exists() or link.is_symlink():
    link.unlink()
link.symlink_to(src)
print("ffmpeg ->", link)
PY
export PATH="$HOME/.local/bin:$PATH"
ffmpeg -version | head -1
