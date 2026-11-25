(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const e=(tag,attrs={},value)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(value!==undefined)n.textContent=value;return n;};
function render(data,lang){
  const r=BathroomRoomModel.derive(data),es=lang==='es',s=8,pad=104,topPad=86,w=r.measurements.room_width,h=r.measurements.room_depth;
  const vbW=Math.round(w*s+pad*2), vbH=Math.round(h*s+topPad+185);
  const svg=e('svg',{viewBox:`0 0 ${vbW} ${vbH}`,preserveAspectRatio:'xMidYMid meet',role:'img','aria-label':es?'Plano completo del baño':'Whole bathroom floor plan','data-view':'room-plan','data-scale':s});
  svg.append(e('rect',{x:0,y:0,width:vbW,height:vbH,fill:'#ecefed'}));

  // Compass badge (top-right)
  const cxC=vbW-48, cyC=42;
  const cg=e('g',{});
  cg.append(e('circle',{cx:cxC,cy:cyC,r:16,fill:'#ffffff',stroke:'#53625d','stroke-width':1.5}));
  cg.append(e('polygon',{points:`${cxC},${cyC-12} ${cxC+4},${cyC-2} ${cxC-4},${cyC-2}`,fill:'#1f5f7a'}));
  cg.append(e('text',{x:cxC,y:cyC-20,'text-anchor':'middle','font-family':'sans-serif','font-size':12,'font-weight':'700',fill:'#1f5f7a'},'N'));
  svg.append(cg);

  const xy=p=>[pad+p.x*s,topPad+p.y*s],ps=r.outline.map(xy);
  svg.append(e('polygon',{points:ps.map(p=>p.join(',')).join(' '),fill:'#fafbf9',stroke:'#53625d','stroke-width':6,'data-shape':'room'}));
  const label=(x,y,t,size=18)=>svg.append(e('text',{x,y,'text-anchor':'middle','dominant-baseline':'middle',fill:'#173f50','font-family':'sans-serif','font-size':size,'paint-order':'stroke',stroke:'#fafbf9','stroke-width':4},t));
  const dim=(id,a,b,t,dx=0,dy=-16)=>{const g=e('g',{'data-room-dimension':id});g.append(e('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#17495e','stroke-width':2}));for(const p of[a,b])g.append(e('circle',{cx:p[0],cy:p[1],r:4,fill:'#17495e'}));svg.append(g);label((a[0]+b[0])/2+dx,(a[1]+b[1])/2+dy,t,17);};
  dim('width',[pad,44],[pad+w*s,44],BathroomModel.format(w),0,-16);
  dim('depth',[54,topPad],[54,topPad+h*s],BathroomModel.format(h),0,0);

  for(const f of r.fixtures){
    const p=f.polygon.map(xy);
    svg.append(e('polygon',{points:p.map(x=>x.join(',')).join(' '),fill:/tub/i.test(f.label)?'#dfecef':'#e8e2d6',stroke:'#466471','stroke-width':2,'stroke-dasharray':'7 4','data-fixture':f.id}));
    const cx=pad+(f.x+f.width/2)*s,cy=topPad+(f.y+f.depth/2)*s;
    const name=/tub/i.test(f.label)?(es?'Tina':'Tub'):/sink/i.test(f.label)?(es?'Lavabo':'Sink'):(es?'Inodoro':'Toilet');
    label(cx,cy-12,name,18);
    label(cx,cy+15,BathroomModel.format(f.symbol_width,true)+' × '+BathroomModel.format(f.symbol_depth,true),15);
  }
  for(const o of r.openings){
    const a=xy(o.start),b=xy(o.end);
    svg.append(e('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#fafbf9','stroke-width':9}));
    if(o.kind==='door'){
      const dw=Math.hypot(b[0]-a[0],b[1]-a[1])*0.58;
      svg.append(e('line',{x1:a[0],y1:a[1],x2:a[0],y2:a[1]+dw,stroke:'#2f6b3f','stroke-width':3.5}));
      svg.append(e('path',{d:`M ${a[0]} ${a[1]+dw} A ${dw} ${dw} 0 0 0 ${a[0]+dw} ${a[1]}`,fill:'none',stroke:'#2f6b3f','stroke-width':2,'stroke-dasharray':'6 4'}));
      label((a[0]+b[0])/2+14,a[1]+dw+20,(es?'Puerta abatible ':'Hinged door ')+BathroomModel.format(o.width)+(es?' (al pasillo)':' (to hall)'),15);
    } else {
      svg.append(e('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#46849a','stroke-width':3,'data-opening':o.id}));
      const x=a[0]-20,y=(a[1]+b[1])/2;
      svg.append(e('text',{x,y,transform:`rotate(-90 ${x} ${y})`,'text-anchor':'middle',fill:'#173f50','font-family':'sans-serif','font-size':15,'font-weight':'600'},es?'Ventana':'Window'));
    }
  }
  return svg;
}
function summary(data,lang){
  const r=BathroomRoomModel.derive(data),es=lang==='es';
  const box=document.createElement('div');
  const rows=[
    [es?'Habitación (base Magicplan)':'Room dimensions (Magicplan)',BathroomModel.format(r.measurements.room_width)+' × '+BathroomModel.format(r.measurements.room_depth)],
    [es?'Muro norte de fondo medido':'Measured North back-wall span',BathroomModel.format(r.measurements.backer_clear_width)],
    [es?'Altura de tina desde piso actual':'Tub height from current floor',BathroomModel.format(r.measurements.tub_current_floor_height)],
    [es?'Profundidad exterior de tina':'Outer tub front depth',BathroomModel.format(r.measurements.tub_outer_depth,true)],
    [es?'Topes laterales de azulejo (Este y Oeste)':'Symmetrical wall-tile stops (East & West)','35″'],
    [es?'Tramo local del muro oeste a repisa':'West-wall span to window sill',BathroomModel.format(r.measurements.west_span)]
  ];
  const table=document.createElement('table');
  table.className='measurement-table';
  const tbody=document.createElement('tbody');
  for(const[a,b]of rows){
    const tr=document.createElement('tr');
    const td1=document.createElement('td'), td2=document.createElement('td');
    td1.textContent=a; td2.textContent=b;
    tr.append(td1,td2); tbody.append(tr);
  }
  table.append(tbody);
  box.append(table);
  const p=document.createElement('p');
  p.className='note';
  p.textContent=es
    ? 'Definiciones vigentes: puerta abatible de 28″ abriendo hacia el pasillo (sin puerta corrediza), topes simétricos de azulejo a 35″ con bullnose cerámico 2″×6″, y cero azulejo arriba de la repisa de 43″.'
    : 'Current locks: 28″ outward-swing hallway door (pocket door retired), 35″ symmetrical tile stops with matching 2″×6″ ceramic bullnose, and zero wall tile above the 43″ window sill.';
  box.append(p);
  return box;
}
window.BathroomRoomView={render,summary};
})();
