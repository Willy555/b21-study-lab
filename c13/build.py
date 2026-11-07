#!/usr/bin/env python3
"""Adds the C1.3 module (units 25-30) to an EF Study Lab index.html that already contains B2.1, B2.2, B2.3 and C1.2.

Usage: python3 c13/build.py <input index.html> <output index.html>
Data: c13/data/*.js, manifests c13/audio/audman_c13.json and lman_c13.json, extra code c13/addons.js.
"""
import re, sys, os, json

HERE = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
html = open(src, encoding="utf-8").read()
if "VOCAB_C13_RAW" in html:
    raise SystemExit("C1.3 is already in this file")

m = re.search(r"(<script[^>]*>)(.*)(</script>)", html, re.S)
js = m.group(2)

# ---------- 1. data + merge, right after the C1.2 merge ----------
data = ""
for f in ["vocab_c13.js", "grammar_c13.js", "colloc_c13.js", "exams_c13.js", "listening_c13.js"]:
    data += f"\n// ===== C1.3 {f} =====\n" + open(os.path.join(HERE, "data", f), encoding="utf-8").read().strip() + "\n"

merge = r'''
// ===== MERGE C1.3 (units 25-30) =====
(function(){UNITS_C13.forEach(u=>u.lv="C1.3");UNITS.push(...UNITS_C13);if(!LEVELS.includes("C1.3"))LEVELS.push("C1.3")})();
(function(){let u=0;VOCAB_C13_RAW.trim().split("\n").forEach(l=>{l=l.trim();if(!l)return;if(l[0]==="#"){u=+l.slice(1);return}const p=l.split("|");VOCAB.push({id:"u"+u+"-"+p[0],w:p[0],pos:p[1],uk:p[2],us:p[3]||p[2],def:p[4],ex:p[5],unit:u})})})();
WF_C13_RAW.trim().split("\n").forEach(l=>{const p=l.split("|");if(p.length<16)return;const f={base:p[0],unit:+p[1],mean:p[2],n:p[3],v:p[4],a:p[5],adv:p[6],neg:p[7],items:[{s:p[8],ans:p[9].split(",").map(x=>x.trim()),p:p[10],why:p[11]},{s:p[12],ans:p[13].split(",").map(x=>x.trim()),p:p[14],why:p[15]}]};f.s=f.items[0].s;f.ans=f.items[0].ans;f.why=f.items[0].why;while(WF.some(x=>x.base===f.base))f.base=f.base+" ";WF.push(f)});
WF.sort((a,b)=>a.base.localeCompare(b.base));
GRAMMAR_C13.forEach(g=>{g.bank=g.practice.concat(GMORE_C13[g.id]||[]);GRAMMAR.push(g)});
Object.assign(BOOK,BOOK_C13);for(const n in BOOK)BOOK[n].grammar=GRAMMAR.filter(g=>g.unit===+n).map(g=>g.id);
COLLOC_C13_RAW.trim().split("\n").forEach(l=>{const p=l.split("|");if(p.length<9)return;COLLOC.push({u:+p[0],node:p[1],type:p[2],ph:p[3],key:p[4],col:p[5],def:p[6],ex:p[7],x:p[8].split(","),xk:(p[9]||p[8]).split(",")})});
for(const k in COLSRC_C13)COLSRC[k]=COLSRC[k]||("https://www.oxfordlearnersdictionaries.com/definition/english/"+COLSRC_C13[k]);
INTO_C13_RAW.trim().split("\n").forEach(l=>{const parts=l.split("|");const u=+parts[0],type=parts[1];const body=parts.slice(2).join("|");
const groups=body.split(" || ").map(g=>{const m=g.trim().match(/^(.*)\s+#(FR|F|R)$/);const toks=m[1].trim().split(/\s+/).map(t=>{const p=t.split("|");return {w:p[0],ipa:p[1],s:parseInt(p[2]),link:/\+$/.test(p[2])}});return {words:toks,tone:m[2]}});
INTO.push({id:INTO.length,unit:u,type,groups,text:groups.map(g=>g.words.map(w=>w.w).join(" ")).join(" ")})});
WXA.push(...WX_C13.map(x=>Object.assign(x,{lv:"C1.3"})));
'''
anchor = js.find('WXA.push(...WX_C13.map(x=>Object.assign(x,{lv:"C1.3"})));')
if anchor < 0:
    raise SystemExit("C1.3 merge anchor missing")
anchor = js.index("\n", anchor)
js = js[:anchor] + "\n" + data + merge + js[anchor:]

# ---------- 2. level support + addons, before the final render() ----------
am = open(os.path.join(HERE, "audio", "audman_c13.json"), encoding="utf-8").read() if os.path.exists(os.path.join(HERE, "audio", "audman_c13.json")) else "{}"
lm = open(os.path.join(HERE, "audio", "lman_c13.json"), encoding="utf-8").read() if os.path.exists(os.path.join(HERE, "audio", "lman_c13.json")) else "{}"
patch = r'''
// ===== C1.3 LEVEL SUPPORT =====
LVPRE["C1.3"]="c13";
if(typeof TR_C13!=="undefined"&&typeof TR_DATA!=="undefined")Object.assign(TR_DATA,TR_C13);
const _lvPackC13=lvPack;lvPack=function(l){return l==="C1.3"?{gx:[null,GX_C13_P1,GX_C13_P2,GX_C13_P3,GX_C13_P4],lx:[null,LX_C13_P1,LX_C13_P2],rx:RX_C13,wx:WX_C13}:_lvPackC13(l)};
const _lsSetsC13=lsSets;lsSets=function(){const add=(arr,pre)=>(arr||[]).map((d,i)=>({d,key:pre+i,lv:"C1.3"}));const extra=S.levels.includes("C1.3")?({p1:add(CL_C13_1,"c13cl1-"),p2:add(CL_C13_2,"c13cl2-"),p3:add(LX_C13_P2,"c13ef2-"),p4:add(CL_C13_4,"c13cl4-")}[LS.part]||[]):[];return _lsSetsC13().concat(extra).sort((a,b)=>LEVELS.indexOf(a.lv)-LEVELS.indexOf(b.lv))};
(function(){const A=__AUDMAN_C13__;for(const acc in A){AUDMAN[acc]=AUDMAN[acc]||{};Object.assign(AUDMAN[acc],A[acc])}Object.assign(LMAN,__LMAN_C13__)})();
Object.assign(AR_EM.unit,{25:"💗",26:"🧬",27:"📺",28:"🏔️",29:"🤝",30:"💧"});
Object.assign(AR_EM.gram,__GRAM_EM__);
(function(){const add=(id,ids)=>{const p=AR_EM.packs.find(x=>x[0]===id);if(p)ids.forEach(i=>{if(GRAMMAR.some(g=>g.id===i)&&!p[4].includes(i))p[4].push(i)})};add("p-cond",GRAMMAR.filter(g=>g.unit>=25&&/conditional/i.test(g.title)).map(g=>g.id));add("p-modals",GRAMMAR.filter(g=>g.unit>=25&&/modal|advice|should/i.test(g.title)).map(g=>g.id));add("p-future",GRAMMAR.filter(g=>g.unit>=25&&/future/i.test(g.title)).map(g=>g.id));add("p-linking",GRAMMAR.filter(g=>g.unit>=25&&/conjunction|contrast/i.test(g.title)).map(g=>g.id))})();
'''
gram_ids = re.findall(r'id:"(c13-[a-z0-9-]+)"', open(os.path.join(HERE, "data", "grammar_c13.js"), encoding="utf-8").read())
EMO = {"quote": "❝", "two-obj": "🎁", "number": "📊", "viewpoint": "👁️", "focus": "🔦", "question": "❓", "reflex": "🪞", "possess": "🔑", "that": "👉", "it-cleft": "🎯", "compar": "⚖️", "spec": "🕵️", "passive": "🔄", "cleft": "🎯", "wish": "🌠", "phrasal": "🧩", "adjective": "🎨", "order": "🎨", "mixed": "🔀", "cond": "🔀", "participle": "😮", "advice": "💡", "should": "💡", "future": "🔮", "gerund": "🔁", "verb": "🔁", "conj": "⚖️", "contrast": "⚖️"}
gem = {}
for g in gram_ids:
    gem[g] = next((e for k, e in EMO.items() if k in g), "🧩")
patch = patch.replace("__AUDMAN_C13__", am).replace("__LMAN_C13__", lm).replace("__GRAM_EM__", json.dumps(gem, ensure_ascii=False))
i = js.rfind("\nrender();")
if i < 0:
    raise SystemExit("final render() not found")
js = js[:i] + "\n" + patch + js[i:]

# ---------- 3. version log ----------
mv = re.search(r'const APP_BUILD=\{v:(\d+),t:"[^"]*",log:\[', js)
if mv:
    v = int(mv.group(1)) + 1
    stamp = os.environ.get("BUILD_TIME", "2026-11-05 09:00")
    js = js[:mv.start()] + f'const APP_BUILD={{v:{v},t:"{stamp}",log:[' + js[mv.end():]
    end = js.index("]]};", mv.start())
    js = js[:end] + f'], [{v}, "{stamp}", "New level C1.3 (units 1-6): vocabulary, word families, collocations, grammar, tests, listening, writing and pronunciation with natural voices."]' + js[end + 1:]

# ---------- 4. CSS unit colours and header text ----------
COL = [(25, "#E11D48"), (26, "#16A34A"), (27, "#9333EA"), (28, "#EA580C"), (29, "#0284C7"), (30, "#0E7490")]
html = html[:m.start(2)] + js + html[m.end(2):]
html = html.replace(".uu1{--uc:var(--u1)}", "".join(f".uu{n}{{--uc:{c}}}" for n, c in COL) + "\n.uu1{--uc:var(--u1)}", 1)
html = html.replace("--u1:#D9480F;", "".join(f"--u{n}:{c};" for n, c in COL) + "\n  --u1:#D9480F;", 1)
html = html.replace('#arena .lvb[data-lv="C1.2"]{background:#FFB870}', '#arena .lvb[data-lv="C1.2"]{background:#FFB870}#arena .lvb[data-lv="C1.3"]{background:#86EFAC}')
html = html.replace("General English B2.1, B2.2, B2.3 and C1.2:", "General English B2.1, B2.2, B2.3, C1.2 and C1.3:")
open(out, "w", encoding="utf-8").write(html)
print("ok", len(html))
