// ===== WORD WARS: GRAMMAR TEST GAMES (the 4 parts of the EF grammar test, Kahoot style) =====
// Part 1 multiple-choice cloze (choose), Part 2 open cloze (choose from the bank or write),
// Part 3 word formation (choose or write), Part 4 key word transformations (write 2-5 words).
if(!AR.cfg.gxm)AR.cfg.gxm={pick:1,type:1};
const GX_PARTS=[[1,"🅰️","Part 1 · Multiple-choice cloze","Choose the word that fits the gap"],[2,"🧺","Part 2 · Open cloze","One word fits the gap: grammar words like which, although, been"],[3,"🔤","Part 3 · Word formation","Change the word in CAPITALS so it fits the gap"],[4,"🔑","Part 4 · Key word transformations","Finish the second sentence with 2-5 words, including the KEY word"]];
const gxNorm=s=>String(s||"").toLowerCase().replace(/[’‘`]/g,"'").replace(/[.,!?;:"“”]+/g," ").replace(/\s+/g," ").trim();
function gxSents(t){return String(t).replace(/\s+/g," ").split(/(?<=[.!?]["”’]?)\s+(?=["“‘(]?[A-Z(])/)}
function gxGapSent(text,n,fill){const ss=gxSents(text);const tag="("+n+")";let s=ss.find(x=>x.includes(tag))||text;
s=s.replace(tag,"_____").replace(/\((\d{1,2})\)/g,(m,k)=>{const v=fill(+k);return v==null?m:v});return s.trim()}
function gxCount(lv,part){const P=lvPack(lv);const d=P&&P.gx&&P.gx[part];if(!d)return 0;return part===4?d.reduce((a,v)=>a+v.length,0):d.reduce((a,v)=>a+(part===1?v.q.length:part===2?v.a.length:v.w.length),0)}
function gxForms(base,ans){const B=base.trim().toUpperCase();const out=new Set();
(typeof WF!=="undefined"?WF:[]).filter(f=>f.base.trim().toUpperCase()===B).forEach(f=>[f.n,f.v,f.a,f.adv,f.neg].join(",").split(/[,\/;]/).map(x=>x.replace(/\(.*?\)/g,"").trim().toLowerCase()).forEach(x=>{if(x&&x.length>1)out.add(x)}));
const a=ans.toLowerCase(),b=B.toLowerCase();const known=w=>out.has(w)||VOCAB.some(v=>v.w.toLowerCase()===w)||(DICTDATA&&(DICTDATA.e[w]||DICTDATA.f[w]));
const guess=[b,a.replace(/ly$/,""),a+"ly",a.replace(/^(un|in|im|il|ir|dis|mis)/,""),"un"+a,a.replace(/s$/,""),a+"s",a.replace(/(ness|ment|ity|ion|ance|ence|er|or|ist)$/,""),b+"ed",b+"ing",b+"al",b+"ful",b+"ous",b+"ly",b+"ness",b+"ment",b+"ion",b.replace(/e$/,"")+"ing",b.replace(/e$/,"")+"ion"];
guess.forEach(g=>{if(g&&g.length>2&&g!==a&&known(g))out.add(g)});out.delete(a);out.delete(b===a?"":"__");return [...out].filter(x=>x!==a)}
function gxQs(lv,part){const P=lvPack(lv);const d=P&&P.gx&&P.gx[part];if(!d)return [];const out=[];const pick=AR.cfg.gxm.pick,type=AR.cfg.gxm.type;const meta=GX_PARTS[part-1];
const H=(mode)=>`📝 ${lv} Grammar test · ${meta[2]}${mode?" · "+mode:""}`;
if(part===1)d.forEach(v=>v.q.forEach((it,i)=>{const p=gxGapSent(v.text,i+1,k=>v.q[k-1]&&v.q[k-1][0]);const o=it.slice(0,4);const idx=shuffle([0,1,2,3]);
out.push({t:"gx1",kind:"mc",p,o:idx.map(j=>o[j]),c:idx.indexOf(0),why:it[4]||"",h:H("Choose the word that fits"),gx:1,lv}) }));
if(part===2)d.forEach(v=>{const answers=v.a.map(a=>String(a[0]).split("/")[0].trim().toLowerCase());const spare=v.bank.filter(b=>!answers.includes(String(b).toLowerCase()));
v.a.forEach((it,i)=>{const p=gxGapSent(v.text,i+11,k=>v.a[k-11]&&String(v.a[k-11][0]).split("/")[0]);const acc=String(it[0]).split("/").map(gxNorm).filter(Boolean);
const wr=shuffle(spare.slice()).concat(shuffle(answers.filter(a=>!acc.includes(a)))).filter((x,j,a)=>a.indexOf(x)===j&&!acc.includes(gxNorm(x))).slice(0,3);
const mc=pick&&wr.length===3&&(!type||Math.random()<.5);
if(mc){const o=[acc[0],...wr];const idx=shuffle([0,1,2,3]);out.push({t:"gx2",kind:"mc",p,o:idx.map(j=>o[j]),c:idx.indexOf(0),why:it[1]||"",h:H("Which word fits?"),gx:2,lv})}
else out.push({t:"gxw",kind:"word",p,w:acc[0],acc,o:[],c:-1,why:it[1]||"",h:H("Write ONE word"),pos:"one word",dur:Math.max(AR.cfg.dur,25),gx:2,lv})})});
if(part===3)d.forEach(v=>v.w.forEach((it,i)=>{const [base,ans]=it;const acc=String(ans).split(/[\/,]/).map(gxNorm).filter(Boolean);
const p=gxGapSent(v.text,i+21,k=>v.w[k-21]&&String(v.w[k-21][1]).split(/[\/,]/)[0]).replace("_____",`_____ (${String(base).trim().toUpperCase()})`);
const forms=shuffle(gxForms(base,acc[0]).filter(f=>!acc.includes(f))).slice(0,3);const why=`${String(base).trim().toUpperCase()} becomes "${acc[0]}" in this sentence. Read the words around the gap: do you need a noun, verb, adjective or adverb? Is the meaning positive or negative?`;
const mc=pick&&forms.length===3&&(!type||Math.random()<.5);
if(mc){const o=[acc[0],...forms];const idx=shuffle([0,1,2,3]);out.push({t:"gx3",kind:"mc",p,o:idx.map(j=>o[j]),c:idx.indexOf(0),why,h:H("Choose the right form"),gx:3,lv})}
else out.push({t:"gxw",kind:"word",p,w:acc[0],acc,o:[],c:-1,why,h:H("Write the right form"),pos:"one word",dur:Math.max(AR.cfg.dur,30),gx:3,lv})}));
if(part===4)d.forEach(v=>v.forEach(it=>{const [orig,key,sent,acc,why]=it;const A=(acc||[]).map(gxNorm).filter(Boolean);if(!A.length)return;
out.push({t:"gxw",kind:"word",p:sent.replace(/_{3,}/,"_____"),pre:`${orig}`,key:String(key).toUpperCase(),w:acc[0],acc:A,o:[],c:-1,why:why||"",h:H(`Use the word ${String(key).toUpperCase()}`),pos:"2-5 words",dur:Math.max(AR.cfg.dur,60),gx:4,lv})}));
out.forEach(q=>{q.em=arKw(q.p)||meta[1]});return out}
function arBuildGx(tops,n){const groups=[];tops.forEach(t=>(t.parts||[1,2,3,4]).forEach(p=>{const qs=shuffle(gxQs(t.lv,p));if(qs.length)groups.push(qs)}));
const out=[],seen=new Set();let g=0,guard=0;while(out.length<n&&groups.some(x=>x.length)&&guard++<5000){const G=groups[g%groups.length];if(G.length){const q=G.shift();const k=q.lv+"|"+q.gx+"|"+q.p;if(!seen.has(k)){seen.add(k);out.push(q)}}g++}return out}
// topics in the library
const _arTopicsGx=arTopics;arTopics=function(all){const L=_arTopicsGx(all);const lvs=all?LEVELS:LEVELS.filter(l=>S.levels.includes(l));
lvs.forEach(lv=>{const P=lvPack(lv);if(!P||!P.gx||!P.gx[1])return;const tot=[1,2,3,4].reduce((a,p)=>a+gxCount(lv,p),0);
L.push({k:`x:${lv}:all`,kind:"gx",em:"📝",name:`Full grammar test ${lv}`,sub:`Grammar test · ${lv} · all 4 parts`,meta:`4 parts · ${tot} questions`,lv,parts:[1,2,3,4],lvs:[lv],q:"grammar test exam mock cloze word formation transformations key word"});
GX_PARTS.forEach(([p,em,name,how])=>L.push({k:`x:${lv}:${p}`,kind:"gx",em,name,sub:`Grammar test · ${lv} · ${how}`,meta:`${gxCount(lv,p)} questions`,lv,parts:[p],lvs:[lv],q:"grammar test exam "+name+" "+how}))});
return L};
const _arTopicLibGx=arTopicLibHTML;arTopicLibHTML=function(){let h=_arTopicLibGx();const T=arTopics(true);const actK=arTopics().map(t=>t.k);const c=T.filter(x=>actK.includes(x.k)&&x.kind==="gx").length;
h=h.replace(/data-sec="gx">[^<]*</,'data-sec="gx">📝 Grammar test (exam practice)<');
h=h.replace('<button class="chip" data-arltab="voc"',`<button class="chip" data-arltab="gx" aria-pressed="${AR.cfg.ltab==="gx"}">📝 Grammar test <span class="tcnt">${c}</span></button><button class="chip" data-arltab="voc"`);
return h.replace("Mixing grammar and vocabulary is allowed.","Mixing grammar, grammar test and vocabulary is allowed. The 📝 Grammar test cards use the 4 parts of the EF exam.")};
arTypesHTML=function(){const sel=arPicked();const v=sel.some(t=>t.kind==="voc"),g=sel.some(t=>t.kind==="gram"||t.kind==="pack"),x=sel.some(t=>t.kind==="gx");
if(AR.cfg.game==="hang")return `<div class="lbl">Words</div><p class="muted">The hangman words come from the vocabulary topics you chose${v?"":" (none chosen: all units of your levels)"}.</p>`;
if(!sel.length)return `<div class="lbl">Question types</div><p class="muted">Choose a topic above and the question types appear here.</p>`;
const parts=[...new Set(sel.filter(t=>t.kind==="gx").flatMap(t=>t.parts))].sort();
return `${v?`<div class="lbl">Vocabulary question types</div><div class="chips">${AR_TYPES.map(([k,l])=>`<button class="chip" data-art="${k}" aria-pressed="${!!AR.cfg.types[k]}">${l}</button>`).join("")}</div>`:""}
${g?`<div class="lbl" style="margin-top:${v?14:0}px">Grammar question types</div><div class="chips"><button class="chip" data-argq="gmc" aria-pressed="${!!AR.cfg.gtypes.gmc}">🧩 Choose the right form</button><button class="chip" data-argq="gtf" aria-pressed="${!!AR.cfg.gtypes.gtf}">✅ Correct or incorrect?</button></div>`:""}
${x?`<div class="lbl" style="margin-top:${v||g?14:0}px">Grammar test: how players answer</div><div class="chips"><button class="chip" data-argx="pick" aria-pressed="${!!AR.cfg.gxm.pick}">👆 Choose from 4 options</button><button class="chip" data-argx="type" aria-pressed="${!!AR.cfg.gxm.type}">✍️ Write the answer</button></div>
<p class="muted" style="margin:8px 0 0">${parts.map(p=>`<b>${GX_PARTS[p-1][1]} Part ${p}</b>: ${p===1?"always 4 options":p===4?"always written (2-5 words)":AR.cfg.gxm.pick&&AR.cfg.gxm.type?"a mix of options and writing":AR.cfg.gxm.type?"written":"4 options"}`).join(" · ")}. Written answers get more time.</p>`:""}`};
const _arTopicBindGx=arTopicBind;arTopicBind=function(w){_arTopicBindGx(w);w.querySelectorAll("[data-argx]").forEach(b=>b.onclick=()=>{const k=b.dataset.argx;AR.cfg.gxm[k]=AR.cfg.gxm[k]?0:1;if(!AR.cfg.gxm.pick&&!AR.cfg.gxm.type)AR.cfg.gxm[k]=1;arHost()})};
const _arBuildMixedGx=arBuildMixed;arBuildMixed=function(){const T=arPicked();const gx=T.filter(t=>t.kind==="gx");if(!gx.length)return _arBuildMixedGx();
const rest=T.filter(t=>t.kind!=="gx");const N=AR.cfg.n;const keep=AR.cfg.pick.slice();let a=[];
if(rest.length){const nR=Math.round(N*rest.length/T.length);AR.cfg.pick=rest.map(t=>t.k);AR.cfg.n=nR;try{a=nR?_arBuildMixedGx():[]}finally{AR.cfg.pick=keep;AR.cfg.n=N}}
const b=arBuildGx(gx,N-a.length);let out=a.concat(b);if(out.length<N&&rest.length){AR.cfg.pick=rest.map(t=>t.k);try{out=out.concat(_arBuildMixedGx().slice(0,N-out.length))}finally{AR.cfg.pick=keep}}
return shuffle(out).slice(0,N)};
// the state sent to phones carries the accepted answers and the first sentence (Part 4)
const _arSendGx=arSend;arSend=function(st){try{if(st&&st.q&&AR.role==="host"){const q=AR.qs[AR.qi];if(q&&q.gx){st.q.gx=q.gx;if(q.acc)st.q.acc=q.acc;if(q.pre)st.q.pre=q.pre;if(q.key)st.q.key=q.key}}}catch(e){}return _arSendGx(st)};
function gxPreHTML(q,big){if(!q||!q.pre)return "";return `<div class="gxpre${big?" big":""}"><span>${arEsc(q.pre)}</span><b class="gxkey">${arEsc(q.key||"")}</b></div>`}
(function(){const st=document.createElement("style");st.textContent=`
#arena .gxpre{display:grid;gap:8px;justify-items:center;margin-bottom:10px;font:600 .95em/1.35 var(--body);opacity:.95}
#arena .gxpre span{background:rgba(27,20,70,.08);border-radius:12px;padding:6px 12px}
#arena .gxkey{display:inline-block;background:#1B1446;color:#FFD84D;border-radius:10px;padding:4px 14px;letter-spacing:.12em;font:900 1.05em var(--display)}
#arena .gxhow{font:800 .78rem var(--body);letter-spacing:.06em;text-transform:uppercase;color:#6B5BD6;margin-bottom:6px}
#arena .gxin{width:100%;box-sizing:border-box;border:3px solid #fff;border-radius:14px;padding:14px;font:700 1.2rem var(--body);text-align:center}
#arena .gxin:focus{outline:none;border-color:var(--aracc)}
#arena .gxhint{text-align:center;font:700 .95rem var(--body);opacity:.9}
#arena .gxhint b{color:var(--aracc);letter-spacing:.05em}
#arena .qcard .gxhow{color:#6B5BD6}
`;document.head.appendChild(st)})();
// big screen: show the instructions and the first sentence, hide the letter slots for written answers
const _arQuestionGx=arQuestion;arQuestion=function(){_arQuestionGx();const q=AR.qs[AR.qi];if(!q||!q.gx||!AR.el)return;const card=AR.el.querySelector(".qcard");
if(card){if(q.kind==="word"){const sm=card.querySelector("small");if(sm)sm.remove()}card.insertAdjacentHTML("afterbegin",`<div class="gxhow">${arEsc(GX_PARTS[q.gx-1][3])}</div>${gxPreHTML(q,1)}`)}
if(q.kind==="word"){const sl=AR.el.querySelector(".slots");if(sl)sl.outerHTML=`<p class="gxhint" style="text-align:center">✍️ Players write ${q.gx===4?"2-5 words on their phones (the KEY word must be used)":"one word on their phones"}</p>`}};
const _arRevealGx=arReveal;arReveal=function(){const q=AR.qs[AR.qi];const ph=AR.ph;_arRevealGx();if(ph!=="q"||!q||!q.gx||!AR.el)return;const card=AR.el.querySelector(".qcard");
if(card&&q.kind==="word"){card.innerHTML=`${gxPreHTML(q,1)}${arHiSent(q.p,q.w)}`;const bw=AR.el.querySelector(".bigword");if(bw&&q.gx===4)bw.style.fontSize="clamp(1.6rem,4vw,2.8rem)"}
else if(card&&q.pre)card.insertAdjacentHTML("afterbegin",gxPreHTML(q,1));
if(q.kind==="word"&&q.acc&&q.acc.length>1){const why=AR.el.querySelector(".whyc .rule");const alt=`Also accepted: ${q.acc.slice(1).join(" / ")}.`;if(why)why.insertAdjacentText("beforeend"," "+alt);else if(card)card.insertAdjacentHTML("afterend",`<div class="whyc ok"><div class="rule">${arEsc(alt)}</div></div>`)}};
// phones
function arGxPlay(st,head){const q=st.q;const dur=st.dur*1000;
if(AR.wq!==st.qi){AR.wq=st.qi;AR.wg={tries:0,done:0,hintN:1,typed:""}}const G=AR.wg;
if(G.done){arPaint(`${head}<div class="phone"><div class="full ${G.done===1?"ok":"ko"}"><div class="big" style="font-size:2rem">${G.done===1?"Correct! ⚡":"Out of tries"}</div><p class="muted" style="color:#fff">Waiting for the others… the answer comes on the big screen.</p><div class="spin"></div></div></div>`);return}
const acc=(q.acc||[q.w]).map(gxNorm);const words=String(q.w).split(/\s+/);
const send=ok=>{if(G.done)return;G.done=ok?1:2;const ms=Math.round(performance.now()-AR.myT0);arPsend({t:"a",qi:st.qi,ok:ok?1:0,ms,miss:G.tries,pu:AR.armed});arVib(ok?[30,30,30]:200);arPlayerRender()};
const v=arMyInv();const hintUsed=(AR.hide&&AR.hide.qi===st.qi)||G.hintN>1;
const pus=arInvN(v)?`<div class="pus">${Object.entries(AR_PU).map(([k,p])=>`<button class="pu" data-pu="${k}" aria-pressed="${AR.armed===k||(k==="fifty"&&hintUsed)}" ${v[k]>0&&!(k==="fifty"&&hintUsed)?"":"disabled"}>${p[0]} ${k==="fifty"?"Hint":p[1]}${v[k]>1?" ×"+v[k]:""}</button>`).join("")}</div>`:"";
const hint=G.hintN>1?(q.gx===4?`Starts with: <b>${arEsc(words[0])} …</b>`:`Starts with: <b>${arEsc(String(q.w).slice(0,2))}…</b>`):(q.gx===4?`Write 2-5 words. Use <b>${arEsc(q.key||"")}</b> and don't change it.`:"Write one word.");
const w=arPaint(`${head}<div class="phone" style="display:grid;gap:12px"><div class="tbar"><i id="arpt"></i></div><div class="apanel" style="padding:12px;text-align:center;font:700 1.05rem var(--display)"><div class="gxhow">${arEsc(GX_PARTS[q.gx-1][2])}</div>${gxPreHTML(q)}${arEsc(q.p)}</div>${pus}
<p class="gxhint">${hint}</p><input class="gxin" id="gxin" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${q.gx===4?"Write the missing words":"Write the word"}" value="${arEsc(G.typed)}"><button class="abtn go" id="gxok">Send ✓</button>${G.tries?`<p class="gxhint">Not quite (${G.tries}×). ${G.tries>=2?"Last try!":"Check it and try again."}</p>`:""}</div>`);
AR.ptmr=setInterval(()=>{const left=dur-(performance.now()-AR.myT0);const b=AR.el&&AR.el.querySelector("#arpt");if(b)b.style.width=Math.max(0,left/dur*100)+"%";if(left<=0){clearInterval(AR.ptmr);w.querySelectorAll("button,input").forEach(x=>{if(!x.closest(".artop"))x.disabled=true})}},150);
const late=()=>performance.now()-AR.myT0>dur;
w.querySelectorAll("[data-pu]").forEach(b=>b.onclick=()=>{const k=b.dataset.pu;arVib(15);if(k==="fifty"){b.disabled=true;G.hintN=3;arPsend({t:"pu",k:"fifty",qi:st.qi});arPlayerRender();return}AR.armed=AR.armed===k?null:k;w.querySelectorAll("[data-pu]").forEach(x=>{if(x.dataset.pu!=="fifty")x.setAttribute("aria-pressed",AR.armed===x.dataset.pu)})});
const inp=w.querySelector("#gxin");inp.oninput=()=>{G.typed=inp.value;arPsend({t:"prog",qi:st.qi,rev:Math.min(String(q.w).length,inp.value.length),len:String(q.w).length,miss:G.tries})};
const chk=()=>{if(late())return;const val=gxNorm(inp.value);if(!val)return;if(acc.includes(val))return send(true);G.tries++;arVib(150);if(G.tries>=3)return send(false);G.typed=inp.value;arPlayerRender()};
w.querySelector("#gxok").onclick=chk;inp.onkeydown=e=>{if(e.key==="Enter")chk()};setTimeout(()=>{try{inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length)}catch(e){}},50)}
const _arWordPlayGx=arWordPlay;arWordPlay=function(st,head){if(st.q&&st.q.t==="gxw")return arGxPlay(st,head);return _arWordPlayGx(st,head)};
const _arWordHintGx=arWordHint;arWordHint=function(){const q=AR.st&&AR.st.q;if(q&&q.t==="gxw"){if(AR.wg)AR.wg.hintN=3;return}return _arWordHintGx()};
// multiple-choice grammar test questions on phones: show what to do
const _arPlayerRenderGx=arPlayerRender;arPlayerRender=function(){_arPlayerRenderGx();try{const st=AR.st;if(!st||st.ph!=="q"||!st.q||!st.q.gx||st.q.kind!=="mc"||AR.myAns!==null||!AR.el)return;const pn=AR.el.querySelector(".phone .apanel");if(pn&&!pn.querySelector(".gxhow"))pn.insertAdjacentHTML("afterbegin",`<div class="gxhow">${arEsc(GX_PARTS[st.q.gx-1][2])} · ${arEsc(GX_PARTS[st.q.gx-1][3])}</div>`)}catch(e){}};

// ===== DICTIONARY TAB: look up any English word (online) =====
const DX={q:"",res:null,busy:false,err:"",hist:[],saved:[]};
try{const d=JSON.parse(localStorage.getItem("dx-hist")||"null");if(d){DX.hist=d.h||[];DX.saved=d.s||[]}}catch(e){}
function dxSave(){try{localStorage.setItem("dx-hist",JSON.stringify({h:DX.hist.slice(0,20),s:DX.saved.slice(0,200)}))}catch(e){}}
ICON.dict='<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/><path d="M8 10.5h5M10.5 8v5"/>';TABIC.dict="dict";
TABS.splice(TABS.findIndex(t=>t[0]==="sounds")+1,0,["dict","Word search"]);
(function(){const st=document.createElement("style");st.textContent=`
.dxwrap{min-width:0;max-width:100%;box-sizing:border-box}
.dxwrap *{min-width:0}
.dxbar{box-sizing:border-box;width:100%;max-width:100%;display:flex;gap:8px;align-items:center;border:2px solid var(--line);border-radius:16px;padding:6px 6px 6px 14px;background:#fff;position:relative}
.dxbar:focus-within{border-color:var(--accent,#6B5BD6)}
.dxbar .btn{flex:none}
.dxbar input{flex:1;width:100%;min-width:0;border:0;outline:0;font:600 1.15rem var(--body);padding:8px 0;background:none;color:var(--ink)}
.dxsug{position:absolute;left:0;right:0;top:calc(100% + 4px);background:#fff;border:2px solid var(--line);border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.12);z-index:20;overflow:hidden}
.dxsug button{display:flex;gap:8px;width:100%;border:0;background:none;text-align:left;padding:10px 14px;font:600 1rem var(--body);cursor:pointer;color:var(--ink)}
.dxsug button:hover,.dxsug button.on{background:#F1F0FB}.dxsug small{color:var(--muted,#667);margin-left:auto}
.dxhead{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px 14px}
.dxhead h2{margin:0;font-size:2rem}
.dxph{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.dxph .ipa{font-size:1.05rem}
.dxsense{display:grid;gap:4px;padding:10px 0;border-top:1px solid var(--line)}
.dxsense:first-of-type{border-top:0}
.dxsense .n{font:800 .8rem var(--body);color:var(--muted,#667)}
.dxsense .d{font-size:1.05rem}
.dxsense .ex{font-style:italic;color:#3B3466}
.dxpos{display:inline-block;font:800 .78rem var(--body);letter-spacing:.06em;text-transform:uppercase;background:#EEF2FF;color:#3730A3;border-radius:999px;padding:3px 10px}
.dxchips{display:flex;flex-wrap:wrap;gap:6px}
.dxchips button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:4px 10px;font:600 .9rem var(--body);cursor:pointer;color:var(--ink)}
.dxbook{border-left:6px solid var(--uc,#6B5BD6)}
.dxcam{display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:linear-gradient(135deg,#0E3B6E,#1D5FA8);color:#fff;border-radius:18px;padding:14px 16px}
.dxcam p{margin:0;flex:1;min-width:200px;color:rgba(255,255,255,.9)}
.dxcam a{background:#FFD84D;color:#1B1446;border-radius:12px;padding:10px 16px;font:800 1rem var(--display);text-decoration:none;white-space:nowrap}
.dxsrc{font-size:.82rem;color:var(--muted,#667)}
.dxlist{display:flex;flex-wrap:wrap;gap:8px}
.dxlist button{border:2px solid var(--line);background:#fff;border-radius:12px;padding:6px 12px;font:700 .95rem var(--body);cursor:pointer;color:var(--ink)}
.dxlist button small{color:var(--muted,#667);font-weight:600}
`;document.head.appendChild(st)})();
function dxCam(w){return "https://dictionary.cambridge.org/dictionary/english/"+encodeURIComponent(String(w).trim().toLowerCase().replace(/\s+/g,"-"))}
function dxBook(word){const lw=word.toLowerCase().trim();return VOCAB.filter(v=>v.w.toLowerCase().replace(/\s*\(.*?\)/g,"").trim()===lw)}
async function dxLookup(word){word=String(word||"").trim().replace(/\s+/g," ");if(!word)return;DX.q=word;DX.busy=true;DX.err="";DX.res={w:word,book:dxBook(word),online:null,off:null};render();
const lw=word.toLowerCase();DX.hist=[lw,...DX.hist.filter(x=>x!==lw)].slice(0,20);dxSave();
let online=null;try{const ctl=new AbortController();const to=setTimeout(()=>ctl.abort(),8000);const r=await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+encodeURIComponent(lw),{signal:ctl.signal});clearTimeout(to);
if(r.ok)online=await r.json();else if(r.status===404)online=[]}catch(e){online=null}
let off=null;if(!online||!online.length){try{const d=await dictData();const own=d.e[lw],bw=d.f[lw];off={own,base:bw&&d.e[bw],bw,ipa:(own&&own.i)||d.p[lw]||""}}catch(e){}}
if(DX.q!==word)return;DX.res.online=online;DX.res.off=off;DX.busy=false;if(online===null&&!(off&&(off.own||off.base))&&!DX.res.book.length)DX.err=navigator.onLine===false?"You are offline. Connect to the internet to search new words (words from the lab still work).":"The online dictionary did not answer. Try again in a moment, or open the word in Cambridge.";
render()}
function dxAudio(online){const out=[];(online||[]).forEach(e=>(e.phonetics||[]).forEach(p=>{if(p.audio&&!out.some(x=>x.src===p.audio)){const acc=/-uk\.mp3|-gb\.mp3/i.test(p.audio)?"UK":/-us\.mp3/i.test(p.audio)?"US":/-au\.mp3/i.test(p.audio)?"AU":"";out.push({src:p.audio,acc,ipa:p.text||""})}}));return out.sort((a,b)=>"UKUSAU".indexOf(a.acc||"Z")-"UKUSAU".indexOf(b.acc||"Z"))}
function dxIpa(online){const s=[];(online||[]).forEach(e=>{if(e.phonetic&&!s.includes(e.phonetic))s.push(e.phonetic);(e.phonetics||[]).forEach(p=>{if(p.text&&!s.includes(p.text))s.push(p.text)})});return s.slice(0,2)}
function dxOnlineHTML(online){const bypos={};(online||[]).forEach(e=>(e.meanings||[]).forEach(m=>{const k=m.partOfSpeech||"";(bypos[k]=bypos[k]||{defs:[],syn:new Set(),ant:new Set()});m.definitions.forEach(d=>{bypos[k].defs.push(d);(d.synonyms||[]).forEach(x=>bypos[k].syn.add(x));(d.antonyms||[]).forEach(x=>bypos[k].ant.add(x))});(m.synonyms||[]).forEach(x=>bypos[k].syn.add(x));(m.antonyms||[]).forEach(x=>bypos[k].ant.add(x))}));
const ks=Object.keys(bypos);if(!ks.length)return "";
return ks.map(k=>{const b=bypos[k];const defs=b.defs.slice().sort((x,y)=>(y.example?1:0)-(x.example?1:0)).slice(0,5);const keep=b.defs.slice(0,5);const show=keep.length?keep:defs;
return `<section class="card" style="display:grid;gap:6px"><div><span class="dxpos">${esc(k)}</span></div>${show.map((d,i)=>`<div class="dxsense"><span class="n">${i+1}</span><div class="d">${esc(d.definition)}</div>${d.example?`<div class="ex">${esc(d.example)}</div>`:""}</div>`).join("")}
${b.syn.size?`<div class="sub" style="margin-top:6px">Similar words</div><div class="dxchips">${[...b.syn].slice(0,10).map(x=>`<button data-dxq="${esc(x)}">${esc(x)}</button>`).join("")}</div>`:""}
${b.ant.size?`<div class="sub" style="margin-top:6px">Opposites</div><div class="dxchips">${[...b.ant].slice(0,8).map(x=>`<button data-dxq="${esc(x)}">${esc(x)}</button>`).join("")}</div>`:""}</section>`}).join("")}
function dxOffHTML(off){if(!off||(!off.own&&!off.base))return "";const sen=e=>e.s.slice(0,4).map((s,i)=>`<div class="dxsense"><span class="n">${s[0]?`<span class="dxpos">${esc(s[0])}</span>`:i+1}</span><div class="d">${esc(s[1])}</div>${s[2]?`<div class="ex">${esc(s[2])}</div>`:""}</div>`).join("");
return `<section class="card" style="display:grid;gap:6px">${off.ipa?`<div><span class="ipa">/${esc(off.ipa)}/</span></div>`:""}${off.own?sen(off.own):""}${off.base?`<div class="sub">Form of <b>${esc(off.bw)}</b></div>${sen(off.base)}`:""}<p class="dxsrc">Saved dictionary (works without internet).</p></section>`}
function dxDefFor(r){const o=r.online&&r.online[0]&&r.online[0].meanings&&r.online[0].meanings[0];if(o&&o.definitions[0])return {pos:o.partOfSpeech,def:o.definitions[0].definition,ex:o.definitions[0].example||""};
if(r.book.length)return {pos:r.book[0].pos,def:r.book[0].def,ex:r.book[0].ex};const off=r.off&&(r.off.own||r.off.base);if(off&&off.s[0])return {pos:off.s[0][0],def:off.s[0][1],ex:off.s[0][2]||""};return null}
function viewDict(m){const r=DX.res;const au=r&&r.online?dxAudio(r.online):[];const ipas=r&&r.online?dxIpa(r.online):[];const saved=r&&DX.saved.some(x=>x.w===r.w.toLowerCase());
m.innerHTML=`<section class="card dxwrap" style="display:grid;gap:12px"><span class="label">Word search</span><h1 style="margin:0">Look up a new word</h1><p class="sub" style="margin:0">Search any English word or phrase: meaning, examples, pronunciation with real voices, similar words and opposites. Words from your book appear first. Needs internet for new words.</p>
<form class="dxbar" id="dxf" autocomplete="off"><span>🔎</span><input id="dxq" type="search" enterkeyhint="search" placeholder="Type a word: baffle, take up with, resilient…" value="${esc(DX.q)}" aria-label="Word to look up"><button class="btn primary" type="submit">Search</button><div class="dxsug" id="dxsug" hidden></div></form>
${DX.hist.length&&!r?`<div><div class="sub" style="margin-bottom:6px">Recent searches</div><div class="dxlist">${DX.hist.slice(0,12).map(x=>`<button data-dxq="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>`:""}</section>
${r?`<section class="card" style="display:grid;gap:10px"><div class="dxhead"><h2>${esc(r.w)}</h2><div class="dxph">${(ipas.length?ipas:r.book[0]?["/"+r.book[0].uk+"/"]:r.off&&r.off.ipa?["/"+r.off.ipa+"/"]:[]).map(x=>`<span class="ipa">${esc(x)}</span>`).join(" ")}
${au.map((a,i)=>`<button class="icon say" data-dxau="${i}">▶ ${a.acc||"Listen"}</button>`).join("")}${!au.length&&r.book[0]&&typeof hasAud==="function"&&hasAud(r.book[0].w)?sayBtns(r.book[0].w):""}</div></div>
<div class="actions"><button class="btn" id="dxsave" ${saved?"disabled":""}>${saved?"Saved in My words ✓":"⭐ Save to My words"}</button><button class="btn" id="dxpr">🧠 Practise later</button></div></section>
${r.book.length?r.book.map(v=>{const u=UNITS.find(x=>x.n===v.unit)||{};return `<section class="card dxbook uu${v.unit}" style="display:grid;gap:6px"><span class="label">In your book · ${esc(uLabel(v.unit))}</span><div><span class="dxpos">${esc(v.pos)}</span> <span class="ipa">/${esc(v.uk)}/</span>${v.us&&v.us!==v.uk?` <span class="sub">US</span> <span class="ipa">/${esc(v.us)}/</span>`:""}</div><div class="d" style="font-size:1.05rem">${esc(v.def)}</div>${v.ex?`<div class="ex" style="font-style:italic">${esc(v.ex)}</div>`:""}</section>`}).join(""):""}
${DX.busy?`<section class="card"><p class="sub" style="margin:0">Looking it up…</p></section>`:r.online&&r.online.length?dxOnlineHTML(r.online)+`<p class="dxsrc">Definitions and recordings: Free Dictionary API (Wiktionary, CC BY-SA).</p>`:dxOffHTML(r.off)||(DX.err?`<section class="card"><p style="margin:0">${esc(DX.err)}</p></section>`:r.online&&!r.online.length&&!r.book.length?`<section class="card"><p style="margin:0">No entry found for <b>${esc(r.w)}</b>. Check the spelling, try the base form (run, not running), or open it in Cambridge.</p></section>`:"")}
<div class="dxcam"><p><b>Cambridge Dictionary</b>: the learner definition, its CEFR level (A1 to C2), British and American audio and more examples.</p><a href="${dxCam(r.w)}" target="_blank" rel="noopener">Open in Cambridge ↗</a></div>`:""}
${DX.saved.length?`<section class="card" style="display:grid;gap:10px"><div class="row" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="label">My words · ${DX.saved.length}</span><button class="btn small" id="dxclr">Clear list</button></div><div class="dxlist">${DX.saved.map(x=>`<button data-dxq="${esc(x.w)}" title="${esc(x.def||"")}">${esc(x.w)} <small>${esc(x.pos||"")}</small></button>`).join("")}</div></section>`:""}`;
const f=$("#dxf",m),inp=$("#dxq",m),sug=$("#dxsug",m);let sel=-1,items=[];
f.onsubmit=e=>{e.preventDefault();sug.hidden=true;dxLookup(inp.value)};
const paint=()=>{sug.innerHTML=items.map((x,i)=>`<button type="button" data-s="${esc(x.w)}" class="${i===sel?"on":""}">${esc(x.w)}<small>${esc(x.tag)}</small></button>`).join("");sug.hidden=!items.length;sug.querySelectorAll("[data-s]").forEach(b=>b.onmousedown=e=>{e.preventDefault();inp.value=b.dataset.s;sug.hidden=true;dxLookup(b.dataset.s)})};
let tq=0;inp.oninput=()=>{const v=inp.value.trim().toLowerCase();sel=-1;if(v.length<2){items=[];paint();return}
const seen=new Set();items=[];VOCAB.forEach(x=>{const w=x.w.toLowerCase();if(w.startsWith(v)&&!seen.has(w)&&items.length<6){seen.add(w);items.push({w:x.w,tag:(UNITS.find(u=>u.n===x.unit)||{}).lv||"lab"})}});
if(DICTDATA)for(const k in DICTDATA.e){if(items.length>=8)break;if(k.startsWith(v)&&!seen.has(k)){seen.add(k);items.push({w:k,tag:""})}}paint();
const my=++tq;clearTimeout(DX.st);DX.st=setTimeout(async()=>{try{const r=await fetch("https://api.datamuse.com/sug?max=8&s="+encodeURIComponent(v));const j=await r.json();if(my!==tq)return;j.forEach(x=>{if(items.length<9&&!seen.has(x.word)){seen.add(x.word);items.push({w:x.word,tag:""})}});paint()}catch(e){}},250)};
inp.onkeydown=e=>{if(sug.hidden)return;if(e.key==="ArrowDown"){sel=Math.min(items.length-1,sel+1);paint();e.preventDefault()}else if(e.key==="ArrowUp"){sel=Math.max(-1,sel-1);paint();e.preventDefault()}else if(e.key==="Enter"&&sel>=0){e.preventDefault();inp.value=items[sel].w;sug.hidden=true;dxLookup(items[sel].w)}else if(e.key==="Escape")sug.hidden=true};
inp.onblur=()=>setTimeout(()=>sug.hidden=true,150);
dictData().catch(()=>{});
$$("[data-dxq]",m).forEach(b=>b.onclick=()=>{inp.value=b.dataset.dxq;dxLookup(b.dataset.dxq);window.scrollTo({top:0,behavior:"smooth"})});
$$("[data-dxau]",m).forEach(b=>b.onclick=()=>{try{const a=new Audio(au[+b.dataset.dxau].src);a.play()}catch(e){}});
if(typeof bindSay==="function")try{bindSay(m)}catch(e){}
const sv=$("#dxsave",m);if(sv)sv.onclick=()=>{const d=dxDefFor(r)||{};DX.saved=[{w:r.w.toLowerCase(),pos:d.pos||"",def:d.def||""},...DX.saved.filter(x=>x.w!==r.w.toLowerCase())];dxSave();render()};
const pr=$("#dxpr",m);if(pr)pr.onclick=()=>{const d=dxDefFor(r);if(r.book[0])myMissWord(r.book[0],"Dictionary");else if(d){const others=shuffle(VOCAB.filter(x=>x.w.toLowerCase()!==r.w.toLowerCase())).slice(0,3).map(x=>x.w);myMiss({p:d.def,o:[r.w,...others],c:0,why:d.ex?`Example: ${d.ex}`:"",h:"Dictionary: which word means this?",key:"dx|"+r.w.toLowerCase()},"Dictionary")}pr.textContent="Added to Review ✓";pr.disabled=true};
const cl=$("#dxclr",m);if(cl)cl.onclick=()=>{if(!confirm("Remove all the words from My words?"))return;DX.saved=[];dxSave();render()};
if(!r)setTimeout(()=>{try{inp.focus({preventScroll:true})}catch(e){}},50)}
const _renderDx=render;render=function(){if(S.tab==="dict"){try{lpStop()}catch(e){}tabs();stats();viewDict($("#main"));return}_renderDx()};
// the tap-a-word pop-up links to the full dictionary
const _dictShowDx=dictShow;dictShow=function(word,x,y){_dictShowDx(word,x,y);const p=document.querySelector("#dictpop");if(!p)return;const a=p.querySelector(".actions")||p;const add=()=>{const box=p.querySelector(".actions")||p;if(box.querySelector(".dxgo"))return;box.insertAdjacentHTML("beforeend",`<button class="btn small dxgo">🔎 Word search</button>`);box.querySelector(".dxgo").onclick=()=>{dictClose();S.tab="dict";save();render();dxLookup(word)}};add();setTimeout(add,400);setTimeout(add,1500)};
