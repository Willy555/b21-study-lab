#!/usr/bin/env python3
"""Adds the C1.2 module (units 13-18) to an EF Study Lab index.html.

Usage: python3 build.py <input index.html> <output index.html>
Data: data/*.js (C1.2 content), audio/audman_c12.json and audio/lman_c12.json (audio manifests).
The patch is applied with string anchors so it can be re-run on a newer version of the app
(for example the one with the updated games section).
"""
import re, sys, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
html = open(src, encoding="utf-8").read()

m = re.search(r"(<script[^>]*>)(.*)(</script>)", html, re.S)
js = m.group(2)


def sub(old, new, count_min=1, s=None):
    global js
    target = js if s is None else s
    n = target.count(old)
    if n < count_min:
        raise SystemExit(f"anchor not found ({n}): {old[:90]}")
    target = target.replace(old, new)
    if s is None:
        js = target
    return target


# ---------- 1. data + merge, right after the B2.2 level helpers ----------
data = ""
for f in ["vocab_c12.js", "grammar_c12.js", "colloc_c12.js", "exams_c12.js", "listening_c12.js"]:
    data += f"\n// ===== C1.2 {f} =====\n" + open(os.path.join(HERE, "data", f), encoding="utf-8").read().strip() + "\n"

merge = r'''
// ===== MERGE C1.2 (units 13-18) =====
UNITS_C12.forEach(u=>{u.lv="C1.2";UNITS.push(u)});LEVELS.push("C1.2");
(function(){let u=0;VOCAB_C12_RAW.trim().split("\n").forEach(l=>{l=l.trim();if(!l)return;if(l[0]==="#"){u=+l.slice(1);return}const p=l.split("|");VOCAB.push({id:"u"+u+"-"+p[0],w:p[0],pos:p[1],uk:p[2],us:p[3]||p[2],def:p[4],ex:p[5],unit:u})})})();
WF_C12_RAW.trim().split("\n").forEach(l=>{const p=l.split("|");if(p.length<16)return;const f={base:p[0],unit:+p[1],mean:p[2],n:p[3],v:p[4],a:p[5],adv:p[6],neg:p[7],items:[{s:p[8],ans:p[9].split(",").map(x=>x.trim()),p:p[10],why:p[11]},{s:p[12],ans:p[13].split(",").map(x=>x.trim()),p:p[14],why:p[15]}]};f.s=f.items[0].s;f.ans=f.items[0].ans;f.why=f.items[0].why;while(WF.some(x=>x.base===f.base))f.base=f.base+" ";WF.push(f)});
WF.sort((a,b)=>a.base.localeCompare(b.base));
GRAMMAR_C12.forEach(g=>{g.bank=g.practice.concat(GMORE_C12[g.id]||[]);GRAMMAR.push(g)});
Object.assign(BOOK,BOOK_C12);for(const n in BOOK)BOOK[n].grammar=GRAMMAR.filter(g=>g.unit===+n).map(g=>g.id);
COLLOC_C12_RAW.trim().split("\n").forEach(l=>{const p=l.split("|");if(p.length<9)return;COLLOC.push({u:+p[0],node:p[1],type:p[2],ph:p[3],key:p[4],col:p[5],def:p[6],ex:p[7],x:p[8].split(","),xk:(p[9]||p[8]).split(",")})});
for(const k in COLSRC_C12)COLSRC[k]="https://www.oxfordlearnersdictionaries.com/definition/english/"+COLSRC_C12[k];
INTO_C12_RAW.trim().split("\n").forEach(l=>{const parts=l.split("|");const u=+parts[0],type=parts[1];const body=parts.slice(2).join("|");
const groups=body.split(" || ").map(g=>{const m=g.trim().match(/^(.*)\s+#(FR|F|R)$/);const toks=m[1].trim().split(/\s+/).map(t=>{const p=t.split("|");return {w:p[0],ipa:p[1],s:parseInt(p[2]),link:/\+$/.test(p[2])}});return {words:toks,tone:m[2]}});
INTO.push({id:INTO.length,unit:u,type,groups,text:groups.map(g=>g.words.map(w=>w.w).join(" ")).join(" ")})});
WXA.push(...WX_C12.map(x=>Object.assign(x,{lv:"C1.2"})));
'''
anchor = re.search(r'function WXL\(\)\{[^\n]*\}', js)
if not anchor:
    raise SystemExit("WXL anchor missing")
js = js[:anchor.end()] + "\n" + data + merge + js[anchor.end():]

# ---------- 2. generic unit numbers (Unit 1-6 inside each level) ----------
js = js.replace("${n>6?n-6:n}", "${uNum(n)}").replace("${u.n>6?u.n-6:u.n}", "${uNum(u.n)}")
sub(">Unit ${x.unit} · ${esc(x.title)}", ">${esc(uLabel(x.unit))} · ${esc(x.title)}")
js = js.replace('<span class="label ulabel">Unit ${s.unit} · ${esc(s.type)}</span>', '<span class="label ulabel">${esc(uLabel(s.unit))} · ${esc(s.type)}</span>')

# ---------- 3. exam start buttons and level default ----------
sub('b.textContent.replace(/B2\\.\\d /,"")', 'b.textContent.replace(/[BC]\\d\\.\\d /,"")')
sub('S.levels=["B2.2"];', 'S.levels=["C1.2"];')

# ---------- 4. word limits per level (B2: 140-190, C1: 220-260) ----------
js = js.replace('if(n<140)issues.push(["Length",`Too short: ${n} words. Write 140-190.`]);else if(n>190)issues.push(["Length",`Too long: ${n} words. Cut to 190 or fewer.`]);',
                'if(n<WLO())issues.push(["Length",`Too short: ${n} words. Write ${WLO()}-${WHI()}.`]);else if(n>WHI())issues.push(["Length",`Too long: ${n} words. Cut to ${WHI()} or fewer.`]);')
js = js.replace('n>=140&&n<=190', 'n>=WLO()&&n<=WHI()').replace('(140-190)', '(${WLO()}-${WHI()})')
js = js.replace('if(n<140||n>190)content-=1;', 'if(n<WLO()||n>WHI())content-=1;')
js = js.replace('if(n<140)content-=n<100?2:1;if(n>190)content-=.5;', 'if(n<WLO())content-=n<WLO()-40?2:1;if(n>WHI())content-=.5;')
js = js.replace('fix:n<140?', 'fix:n<WLO()?')
js = js.replace('then write 140-190 words.', 'then write the number of words the task asks for (140-190 at B2, 220-260 at C1).')
js = js.replace('Writing, 140-190 words with notes', 'Writing with notes (140-190 words at B2, 220-260 at C1)')
js = js.replace('<b>Part 5 · Writing</b> 140-190 words with notes', '<b>Part 5 · Writing</b> 140-190 words (B2) or 220-260 words (C1) with notes')
js = js.replace('stay within 140-190 words.', 'stay within the word limit (140-190 at B2, 220-260 at C1).')

# ---------- 5. level-aware helpers, inserted before the final render() ----------
patch = r'''
// ===== C1.2 LEVEL SUPPORT =====
function uNum(n){return ((n-1)%6)+1}
const LVPRE={"B2.1":"","B2.2":"b22","C1.2":"c12"};
function lvPack(l){return l==="C1.2"?{gx:[null,GX_C12_P1,GX_C12_P2,GX_C12_P3,GX_C12_P4],lx:[null,LX_C12_P1,LX_C12_P2],rx:RX_C12,wx:WX_C12}:l==="B2.2"?{gx:[null,GX22_P1,GX22_P2,GX22_P3,GX22_P4],lx:[null,LX22_P1,LX22_P2],rx:RX22,wx:WX22}:{gx:[null,GX_P1,GX_P2,GX_P3,GX_P4],lx:[null,LX_P1,LX_P2],rx:RX,wx:WX}}
function GXL(n){return lvPack(lvOf()).gx[n]}
function LXL(n){return lvPack(lvOf()).lx[n]}
function RXL(){return lvPack(lvOf()).rx}
function WXL(){return lvPack(lvOf()).wx}
function wrLv(){if(document.querySelector("#wta")){const x=WXA[WR.task];return x?x.lv:S.levels[S.levels.length-1]}return lvOf()}
function WLO(){return wrLv()==="C1.2"?220:140}
function WHI(){return wrLv()==="C1.2"?260:190}
listenPlayer=function(key){const k=(LVPRE[lvOf()]||"")+key.replace(/^l1-/,"ef1-").replace(/^l2-/,"ef2-");const locked=!X.sub&&(X.plays[k]||0)>=1;return lpBox(k,X.sub?"Review.":"The recording is played twice, like in the exam.",locked)};
function lsSets(){const add=(arr,pre,lv)=>(arr||[]).map((d,i)=>({d,key:pre+i,lv}));const all={p1:[...add(CL1,"cl1-","B2.1"),...add(CL22_1,"b22cl1-","B2.2"),...add(CL_C12_1,"c12cl1-","C1.2")],p2:[...add(CL2,"cl2-","B2.1"),...add(CL22_2,"b22cl2-","B2.2"),...add(CL_C12_2,"c12cl2-","C1.2")],p3:[...add(LX_P2,"ef2-","B2.1"),...add(LX22_P2,"b22ef2-","B2.2"),...add(LX_C12_P2,"c12ef2-","C1.2")],p4:[...add(CL4,"cl4-","B2.1"),...add(CL22_4,"b22cl4-","B2.2"),...add(CL_C12_4,"c12cl4-","C1.2")]}[LS.part];return all.filter(s=>S.levels.includes(s.lv))}
(function(){const A=__AUDMAN_C12__;for(const acc in A){AUDMAN[acc]=AUDMAN[acc]||{};Object.assign(AUDMAN[acc],A[acc])}Object.assign(LMAN,__LMAN_C12__)})();
'''
am = open(os.path.join(HERE, "audio", "audman_c12.json"), encoding="utf-8").read() if os.path.exists(os.path.join(HERE, "audio", "audman_c12.json")) else "{}"
lm = open(os.path.join(HERE, "audio", "lman_c12.json"), encoding="utf-8").read() if os.path.exists(os.path.join(HERE, "audio", "lman_c12.json")) else "{}"
patch = patch.replace("__AUDMAN_C12__", am).replace("__LMAN_C12__", lm)
i = js.rfind("\nrender();")
if i < 0:
    raise SystemExit("final render() not found")
js = js[:i] + "\n" + patch + js[i:]

# ---------- 6. CSS unit colours and header text ----------
css_add = "".join(f".uu{n}{{--uc:{c}}}" for n, c in [(13, "#9333EA"), (14, "#059669"), (15, "#B45309"), (16, "#0284C7"), (17, "#EA580C"), (18, "#16A34A")])
css_vars = "".join(f"--u{n}:{c};" for n, c in [(13, "#9333EA"), (14, "#059669"), (15, "#B45309"), (16, "#0284C7"), (17, "#EA580C"), (18, "#16A34A")])
html = html[:m.start(2)] + js + html[m.end(2):]
html = html.replace(".uu1{--uc:var(--u1)}", css_add + "\n.uu1{--uc:var(--u1)}", 1)
html = html.replace("--u1:#D9480F;", css_vars + "\n  --u1:#D9480F;", 1)
html = re.sub(r'<p class="sub">General English B2\.1 and B2\.2:', '<p class="sub">General English B2.1, B2.2 and C1.2:', html)
open(out, "w", encoding="utf-8").write(html)
print("ok", len(html))
