"""Natural-voice audio builder for the EF Study Lab (Kokoro ONNX).

group(name, acc, texts) -> writes audio/<acc>-<name>.mp3 and returns {key: [start, dur]}
listening(key, parts)   -> writes audio/<key>.mp3 and returns an LMAN programme
"""
import os, re, json, subprocess, hashlib
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 24000
K = Kokoro(os.path.join(HERE, "kokoro-v1.0.onnx"), os.path.join(HERE, "voices-v1.0.bin"))
CACHE = os.path.join(HERE, "cache")
os.makedirs(CACHE, exist_ok=True)

ACC = {"uk": ("bf_emma", "en-gb"), "us": ("af_heart", "en-us")}


def aclean(t):
    t = re.sub(r"\s*\((.*?)\)", r" \1", str(t))
    t = re.sub(r"[↗↘]", "", t)
    return re.sub(r"\s+", " ", t).strip()


# words the G2P gets wrong: spoken replacements (text level)
FIX = [
    (re.compile(r"^minute$"), "my-newt"),
    (re.compile(r"\bminute (amounts?|details?|particles?|quantities|traces?|changes?|differences?|organisms?|fragments?|pieces?|errors?)\b", re.I), r"my-newt \1"),
]


def spoken(t, keep_paren=False):
    t = str(t)
    if not keep_paren:
        t = re.sub(r"\s*\([^)]*\)", "", t)
    t = re.sub(r"\(([^)]*)\)", r"\1", t)
    t = t.replace("___", "blank").replace(" / ", " or ").replace("/", " or ")
    t = re.sub(r"<[^>]+>", "", t)
    t = re.sub(r"[↗↘]", "", t)
    for rx, rep in FIX:
        t = rx.sub(rep, t)
    return re.sub(r"\s+", " ", t).strip()


def trim(a, thr=0.008, pad=0.04):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    s = max(0, idx[0] - int(pad * SR)); e = min(len(a), idx[-1] + int(pad * SR))
    return a[s:e]


# place names the G2P mispronounces: word -> (UK phonemes, US phonemes)
PH = {
    "Galápagos": ("ɡəlˈapəɡəs", "ɡəlˈɑːpəɡoʊs"), "Galapagos": ("ɡəlˈapəɡəs", "ɡəlˈɑːpəɡoʊs"),
    "Mindo": ("mˈiːndəʊ", "mˈiːndoʊ"), "Cuenca": ("kwˈɛŋkə", "kwˈɛŋkə"), "Upano": ("uːpˈɑːnəʊ", "uːpˈɑːnoʊ"),
    "Ingapirca": ("ˌɪŋɡəpˈɪəkə", "ˌɪŋɡəpˈɪɹkə"), "Otavalo": ("ˌəʊtəvˈɑːləʊ", "ˌoʊtəvˈɑːloʊ"),
    "Cochasquí": ("kˌɒtʃɑːskˈiː", "kˌoʊtʃɑːskˈiː"), "Cochasqui": ("kˌɒtʃɑːskˈiː", "kˌoʊtʃɑːskˈiː"),
    "Esmeraldas": ("ˌɛsməɹˈaldəs", "ˌɛsməɹˈɑːldəs"), "Cayambe": ("kaɪˈambeɪ", "kaɪˈɑːmbeɪ"),
    "Imbabura": ("ˌɪmbəbˈʊəɹə", "ˌɪmbəbˈʊɹə"), "Latacunga": ("lˌatəkˈʊŋɡə", "lˌɑːtəkˈʊŋɡə"),
    "Cotopaxi": ("kˌəʊtəpˈaksi", "kˌoʊtəpˈæksi"), "Yasuní": ("jˌasuːnˈiː", "jˌɑːsuːnˈiː"), "Yasuni": ("jˌasuːnˈiː", "jˌɑːsuːnˈiː"),
}


def _create(text, voice, lang, speed):
    hits = [w for w in PH if re.search(r"\b" + re.escape(w) + r"\b", text)]
    if not hits:
        return K.create(text, voice=voice, speed=speed, lang=lang)
    ph = K.tokenizer.phonemize(text, lang)
    for w in sorted(hits, key=len, reverse=True):
        auto = K.tokenizer.phonemize(w, lang).strip()
        fix = PH[w][0 if lang == "en-gb" else 1]
        if auto and auto in ph:
            ph = ph.replace(auto, fix)
    return K.create(ph, voice=voice, speed=speed, lang=lang, is_phonemes=True)


def _raw(text, voice, lang, speed):
    h = hashlib.md5(f"{voice}|{lang}|{speed}|{text}".encode()).hexdigest()
    p = os.path.join(CACHE, h + ".npy")
    if os.path.exists(p):
        return np.load(p)
    a, sr = _create(text, voice, lang, speed)
    a = trim(np.asarray(a, dtype=np.float32))
    np.save(p, a)
    return a


def sil(sec):
    return np.zeros(int(sec * SR), dtype=np.float32)


SENT = re.compile(r"(?<=[.!?])[\"'’”]?\s+(?=[A-Z0-9\"'‘“¿¡(])")


def say(text, voice, lang, speed=1.0, gap=0.16, pgap=0.4):
    """Long text: paragraphs by newline, sentences by punctuation."""
    out = []
    paras = [p.strip() for p in str(text).split("\n") if p.strip()]
    for pi, p in enumerate(paras):
        sents = [s.strip() for s in SENT.split(p) if s.strip()]
        # merge very short sentences into the next one for better prosody
        buf = []
        for s in sents:
            buf.append(s)
        for si, s in enumerate(buf):
            out.append(_raw(s, voice, lang, speed))
            if si < len(buf) - 1:
                out.append(sil(gap))
        if pi < len(paras) - 1:
            out.append(sil(pgap))
    return np.concatenate(out) if out else sil(0.1)


def to_mp3(a, path, kbps=48):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    wav = path[:-4] + ".tmp.wav"
    sf.write(wav, a, SR)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-ar", "24000", "-b:a", f"{kbps}k", path], check=True)
    os.remove(wav)


def group(outdir, name, acc, texts, speed=1.0, keep_paren=False):
    voice, lang = ACC[acc]
    parts = [sil(0.5)]
    pos = 0.5
    man = {}
    seen = set()
    for t in texts:
        key = aclean(t)
        if not key or key in seen:
            continue
        seen.add(key)
        a = say(spoken(t, keep_paren), voice, lang, speed)
        d = len(a) / SR
        man[key] = [round(pos, 3), round(d, 3)]
        parts += [a, sil(0.5)]
        pos += d + 0.5
    to_mp3(np.concatenate(parts), os.path.join(outdir, f"{acc}-{name}.mp3"))
    return man


def listening(outdir, key, segs, waits):
    """segs: dict name -> audio array; waits: programme as list of ("s", name) or ("w", secs).
    Each named segment is stored once in the file; repeated names reuse it."""
    order, pos, parts, where = [], 0.3, [sil(0.3)], {}
    for kind, v in waits:
        if kind == "s" and v not in where:
            a = segs[v]
            where[v] = (round(pos, 3), round(pos + len(a) / SR, 3))
            parts += [a, sil(0.3)]
            pos += len(a) / SR + 0.3
    prog = []
    for kind, v in waits:
        if kind == "s":
            prog.append(["s", where[v][0], where[v][1]])
        else:
            prog.append(["w", v])
    to_mp3(np.concatenate(parts), os.path.join(outdir, f"{key}.mp3"), kbps=40)
    return prog
