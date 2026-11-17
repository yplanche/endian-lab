import {wordcloudSVG} from './wordcloud-layout.mjs';
async function loadWordcloud(){
 const status=document.querySelector('#wordcloud-status');
 try{
 const r=await fetch('data/wordcloud.json',{cache:'no-store'});if(!r.ok)throw Error();const d=await r.json();if(!d.terms?.length)throw Error();
 const svg=wordcloudSVG(d.terms);const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 document.querySelector('#research-wordcloud').src=url;document.querySelector('#wordcloud-download').href=url;
 status.textContent=`${d.paperCount} unique papers · Generated ${new Date(d.generatedAt).toLocaleDateString('en-GB')}`+(d.status==='source_unavailable'?' · Latest check unavailable; previous cloud retained.':'');
 const list=document.querySelector('#wordcloud-terms');list.replaceChildren(...d.terms.slice(0,30).map(t=>{const li=document.createElement('li');li.textContent=`${t.term}: ${t.count} papers`;return li;}));
 }catch{status.textContent='Saved word cloud · public ORCID paper titles';}
}
loadWordcloud();
