(function(){
function track(name,data){try{if(window.va)window.va('event',{name:name,data:data||{}});}catch(e){}}
// mobile menu
var t=document.querySelector('.menu-toggle'),n=document.getElementById('main-nav');
if(t&&n){t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',o?'true':'false');});}
// catalogue filter/sort
var grid=document.getElementById('collection-grid'),mf=document.getElementById('material-filter'),ps=document.getElementById('price-sort');
if(grid){var orig=[].slice.call(grid.querySelectorAll('.card'));
 function arrange(){var cards=orig.slice();cards.forEach(function(c){c.hidden=!!(mf&&mf.value)&&c.dataset.material!==mf.value;});
  if(ps&&ps.value!=='curated'){var d=ps.value==='asc'?1:-1;cards.sort(function(a,b){return (Number(a.dataset.price)-Number(b.dataset.price))*d;});}
  cards.forEach(function(c){grid.appendChild(c);});}
 if(mf)mf.addEventListener('change',arrange);if(ps)ps.addEventListener('change',arrange);}
// tracked links
[].forEach.call(document.querySelectorAll('[data-track]'),function(a){a.addEventListener('click',function(){track(a.getAttribute('data-track'),{page:location.pathname});});});
function post(url,body){return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json().catch(function(){return {ok:false};}).then(function(j){return r.ok&&j.ok;});}).catch(function(){return false;});}
var cfg=fetch('/api/status/',{cache:'no-store'}).then(function(r){return r.ok?r.json():{};}).catch(function(){return {};});
cfg.then(function(c){if(c.list){[].forEach.call(document.querySelectorAll('[data-needs-list]'),function(el){el.hidden=false;});}});
function mailtoFallback(d){var body='Work: '+d.work+'\nName: '+d.name+'\nDelivery country: '+d.country+(d.postcode?'\nPostcode: '+d.postcode:'')+(d.phone?'\nTelephone: '+d.phone:'')+'\n\n'+(d.message||'');
 return 'mailto:studio@petrides.art?subject='+encodeURIComponent('Enquiry: '+d.work)+'&body='+encodeURIComponent(body);}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
// signup forms
[].forEach.call(document.querySelectorAll('form[data-signup]'),function(f){
 f.addEventListener('submit',function(e){e.preventDefault();var st=f.querySelector('.form-status'),em=f.querySelector('input[name=email]'),btn=f.querySelector('button');
  st.className='form-status';if(!validEmail(em.value.trim())){st.textContent='Enter a valid email address.';st.classList.add('err');em.focus();return;}
  btn.disabled=true;st.textContent='Sending…';
  post('/api/subscribe/',{email:em.value.trim(),website:f.querySelector('input[name=website]').value,page:location.pathname}).then(function(ok){btn.disabled=false;
   if(ok){st.textContent='Thank you. You\u2019re on the list for news from Petrides Editions.';st.classList.add('ok');f.reset();track('Newsletter signup',{page:location.pathname});}
   else{st.innerHTML='Your email could not be added. Please try again or email <a href="mailto:studio@petrides.art">studio@petrides.art</a>.';st.classList.add('err');}});});});
// enquiry form
var ef=document.getElementById('enquiry-form');
if(ef){var q=new URLSearchParams(location.search),w=q.get('work'),sel=document.getElementById('f-work');
 if(q.get('visit'))sel.value='Studio visit';
 else if(w){var found=[].some.call(sel.options,function(o){if(o.value===w){sel.value=w;return true;}return false;});if(!found){var o=document.createElement('option');o.value=w;o.textContent=w;sel.appendChild(o);sel.value=w;}}
 var started=false;ef.addEventListener('focusin',function(){if(!started){started=true;track('Enquiry form started',{work:sel.value});}});
 ef.addEventListener('submit',function(e){e.preventDefault();var st=ef.querySelector('.form-status'),btn=ef.querySelector('button[type=submit]');st.className='form-status';
  var el=ef.elements,v=function(k){return (el[k].value||'').trim();};var d={work:sel.value,name:v('name'),email:v('email'),country:v('country'),postcode:v('postcode'),message:v('message'),phone:v('phone'),newsletter:el['newsletter'].checked,website:el['website'].value};
  var miss=!d.name?'f-name':!validEmail(d.email)?'f-email':!d.country?'f-country':null;
  if(miss){st.textContent=miss==='f-email'?'Enter a valid email address.':'Please complete the required fields: name, email and delivery country.';st.classList.add('err');document.getElementById(miss).focus();return;}
  btn.disabled=true;st.textContent='Sending…';
  cfg.then(function(c){if(!c.enquiry){btn.disabled=false;var m=mailtoFallback(d);track('Enquiry email draft',{work:d.work});st.innerHTML='Your email app should open with your enquiry ready to send. If it does not, email <a href="'+m.replace(/"/g,'&quot;')+'">studio@petrides.art</a>.';st.classList.add('ok');location.href=m;return;}
  post('/api/enquiry/',d).then(function(ok){btn.disabled=false;
   if(ok){st.textContent='Thank you for your enquiry about '+d.work+'. The studio will contact you to discuss availability and delivery. A confirmation has been sent to your email.';st.classList.add('ok');ef.reset();track('Enquiry submitted',{work:d.work});}
   else{st.innerHTML='Your enquiry could not be sent. Please try again or email <a href="mailto:studio@petrides.art">studio@petrides.art</a>.';st.classList.add('err');}});});});}
})();
