'use strict';
// Keep the same record and filters when changing language, including after filtering.
document.querySelectorAll('[data-language-link]').forEach(link=>{
 link.addEventListener('click',()=>{
  const target=new URL(link.href,location.origin);
  target.search=location.search;target.hash=location.hash;link.href=target.href;
 });
});
