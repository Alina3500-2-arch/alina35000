#!/usr/bin/env python3
"""Разбор речи в ролике: где спикер говорит, где молчит.

Что умеет:

    # показать речевые куски
    python3 video/speech.py raw/talk.mp4

    # склейка без пауз — готовые clips для плана (jump cuts)
    python3 video/speech.py raw/talk.mp4 --cut > clips.json

    # подписи из сценария, разложенные по речевым кускам
    python3 video/speech.py raw/talk.mp4 --script scenario.txt > texts.json

    # распознать речь и собрать подписи автоматически
    python3 video/speech.py raw/talk.mp4 --whisper > texts.json

--whisper требует доступа в сеть к huggingface.co (веса модели). Если его нет,
работает связка --script: тайминги берутся из пауз, а текст — из сценария,
по одной фразе на строку.
"""
import argparse
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import ffmpeg_exe  # noqa: E402

MAX_LINE = 30   # символов в строке подписи
MAX_LINES = 2


def duration(path):
    out = subprocess.run([ffmpeg_exe(), "-i", path], stderr=subprocess.PIPE,
                         text=True).stderr
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", out)
    if not m:
        raise SystemExit(f"Не читается длительность: {path}")
    h, mi, s = m.groups()
    return int(h) * 3600 + int(mi) * 60 + float(s)


def speech_segments(path, noise=-32, min_silence=0.35, pad=0.12, min_len=0.4):
    """Куски со звуком, найденные по паузам (ffmpeg silencedetect)."""
    total = duration(path)
    proc = subprocess.run(
        [ffmpeg_exe(), "-i", path, "-af",
         f"silencedetect=noise={noise}dB:d={min_silence}", "-f", "null", "-"],
        stderr=subprocess.PIPE, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", proc.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", proc.stderr)]

    segs, cursor = [], 0.0
    for i, s in enumerate(starts):
        if s - cursor > min_len:
            segs.append([cursor, s])
        cursor = ends[i] if i < len(ends) else total
    if total - cursor > min_len:
        segs.append([cursor, total])
    if not segs:
        segs = [[0.0, total]]

    # немного воздуха по краям, чтобы не срезать начало и конец слова
    out = []
    for a, b in segs:
        a, b = max(a - pad, 0), min(b + pad, total)
        if out and a <= out[-1][1] + 0.05:
            out[-1][1] = b
        else:
            out.append([a, b])
    return out, total


def wrap(text, width=MAX_LINE, lines=MAX_LINES):
    """Перенос в 1-2 короткие строки, как в субтитрах для соцсетей."""
    words, rows, cur = text.split(), [], ""
    for word in words:
        if cur and len(cur) + 1 + len(word) > width:
            rows.append(cur)
            cur = word
        else:
            cur = f"{cur} {word}".strip()
    if cur:
        rows.append(cur)
    # если строк больше лимита — выравниваем по числу слов
    if len(rows) > lines:
        per = max(len(words) // lines, 1)
        rows = [" ".join(words[i:i + per]) for i in range(0, len(words), per)][:lines]
    return "\n".join(rows)


def at_speech_time(offset, segs):
    """Сколько это на часах ролика, если отсчитывать только время речи."""
    left = offset
    for a, b in segs:
        if left <= b - a:
            return a + left
        left -= b - a
    return segs[-1][1]


def from_script(segs, script_path):
    """Фразы сценария раскладываются по речевому времени, длинным — больше."""
    with open(script_path, encoding="utf-8") as fh:
        phrases = [ln.strip() for ln in fh if ln.strip()]
    if not phrases:
        raise SystemExit("Сценарий пустой.")
    weights = [max(len(p), 8) for p in phrases]
    speech = sum(b - a for a, b in segs)
    texts, cursor = [], 0.0
    for phrase, weight in zip(phrases, weights):
        span = speech * weight / sum(weights)
        start = at_speech_time(cursor, segs)
        end = at_speech_time(cursor + span, segs)
        texts.append({"style": "sub", "text": wrap(phrase),
                      "start": round(start, 2), "end": round(max(end, start + 0.6), 2)})
        cursor += span
    return texts


def from_whisper(path, language="ru"):
    """Распознавание речи: текст и тайминги прямо из аудио."""
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        raise SystemExit("Нет faster-whisper: pip install faster-whisper")
    size = os.environ.get("WHISPER_MODEL", "small")
    try:
        model = WhisperModel(size, device="cpu", compute_type="int8")
    except Exception as exc:  # веса тянутся с huggingface.co
        raise SystemExit(
            f"Не удалось загрузить модель '{size}': {exc}\n"
            "Похоже, закрыт доступ к huggingface.co. Либо разреши этот домен "
            "в настройках окружения, либо используй --script со сценарием.")
    segments, _ = model.transcribe(path, language=language, vad_filter=True)
    texts = []
    for s in segments:
        body = s.text.strip()
        if body:
            texts.append({"style": "sub", "text": wrap(body),
                          "start": round(s.start, 2), "end": round(s.end, 2)})
    return texts


def main():
    p = argparse.ArgumentParser(description="Речь, паузы и подписи из видео")
    p.add_argument("video")
    p.add_argument("--cut", action="store_true", help="выдать clips без пауз")
    p.add_argument("--script", help="файл со сценарием, по фразе на строку")
    p.add_argument("--whisper", action="store_true", help="распознать речь автоматически")
    p.add_argument("--language", default="ru")
    p.add_argument("--noise", type=float, default=-32, help="порог тишины в дБ")
    p.add_argument("--min-silence", type=float, default=0.35,
                   help="от какой длины паузы резать, в секундах")
    args = p.parse_args()

    if args.whisper:
        print(json.dumps(from_whisper(args.video, args.language),
                         ensure_ascii=False, indent=2))
        return

    segs, total = speech_segments(args.video, args.noise, args.min_silence)

    if args.cut:
        name = os.path.basename(args.video)
        clips = [{"src": name, "start": round(a, 2), "end": round(b, 2)}
                 for a, b in segs]
        print(json.dumps(clips, ensure_ascii=False, indent=2))
        return

    if args.script:
        print(json.dumps(from_script(segs, args.script), ensure_ascii=False, indent=2))
        return

    kept = sum(b - a for a, b in segs)
    print(f"Всего {total:.1f} с, речи {kept:.1f} с в {len(segs)} кусках "
          f"(паузы съедают {total - kept:.1f} с)", file=sys.stderr)
    for i, (a, b) in enumerate(segs, 1):
        print(f"{i:>3}. {a:7.2f} → {b:7.2f}   {b - a:5.2f} с")


if __name__ == "__main__":
    main()
