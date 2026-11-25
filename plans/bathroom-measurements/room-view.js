(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const e=(tag,attrs={},value)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(value!==undefined)n.textContent=value;return n;};
function render(data,lang){
 const r=BathroomRoomModel.derive(data),es=lang==='es',s=8,pad=85,w=r.measurements.room_width,h=r.measurements.room_depth;
 const svg=e('svg',{viewBox:`0 0 ${w*s+170} ${h*s+170}`,preserveAspectRatio:'xMidYMid meet',role:'img','aria-label':es?'Plano completo del baño':'Whole bathroom floor plan','data-view':'room-plan','data-scale':s});
 svg.append(e('rect',{width:'100%',height:'100%',fill:'#ecefed'}));
 const xy=p=>[pad+p.x*s,80+p.y*s],ps=r.outline.map(xy);
 svg.append(e('polygon',{points:ps.map(p=>p.join(',')).join(' '),fill:'#fafbf9',stroke:'#53625d','stroke-width':6,'data-shape':'room'}));
 const label=(x,y,t,size=19)=>svg.append(e('text',{x,y,'text-anchor':'middle','dominant-baseline':'middle',fill:'#173f50','font-family':'sans-serif','font-size':size,'paint-order':'stroke',stroke:'#fafbf9','stroke-width':4},t));
 const dim=(id,a,b,t)=>{const g=e('g',{'data-room-dimension':id});g.append(e('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#17495e','stroke-width':2}));for(const p of[a,b])g.append(e('circle',{cx:p[0],cy:p[1],r:4,fill:'#17495e'}));svg.append(g);label((a[0]+b[0])/2,(a[1]+b[1])/2-15,t);};
 dim('width',[pad,42],[pad+w*s,42],BathroomModel.format(w));dim('depth',[38,80],[38,80+h*s],BathroomModel.format(h));
 for(const f of r.fixtures){const p=f.polygon.map(xy);svg.append(e('polygon',{points:p.map(x=>x.join(',')).join(' '),fill:/tub/i.test(f.label)?'#dfecef':'#e8e2d6',stroke:'#466471','stroke-width':2,'stroke-dasharray':'7 4','data-fixture':f.id}));
 const cx=pad+(f.x+f.width/2)*s,cy=80+(f.y+f.depth/2)*s;
 const name=/tub/i.test(f.label)?(es?'Tina':'Tub'):/sink/i.test(f.label)?(es?'Lavabo':'Sink'):(es?'Inodoro':'Toilet');
 label(cx,cy-10,name,18);label(cx,cy+15,BathroomModel.format(f.symbol_width,true)+' × '+BathroomModel.format(f.symbol_depth,true),16);
 }
 for(const o of r.openings){const a=xy(o.start),b=xy(o.end);svg.append(e('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#fafbf9','stroke-width':9}));svg.append(e('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#46849a','stroke-width':3,'data-opening':o.id}));
 if(o.kind==='door')label((a[0]+b[0])/2,a[1]+34,(es?'Puerta abatible ':'Outward door ')+BathroomModel.format(o.width),16);
 else{const x=a[0]+27,y=(a[1]+b[1])/2;svg.append(e('text',{x,y,transform:`rotate(-90 ${x} ${y})`,'text-anchor':'middle',fill:'#173f50','font-family':'sans-serif','font-size':15},es?'Ventana · reemplazar':'Window · replace'));}
 }
 label(pad+w*s/2,80+h*s+70,es?'Ubicaciones base de Magicplan':'Magicplan baseline placements',16);
 return svg;
}
function summary(data,lang){const r=BathroomRoomModel.derive(data),es=lang==='es';const box=document.createElement('div');
 const rows=[[es?'Habitación aceptada':'Accepted room',BathroomModel.format(r.measurements.room_width)+' × '+BathroomModel.format(r.measurements.room_depth)],[es?'Muro posterior medido':'Measured backer-wall span',BathroomModel.format(r.measurements.backer_clear_width)],[es?'Altura de tina desde piso actual':'Tub height from current floor',BathroomModel.format(r.measurements.tub_current_floor_height)],[es?'Profundidad exterior de tina':'Outer tub depth',BathroomModel.format(r.measurements.tub_outer_depth,true)],[es?'Tramo local del muro oeste':'West-wall local span',BathroomModel.format(r.measurements.west_span)]];
 const table=document.createElement('table');for(const[a,b]of rows){const tr=document.createElement('tr');for(const val of[a,b]){const td=document.createElement('td');td.textContent=val;tr.append(td);}table.append(tr);}box.append(table);
 const p=document.createElement('p');p.textContent=es?'El ancho del respaldo medido y el ancho de la habitación usan límites distintos por conciliar. Las posiciones de los muebles se conservan del plano; no prueban la instalación.':'The measured backer span and room width have different boundaries still to reconcile. Fixture positions are preserved from the plan; they do not verify installed locations.';box.append(p);
 const q=document.createElement('p');q.textContent=es?'Decisiones abiertas: lavabo, ventana y molduras de reemplazo, botiquín y límite del azulejo junto a la tina.':'Open decisions: sink, replacement window and casing, medicine cabinet, and tile stop beside the tub.';box.append(q);return box;}
window.BathroomRoomView={render,summary};
})();
