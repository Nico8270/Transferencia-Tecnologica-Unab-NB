const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:760}});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 const html=require('fs').readFileSync(require('path').join(__dirname,'..','mvp','nivelatec_mvp.html'),'utf8');
 await p.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>'+html+'</body></html>');
 let clicks=0; const c=async s=>{await p.click(s);clicks++;};
 await c('[data-c="Técnico en Mecánica Automotriz"]'); await c('#start');
 // answer: pick option index pattern (correct for M1/M2 some wrong)
 let n=0;
 while(await p.$('#next')){ const opts=await p.$$('#opts .opt'); 
   // choose correct (data-i=0) for odd, wrong for even to exercise adaptivity
   const pat=[[0,0,1],[1,1,0],[0,1,0],[1,1,1]][Math.floor(n/3)][n%3]; const target = pat? '#opts .opt[data-i="0"]':'#opts .opt[data-i="1"]';
   await c(target); await c('#next'); n++; }
 console.log('items',n,'clicks',clicks);
 await p.screenshot({path:''+require('path').join(__dirname,'..','figuras','s_')+'resultado.png',fullPage:true});
 await c('[data-sk]');
 for(let i=0;i<4;i++){ await c('#opts .opt[data-i="'+(i===1?2:0)+'"]'); await c('#ck'); if(i===1) await p.screenshot({path:''+require('path').join(__dirname,'..','figuras','s_')+'feedback.png',fullPage:true}); await c('#nx'); }
 console.log('total clicks',clicks);
 await p.screenshot({path:''+require('path').join(__dirname,'..','figuras','s_')+'constancia.png',fullPage:true});
 await c('#tab-doc'); await c('[data-al]');
 await p.screenshot({path:''+require('path').join(__dirname,'..','figuras','s_')+'docente.png',fullPage:true});
 await c('#tab-ev'); await p.screenshot({path:''+require('path').join(__dirname,'..','figuras','s_')+'eventos.png',fullPage:true});
 const ev=await p.$$eval('#view-ev tbody tr',r=>r.length); console.log('events',ev);
 await p.setViewportSize({width:400,height:800}); await c('#tab-doc');
 const sw=await p.evaluate(()=>document.documentElement.scrollWidth); console.log('mobile scrollWidth',sw);
 console.log('errors',errs); await b.close();})();
