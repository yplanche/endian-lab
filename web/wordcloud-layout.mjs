// Deterministic, dependency-free SVG layout, shared by browser and static build.
export function wordcloudSVG(terms){
 const width=1200,height=675,occupied=[],words=[],colors=['#0057b8','#006bff','#00366e','#007fa3','#2987b8'];
 const sorted=[...terms].sort((a,b)=>b.count-a.count||a.term.localeCompare(b.term)).slice(0,100),max=sorted[0]?.count||1;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 for(const [i,t] of sorted.entries()){
  let placed=false;
  for(let font=Math.round(14+78*Math.sqrt(t.count/max));font>=14&&!placed;font-=4){
   const w=t.term.length*font*.62+12,h=font*1.14+8;
   for(let step=0;step<2200;step++){
    const angle=step*.38+i*.7,r=6*Math.sqrt(step),x=width/2+Math.cos(angle)*r*2.4-w/2,y=height/2+Math.sin(angle)*r*1.3-h/2;
    if(x<12||y<12||x+w>width-12||y+h>height-12||occupied.some(b=>x<b.x+b.w&&x+w>b.x&&y<b.y+b.h&&y+h>b.y))continue;
    occupied.push({x,y,w,h});words.push(`<text x="${(x+w/2).toFixed(1)}" y="${(y+h/2).toFixed(1)}" font-size="${font}" fill="${colors[i%colors.length]}" text-anchor="middle" dominant-baseline="central">${esc(t.term)}<title>${esc(t.term)}: ${t.count} papers</title></text>`);placed=true;break;
   }
  }
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="cloud-title"><title id="cloud-title">Research vocabulary from public ORCID paper titles</title><g font-family="monospace" font-weight="500">${words.join('')}</g></svg>`;
}
