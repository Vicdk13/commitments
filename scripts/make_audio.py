"""
Озвучує сценарій діалогу з samples/NN-*.md через ElevenLabs TTS
і склеює репліки в один mp3 з паузами.

Використання:
    python scripts/make_audio.py samples/01-main.md

Парсить рядки виду `**Ім'я:** текст`. Голоси — у VOICES.
Результат: samples/NN-*.mp3 + samples/NN-*.lines.json (репліки з приблизними таймкодами,
для ручної перевірки; не використовується апкою).
"""
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV = ROOT / ".env"

VOICES = {
    "Олена": "yMBZR4SLoc24wOJLWAB2",   # Solomiya Vitlitska - Podcast Pro
    "Дмитро": "lBvcwD2nQgxr2mkKA71z",  # Ievgen Diachenko
    "Наталя": "JOQst3wrnXwBfeTEW2ts",  # Yaryna Lisova - Natural Conversation
    "Андрій": "zCW9T5OJ4bUQxldhLWUA",  # Ivo - Clear, confident and narrative
    "Ірина": "bsourKGZEagmttzrIzmu",   # Kateryna Pavlenko - Professional & Calm
    "Тарас": "h9NSQvWZaC4NFusYsxT9",   # Artem Klopotenko - Podcast Pro
}
MODEL = "eleven_v3"  # краще тримає наголоси й інтонацію; підтримує теги типу [sarcastic]
PAUSE_SEC = 0.6          # пауза між репліками
LINE_RE = re.compile(r"^\*\*(.+?):\*\*\s+(.+)$")


def load_env():
    if ENV.exists():
        for line in ENV.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


def parse(md_path: Path):
    """Репліки беруться лише з першого блоку між `---` роздільниками."""
    text = md_path.read_text(encoding="utf-8")
    blocks = text.split("\n---\n")
    body = blocks[1] if len(blocks) > 1 else text
    lines = []
    for raw in body.splitlines():
        m = LINE_RE.match(raw.strip())
        if m:
            lines.append((m.group(1).strip(), m.group(2).strip()))
    return lines


def tts(text: str, voice_id: str, api_key: str) -> bytes:
    import urllib.request
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128",
        data=json.dumps({
            "text": text,
            "model_id": MODEL,
            "voice_settings": {"stability": 0.5},
        }).encode(),
        headers={"xi-api-key": api_key, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def duration(path: Path) -> float:
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(path)
    ])
    return float(out.strip())


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    load_env()
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("ELEVENLABS_API_KEY не знайдено в .env")

    md = Path(sys.argv[1])
    lines = parse(md)
    if not lines:
        sys.exit("Не знайдено реплік виду **Ім'я:** текст")
    print(f"{len(lines)} реплік")

    out_mp3 = md.with_suffix(".mp3")
    out_json = md.with_suffix(".lines.json")

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        silence = tmp / "silence.mp3"
        subprocess.run([
            "ffmpeg", "-y", "-v", "error", "-f", "lavfi",
            "-i", "anullsrc=r=44100:cl=mono", "-t", str(PAUSE_SEC),
            "-b:a", "128k", str(silence)
        ], check=True)

        parts, meta, t = [], [], 0.0
        for i, (speaker, text) in enumerate(lines):
            vid = VOICES.get(speaker)
            if not vid:
                sys.exit(f"Немає голосу для «{speaker}»")
            p = tmp / f"{i:03d}.mp3"
            for attempt in range(3):
                try:
                    p.write_bytes(tts(text, vid, key))
                    break
                except Exception as e:  # noqa
                    print(f"  повтор {attempt+1}: {e}")
                    time.sleep(2)
            d = duration(p)
            meta.append({"i": i, "speaker": speaker, "text": text, "start": round(t, 2), "end": round(t + d, 2)})
            print(f"  [{t:6.1f}s] {speaker}: {text[:60]}")
            parts.append(p)
            parts.append(silence)
            t += d + PAUSE_SEC

        concat = tmp / "list.txt"
        concat.write_text("".join(f"file '{p.as_posix()}'\n" for p in parts), encoding="utf-8")
        subprocess.run([
            "ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
            "-i", str(concat), "-c:a", "libmp3lame", "-b:a", "128k", "-ac", "1", str(out_mp3)
        ], check=True)

    out_json.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n→ {out_mp3}  ({duration(out_mp3):.0f} с)")
    print(f"→ {out_json}")


if __name__ == "__main__":
    main()
