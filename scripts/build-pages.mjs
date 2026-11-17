import fs from 'node:fs';import path from 'node:path';
fs.rmSync('site',{recursive:true,force:true});fs.cpSync('web','site',{recursive:true});fs.mkdirSync('site/data',{recursive:true});
const state=JSON.parse(fs.readFileSync('data/content.json','utf8'));
// Export display content only; exclude internal updater details.
const pick = (value, keys) => Object.fromEntries(
  keys
    .filter(key => value?.[key] !== undefined)
    .map(key => [key, structuredClone(value[key])])
);

const data = {
  projects: pick(state.projects, [
    'items', 'lastSuccess', 'lastAttempt',
    'status', 'retrievalMode', 'source'
  ]),
  latestManuscript: pick(state.latestManuscript, [
    'item', 'lastSuccess', 'lastAttempt', 'status'
  ]),
  featuredProjects: pick(state.featuredProjects, [
    'items', 'archive', 'lastSuccess', 'lastAttempt', 'status'
  ])
};
const figure=data.latestManuscript?.item?.figure;
if(figure){const source=path.resolve('data/objects',figure.key);if(!source.startsWith(path.resolve('data/objects')+path.sep))throw Error('Invalid figure key');if(fs.existsSync(source)){const ext=({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'})[figure.mime];if(!ext)throw Error('Unsupported figure MIME');figure.staticUrl='data/manuscript-figure.'+ext;fs.copyFileSync(source,'site/'+figure.staticUrl);}else{data.latestManuscript.item.figure=null;console.warn('Figure object missing; publishing text-only feature.');}}
fs.writeFileSync('site/data/content.json',JSON.stringify(data,null,2)+'\n');
let js=fs.readFileSync('site/app.js','utf8').replace("fetch('/api/content'","fetch('data/content.json'").replace("'/api/latest-manuscript/figure?v='","p.figure.staticUrl+'?v='");
if(js.includes("fetch('/api/content'")||js.includes('/api/latest-manuscript/figure'))throw Error('Non-static URL remains.');
fs.writeFileSync('site/app.js',js);fs.writeFileSync('site/archive.js',fs.readFileSync('web/archive.js','utf8').replace("fetch('/api/content'","fetch('data/content.json'"));fs.writeFileSync('site/.nojekyll','');
console.log('Built site/ for root, repository-subpath, or custom-domain hosting.');
