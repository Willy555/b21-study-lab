
// ===== WORD SEARCH v3: Cambridge-like entries =====
// Simple definitions (WordNet via Datamuse) first, examples and labels from Wiktionary, spelling suggestions, tap a word in a definition to look it up.
(function(){const s=document.createElement("style");s.textContent=`
.dxe{display:grid;gap:4px}
.dxe .eh{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 12px;padding-bottom:8px;border-bottom:2px solid #1D4ED8}
.dxe .eh h3{margin:0;font-size:1.6rem}
.dxe .eh .pos{font:italic 700 1.05rem var(--body);color:#1D4ED8}
.dxe .eh .pr{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;font-size:.95rem}
.dxe .eh .pr b{font:800 .78rem var(--body);color:#475569}
.dxs3{display:grid;gap:6px;padding:12px 0;border-bottom:1px solid var(--line);scroll-margin-top:90px}
.dxs3:last-of-type{border-bottom:0}
.dxs3 .gw3{font:900 .85rem var(--body);letter-spacing:.05em;color:#1D4ED8}
.dxs3 .tags{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.dxs3 .df{font:700 1.12rem/1.45 var(--body);color:#111827}
.dxs3 .df .w{cursor:pointer;border-radius:4px}
.dxs3 .df .w:hover{background:#DBEAFE}
.dxs3 ul{margin:2px 0 0;padding-left:0;list-style:none;display:grid;gap:5px}
.dxs3 li{font-style:italic;color:#374151;padding-left:14px;position:relative}
.dxs3 li:before{content:"";position:absolute;left:0;top:.62em;width:6px;height:6px;border-radius:50%;background:#93C5FD}
.dxs3 li b{font-style:normal;color:#1D4ED8}
.dxs3 .syn{font-size:.9rem;color:#475569}
.dxs3 .syn button{border:0;background:none;padding:0;color:#1D4ED8;font:700 .9rem var(--body);cursor:pointer;text-decoration:underline dotted}
.dxtip{font-size:.85rem;color:#64748B;margin:0}
.dxdym{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
`;document.head.appendChild(s)})();
const DM_POS={n:"noun",v:"verb",adj:"adjective",adv:"adverb",u:""};
function dxToks(s){return new Set(String(s||"").toLowerCase().match(/[a-z]{4,}/g)?.filter(x=>!DX_STOP.has(x)&&!/^(that|this|with|from|have|having|which|something|someone|person|thing|being|cause|causing|used|make|very|more|less|kind|state|quality|especially)$/.test(x)).map(x=>x.slice(0,5))||[])}
function dxDefsWN(r){const d=(r.dm||[]).find(x=>x.word&&x.word.toLowerCase()===r.w.toLowerCase());const out=[];(d&&d.defs||[]).forEach(t=>{const i=t.indexOf("\t");const pos=DM_POS[t.slice(0,i)]??t.slice(0,i);let def=t.slice(i+1).trim();if(!def)return;def=def.replace(/^\(([^)]*)\)\s*/,"");def=def.charAt(0).toUpperCase()+def.slice(1);if(!/[.!?]$/.test(def))def+=".";if(!out.some(o=>o.def.toLowerCase()===def.toLowerCase()))out.push({pos,def})});return out}
function dxBuild3(r){const B=dxBuild(r);const wn=dxDefsWN(r);const groups=[];
const posOrder=[...new Set([...wn.map(x=>x.pos),...B.groups.map(g=>g.pos)])].filter(Boolean);
posOrder.forEach(pos=>{const G=B.groups.find(g=>g.pos===pos)||{senses:[],syn:new Set(),ant:new Set()};const W=wn.filter(x=>x.pos===pos);const used=new Set();let senses=[];
if(W.length){senses=W.map(x=>{const t=dxToks(x.def);let best=-1,bs=0;G.senses.forEach((s,i)=>{if(used.has(i))return;const u=dxToks(s.def+" "+(s.syn||[]).join(" ")+" "+(s.gw||""));let sc=0;t.forEach(k=>{if(u.has(k))sc++});if(sc>bs){bs=sc;best=i}});
const m=best>=0?G.senses[best]:null;if(m)used.add(best);return {def:x.def,ex:m?m.ex:[],gram:m?m.gram:[],reg:m?m.reg:[],ctx:m?m.ctx:[],syn:m?m.syn:[],gw:m&&m.ctx.length?m.gw:""}});
G.senses.forEach((s,i)=>{if(!used.has(i)&&s.ex.length)senses.push(Object.assign({extra:1},s))})}
else senses=G.senses.map(s=>Object.assign({},s));
const fam=r.w.toLowerCase().slice(0,Math.max(3,r.w.length-4));
senses.forEach(s=>{if(!s.gw||s.gw.toLowerCase().startsWith(fam))s.gw="";const seg=s.def.replace(/\.$/,"").split(/;\s*/);if(seg.length>1&&seg[0].toLowerCase().includes(fam)){s.def=seg.slice(1).join("; ");s.def=s.def.charAt(0).toUpperCase()+s.def.slice(1)+"."}
if(!s.gw&&senses.length>1){const sy=(s.syn||[]).find(x=>!x.toLowerCase().startsWith(fam)&&x.split(" ").length<=2);if(sy)s.gw=sy.toUpperCase()}});
if(senses.length)groups.push({pos,senses,syn:G.syn,ant:G.ant})});
return {groups,forms:B.forms}}
function dxDefHTML(def){return esc(def).replace(/[A-Za-z][A-Za-z'-]{2,}/g,w=>`<span class="w" data-dxq="${w.toLowerCase().replace(/'s$/,"")}">${w}</span>`)}
function dxSugg(r){const lw=r.w.toLowerCase();return (r.dm||[]).map(x=>x.word).filter(x=>x&&x.toLowerCase()!==lw).slice(0,5)}
const _dxLookup3=dxLookup;dxLookup=async function(word){const w=String(word||"").trim().replace(/\s+/g," ");if(!w)return;const dmP=dxGet("https://api.datamuse.com/words?max=6&md=d&sp="+encodeURIComponent(w.toLowerCase()),6000);
await _dxLookup3(word);if(!DX.res||DX.res.w!==w)return;const dm=await dmP;if(!DX.res||DX.res.w!==w)return;DX.res.dm=dm||[];
const exact=(dm||[]).some(x=>x.word&&x.word.toLowerCase()===w.toLowerCase()&&x.defs);if(exact&&(!DX.res.online||!DX.res.online.length))DX.res.online=[{word:w,phonetics:[],meanings:[]}];
const near=(dm||[]).some(x=>x.word&&x.word.toLowerCase()!==w.toLowerCase());if(!exact&&near&&(!DX.res.online||!DX.res.online.length)&&!DX.res.book.length)DX.res.online=[{word:w,phonetics:[],meanings:[]}];
if(DX.err&&(exact||near))DX.err="";render()};
dxOnlineHTML=function(){const r=DX.res;if(!r)return "";const B=dxBuild3(r);const sug=dxSugg(r);
if(!B.groups.length&&!B.forms.length)return `<section class="card" style="display:grid;gap:10px"><p style="margin:0">No entry found for <b>${esc(r.w)}</b>.</p>${sug.length?`<div class="dxdym"><b>Did you mean</b>${sug.map(x=>`<button class="btn small" data-dxq="${esc(x)}">${esc(x)}</button>`).join("")}</div>`:`<p class="dxtip">Check the spelling, or try the base form (run, not running).</p>`}</section>`;
const au=dxAudio(r.online);const ipas=dxIpa(r.online);const uk=au.find(a=>a.acc==="UK"),us=au.find(a=>a.acc==="US");
const pr=`<span class="pr">${ipas[0]?`<span class="ipa">${esc(ipas[0])}</span>`:""}${uk?`<b>UK</b><button class="icon say" data-dxau="${au.indexOf(uk)}">🔊</button>`:""}${us?`<b>US</b><button class="icon say" data-dxau="${au.indexOf(us)}">🔊</button>`:""}${!uk&&!us&&au[0]?`<button class="icon say" data-dxau="0">🔊</button>`:""}</span>`;
const LIM=DX.all?99:4;let more=false;
const forms=B.forms.length?`<section class="card"><p style="margin:0"><b>${esc(r.w)}</b> is a form of ${B.forms.map(f=>`<button class="btn small" data-dxq="${esc(f)}">${esc(f)}</button>`).join(" ")}. Tap it to see all its meanings.</p></section>`:"";
const secs=B.groups.map((g,gi)=>{const main=g.senses.filter(s=>!s.extra);const ext=g.senses.filter(s=>s.extra);const list=main.concat(ext);if(list.length>LIM)more=true;const parts=dxPartners(r,g.pos);
return `<section class="card dxe"><div class="eh"><h3>${esc(r.w)}</h3><span class="pos">${esc(g.pos)}</span>${pr}</div>
${list.slice(0,LIM).map((s,si)=>`<div class="dxs3" id="dxs-${gi}-${si}">${s.gw||s.gram.length||s.reg.length?`<div class="tags">${s.gw?`<span class="gw3">(${esc(s.gw)})</span>`:""}${s.gram.map(x=>`<span class="dxgc">[${esc(x)}]</span>`).join("")}${s.reg.map(x=>`<span class="dxreg">${esc(x)}</span>`).join("")}</div>`:""}
<div class="df">${dxDefHTML(s.def)}</div>${s.ex.length?`<ul>${s.ex.slice(0,3).map(x=>`<li>${dxHi(x,r.w)}</li>`).join("")}</ul>`:""}${s.syn&&s.syn.length?`<div class="syn">Similar: ${s.syn.filter(x=>x.toLowerCase()!==r.w.toLowerCase()).slice(0,4).map(x=>`<button data-dxq="${esc(x)}">${esc(x)}</button>`).join(", ")}</div>`:""}</div>`).join("")}
${parts.length?`<div class="dxpart"><span class="lbl2">Words it is used with</span>${parts.map(([t,a])=>`<div class="sub" style="font-size:.85rem">${esc(t)}</div><div class="ph">${a.map(x=>`<span>${x}</span>`).join("")}</div>`).join("")}</div>`:""}
${g.syn.size||g.ant.size?`<div style="display:grid;gap:6px;margin-top:6px">${g.syn.size?`<div><span class="sub">Similar words </span><span class="dxchips" style="display:inline-flex">${[...g.syn].slice(0,8).map(x=>`<button data-dxq="${esc(x)}">${esc(x)}</button>`).join("")}</span></div>`:""}${g.ant.size?`<div><span class="sub">Opposites </span><span class="dxchips" style="display:inline-flex">${[...g.ant].slice(0,6).map(x=>`<button data-dxq="${esc(x)}">${esc(x)}</button>`).join("")}</span></div>`:""}</div>`:""}</section>`}).join("");
return forms+secs+(more?`<button class="btn dxmore" id="dxall">Show more meanings</button>`:"")+`<p class="dxtip">Tip: tap any word in a definition to look it up.</p>`};
