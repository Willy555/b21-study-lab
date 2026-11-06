
// ===== WORD SEARCH v2: meanings by context (Cambridge style) =====
// Sources: Wiktionary REST (senses, labels, examples), Free Dictionary API (audio, IPA, synonyms), Datamuse (common word partners).
(function(){const s=document.createElement("style");s.textContent=`
.dxglance{display:grid;gap:8px}
.dxglance .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:flex-start}
.dxglance button{border:2px solid var(--line);background:#fff;border-radius:999px;padding:5px 12px;font:800 .82rem var(--body);letter-spacing:.04em;cursor:pointer;color:#1E3A8A}
.dxglance button:hover{background:#EEF2FF}
.dxpsec{display:grid;gap:10px}
.dxpsec>.top{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px}
.dxpsec>.top h3{margin:0;font-size:1.25rem}
.dxsn{display:grid;gap:6px;padding:12px 0 12px 14px;border-left:4px solid #C7D2FE;scroll-margin-top:90px}
.dxsn+.dxsn{margin-top:4px}
.dxsn .gwrow{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.dxgw{font:900 .8rem var(--body);letter-spacing:.06em;color:#fff;background:#1D4ED8;border-radius:8px;padding:3px 9px}
.dxgc{font:800 .78rem var(--body);color:#1D4ED8;border:1px solid #93C5FD;border-radius:6px;padding:1px 6px}
.dxreg{font:700 .76rem var(--body);color:#7C2D12;background:#FFEDD5;border-radius:6px;padding:2px 7px}
.dxsn .d{font:600 1.05rem/1.4 var(--body)}
.dxsn ul{margin:0;padding-left:20px;display:grid;gap:4px}
.dxsn li{font-style:italic;color:#3B3466}
.dxsn li b{font-style:normal;color:#1D4ED8}
.dxsn .syn{font-size:.88rem;color:var(--muted,#667)}
.dxpart{background:#F8FAFC;border-radius:12px;padding:10px 12px;display:grid;gap:6px}
.dxpart .lbl2{font:800 .76rem var(--body);letter-spacing:.06em;text-transform:uppercase;color:#475569}
.dxpart .ph{display:flex;flex-wrap:wrap;gap:6px}
.dxpart .ph span{background:#fff;border:1px solid var(--line);border-radius:999px;padding:3px 10px;font:600 .92rem var(--body)}
.dxpart .ph span b{color:#1D4ED8}
.dxmore{justify-self:start}
`;document.head.appendChild(s)})();
const DX_SKIP=/\b(obsolete|archaic|dated|rare|now rare|uncommon|dialect|dialectal|nonstandard|non-standard|historical|vulgar|offensive|derogatory|ethnic slur|Scotland|Northern England|Ireland|Geordie|Yorkshire|eye dialect|obsolete)\b/i;
const DX_GRAM={transitive:"T",intransitive:"I",countable:"C",uncountable:"U",ditransitive:"T","usually plural":"usually plural","in the plural":"plural",ergative:"I or T",ambitransitive:"I or T","not comparable":"not comparable",attributive:"before noun",predicative:"after verb","usually passive":"usually passive"};
const DX_REG=/^(informal|formal|figurative|figuratively|slang|colloquial|literary|humorous|British|UK|US|American|Commonwealth|Australia|Canada|chiefly British|chiefly US|euphemistic|technical|law|legal|medicine|computing|finance|business|music|sports|mathematics|physics|chemistry|biology|economics)$/i;
const dxTxt=html=>{try{const d=new DOMParser().parseFromString("<div>"+String(html||"")+"</div>","text/html");return (d.body.textContent||"").replace(/\s+/g," ").trim()}catch(e){return String(html||"").replace(/<[^>]+>/g,"").trim()}};
function dxSplitLabels(t){const labels=[];let m;while((m=t.match(/^\(([^()]{1,60})\)\s*/))){m[1].split(/,\s*|;\s*/).forEach(x=>{x=x.trim();if(x)labels.push(x)});t=t.slice(m[0].length)}return {labels,def:t}}
function dxGuide(def,ctx,syns){if(ctx.length){const c=ctx.join(", ").replace(/^of (an? |the )?/i,"").replace(/^(especially|chiefly|usually|often) /i,"");if(c.split(" ").length<=4)return c.toUpperCase()}
const seg=def.replace(/\.$/,"").split(/;\s*/);if(seg.length>1){if(seg[0].split(" ").length<=3)return seg[0].toUpperCase();const last=seg[seg.length-1].split(/,\s*/)[0];if(last&&last.split(" ").length<=2)return last.toUpperCase()}
if(syns&&syns[0]&&syns[0].split(" ").length<=2)return syns[0].toUpperCase();
const words=def.replace(/\.$/,"").split(" ");if(words.length<=3)return def.replace(/\.$/,"").split(/,\s*/)[0].toUpperCase();return ""}
function dxHi(ex,w){const e=esc(ex);const base=String(w).toLowerCase().replace(/(e|y|ies|es|s)$/,"");if(base.length<3||/\s/.test(w))return e.replace(new RegExp(String(w).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"ig"),x=>`<b>${x}</b>`);
return e.replace(new RegExp(`\\b(${base.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}[a-z]*)\\b`,"ig"),x=>`<b>${x}</b>`)}
function dxBuild(r){const w=r.w;const groups=[];const fa={};
(r.online||[]).forEach(e=>(e.meanings||[]).forEach(m=>{const k=(m.partOfSpeech||"").toLowerCase();(fa[k]=fa[k]||{syn:new Set(),ant:new Set(),defs:[]});m.definitions.forEach(d=>{fa[k].defs.push(d);(d.synonyms||[]).forEach(x=>fa[k].syn.add(x));(d.antonyms||[]).forEach(x=>fa[k].ant.add(x))});(m.synonyms||[]).forEach(x=>fa[k].syn.add(x));(m.antonyms||[]).forEach(x=>fa[k].ant.add(x))}));
const norm=s=>String(s).toLowerCase().replace(/[^a-z ]/g,"").slice(0,40);
const synFor=(pos,def)=>{const F=fa[pos];if(!F)return [];const d=F.defs.find(x=>norm(x.definition)===norm(def)||norm(def).startsWith(norm(x.definition).slice(0,25)));return d&&d.synonyms||[]};
const wk=(r.wk&&(r.wk.en||[]))||[];const forms=new Set();
if(wk.length){wk.forEach(ent=>{const pos=String(ent.partOfSpeech||"").toLowerCase();if(pos==="proper noun"&&wk.some(x=>String(x.partOfSpeech).toLowerCase()!=="proper noun"))return;
let g=groups.find(x=>x.pos===pos);if(!g){g={pos,senses:[],syn:new Set(fa[pos]?fa[pos].syn:[]),ant:new Set(fa[pos]?fa[pos].ant:[])};groups.push(g)}
(ent.definitions||[]).forEach(d=>{const raw=dxTxt(d.definition);if(!raw)return;const {labels,def}=dxSplitLabels(raw);if(!def)return;
const fm=def.match(/^(?:plural|simple past|simple past tense|past tense|past participle|present participle|third-person singular(?: simple present indicative)?(?: form)?|comparative(?: form)?|superlative(?: form)?|alternative (?:form|spelling|letter-case form)|obsolete (?:form|spelling)|misspelling|archaic (?:form|spelling)|nonstandard (?:form|spelling)|(?:simple past and )?past participle)(?: form)? of ([A-Za-z' -]+?)[.;]?$/i);
if(fm){forms.add(fm[1].trim());return}
const skip=labels.some(l=>DX_SKIP.test(l));const gram=[],reg=[],ctx=[];labels.forEach(l=>{const lw=l.toLowerCase();const bare=l.replace(/^(chiefly|mainly|mostly|usually|often|especially|now|sometimes)\s+/i,"");if(DX_GRAM[lw])gram.push(DX_GRAM[lw]);else if(DX_REG.test(bare))reg.push(l);else if(!/^(also|usually|often|chiefly|especially|by extension|now|in general)$/i.test(l))ctx.push(l)});
const ex=[...(d.parsedExamples||[]).map(x=>dxTxt(x.example)),...(d.examples||[]).map(dxTxt)].filter((x,i,a)=>x&&a.indexOf(x)===i&&x.length<220).slice(0,3);
const syn=synFor(pos,def);g.senses.push({def,gram:[...new Set(gram)],reg,ctx,ex,syn,skip,gw:dxGuide(def,ctx,syn)})})});
const anyOk=groups.some(g=>g.senses.some(s=>!s.skip));groups.forEach(g=>{const ok=g.senses.filter(s=>!s.skip);g.senses=ok.length?ok:anyOk?[]:g.senses.slice(0,3)})}
else Object.keys(fa).forEach(pos=>{const F=fa[pos];groups.push({pos,syn:F.syn,ant:F.ant,senses:F.defs.map(d=>({def:d.definition,gram:[],reg:[],ctx:[],ex:d.example?[d.example]:[],syn:d.synonyms||[],gw:dxGuide(d.definition,[],d.synonyms)}))})});
return {groups:groups.filter(g=>g.senses.length),forms:[...forms].filter(f=>f.toLowerCase()!==w.toLowerCase())}}
const DX_STOP=new Set("the a an and or of to in on at for with by from as is are was were be been it its this that these those his her their my your our me him them us you i he she we they not no so than then there here what which who whom whose when where why how all any some more most very just also into out up down over about after before off".split(" "));
function dxPartners(r,pos){const C=r.ctx||{};const w=r.w.toLowerCase();const out=(arr,fmt,filt)=>(arr||[]).filter(x=>x.word&&!DX_STOP.has(x.word)&&!/\s/.test(x.word)&&x.word!==w&&(!filt||filt(x))).slice(0,10).map(x=>fmt(esc(x.word)));
const tg=t=>x=>(x.tags||[]).includes(t);
if(pos==="adjective"){const a=out(C.jja,x=>`<b>${esc(r.w)}</b> ${x}`);const b=out(C.lc,x=>`<b>${esc(r.w)}</b> ${x}`,tg("prep"));return [a.length&&["Nouns it describes",a],b.length&&["Followed by",b]].filter(Boolean)}
if(pos==="noun"){const a=out(C.jjb,x=>`${x} <b>${esc(r.w)}</b>`);const v=out(C.rc,x=>`${x} (a/the) <b>${esc(r.w)}</b>`,tg("v"));const pr=out(C.lc,x=>`<b>${esc(r.w)}</b> ${x}`,tg("prep"));return [a.length&&["Adjectives used with it",a],v.length&&["Verbs before it",v],pr.length&&["Prepositions after it",pr]].filter(Boolean)}
if(pos==="verb"){const a=out(C.lc,x=>`<b>${esc(r.w)}</b> ${x}`,x=>!tg("adj")(x)||tg("n")(x));const b=out(C.rc,x=>`${x} <b>${esc(r.w)}</b>`,tg("adv"));return [a.length&&["Words that often come after it",a],b.length&&["Adverbs before it",b]].filter(Boolean)}
if(pos==="adverb"){const a=out(C.lc,x=>`<b>${esc(r.w)}</b> ${x}`,x=>tg("adj")(x)||tg("v")(x));return a.length?[["Words it often goes with",a]]:[]}
return []}
async function dxGet(url,ms){try{const c=new AbortController();const t=setTimeout(()=>c.abort(),ms||8000);const r=await fetch(url,{signal:c.signal});clearTimeout(t);if(r.status===404)return [];if(!r.ok)return null;return await r.json()}catch(e){return null}}
dxLookup=async function(word){word=String(word||"").trim().replace(/\s+/g," ");if(!word)return;DX.q=word;DX.busy=true;DX.err="";DX.all=false;DX.res={w:word,book:dxBook(word),online:null,off:null,wk:null,ctx:{}};render();
const lw=word.toLowerCase();DX.hist=[lw,...DX.hist.filter(x=>x!==lw)].slice(0,20);dxSave();const q=encodeURIComponent(lw);
const one=!/\s/.test(lw);const dm=p=>one?dxGet("https://api.datamuse.com/words?max=30&md=p&"+p+"="+q,6000):Promise.resolve([]);
const [fd,wkRaw,jja,jjb,lc,rc]=await Promise.all([dxGet("https://api.dictionaryapi.dev/api/v2/entries/en/"+q),dxGet("https://en.wiktionary.org/api/rest_v1/page/definition/"+encodeURIComponent(lw.replace(/ /g,"_"))),dm("rel_jja"),dm("rel_jjb"),dm("lc"),dm("rc")]);
let wk=wkRaw&&!Array.isArray(wkRaw)&&wkRaw.en&&wkRaw.en.length?wkRaw:null;
let online=fd;if(wk&&(!online||!online.length))online=[{word:lw,phonetics:[],meanings:[]}];
let off=null;if(!online||!online.length){try{const d=await dictData();const own=d.e[lw],bw=d.f[lw];off={own,base:bw&&d.e[bw],bw,ipa:(own&&own.i)||d.p[lw]||""}}catch(e){}}
if(DX.q!==word)return;Object.assign(DX.res,{online,off,wk,ctx:{jja,jjb,lc,rc}});DX.busy=false;
if(online===null&&!(off&&(off.own||off.base))&&!DX.res.book.length)DX.err=navigator.onLine===false?"You are offline. Connect to the internet to search new words (words from the lab still work).":"The online dictionary did not answer. Try again in a moment, or open the word in Cambridge.";
render()};
dxOnlineHTML=function(){const r=DX.res;if(!r)return "";const B=dxBuild(r);if(!B.groups.length&&!B.forms.length)return `<section class="card"><p style="margin:0">No entry found for <b>${esc(r.w)}</b>. Check the spelling or open it in Cambridge.</p></section>`;
const LIM=DX.all?99:5;let more=false;
const glance=B.groups.length>1||B.groups.some(g=>g.senses.length>1)?`<section class="card dxglance"><span class="label">Meanings at a glance</span>${B.groups.map((g,gi)=>`<div class="row"><span class="dxpos">${esc(g.pos)}</span>${g.senses.slice(0,LIM).map((s,si)=>`<button data-dxjump="dxs-${gi}-${si}">${esc(s.gw||("MEANING "+(si+1)))}</button>`).join("")}</div>`).join("")}</section>`:"";
const forms=B.forms.length?`<section class="card"><p style="margin:0"><b>${esc(r.w)}</b> is a form of ${B.forms.map(f=>`<button class="btn small" data-dxq="${esc(f)}">${esc(f)}</button>`).join(" ")}. Tap it to see all its meanings.</p></section>`:"";
const secs=B.groups.map((g,gi)=>{if(g.senses.length>LIM)more=true;const parts=dxPartners(r,g.pos);
return `<section class="card dxpsec"><div class="top"><h3>${esc(r.w)}</h3><span class="dxpos">${esc(g.pos)}</span></div>
${g.senses.slice(0,LIM).map((s,si)=>`<div class="dxsn" id="dxs-${gi}-${si}"><div class="gwrow">${s.gw?`<span class="dxgw">${esc(s.gw)}</span>`:`<span class="dxgw" style="background:#64748B">${si+1}</span>`}${s.gram.map(x=>`<span class="dxgc">[${esc(x)}]</span>`).join("")}${s.reg.map(x=>`<span class="dxreg">${esc(x)}</span>`).join("")}${s.ctx.length&&!(s.gw&&s.gw===s.ctx.join(", ").toUpperCase())?`<span class="dxreg" style="background:#E0F2FE;color:#075985">${esc(s.ctx.join(", "))}</span>`:""}</div>
<div class="d">${esc(s.def)}</div>${s.ex.length?`<ul>${s.ex.map(x=>`<li>${dxHi(x,r.w)}</li>`).join("")}</ul>`:""}${s.syn&&s.syn.length?`<div class="syn">Similar: ${s.syn.slice(0,5).map(esc).join(", ")}</div>`:""}</div>`).join("")}
${parts.length?`<div class="dxpart"><span class="lbl2">How it is used</span>${parts.map(([t,a])=>`<div class="sub" style="font-size:.85rem">${esc(t)}</div><div class="ph">${a.map(x=>`<span>${x}</span>`).join("")}</div>`).join("")}</div>`:""}
${g.syn.size?`<div><div class="sub" style="margin-bottom:4px">Similar words</div><div class="dxchips">${[...g.syn].slice(0,10).map(x=>`<button data-dxq="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>`:""}
${g.ant.size?`<div><div class="sub" style="margin-bottom:4px">Opposites</div><div class="dxchips">${[...g.ant].slice(0,8).map(x=>`<button data-dxq="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>`:""}</section>`}).join("");
return forms+glance+secs+(more?`<button class="btn dxmore" id="dxall">Show all meanings</button>`:"")};
const _viewDictCtx=viewDict;viewDict=function(m){_viewDictCtx(m);
m.querySelectorAll("[data-dxjump]").forEach(b=>b.onclick=()=>{const t=document.getElementById(b.dataset.dxjump);if(t){t.scrollIntoView({behavior:"smooth",block:"start"});t.style.background="#EEF2FF";setTimeout(()=>t.style.background="",1200)}});
const all=m.querySelector("#dxall");if(all)all.onclick=()=>{DX.all=true;render()};
m.querySelectorAll(".dxsrc").forEach(p=>{if(/Free Dictionary/.test(p.textContent))p.textContent="Meanings and examples: Wiktionary (CC BY-SA). Recordings: Free Dictionary API. Word partners: Datamuse."})};
const _dxDefForCtx=dxDefFor;dxDefFor=function(r){try{const B=dxBuild(r);const g=B.groups[0];if(g&&g.senses[0])return {pos:g.pos,def:g.senses[0].def,ex:g.senses[0].ex[0]||""}}catch(e){}return _dxDefForCtx(r)};
