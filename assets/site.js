(() => {
  'use strict';
  const {ui, places} = window.PPS_DATA;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const lang = document.documentElement.lang;
  const normalize = s => s.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase(lang);
  const nav = $('nav'), menu = $('.menu-toggle');
  const closeMenu = () => { nav.classList.remove('menu-open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label',ui.menuOpen); document.body.style.overflow=''; };
  menu.addEventListener('click',() => {const open = !nav.classList.contains('menu-open');nav.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?ui.menuClose:ui.menuOpen);document.body.style.overflow=open?'hidden':'';});
  $$('nav ul a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  matchMedia('(min-width:881px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
  $$('[data-language-link]').forEach(a=>a.addEventListener('click',()=>{if(location.hash)a.hash=location.hash;}));
  const oldTarget=location.hash.slice(1); if(oldTarget&&!document.getElementById(oldTarget)&&window.PPS_ROUTES?.[oldTarget]) location.replace(window.PPS_ROUTES[oldTarget]);
  const prog=$('#progress');
  const progress=()=>{const d=document.documentElement; if(prog)prog.style.width=(d.scrollHeight>d.clientHeight?100*d.scrollTop/(d.scrollHeight-d.clientHeight):0)+'%';};
  document.addEventListener('scroll',progress,{passive:true});progress();
  // Filtering shares state between the catalogue and illustrated works.
  const rows=$$('.register .row[data-target]'), dossiers=$$('.dossier,.work-card'), chips=$$('.chip[data-filter]');
  let filter='all', query='';
  function apply(){
    const matches=e=>(filter==='all'||(filter.startsWith('sector:')?e.dataset.sector===filter.slice(7):filter.startsWith('status:')?e.dataset.status===filter.slice(7):e.dataset.setting===filter.slice(8)))&&normalize(e.dataset.search||'').includes(query);
    [...rows,...dossiers].forEach(e=>e.hidden=!matches(e));
    chips.forEach(c=>{const on=c.dataset.filter===filter;c.classList.toggle('on',on);c.setAttribute('aria-pressed',String(on));});
    const n=rows.filter(r=>!r.hidden).length;
    if($('#result-count'))$('#result-count').textContent=(lang==='ar'?'الأعمال المعروضة: '+n:lang==='en'&&n===1?'1 work shown':n+' '+ui.shown);
    if($('#empty-results'))$('#empty-results').hidden=n!==0;
  }
  chips.forEach(c=>c.addEventListener('click',()=>{filter=c.dataset.filter;apply();}));
  $('#search')?.addEventListener('input',e=>{query=normalize(e.target.value.trim());apply();});
  const reset=()=>{filter='all';query='';if($('#search'))$('#search').value='';apply();};
  $('#reset-filters')?.addEventListener('click',reset);
  $$('.sector-filter').forEach(b=>b.addEventListener('click',()=>{filter='sector:'+b.dataset.sector;apply();$('#index').scrollIntoView();}));
  $$('.register .sortable').forEach(b=>b.addEventListener('click',()=>{
    const dir=b.classList.contains('asc')?'desc':'asc', key=b.dataset.key;
    $$('.register .sortable').forEach(x=>{x.classList.remove('asc','desc');x.setAttribute('aria-pressed',String(x===b));});b.classList.add(dir);
    rows.sort((a,c)=>{let n=key==='val'?Number(a.dataset.val)-Number(c.dataset.val):key==='yr'?Number(a.dataset.yr)-Number(c.dataset.yr):a.dataset.title.localeCompare(c.dataset.title,lang);return n*(dir==='asc'?1:-1);}).forEach(r=>$('.register').appendChild(r));
  }));
  const go=id=>{if(!document.getElementById(id)&&window.PPS_ROUTES?.[id]){location.href=window.PPS_ROUTES[id];return;}const target=document.getElementById(id);if(target){if(target.hidden)reset();location.hash=id;target.scrollIntoView();}};
  rows.forEach(r=>{r.addEventListener('click',()=>go(r.dataset.target));r.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go(r.dataset.target);}});});
  // Native dialog provides focus containment and Escape-to-close.
  const dialog=$('#lightbox'), image=$('#lb-stage img');let scale=1,opener;
  function zoom(v){scale=Math.max(1,Math.min(4,v));image.style.maxWidth=scale===1?'100%':'none';image.style.maxHeight=scale===1?'100%':'none';image.style.width=scale===1?'auto':(80*scale)+'vw';}
  $$('.loupe-wrap,.detail').forEach(w=>{
    const open=()=>{opener=w;const source=w.querySelector('img');image.src=source.src;image.alt=source.alt;dialog.querySelector('.cap').textContent=w.dataset.cap||source.alt;zoom(1);dialog.showModal();};
    w.addEventListener('click',open);w.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  });
  $('#lb-close')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('close',()=>opener?.focus());
  $('#zoom-in')?.addEventListener('click',()=>zoom(scale+.5));$('#zoom-out')?.addEventListener('click',()=>zoom(scale-.5));$('#zoom-reset')?.addEventListener('click',()=>zoom(1));
  // Both map markers and a text list work with touch and keyboard.
  const tip=$('#map-tip');
  function showPlace(city){
    const p=places.find(p=>p.name===city);if(!p||!tip)return;
    tip.replaceChildren();const title=document.createElement('div');title.className='city';title.textContent=p.label;tip.append(title);
    p.works.forEach(w=>{const a=document.createElement('a');a.href=window.PPS_ROUTES?.[w.a]||'#'+w.a;a.textContent=w.ref+' — '+w.title;a.addEventListener('click',e=>{e.preventDefault();go(w.a);});tip.append(a);});
    tip.style.display='block';tip.style.position='relative';tip.style.left='0';tip.style.top='0';
    $$('.marker').forEach(m=>m.classList.toggle('on',m.dataset.city===city));
    $$('.atlas-list button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.city===city)));
  }
  $$('.marker,.atlas-list button').forEach(m=>{m.addEventListener('click',()=>showPlace(m.dataset.city));if(m.tagName.toLowerCase()!=='button')m.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showPlace(m.dataset.city);}});});
  const press=$('#press-toggle');press?.addEventListener('click',()=>{const open=$('.pressreg').classList.toggle('expanded');press.setAttribute('aria-expanded',String(open));press.textContent=open?ui.fewer:ui.all.replace('{n}',$$('.prow').length);});
})();
