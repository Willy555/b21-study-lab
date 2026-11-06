#!/usr/bin/env python3
"""Adds the B2.3 module (units 19-24), the Grammar test games in Word Wars and the Dictionary tab
to an EF Study Lab index.html that already contains B2.1, B2.2 and C1.2.

Usage: python3 b23/build.py <input index.html> <output index.html>
Data: b23/data/*.js, manifests b23/audio/audman_b23.json and lman_b23.json, extra code b23/addons.js.
"""
import re, sys, os, json

HERE = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
html = open(src, encoding="utf-8").read()
if "VOCAB_B23_RAW" in html:
    raise SystemExit("B2.3 is already in this file")

m = re.search(r"(<script[^>]*>)(.*)(</script>)", html, re.S)
js = m.group(2)

# ---------- 1. data + merge, right after the C1.2 merge ----------
data = ""
for f in ["vocab_b23.js", "grammar_b23.js", "colloc_b23.js", "exams_b23.js", "listening_b23.js"]:
    data += f"\n// ===== B2.3 {f} =====\n" + open(os.path.join(HERE, "data", f), encoding="utf-8").read().strip() + "\n"

merge = r'''
// ===== MERGE B2.3 (units 19-24) =====
(function(){const at=UNITS.findIndex(u=>u.lv==="C1.2");UNITS_B23.forEach(u=>u.lv="B2.3");UNITS.splice(at<0?UNITS.length:at,0,...UNITS_B23);const li=LEVELS.indexOf("C1.2");LEVELS.splice(li<0?LEVELS.length:li,0,"B2.3")})();
(function(){let u=0;VOCAB_B23_RAW.trim().split("\n").forEach(l=>{l=l.trim();if(!l)return;if(l[0]==="#"){u=+l.slice(1);return}const p=l.split("|");VOCAB.push({id:"u"+u+"-"+p[0],w:p[0],pos:p[1],uk:p[2],us:p[3]||p[2],def:p[4],ex:p[5],unit:u})})})();
WF_B23_RAW.trim().split("\n").forEach(l=>{const p=l.split("|");if(p.length<16)return;const f={base:p[0],unit:+p[1],mean:p[2],n:p[3],v:p[4],a:p[5],adv:p[6],neg:p[7],items:[{s:p[8],ans:p[9].split(",").map(x=>x.trim()),p:p[10],why:p[11]},{s:p[12],ans:p[13].split(",").map(x=>x.trim()),p:p[14],why:p[15]}]};f.s=f.items[0].s;f.ans=f.items[0].ans;f.why=f.items[0].why;while(WF.some(x=>x.base===f.base))f.base=f.base+" ";WF.push(f)});
WF.sort((a,b)=>a.base.localeCompare(b.base));
GRAMMAR_B23.forEach(g=>{g.bank=g.practice.concat(GMORE_B23[g.id]||[]);GRAMMAR.push(g)});
Object.assign(BOOK,BOOK_B23);for(const n in BOOK)BOOK[n].grammar=GRAMMAR.filter(g=>g.unit===+n).map(g=>g.id);
COLLOC_B23_RAW.trim().split("\n").forEach(l=>{const p=l.split("|");if(p.length<9)return;COLLOC.push({u:+p[0],node:p[1],type:p[2],ph:p[3],key:p[4],col:p[5],def:p[6],ex:p[7],x:p[8].split(","),xk:(p[9]||p[8]).split(",")})});
for(const k in COLSRC_B23)COLSRC[k]=COLSRC[k]||("https://www.oxfordlearnersdictionaries.com/definition/english/"+COLSRC_B23[k]);
INTO_B23_RAW.trim().split("\n").forEach(l=>{const parts=l.split("|");const u=+parts[0],type=parts[1];const body=parts.slice(2).join("|");
const groups=body.split(" || ").map(g=>{const m=g.trim().match(/^(.*)\s+#(FR|F|R)$/);const toks=m[1].trim().split(/\s+/).map(t=>{const p=t.split("|");return {w:p[0],ipa:p[1],s:parseInt(p[2]),link:/\+$/.test(p[2])}});return {words:toks,tone:m[2]}});
INTO.push({id:INTO.length,unit:u,type,groups,text:groups.map(g=>g.words.map(w=>w.w).join(" ")).join(" ")})});
WXA.push(...WX_B23.map(x=>Object.assign(x,{lv:"B2.3"})));
'''
anchor = js.find('WXA.push(...WX_C12.map(x=>Object.assign(x,{lv:"C1.2"})));')
if anchor < 0:
    raise SystemExit("C1.2 merge anchor missing")
anchor = js.index("\n", anchor)
js = js[:anchor] + "\n" + data + merge + js[anchor:]

# ---------- 2. level support + addons, before the final render() ----------
am = open(os.path.join(HERE, "audio", "audman_b23.json"), encoding="utf-8").read() if os.path.exists(os.path.join(HERE, "audio", "audman_b23.json")) else "{}"
lm = open(os.path.join(HERE, "audio", "lman_b23.json"), encoding="utf-8").read() if os.path.exists(os.path.join(HERE, "audio", "lman_b23.json")) else "{}"
patch = r'''
// ===== B2.3 LEVEL SUPPORT =====
LVPRE["B2.3"]="b23";
if(typeof TR_B23!=="undefined"&&typeof TR_DATA!=="undefined")Object.assign(TR_DATA,TR_B23);
const _lvPackB23=lvPack;lvPack=function(l){return l==="B2.3"?{gx:[null,GX_B23_P1,GX_B23_P2,GX_B23_P3,GX_B23_P4],lx:[null,LX_B23_P1,LX_B23_P2],rx:RX_B23,wx:WX_B23}:_lvPackB23(l)};
const _lsSetsB23=lsSets;lsSets=function(){const add=(arr,pre)=>(arr||[]).map((d,i)=>({d,key:pre+i,lv:"B2.3"}));const extra=S.levels.includes("B2.3")?({p1:add(CL_B23_1,"b23cl1-"),p2:add(CL_B23_2,"b23cl2-"),p3:add(LX_B23_P2,"b23ef2-"),p4:add(CL_B23_4,"b23cl4-")}[LS.part]||[]):[];return _lsSetsB23().concat(extra).sort((a,b)=>LEVELS.indexOf(a.lv)-LEVELS.indexOf(b.lv))};
(function(){const A=__AUDMAN_B23__;for(const acc in A){AUDMAN[acc]=AUDMAN[acc]||{};Object.assign(AUDMAN[acc],A[acc])}Object.assign(LMAN,__LMAN_B23__)})();
Object.assign(AR_EM.unit,{19:"🛸",20:"🌅",21:"🎆",22:"🎭",23:"📱",24:"💰"});
Object.assign(AR_EM.gram,__GRAM_EM__);
(function(){const add=(id,ids)=>{const p=AR_EM.packs.find(x=>x[0]===id);if(p)ids.forEach(i=>{if(GRAMMAR.some(g=>g.id===i)&&!p[4].includes(i))p[4].push(i)})};add("p-cond",GRAMMAR.filter(g=>g.unit>=19&&/conditional/i.test(g.title)).map(g=>g.id));add("p-modals",GRAMMAR.filter(g=>g.unit>=19&&/modal|advice|should/i.test(g.title)).map(g=>g.id));add("p-future",GRAMMAR.filter(g=>g.unit>=19&&/future/i.test(g.title)).map(g=>g.id));add("p-linking",GRAMMAR.filter(g=>g.unit>=19&&/conjunction|contrast/i.test(g.title)).map(g=>g.id))})();
'''
gram_ids = re.findall(r'id:"(b23-[a-z0-9-]+)"', open(os.path.join(HERE, "data", "grammar_b23.js"), encoding="utf-8").read())
EMO = {"spec": "🕵️", "passive": "🔄", "cleft": "🎯", "wish": "🌠", "phrasal": "🧩", "adjective": "🎨", "order": "🎨", "mixed": "🔀", "cond": "🔀", "participle": "😮", "advice": "💡", "should": "💡", "future": "🔮", "gerund": "🔁", "verb": "🔁", "conj": "⚖️", "contrast": "⚖️"}
gem = {}
for g in gram_ids:
    gem[g] = next((e for k, e in EMO.items() if k in g), "🧩")
patch = patch.replace("__AUDMAN_B23__", am).replace("__LMAN_B23__", lm).replace("__GRAM_EM__", json.dumps(gem, ensure_ascii=False))
patch += "\n" + open(os.path.join(HERE, "addons.js"), encoding="utf-8").read() + "\n"
patch += "\n" + open(os.path.join(HERE, "dict_ctx.js"), encoding="utf-8").read() + "\n"
patch += "\n" + open(os.path.join(HERE, "dict_ctx2.js"), encoding="utf-8").read() + "\n"
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
    js = js[:end] + f'], [{v}, "{stamp}", "New level B2.3 (units 1-6). Word Wars: Grammar test games (the 4 exam parts, choose or write the answer). New Word search tab to look up any English word."]' + js[end + 1:]

# ---------- 4. CSS unit colours and header text ----------
COL = [(19, "#7C3AED"), (20, "#0D9488"), (21, "#DB2777"), (22, "#2563EB"), (23, "#0891B2"), (24, "#CA8A04")]
html = html[:m.start(2)] + js + html[m.end(2):]
html = html.replace(".uu1{--uc:var(--u1)}", "".join(f".uu{n}{{--uc:{c}}}" for n, c in COL) + "\n.uu1{--uc:var(--u1)}", 1)
html = html.replace("--u1:#D9480F;", "".join(f"--u{n}:{c};" for n, c in COL) + "\n  --u1:#D9480F;", 1)
html = html.replace('#arena .lvb[data-lv="C1.2"]{background:#FFB870}', '#arena .lvb[data-lv="B2.3"]{background:#F9A8D4}#arena .lvb[data-lv="C1.2"]{background:#FFB870}')
html = html.replace("General English B2.1, B2.2 and C1.2:", "General English B2.1, B2.2, B2.3 and C1.2:")
open(out, "w", encoding="utf-8").write(html)
print("ok", len(html))
