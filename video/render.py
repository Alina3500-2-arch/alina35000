#!/usr/bin/env python3
"""Рендер видео по плану монтажа (plan.json) через ffmpeg.

    python3 video/render.py plan.json

Схема плана описана в video/README.md, пример — в video/plan.example.json.
"""
import json
import os
import shlex
import subprocess
import sys

FONT = "DejaVu Sans"
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def ffmpeg_exe():
    for p in (os.path.expanduser("~/.local/bin/ffmpeg"), "ffmpeg"):
        if os.path.exists(p):
            return p
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def esc(text):
    """Экранирование текста для ASS-субтитров."""
    return (text.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}")
                .replace("\n", "\\N"))


def ass_color(value, alpha=0):
    """#RRGGBB или имя цвета -> &HAABBGGRR."""
    named = {"white": "#ffffff", "black": "#000000", "yellow": "#ffd400",
             "red": "#ff3b30", "pink": "#ff6fae", "blue": "#3b82f6",
             "green": "#34c759", "orange": "#ff9500"}
    v = named.get(str(value).lower(), str(value)).lstrip("#")
    if len(v) != 6:
        v = "ffffff"
    r, g, b = v[0:2], v[2:4], v[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper()


def ts(seconds):
    seconds = max(float(seconds), 0)
    h, rem = divmod(seconds, 3600)
    m, sec = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{sec:05.2f}"


#: Готовые стили подписей. Поля в самой подписи перекрывают стиль.
STYLES = {
    # Реплики спикера: крупный капс по центру-низу, без плашки, тонкая обводка.
    "sub": {"y": 0.72, "size_rel": 0.045, "uppercase": True, "box": False,
            "opacity": 0.95, "spacing": 1, "text_fade": 0.1},
    # Шапка ролика: держится весь ролик, полупрозрачная, с разрядкой.
    "header": {"y": 0.12, "size_rel": 0.027, "uppercase": True, "box": False,
               "opacity": 0.6, "spacing": 5, "text_fade": 0.3},
    # Подпись бренда внизу.
    "brand": {"y": 0.9, "size_rel": 0.024, "uppercase": True, "box": False,
              "opacity": 0.8, "spacing": 7, "text_fade": 0.3},
    # Крупный титр с плашкой — для хука в начале и призыва в конце.
    "title": {"y": 0.3, "size_rel": 0.055, "box": True, "box_opacity": 0.5,
              "opacity": 1, "text_fade": 0.25},
}


def styled(t, h):
    """Подпись + её стиль: значения из самой подписи всегда главнее."""
    base = dict(STYLES.get(t.get("style", "title"), STYLES["title"]))
    base.update({k: v for k, v in t.items() if v is not None})
    base.setdefault("size", round(h * float(base.pop("size_rel", 0.045))))
    base.pop("size_rel", None)
    return base


def write_ass(texts, w, h, total, path):
    """Собирает файл субтитров с плашками (libass)."""
    head = [
        "[Script Info]", "ScriptType: v4.00+", "WrapStyle: 0",
        "ScaledBorderAndShadow: yes", f"PlayResX: {w}", f"PlayResY: {h}", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour,"
        " OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX,"
        " ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment,"
        " MarginL, MarginR, MarginV, Encoding",
    ]
    events = ["", "[Events]",
              "Format: Layer, Start, End, Style, Name, MarginL, MarginR,"
              " MarginV, Effect, Text"]
    for j, raw in enumerate(texts):
        t = styled(raw, h)
        size = int(t["size"])
        boxed = t.get("box", True)
        border = 3 if boxed else 1
        back = ass_color(t.get("box_color", "#000000"),
                         alpha=int((1 - float(t.get("box_opacity", 0.55))) * 255))
        alpha = int((1 - float(t.get("opacity", 1))) * 255)
        outline = max(size // 18, 3) if boxed else max(size // 26, 2)
        head.append(
            f"Style: s{j},{t.get('font', FONT)},{size},"
            f"{ass_color(t.get('color', 'white'), alpha)},{ass_color('white')},"
            f"{ass_color(t.get('outline_color', '#000000'), min(alpha + 40, 255))},{back},"
            f"{-1 if t.get('bold', True) else 0},0,0,0,100,100,"
            f"{float(t.get('spacing', 0)):.1f},0,"
            f"{border},{outline},0,5,40,40,40,1")
        y = float(t.get("y", 0.75))
        x = float(t.get("x", 0.5))
        fade = float(t.get("text_fade", 0.25) or 0)
        tags = f"\\pos({x * w:.0f},{y * h:.0f})"
        if fade > 0:
            tags += f"\\fad({int(fade * 1000)},{int(fade * 1000)})"
        body = t["text"].upper() if t.get("uppercase") else t["text"]
        events.append(
            f"Dialogue: 0,{ts(t.get('start', 0))},{ts(t.get('end', total))},"
            f"s{j},,0,0,0,,{{{tags}}}{esc(body)}")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(head + events) + "\n")
    return path


def build(plan, base):
    w = int(plan.get("width", 1080))
    h = int(plan.get("height", 1920))
    fps = int(plan.get("fps", 30))
    clips = plan.get("clips") or []
    if not clips:
        raise SystemExit("В плане нет ни одного клипа (clips).")

    inputs, parts, vlabels, alabels = [], [], [], []
    timeline = 0.0  # когда клип начинается в итоговом видео
    starts = []

    for i, c in enumerate(clips):
        src = os.path.join(base, c["src"]) if not os.path.isabs(c["src"]) else c["src"]
        if not os.path.exists(src):
            raise SystemExit(f"Нет файла: {src}")
        ext = os.path.splitext(src)[1].lower()
        is_image = ext in IMAGE_EXT
        speed = float(c.get("speed", 1) or 1)

        if is_image:
            dur = float(c.get("duration", 3))
            inputs += ["-loop", "1", "-t", f"{dur:.3f}", "-i", src]
            out_dur = dur
        else:
            start = float(c.get("start", 0))
            args = ["-ss", f"{start:.3f}"]
            if c.get("end") is not None:
                args += ["-to", f"{float(c['end']):.3f}"]
                out_dur = (float(c["end"]) - start) / speed
            else:
                out_dur = float(c.get("duration", 0)) / speed
            inputs += args + ["-i", src]

        v = f"v{i}"
        pre = ""
        if c.get("crop"):  # [x, y, ширина, высота] в долях кадра
            cx, cy, cw, ch = [float(n) for n in c["crop"]]
            pre = (f"crop=iw*{cw:.4f}:ih*{ch:.4f}:iw*{cx:.4f}:ih*{cy:.4f},")
        f = (f"[{i}:v]{pre}scale={w}:{h}:force_original_aspect_ratio=increase,"
             f"crop={w}:{h},fps={fps},setsar=1,format=yuv420p")
        if speed != 1:
            f += f",setpts={1/speed:.6f}*PTS"
        if is_image and c.get("zoom"):
            frames = max(int(out_dur * fps), 1)
            step = 0.18 / frames  # медленный наезд/отъезд на 18%% за клип
            zexpr = (f"1+{step:.6f}*on" if c["zoom"] == "in"
                     else f"1.18-{step:.6f}*on")
            f = (f"[{i}:v]{pre}fps={fps},scale={w*2}:{h*2}:"
                 f"force_original_aspect_ratio=increase,crop={w*2}:{h*2},"
                 f"zoompan=z='{zexpr}':d=1:x='iw/2-(iw/zoom/2)':"
                 f"y='ih/2-(ih/zoom/2)':s={w}x{h}:fps={fps},"
                 f"trim=duration={out_dur:.3f},setpts=PTS-STARTPTS,"
                 f"setsar=1,format=yuv420p")
        fade = float(c.get("fade", 0) or 0)
        if fade > 0:
            f += (f",fade=t=in:st=0:d={fade}"
                  f",fade=t=out:st={max(out_dur - fade, 0):.3f}:d={fade}")
        parts.append(f + f"[{v}]")
        vlabels.append(f"[{v}]")

        a = f"a{i}"
        if is_image or not plan.get("keep_audio", True) or c.get("mute"):
            parts.append(f"anullsrc=r=44100:cl=stereo,atrim=0:{out_dur:.3f}[{a}]")
        else:
            af = f"[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo"
            if speed != 1:
                af += f",atempo={min(max(speed, 0.5), 2.0):.3f}"
            vol = c.get("volume")
            if vol is not None:
                af += f",volume={float(vol)}"
            parts.append(af + f"[{a}]")
        alabels.append(f"[{a}]")

        starts.append(timeline)
        timeline += out_dur

    n = len(clips)
    parts.append("".join(v + a for v, a in zip(vlabels, alabels)) +
                 f"concat=n={n}:v=1:a=1[cv][ca]")

    # Текстовые плашки поверх смонтированной дорожки (libass)
    cur = "[cv]"
    texts = plan.get("texts") or []
    if texts:
        out_name = plan.get("output", "out.mp4")
        ass_path = os.path.join(base, os.path.splitext(os.path.basename(out_name))[0] + ".ass")
        write_ass(texts, w, h, timeline, ass_path)
        parts.append(f"[cv]ass={ass_path.replace(chr(92), '/').replace(':', chr(92) + ':')}[tv]")
        cur = "[tv]"

    # Фоновая музыка
    aout = "[ca]"
    music = plan.get("music")
    if music:
        msrc = music["src"] if os.path.isabs(music["src"]) else os.path.join(base, music["src"])
        if not os.path.exists(msrc):
            raise SystemExit(f"Нет файла музыки: {msrc}")
        mi = len(clips)
        inputs += ["-stream_loop", "-1", "-i", msrc]
        vol = float(music.get("volume", 0.25))
        mf = (f"[{mi}:a]aformat=sample_rates=44100:channel_layouts=stereo,"
              f"atrim=0:{timeline:.3f},volume={vol}")
        fo = float(music.get("fade_out", 1.5) or 0)
        if fo > 0:
            mf += f",afade=t=out:st={max(timeline - fo, 0):.3f}:d={fo}"
        parts.append(mf + "[mus]")
        parts.append(f"[ca][mus]amix=inputs=2:duration=first:dropout_transition=0,"
                     f"alimiter=limit=0.95[mixa]")
        aout = "[mixa]"

    out = plan.get("output", "out.mp4")
    out = out if os.path.isabs(out) else os.path.join(base, out)
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)

    cmd = ([ffmpeg_exe(), "-y"] + inputs +
           ["-filter_complex", ";".join(parts),
            "-map", cur, "-map", aout,
            "-r", str(fps), "-c:v", "libx264", "-preset", "medium", "-crf", str(plan.get("crf", 20)),
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart", out])
    return cmd, out, timeline


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Использование: python3 video/render.py plan.json")
    path = sys.argv[1]
    with open(path, encoding="utf-8") as fh:
        plan = json.load(fh)
    base = os.path.dirname(os.path.abspath(path))
    cmd, out, dur = build(plan, base)
    if "--dry-run" in sys.argv:
        print(" ".join(shlex.quote(c) for c in cmd))
        return
    print(f"Рендер {out} ({dur:.1f} c)...")
    r = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    if r.returncode != 0:
        print(r.stderr[-4000:], file=sys.stderr)
        raise SystemExit("ffmpeg упал")
    print("Готово:", out, f"{os.path.getsize(out) / 1e6:.1f} МБ")


if __name__ == "__main__":
    main()
