const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const S=path.join(__dirname,'.');  // carpeta con deck.json y slides/
const FIG=path.join(__dirname,'..','figuras')+'/';
const deck=JSON.parse(fs.readFileSync(S+'/deck.json','utf8'));
const blobs={'/_blob/081a6209d4cb4abcf3b62ea5bf567f5d':'fig_mvp.png','/_blob/060a9b94dee976bca608a95ec2a2961e':'fig_embudo.png','/_blob/d2218acf969b9bf786eed7d226f2ec0c':'fig_lean_canvas.png','/_blob/683145ad0fb75cab8db9450d9d963b01':'fig_matriz_mvp.png'};
const F='node_modules/@fontsource/';
const face=(fam,file,w)=>`@font-face{font-family:'${fam}';font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(F+file).toString('base64')}) format('woff2')}`;
let css=[face('Rubik','rubik/files/rubik-latin-400-normal.woff2',400),face('Rubik','rubik/files/rubik-latin-500-normal.woff2',500),face('Rubik','rubik/files/rubik-latin-600-normal.woff2',600),face('Rubik','rubik/files/rubik-latin-700-normal.woff2',700),
 face('Nunito Sans','nunito-sans/files/nunito-sans-latin-400-normal.woff2',400),face('Nunito Sans','nunito-sans/files/nunito-sans-latin-600-normal.woff2',600),face('Nunito Sans','nunito-sans/files/nunito-sans-latin-700-normal.woff2',700)].join('\n');
css+=`
@page{size:1920px 1080px;margin:0}
html,body{margin:0;padding:0}
section{width:1920px;height:1080px;box-sizing:border-box;position:relative;overflow:hidden;page-break-after:always;break-after:page}
section *{box-sizing:border-box}
h1,h2,h3,p,ul,ol{margin:0}
h1{font-size:96px;font-weight:600;line-height:1.1} h2{font-size:64px;font-weight:600;line-height:1.15} h3{font-size:44px;font-weight:600;line-height:1.2} p{font-size:32px;line-height:1.4}
aside{display:none}
table{border-collapse:collapse;width:100%}
th,td{padding:0.35em 0.6em;border-bottom:1px solid #C9D1CD;text-align:left;vertical-align:top}
th{font-weight:700;border-bottom:2px solid currentColor}
img{display:block}`;
let html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>NivelaTec · Lean Canvas</title><style>'+css+'</style></head><body>';
for(const id of deck.order){
  let s=fs.readFileSync(`${S}/slides/${id}.html`,'utf8');
  for(const [b,f] of Object.entries(blobs)) s=s.split(b).join('data:image/png;base64,'+fs.readFileSync(FIG+f).toString('base64'));
  html+=s;
}
html+='</body></html>';
fs.writeFileSync('deck_print.html',html);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.setContent(html,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);
await p.pdf({path:'NivelaTec_presentacion.pdf',width:'1920px',height:'1080px',printBackground:true,preferCSSPageSize:true});
const secs=await p.$$('section');for(let i=0;i<secs.length;i++){await secs[i].screenshot({path:`s${String(i+1).padStart(2,'0')}.png`});}
await b.close();console.log('ok',secs.length);})();
