/* Whole-life cost arithmetic in minor currency units; no exchange rates or forecasts. */
(function(root){
 'use strict';
 const money=v=>{const s=String(v??'').trim();if(s==='')return 0;if(!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(s)||Number(s)>100000000)throw Error('amount');const [a,b='']=s.split('.');return Number(a)*100+Number(b.padEnd(2,'0'));};
 const integer=v=>{if(!/^\d+$/.test(String(v))||Number(v)<1||Number(v)>100)throw Error('years');return Number(v);};
 function calculate(d){
  const years=integer(d.years);const rate=money(d.contingency);if(rate>10000)throw Error('contingency');
  let capital=0,annual=0,periodic=0,entered=0;
  const rows=d.rows.map(r=>{const once=money(r.once),yearly=money(r.annual),cycle=money(r.periodic);const every=integer(r.every);const events=Math.floor(years/every);const total=once+yearly*years+cycle*events;capital+=once;annual+=yearly*years;periodic+=cycle*events;if([r.once,r.annual,r.periodic].some(v=>String(v??'').trim()!==''))entered++;return {...r,events,total};});
  const subtotal=capital+annual+periodic,contingency=Number((BigInt(subtotal)*BigInt(rate)+5000n)/10000n),gift=money(d.gift);
  return {years,capital,annual,periodic,subtotal,contingency,total:subtotal+contingency,gift,entered,rows};
 }
 const api={money,integer,calculate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PAHBudget=api;
})(typeof window!=='undefined'?window:globalThis);
