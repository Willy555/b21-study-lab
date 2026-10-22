#!/usr/bin/env python3
"""Generate C1.2 audio. Usage: python3 make_audio.py words|listening [only-key-prefix]
Reads the data files through node, writes audio/*.mp3 and merges manifests into
audio/audman_c12.json and audio/lman_c12.json."""
import sys, os, json, subprocess, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import tts

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "audio")
os.makedirs(OUT, exist_ok=True)

V_ = {"dan": ["bm_daniel", "en-gb"], "lew": ["bm_lewis", "en-gb"], "fab": ["bm_fable", "en-gb"], "emm": ["bf_emma", "en-gb"], "isa": ["bf_isabella", "en-gb"], "ali": ["bf_alice", "en-gb"], "lil": ["bf_lily", "en-gb"], "hea": ["af_heart", "en-us"], "bel": ["af_bella", "en-us"], "nic": ["af_nicole", "en-us"], "sar": ["af_sarah", "en-us"], "mic": ["am_michael", "en-us"], "ada": ["am_adam", "en-us"], "eri": ["am_eric", "en-us"]}
NARR = ("bm_george", "en-gb")


def load(files, names):
    pre = "const V_=" + json.dumps(V_) + ";\n"
    code = pre + "\n".join(open(os.path.join(HERE, "data", f), encoding="utf-8").read() for f in files if os.path.exists(os.path.join(HERE, "data", f)))
    code += "\nprocess.stdout.write(JSON.stringify({" + ",".join(f'{n}:typeof {n}!=="undefined"?{n}:null' for n in names) + "}));"
    r = subprocess.run(["node", "-"], input=code, capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def merge_json(path, upd, nested=False):
    d = json.load(open(path)) if os.path.exists(path) else {}
    if nested:
        for k, v in upd.items():
            d.setdefault(k, {}).update(v)
    else:
        d.update(upd)
    json.dump(d, open(path, "w"), ensure_ascii=False)


def words_job():
    D = load(["vocab_c12.js", "grammar_c12.js", "colloc_c12.js", "exams_c12.js"],
             ["VOCAB_C12_RAW", "WF_C12_RAW", "GRAMMAR_C12", "COLLOC_C12_RAW", "INTO_C12_RAW"])
    for k, e in (("VOCAB_C12_RAW", ""), ("WF_C12_RAW", ""), ("GRAMMAR_C12", []), ("COLLOC_C12_RAW", ""), ("INTO_C12_RAW", "")):
        if D[k] is None:
            D[k] = e
    vocab, unit = [], 0
    for l in D["VOCAB_C12_RAW"].strip().split("\n"):
        l = l.strip()
        if not l:
            continue
        if l[0] == "#":
            unit = int(l[1:]); continue
        p = l.split("|")
        vocab.append({"w": p[0], "ex": p[5], "unit": unit})
    forms, wfs = [], []
    for l in D["WF_C12_RAW"].strip().split("\n"):
        p = l.split("|")
        if len(p) < 16:
            continue
        for k in (3, 4, 5, 6, 7):
            forms += [x.strip() for x in p[k].split(",") if x.strip()]
        for s, a in ((p[8], p[9]), (p[12], p[13])):
            wfs.append(s.replace("___", a.split(",")[0].strip()))
    uses = [u[1] for g in D["GRAMMAR_C12"] for u in g["uses"]]
    coll = [l.split("|") for l in D["COLLOC_C12_RAW"].strip().split("\n") if l.count("|") >= 8]
    pron = []
    for l in [x for x in D["INTO_C12_RAW"].strip().split("\n") if x.strip()]:
        parts = l.split("|"); body = "|".join(parts[2:])
        txt = []
        for g in body.split(" || "):
            m = re.match(r"^(.*)\s+#(FR|F|R)$", g.strip())
            txt.append(" ".join(t.split("|")[0] for t in m.group(1).strip().split()))
        pron.append(" ".join(txt))
    man = {"uk": {}, "us": {}}
    jobs = [("c12words", [v["w"] for v in vocab] + forms, True)]
    for u in range(13, 19):
        jobs.append((f"c12ex{u}", [v["ex"] for v in vocab if v["unit"] == u], False))
    jobs += [("c12gram", uses + wfs, False), ("c12colph", [c[3] for c in coll], True), ("c12colex", [c[7] for c in coll], False), ("c12pron", pron, True)]
    only = sys.argv[2] if len(sys.argv) > 2 else ""
    for name, texts, keep in jobs:
        if (only and not name.startswith(only)) or not texts:
            continue
        for acc in ("uk", "us"):
            man[acc][name] = tts.group(OUT, name, acc, texts, keep_paren=keep)
            print(acc, name, len(man[acc][name]), flush=True)
            merge_json(os.path.join(OUT, "audman_c12.json"), {acc: {name: man[acc][name]}}, nested=True)


NUM = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]


def v(voice):
    return tuple(voice) if isinstance(voice, list) else tuple(V_[voice])


def turns(script, voices):
    out = []
    for role, text in script:
        vv = v(voices[role])
        out.append(tts.say(text, vv[0], vv[1]))
        out.append(tts.sil(0.45))
    return np.concatenate(out[:-1])


def narr(t):
    return tts.say(t, *NARR)


def std(key, intro, body, wait):
    segs = {"intro": narr(intro), "body": body, "again": narr("Now listen again."), "end": narr("That is the end of the recording.")}
    prog = [("s", "intro"), ("w", wait), ("s", "body"), ("w", 3), ("s", "again"), ("w", 1), ("s", "body"), ("w", 3), ("s", "end")]
    return tts.listening(OUT, key, segs, prog)


def listening_job():
    D = load(["listening_c12.js"], ["LX_C12_P1", "LX_C12_P2", "CL_C12_1", "CL_C12_2", "CL_C12_4"])
    only = sys.argv[2] if len(sys.argv) > 2 else ""
    lm = {}

    def done(k, prog):
        lm[k] = prog
        merge_json(os.path.join(OUT, "lman_c12.json"), {k: prog})
        print(k, round(sum(o[2] - o[1] if o[0] == "s" else o[1] for o in prog) / 60, 1), "min", flush=True)

    for i, d in enumerate(D["LX_C12_P1"]):
        k = f"c12ef1-{i}"
        if only and not k.startswith(only): continue
        done(k, std(k, f"{d['intro']} For questions one to five, choose the best answer, A, B, C or D. You now have twenty seconds to look at the questions.", turns(d["script"], d["voices"]), 20))
    for i, d in enumerate(D["LX_C12_P2"]):
        k = f"c12ef2-{i}"
        if only and not k.startswith(only): continue
        parts = []
        for j, sp in enumerate(d["sp"]):
            parts += [narr(f"Speaker {NUM[j]}."), tts.sil(0.6), tts.say(sp[0], *v(sp[3])), tts.sil(1.4)]
        done(k, std(k, f"You will hear five short extracts in which people talk about {d['topic']}. While you listen, you must complete both tasks. You now have thirty seconds to look at the tasks.", np.concatenate(parts[:-1]), 30))
    for i, d in enumerate(D["CL_C12_1"]):
        k = f"c12cl1-{i}"
        if only and not k.startswith(only): continue
        segs = {"intro": narr("You will hear six short extracts. For each one, choose the best answer, A, B or C. You will hear each extract twice."), "end": narr("That is the end of the recording.")}
        prog = [("s", "intro"), ("w", 2)]
        for j, ex in enumerate(d["ex"]):
            segs[f"h{j}"] = narr(f"Extract {NUM[j]}. {ex['ctx']} {ex['q']}")
            body = []
            for vid, text in ex["lines"]:
                body += [tts.say(text, *v(vid)), tts.sil(0.4)]
            segs[f"x{j}"] = np.concatenate(body[:-1])
            prog += [("s", f"h{j}"), ("w", 5), ("s", f"x{j}"), ("w", 2), ("s", f"x{j}"), ("w", 3)]
        prog.append(("s", "end"))
        done(k, tts.listening(OUT, k, segs, prog))
    for i, d in enumerate(D["CL_C12_2"]):
        k = f"c12cl2-{i}"
        if only and not k.startswith(only): continue
        n = len(d["items"])
        done(k, std(k, f"{d['intro']} For questions one to {NUM[n-1] if n <= 10 else n}, complete the sentences with a word or a short phrase. You now have thirty seconds to look at the sentences.", tts.say(d["text"], *v(d["voice"])), 30))
    for i, d in enumerate(D["CL_C12_4"]):
        k = f"c12cl4-{i}"
        if only and not k.startswith(only): continue
        n = len(d["q"])
        done(k, std(k, f"{d['intro']} For questions one to {NUM[n-1] if n <= 10 else n}, choose the best answer. You now have twenty seconds to look at the questions.", turns(d["script"], d["voices"]), 20))


if __name__ == "__main__":
    {"words": words_job, "listening": listening_job}[sys.argv[1]]()
