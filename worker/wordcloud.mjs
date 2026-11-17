const WORDCLOUD_STOP=new Set('a an the of and or in on to for from with by as at into over under between across around through than using use used study studies based towards toward improved improvement novel new potential assessment influence contribution representation revealed development properties effect effects role analysis approach methods method model models modelling modeling data dataset set observations observation research results changes change different associated applications application distribution'.split(' '));
const WORDCLOUD_ALIASES={oceans:'ocean',oceanic:'ocean',elements:'element',cycles:'cycle',coatings:'coating',resources:'resource',streams:'stream',masses:'mass',stocks:'stock',flows:'flow',patterns:'pattern',responses:'response',electrodes:'electrode',errors:'error',ree:'REE',rees:'REE',ph:'pH',cmip6:'CMIP6',ukesm1:'UKESM1',lidar:'LiDAR'};
function computeWordcloud(raw){
 if(raw?.['orcid-identifier']?.path&&raw['orcid-identifier'].path!=='0000-0002-3624-0757')throw Error('ORCID owner mismatch');
 if(!Array.isArray(raw?.group)||!raw.group.length)throw Error('Empty ORCID record; previous cloud retained');
 const papers=new Map();let excluded=0;
 for(const g of raw.group){
  const w=[...(g['work-summary']||[])].sort((a,b)=>(a.type==='preprint')-(b.type==='preprint'))[0];
  const title=w?.title?.title?.value?.trim(),type=w?.type;
  if(!title||!['journal-article','preprint','conference-paper'].includes(type)){excluded++;continue;}
  const doi=(w['external-ids']?.['external-id']||[]).find(x=>x['external-id-type']==='doi')?.['external-id-value']?.toLowerCase()||'';
  // This original is explicitly identified by its ORCID-listed retraction notice.
  if(/^(retracted|retraction|correction|corrigendum|erratum)\b/i.test(title)||doi==='10.3390/resources11040038'){excluded++;continue;}
  const key=title.normalize('NFKD').replace(/[^a-z0-9]/gi,'').toLowerCase();
  if(papers.has(key)){excluded++;if(papers.get(key).type!=='preprint'||type==='preprint')continue;}
  papers.set(key,{title,doi,type});
 }
 if(!papers.size)throw Error('No usable paper titles; previous cloud retained');
 const counts=new Map();
 for(const p of papers.values()){
  const words=(p.title.toLowerCase().match(/[a-z]+[0-9]*/g)||[]).filter(t=>(t.length>2||t==='ph')&&!WORDCLOUD_STOP.has(t)).map(t=>WORDCLOUD_ALIASES[t]||t);
  for(const term of new Set(words))counts.set(term,(counts.get(term)||0)+1);
 }
 return {paperCount:papers.size,excludedCount:excluded,papers:[...papers.values()].sort((a,b)=>a.title.localeCompare(b.title)),terms:[...counts].map(([term,count])=>({term,count})).sort((a,b)=>b.count-a.count||a.term.localeCompare(b.term)),method:'Distinct-paper frequency in titles; duplicates, corrections and retracted material excluded. Generic words removed; selected word variants combined.',source:'https://orcid.org/0000-0002-3624-0757',version:1};
}
