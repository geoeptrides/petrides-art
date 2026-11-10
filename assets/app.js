'use strict';
document.documentElement.classList.add('js');
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const greek = document.documentElement.lang === 'el';
const searchText = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/ς/g,'σ');
const toggle = $('.navtoggle');
if(toggle){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));$('#nav').classList.toggle('open',open);});document.addEventListener('keydown',e=>{if(e.key==='Escape'){toggle.setAttribute('aria-expanded','false');$('#nav').classList.remove('open');}});}
const filterGroups={form:{'Paintings and pictures':['Pictures','Pictures (screen)'],'Nature, views and gardens':['Window view (nature)','Outdoor / green space']},signal:{'Mixed or null findings':['Mixed findings','Includes null findings']}};
const matchesFilter=(el,field)=>{const options=filterGroups[field.name]?.[field.value]||[field.value];const values=(el.dataset[field.name]||'').split('|');return options.some(value=>values.includes(value));};
const panel=$('[data-filter-panel]');
if(panel){
 const list=$('[data-results]');const items=[...list.children];
 const fields=$$('[data-filter]');const count=$('[data-result-count]');const empty=$('[data-empty]');
 const params=new URLSearchParams(location.search);
 const paginated=list.dataset.noun==='records'&&!!$('[data-show-more]');
 let shownLimit=Math.min(items.length,Math.max(12,Number(params.get('shown'))||12));
 const showMore=$('[data-show-more]');const shownCount=$('[data-shown-count]');
 // Preserve links shared under Edition 4.1.
 if(params.get('signal')==='Mixed / null')params.set('signal','Includes null findings');
 if(['Preprint','Conference abstract'].includes(params.get('type'))){params.set('format',params.get('type'));params.delete('type');}
 if(['Review','Policy','Guidance','Programme'].includes(params.get('form')))params.set('form','Several or unspecified');
 if(params.get('type')==='Insufficient methods'){params.set('reporting','Limited methods available');params.delete('type');}
 fields.forEach(f=>{if(!params.has(f.name)&&f.dataset.default&&!location.hash)f.value=f.dataset.default;});
 fields.forEach(f=>{if(params.has(f.name)){const v=params.get(f.name);if(f.tagName!=='SELECT'||[...f.options].some(o=>o.value===v))f.value=v;}});
 function filter(updateURL=false,preserveHash=false,expand=false){
  if(paginated&&updateURL&&!expand)shownLimit=12;
  const state=Object.fromEntries(fields.map(f=>[f.name,f.value]));
  const q=searchText((state.q||'').trim());let visible=0;
  items.forEach(el=>{const match=(!q||searchText(el.textContent+' '+(el.dataset.searchEn||'')+' '+(el.dataset.searchAlt||'')).includes(q))&&fields.every(f=>['q','sort'].includes(f.name)||!f.value||matchesFilter(el,f));el.dataset.filterMatch=String(match);el.hidden=!match;if(match)visible++;});
  const kindRank={'Register source':0,'Audit verification':1,'Original bibliography':2};const rank=el=>list.dataset.noun==='installations'?(el.querySelector('.workphoto')?(el.dataset.scope==='Founder practice'?1:0):2):(list.dataset.noun==='source links'?(kindRank[el.dataset.kind]??3):0);
  const sorted=[...items].sort((a,b)=>state.sort==='year'?(Number(b.dataset.year||0)-Number(a.dataset.year||0))||a.id.localeCompare(b.id):(rank(a)-rank(b))||a.id.localeCompare(b.id,undefined,{numeric:true}));
  sorted.forEach(el=>list.append(el));
  if(paginated){const matches=sorted.filter(el=>el.dataset.filterMatch==='true');matches.forEach((el,i)=>el.hidden=i>=shownLimit);showMore.hidden=shownLimit>=matches.length;shownCount.textContent=greek?`Εμφανίζονται ${Math.min(shownLimit,matches.length)} από ${matches.length} εγγραφές`:`Showing ${Math.min(shownLimit,matches.length)} of ${matches.length} records`;}
  const noun=list.dataset.noun||'records';count.textContent=greek?`${visible} από ${items.length} ${{records:'εγγραφές',installations:'έργα',cases:'παραδείγματα',sources:'πηγές','source links':'σύνδεσμοι πηγών'}[noun]||'εγγραφές'}`:`${visible} of ${items.length} ${noun}`;empty.hidden=visible!==0;
  if(updateURL){const p=new URLSearchParams();if(new URLSearchParams(location.search).get('view')==='compact')p.set('view','compact');fields.forEach(f=>{if(f.value)p.set(f.name,f.value);});if(paginated&&shownLimit>12)p.set('shown',String(shownLimit));history.replaceState(null,'',location.pathname+(p.size?'?'+p.toString():'')+(preserveHash?location.hash:''));}
 }
 fields.forEach(f=>f.addEventListener(f.type==='search'?'input':'change',()=>filter(true)));
 $('[data-reset]')?.addEventListener('click',()=>{fields.forEach(f=>f.value='');filter(true);});
 function revealHash(){if(!location.hash)return;let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}if(!target)return;const record=target.closest('.record,.work,.case,.source-item');if(record){if(record.hidden){if(paginated&&record.dataset.filterMatch==='true'){shownLimit=items.length;filter(true,true,true);}else{fields.forEach(f=>f.value='');shownLimit=paginated?items.length:12;filter(true,true,true);}}const details=record.querySelector('details');if(details)details.open=true;requestAnimationFrame(()=>target.scrollIntoView());}}
 const more=$('[data-more-filters]');if(more&&[...more.querySelectorAll('[data-filter]')].some(f=>f.value))more.open=true;
 if(showMore)showMore.addEventListener('click',()=>{const before=[...list.children].filter(el=>!el.hidden).length;shownLimit+=12;filter(true,false,true);const next=[...list.children].filter(el=>!el.hidden)[before];if(next){next.setAttribute('tabindex','-1');next.focus({preventScroll:true});}});
 filter();revealHash();window.addEventListener('hashchange',revealHash);
 window.addEventListener('beforeprint',()=>{if(paginated)items.forEach(el=>el.hidden=el.dataset.filterMatch!=='true');});window.addEventListener('afterprint',()=>filter());
}
$$('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
// Compact view: every record keeps an "Expand record" control, and the title activates the same control.
const recLabels=greek?{expand:'Ανάπτυξη εγγραφής',collapse:'Σύμπτυξη εγγραφής'}:{expand:'Expand record',collapse:'Collapse record'};
function setRecord(rec,open){rec.classList.toggle('open',open);rec.querySelectorAll('[data-rec-toggle]').forEach(b=>{b.setAttribute('aria-expanded',String(open));if(b.classList.contains('rec-expand'))b.textContent=open?recLabels.collapse:recLabels.expand;});}
function enterCompact(list){list.querySelectorAll('.record').forEach(rec=>{const h=rec.querySelector('h2');if(!h||rec.querySelector('.rec-expand'))return;const bodyId=rec.id+'-body';let body=rec.querySelector('.rec-body');if(!body){body=document.createElement('div');body.className='rec-body';body.id=bodyId;[...rec.querySelectorAll(':scope > .finding, :scope > .limit, :scope > .record-source, :scope > details, :scope > .pico-block')].forEach(el=>body.append(el));rec.append(body);}
 const tb=document.createElement('button');tb.type='button';tb.className='rec-title';tb.dataset.recToggle='';tb.setAttribute('aria-controls',body.id);tb.setAttribute('aria-expanded','false');tb.textContent=h.textContent.trim();h.dataset.plain=h.textContent;h.textContent='';h.append(tb);
 const eb=document.createElement('button');eb.type='button';eb.className='rec-expand btn secondary';eb.dataset.recToggle='';eb.setAttribute('aria-controls',body.id);eb.setAttribute('aria-expanded','false');eb.textContent=recLabels.expand;h.after(eb);
 [tb,eb].forEach(b=>b.addEventListener('click',()=>{const open=!rec.classList.contains('open');setRecord(rec,open);if(open){const d=rec.querySelector('details');if(d)d.open=true;}}));setRecord(rec,false);});}
function leaveCompact(list){list.querySelectorAll('.record').forEach(rec=>{const h=rec.querySelector('h2');const tb=h&&h.querySelector('.rec-title');if(tb){h.textContent=h.dataset.plain||tb.textContent;}rec.querySelector('.rec-expand')?.remove();rec.classList.remove('open');});}
$$('[data-view-toggle]').forEach(b=>{const list=$('[data-results]');if(!list)return;b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));list.classList.toggle('compact',on);if(on)enterCompact(list);else leaveCompact(list);try{sessionStorage.setItem('pah-compact',on?'1':'0');}catch{}});
 let saved=null;try{saved=sessionStorage.getItem('pah-compact');}catch{}
 if(saved==='1'||new URLSearchParams(location.search).get('view')==='compact'){b.click();}
 const openHash=()=>{if(!list.classList.contains('compact')||!location.hash)return;let t;try{t=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}const rec=t&&t.closest('.record');if(rec){setRecord(rec,true);const d=rec.querySelector('details');if(d)d.open=true;}};openHash();window.addEventListener('hashchange',openHash);});
// Help controls
$$('[data-help-toggle]').forEach(b=>{const panel=document.getElementById(b.getAttribute('aria-controls'));if(!panel)return;b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));panel.hidden=!open;});});

// Decision-sheet drafts are explicit local downloads. Contents never enter analytics or a server request.
const decisionForm=$('[data-decision-form]');
if(decisionForm){
 const controls=[...decisionForm.querySelectorAll('textarea,input[type=radio]')];
 const status=$('[data-draft-status]');const file=$('[data-draft-file]');let dirty=false;
 const say=(en,el)=>status.textContent=greek?el:en;
 const snapshot=()=>Object.fromEntries(controls.filter(c=>c.tagName==='TEXTAREA'||c.checked).map(c=>[c.name,c.value]));
 const syncPrint=()=>decisionForm.querySelectorAll('textarea').forEach(field=>{let mirror=field.parentElement.querySelector('.print-value');if(!mirror){mirror=document.createElement('span');mirror.className='print-value';mirror.setAttribute('aria-hidden','true');field.after(mirror);}mirror.textContent=field.value||' ';});
 syncPrint();window.addEventListener('beforeprint',syncPrint);
 decisionForm.addEventListener('input',()=>{dirty=true;say('Unsaved changes — save a draft before leaving.','Μη αποθηκευμένες αλλαγές — αποθηκεύστε προσχέδιο πριν φύγετε.');});
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 $('[data-draft-save]').addEventListener('click',()=>{
  const draft={format:'publicart-health-decision-sheet',version:1,savedAt:new Date().toISOString(),fields:snapshot()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='publicart-health-decision-draft.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);dirty=false;
  say('Draft download started. Keep the file to restore your work.','Η λήψη του προσχεδίου ξεκίνησε. Κρατήστε το αρχείο για να επαναφέρετε την εργασία σας.');
 });
 $('[data-draft-load]').addEventListener('click',()=>file.click());
 file.addEventListener('change',async()=>{
  const chosen=file.files[0];if(!chosen)return;
  try{
   if(chosen.size>2000000)throw Error('size');const draft=JSON.parse(await chosen.text());
   if(draft.format!=='publicart-health-decision-sheet'||draft.version!==1||!draft.fields||Array.isArray(draft.fields)||typeof draft.fields!=='object')throw Error('format');
   const allowed=new Set(controls.map(c=>c.name));for(const [key,value] of Object.entries(draft.fields)){if(!allowed.has(key)||typeof value!=='string'||value.length>100000)throw Error('field');}
   if(draft.fields.decision&&!controls.some(c=>c.type==='radio'&&c.value===draft.fields.decision))throw Error('decision');
   decisionForm.reset();controls.forEach(c=>{if(c.type==='radio')c.checked=draft.fields[c.name]===c.value;else c.value=draft.fields[c.name]||'';});dirty=false;syncPrint();
   say('Draft restored from your file. New changes must be saved again.','Το προσχέδιο επαναφέρθηκε από το αρχείο σας. Αποθηκεύστε ξανά τυχόν νέες αλλαγές.');
  }catch{say('Could not load this file. Choose a decision-sheet draft saved by this site. Your current entries are unchanged.','Δεν ήταν δυνατή η φόρτωση. Επιλέξτε προσχέδιο αποθηκευμένο από αυτόν τον ιστότοπο. Τα τρέχοντα πεδία παραμένουν αμετάβλητα.');}
  file.value='';
 });
 $('[data-draft-clear]').addEventListener('click',()=>{decisionForm.reset();dirty=false;syncPrint();say('Fields cleared. Previously downloaded files are unchanged.','Τα πεδία καθαρίστηκαν. Τα αρχεία που έχετε ήδη κατεβάσει δεν αλλάζουν.');});
}
