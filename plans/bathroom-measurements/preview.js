'use strict';
(async function () {
  const M = window.BathroomModel, NS='http://www.w3.org/2000/svg';
  const query=new URLSearchParams(location.search);
  const ui={lang:query.get('lang')==='es'?'es':'en',theme:query.get('theme')==='dark'?'dark':'light',wall:['room','tub','west','tub-profile'].includes(query.get('wall'))?query.get('wall'):'room',view:query.get('view')==='flat'?'flat':query.get('view')==='photo'?'photo':(!query.get('wall')||query.get('wall')==='room'||query.get('wall')==='west')?'flat':'photo',layer:['widths','heights','all'].includes(query.get('layer'))?query.get('layer'):'widths',zoom:100,selected:null};
  let data, derived;

  const asset=path=>(window.U4PLAN_ASSETS||{})[path]||path;
  const words={
    en:{eyebrow:'UNIT 4 · BATHROOM',title:'Historical bathroom measurement viewer',hold:'Archived working draft. Use the Bathroom Reference Photos for measurements and the Tile Plan for current instructions.',orientation:'North tub back wall (69-5/16″) · Window left (West), Shower right (East)',photo:'Photo',flat:'Flat drawing',widths:'Widths',heights:'Heights',all:'All',zoom:'Zoom',reset:'Reset',dark:'Dark',light:'Light',approximate:'≈ marks provisional readings, rounded to the nearest ¼ inch.',datum:'Heights start at the tub/stone rim. The reported {floor} floor-to-tub height has an unconfirmed floor datum.',readings:'Measurements',unknown:'Still to measure on site: inside depth of both waterproofed niches before cutting back panels.',sources:'Sources and notes',technical:'Technical details',draft:'Draft preview only. It is not an issued crew plan.',download:'Download source measurements',photoCaption:'Left = window · right = shower. Photo is not to scale; arrows mark visible edges.',flatCaption:'Left = window · right = shower. Equal scale in both directions; niche positions remain approximate.',distance:'Distance',reading:'Reading',positions:'From the left corner',chain:'The unrounded horizontal chain closes exactly to the wall width.',photoSource:'Photo',provisional:'Niche readings are approximate. The small niche top is within {lo}–{hi}; this draft uses {top}.',otherRefs:'Unplaced references: {casing} casing space and {sill} sill reference have unconfirmed endpoints. The {depth} shower-wall depth reaches the OUTER tub front, not the final tile stop.',local:'Local preview only; measurements are not saved to the live plans.',error:'The measurements could not load. Open this folder through a local web server.'},
    es:{eyebrow:'UNIDAD 4 · BAÑO',title:'Visor anterior de medidas del baño',hold:'Borrador archivado. Consulta las Fotos de Referencia del Baño para las medidas y el Plano de Azulejo para las instrucciones actuales.',orientation:'Muro norte de tina (69-5/16″) · Ventana izq. (Oeste), Regadera der. (Este)',photo:'Foto',flat:'Dibujo frontal',widths:'Anchos',heights:'Alturas',all:'Todas',zoom:'Ampliar',reset:'Restablecer',dark:'Oscuro',light:'Claro',approximate:'≈ indica medidas provisionales, redondeadas al ¼ de pulgada más cercano.',datum:'Las alturas parten del borde de la tina/piedra. Falta confirmar desde qué nivel del piso se midieron las {floor} hasta la tina.',readings:'Medidas',unknown:'Falta medir en obra: profundidad interior de ambos nichos impermeabilizados antes de cortar los fondos.',sources:'Fuentes y notas',technical:'Detalles técnicos',draft:'Vista preliminar. No es un plano autorizado para la cuadrilla.',download:'Descargar medidas originales',photoCaption:'Izquierda = ventana · derecha = regadera. La foto no está a escala; las flechas señalan los bordes visibles.',flatCaption:'Izquierda = ventana · derecha = regadera. Misma escala en ambos ejes; los nichos siguen siendo aproximados.',distance:'Distancia',reading:'Medida',positions:'Desde la esquina izquierda',chain:'La suma horizontal sin redondear coincide exactamente con el ancho del muro.',photoSource:'Foto',provisional:'Las medidas de los nichos son aproximadas. El borde superior del nicho pequeño queda entre {lo} y {hi}; este borrador usa {top}.',otherRefs:'Referencias sin ubicar: falta confirmar los extremos de {casing} junto a la moldura y {sill} del alféizar. Las {depth} del muro de la regadera llegan al FRENTE EXTERIOR de la tina; no fijan el límite del azulejo.',local:'Solo vista preliminar local; las medidas no se guardan en los planos publicados.',error:'No se pudieron cargar las medidas. Abre esta carpeta mediante un servidor web local.'}
  };
  const names={
    en:{wall_width:'Wall, corner to corner',wall_height:'Tub rim to wall top',left_gap:'Left corner → large niche',large_width:'Large niche width',between_gap:'Between niches',small_width:'Small niche width',right_gap:'Small niche → right corner',large_height:'Large niche height',small_height:'Small niche height',large_bottom:'Tub rim → large niche bottom',small_bottom:'Tub rim → small niche bottom',large_top:'Tub rim → large niche top',small_top:'Tub rim → small niche top',large_top_gap:'Large niche top → wall top',small_top_gap:'Small niche top → wall top',large_left_position:'Large niche, left edge',large_right_position:'Large niche, right edge',small_left_position:'Small niche, left edge',small_right_position:'Small niche, right edge'},
    es:{wall_width:'Muro, de esquina a esquina',wall_height:'Borde de tina → parte superior del muro',left_gap:'Esquina izquierda → nicho grande',large_width:'Ancho del nicho grande',between_gap:'Entre nichos',small_width:'Ancho del nicho pequeño',right_gap:'Nicho pequeño → esquina derecha',large_height:'Alto del nicho grande',small_height:'Alto del nicho pequeño',large_bottom:'Borde de tina → fondo del nicho grande',small_bottom:'Borde de tina → fondo del nicho pequeño',large_top:'Borde de tina → parte superior del nicho grande',small_top:'Borde de tina → parte superior del nicho pequeño',large_top_gap:'Nicho grande → parte superior del muro',small_top_gap:'Nicho pequeño → parte superior del muro',large_left_position:'Nicho grande, borde izquierdo',large_right_position:'Nicho grande, borde derecho',small_left_position:'Nicho pequeño, borde izquierdo',small_right_position:'Nicho pequeño, borde derecho'}
  };
  Object.assign(words.en,{tub:'Tub wall',west:'West wall',westOrientation:'West wall · estimated finished edge to window sill',westCaption:'{west} reported span. Starting finished edge is estimated; wall height is unknown.',westPhotoCaption:'Confirm the starting edge before adding a measurement arrow to these photos.',westUnknown:'Confirm the exact starting edge in the photos. No wall height is assumed.'});
  Object.assign(words.es,{tub:'Muro de la tina',west:'Muro oeste',westOrientation:'Muro oeste · borde terminado estimado al alféizar',westCaption:'Distancia reportada: {west}. El borde terminado inicial es estimado; falta medir la altura del muro.',westPhotoCaption:'Confirma el borde inicial antes de agregar una flecha de medida a estas fotos.',westUnknown:'Confirma en las fotos el borde exacto de inicio. No se supone ninguna altura del muro.'});
  names.en.west_span='Estimated finished edge → sill / tile stop';names.es.west_span='Borde terminado estimado → alféizar / límite del azulejo';
  Object.assign(words.en,{'tub-profile':'Tub',tubOrientation:'Tub · height, depth and tile-stop gap',sideView:'Side view',tubPhotoCaption:'Full photo: {floor} current-floor height and {depth} back wall to outer front. Arrows use approximate photo anchors; photo is not to scale.',tubFlatCaption:'Side measurement profile · equal scale on both axes. Tub shape details are not modeled.',tubDatum:'Height starts at the current photo floor. Finished-floor elevation remains unconfirmed.',tubUnknown:'Wall tile stops at 35″ from North back wall (~2″ past the ~33″ stone apron front) with matching 2″×6″ ceramic bullnose.',tileGapNote:'Locked at 35″ from North wall (~2″ vertical ceramic bullnose drop past ~33″ stone apron).'});
  Object.assign(words.es,{'tub-profile':'Tina',tubOrientation:'Tina · altura, fondo y separación al límite del azulejo',sideView:'Vista lateral',tubPhotoCaption:'Foto completa: {floor} de alto desde el piso actual y {depth} del muro posterior al frente exterior. Las flechas usan puntos aproximados; la foto no está a escala.',tubFlatCaption:'Perfil lateral de medidas · misma escala en ambos ejes. No muestra los detalles de la forma de la tina.',tubDatum:'La altura parte del piso actual de la foto. El nivel del piso terminado sigue sin confirmarse.',tubUnknown:'El azulejo termina a 35″ del muro norte (~2″ pasando el frente de piedra de ~33″) con bullnose cerámico 2″×6″.',tileGapNote:'Definido a 35″ del muro norte (~2″ de bullnose cerámico pasando el frente de ~33″).'});
  Object.assign(names.en,{tub_height:'Current floor → tub/stone rim',tub_depth:'Tub depth · back wall → outer front',tub_across:'Across-tub length · left to right',tile_gap:'Outer front tub edge → tile stop'});
  Object.assign(names.es,{tub_height:'Piso actual → borde de tina/piedra',tub_depth:'Fondo de tina · muro posterior → frente exterior',tub_across:'Largo de tina · izquierda a derecha',tile_gap:'Frente exterior de tina → límite del azulejo'});
  Object.assign(words.en,{room:'Whole room',roomOrientation:'Whole bathroom · Magicplan baseline + field corrections',roomCaption:'1:1 equal scale · 72-1/8″ × 82-1/8″ Magicplan room with 28″ outward-swing hallway door.',roomUnknown:'Verify hinge swing direction & hallway clearance on site before door framing lock; measure niche depths before cutting.'});
  Object.assign(words.es,{room:'Todo el baño',roomOrientation:'Baño completo · base de Magicplan + correcciones de obra',roomCaption:'Escala real 1:1 · Cuarto de 72-1/8″ × 82-1/8″ con puerta abatible de 28″ hacia el pasillo.',roomUnknown:'Verificar giro de bisagras y espacio en pasillo antes de fijar marco; medir profundidad de nichos en obra.'});
  const text = key => {
    let value=words[ui.lang][key];
    if(data&&derived){
      const ref=id=>data.unplaced_references.find(r=>r.id===id);
      const originalInterval=data.sources.small_vertical.interval_in;
      const values={floor:M.format(derived.dimensions.tub_height.value),west:M.format(derived.dimensions.west_span.value),lo:M.format(originalInterval[0]),hi:M.format(originalInterval[1]),top:M.format(derived.dimensions.small_top.value,true),casing:M.format(ref('casing_space').value_in,true),sill:M.format(ref('sill_reference').value_in,true),depth:M.format(derived.dimensions.tub_depth.value,true)};
      for(const [name,replacement] of Object.entries(values)) value=value.replaceAll('{'+name+'}',replacement);
    }
    return value;
  };
  words.en.westPhotoCaption='Doorway-side estimated finished edge → window sill / tile stop. Dashed line marks the estimated start; photo is not to scale.';
  words.es.westPhotoCaption='Borde terminado estimado junto a la puerta → alféizar / límite del azulejo. La línea punteada marca el inicio estimado; la foto no está a escala.';
  words.en.westUnknown='Starting finished plane remains estimated. Wall height has not been measured.';
  words.es.westUnknown='El plano terminado inicial sigue siendo estimado. Falta medir la altura del muro.';
  function el(name,attrs={},content) {
    const item=document.createElementNS(NS,name);
    for (const [k,v] of Object.entries(attrs)) item.setAttribute(k,String(v));
    if (content!==undefined) item.textContent=content;
    return item;
  }
  function svgBase(viewBox) {
    const svg=el('svg',{viewBox:viewBox.join(' '),preserveAspectRatio:'xMidYMid meet',role:'img','aria-label':text('title')});
    const defs=el('defs');
    for (const [id,color] of [['arrow','#17495e'],['height-arrow','#7e4200']]) {
      const marker=el('marker',{id,viewBox:'0 0 10 10',refX:5,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse',markerUnits:'strokeWidth'});
      marker.append(el('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:color}));defs.append(marker);
    }
    svg.append(defs);return svg;
  }
  function dimension(svg,id,a,b,options={}) {
    const d=derived.dimensions[id], height=d.group==='heights';
    const g=el('g',{'data-dimension':id,class:(height?'height-dim ':'')+(ui.selected===id?'highlight':'')});
    g.append(el('title',{},names[ui.lang][id]+': '+M.format(d.value,d.approximate)));
    const marker=height?'height-arrow':'arrow';
    g.append(el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'dim-line','marker-start':'url(#'+marker+')','marker-end':'url(#'+marker+')'}));
    // Dots mark the exact edge endpoints even when the arrowheads extend past them.
    for(const p of [a,b])g.append(el('circle',{cx:p[0],cy:p[1],r:2.5,class:'edge-dot'}));
    g.append(el('text',{x:(a[0]+b[0])/2+(options.dx||0),y:(a[1]+b[1])/2+(options.dy??-13),class:'dim-text','text-anchor':options.anchor||'middle','dominant-baseline':'middle'},M.format(d.value,d.approximate)));
    svg.append(g);
  }
  function atY(a,b,y){const t=(y-a[1])/(b[1]-a[1]);return[a[0]+t*(b[0]-a[0]),y];}
  function atX(a,b,x){const t=(x-a[0])/(b[0]-a[0]);return[x,a[1]+t*(b[1]-a[1])];}
  function photo() {
    const p=data.photo.anchors_px, svg=svgBase(data.photo.view_box);
    svg.setAttribute('data-view','photo');
    svg.append(el('image',{href:asset(data.photo.asset),x:0,y:0,width:data.photo.width_px,height:data.photo.height_px}));
    for(const id of ['large','small'])svg.append(el('polygon',{points:[p[id+'_tl'],p[id+'_tr'],p[id+'_br'],p[id+'_bl']].map(a=>a.join(',')).join(' '),class:'photo-outline'}));
    if(ui.layer!=='heights') {
      dimension(svg,'wall_width',p.wall_tl,p.wall_tr,{dy:-26});
      const y=856, edges=[atY(p.wall_tl,p.wall_bl,y),atY(p.large_tl,p.large_bl,y),atY(p.large_tr,p.large_br,y),atY(p.small_tl,p.small_bl,y),atY(p.small_tr,p.small_br,y),atY(p.wall_tr,p.wall_br,y)];
      derived.chain.segment_ids.forEach((id,i)=>dimension(svg,id,edges[i],edges[i+1],{dy:i%2?-22:23}));
    }
    if(ui.layer!=='widths') {
      dimension(svg,'wall_height',p.wall_tr,p.wall_br,{dx:62,dy:0});
      for(const id of ['large','small']) {
        const side=id==='large'?'l':'r', top=p[id+'_t'+side], bottom=p[id+'_b'+side];
        const dx=id==='large'?-42:45;
        dimension(svg,id+'_height',top,bottom,{dx,dy:ui.layer==='all'&&id==='large'?-65:0});
        dimension(svg,id+'_top_gap',atX(p.wall_tl,p.wall_tr,top[0]),top,{dx,dy:0});
        dimension(svg,id+'_bottom',bottom,atX(p.wall_bl,p.wall_br,bottom[0]),{dx,dy:0});
      }
    }
    return svg;
  }
  function flat() {
    const s=8.5,pad=112,w=derived.wall.right,h=derived.wall.top;
    const canvasWidth=Math.round(w*s+224),canvasHeight=Math.round(h*s+210);
    const svg=svgBase([0,0,canvasWidth,canvasHeight]);svg.setAttribute('data-view','flat');
    const pt=(x,z)=>[pad+x*s,75+(h-z)*s];
    svg.append(el('rect',{x:0,y:0,width:canvasWidth,height:canvasHeight,fill:'#ecefed'}));
    svg.append(el('rect',{x:pad,y:75,width:w*s,height:h*s,fill:'#fafbf9',stroke:'#53625d','stroke-width':2}));
    for(const id of ['large','small']){
      const r=derived[id];svg.append(el('rect',{'data-shape':id,x:pt(r.left,r.top)[0],y:pt(r.left,r.top)[1],width:(r.right-r.left)*s,height:(r.top-r.bottom)*s,class:'niche-outline'}));
    }
    if(ui.layer!=='heights'){
      dimension(svg,'wall_width',[pad,37],[pad+w*s,37]);
      const row=75+h*s+40;
      derived.chain.segment_ids.forEach((id,i)=>{
        const a=derived.chain.point_x[i],b=derived.chain.point_x[i+1];
        svg.append(el('line',{x1:pad+a*s,y1:75+h*s,x2:pad+a*s,y2:row+8,stroke:'#98a6a0'}));
        dimension(svg,id,[pad+a*s,row],[pad+b*s,row],{dy:i%2?-22:28});
      });
      svg.append(el('line',{x1:pad+w*s,y1:75+h*s,x2:pad+w*s,y2:row+8,stroke:'#98a6a0'}));
    }
    if(ui.layer!=='widths'){
      dimension(svg,'wall_height',[45,75],[45,75+h*s],{dx:0,dy:0});
      for(const id of ['large','small']){
        const r=derived[id],x=id==='large'?r.left:r.right,dx=id==='large'?-36:36;
        dimension(svg,id+'_height',pt(x,r.top),pt(x,r.bottom),{dx,dy:0});
        dimension(svg,id+'_top_gap',pt(x,h),pt(x,r.top),{dx,dy:0});
        dimension(svg,id+'_bottom',pt(x,r.bottom),pt(x,0),{dx,dy:0});
      }
    }
    return svg;
  }
  function tubView(){
    if(ui.view==='photo'){
      const svg=svgBase([0,0,data.photo.width_px,data.photo.height_px]),p=data.tub.photo_anchors_px;
      svg.setAttribute('data-view','tub-photo');svg.append(el('image',{href:asset(data.photo.asset),width:data.photo.width_px,height:data.photo.height_px}));
      dimension(svg,'tub_height',p.height_start,p.height_end,{dx:-70,dy:0});
      dimension(svg,'tub_depth',p.depth_start,p.depth_end,{dx:60,dy:-15});
      return svg;
    }
    const r=M.bounds(data,'tub_side'),s=12,pad=80,top=70,w=(r.right-r.left)*s,h=(r.top-r.bottom)*s;
    const svg=svgBase([0,0,w+160,h+140]);svg.setAttribute('data-view','tub-side');
    svg.append(el('rect',{x:0,y:0,width:w+160,height:h+140,fill:'#ecefed'}));
    svg.append(el('rect',{'data-shape':'tub_side',x:pad,y:top,width:w,height:h,class:'niche-outline'}));
    dimension(svg,'tub_depth',[pad,35],[pad+w,35],{dy:-16});
    dimension(svg,'tub_height',[35,top],[35,top+h],{dy:0});
    svg.append(el('line',{x1:pad-10,y1:top+h,x2:pad+w+10,y2:top+h,stroke:'#53625d','stroke-width':3}));
    return svg;
  }
  function table(ids,caption) {
    const t=document.createElement('table');t.className='measurement-table';
    if(caption){const c=document.createElement('caption');c.textContent=caption;t.append(c);}
    const head=document.createElement('thead');head.innerHTML='<tr><th scope="col"></th><th scope="col"></th></tr>';
    head.querySelectorAll('th')[0].textContent=text('distance');head.querySelectorAll('th')[1].textContent=text('reading');t.append(head);
    const body=document.createElement('tbody');
    for(const id of ids){
      const d=derived.dimensions[id],row=document.createElement('tr');row.dataset.dim=id;
      const label=document.createElement('td'),value=document.createElement('td');label.textContent=names[ui.lang][id];value.textContent=M.format(d.value,d.approximate);row.append(label,value);body.append(row);
      row.addEventListener('click',()=>{ui.selected=id;renderDrawing();});
    }
    t.append(body);return t;
  }
  function renderDrawing(){
    let graphic;
    if(ui.wall==='room')graphic=BathroomRoomView.render(data,ui.lang);
    else if(ui.wall==='tub-profile')graphic=tubView();
    else if(ui.wall==='west'){
      if(ui.view==='flat'){
        graphic=svgBase([0,0,600,180]);graphic.setAttribute('data-view','west-segment');
        graphic.append(el('rect',{width:600,height:180,fill:'#ecefed'}));
        dimension(graphic,'west_span',[65,105],[65+derived.dimensions.west_span.value*10,105],{dy:-24});
      }else{
        graphic=document.createElement('div');graphic.className='west-photos';
        const west=data.wall_segments.west,anchors=west.photo_anchors_px;
        if(anchors){
          const photoSvg=svgBase([0,0,anchors.width_px,anchors.height_px]);photoSvg.setAttribute('data-view','west-photo');
          photoSvg.append(el('image',{href:asset(west.photos.find(p=>p.filename===anchors.filename).asset),width:anchors.width_px,height:anchors.height_px}));
          photoSvg.append(el('line',{x1:anchors.start[0],y1:anchors.start[1]-100,x2:anchors.start[0],y2:anchors.start[1]+100,stroke:'#fff','stroke-width':6,'stroke-dasharray':'15 10'}));
          dimension(photoSvg,'west_span',anchors.start,anchors.end,{dy:-35});graphic.append(photoSvg);
        }
        for(const photo of west.photos.filter(p=>!anchors||p.filename!==anchors.filename)){
          const a=document.createElement('a');a.href=photo.original_url;a.target='_blank';a.rel='noopener';
          const img=document.createElement('img');img.src=asset(photo.asset);img.alt=photo.filename;img.loading='lazy';a.append(img);graphic.append(a);
        }
      }
    }else graphic=ui.view==='photo'?photo():flat();
    document.getElementById('drawing').replaceChildren(graphic);
    document.getElementById('drawing').style.width=ui.zoom+'%';
    document.getElementById('viewport').classList.toggle('room-focus',ui.wall==='room'&&ui.zoom===100);
    document.getElementById('caption').textContent=text(ui.wall==='room'?'roomCaption':ui.wall==='tub-profile'?(ui.view==='photo'?'tubPhotoCaption':'tubFlatCaption'):ui.wall==='west'?(ui.view==='photo'?'westPhotoCaption':'westCaption'):(ui.view==='photo'?'photoCaption':'flatCaption'));
  }
  function render(){
    derived=M.derive(data);
    document.documentElement.lang=ui.lang;document.documentElement.dataset.theme=ui.theme;
    document.title=text('title')+' · Unit 4';
    document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=text(el.dataset.i18n);});
    const langBtn=document.getElementById('language');if(langBtn)langBtn.textContent=ui.lang==='en'?'Español (MX)':'English (EN)';
    const thBtn=document.getElementById('theme');if(thBtn)thBtn.textContent=text(ui.theme==='light'?'dark':'light');
    document.querySelectorAll('[data-wall]').forEach(b=>{b.textContent=text(b.dataset.wall);b.setAttribute('aria-pressed',b.dataset.wall===ui.wall);});
    document.getElementById('orientation').textContent=text(ui.wall==='room'?'roomOrientation':ui.wall==='tub-profile'?'tubOrientation':ui.wall==='west'?'westOrientation':'orientation');
    document.getElementById('layers').hidden=ui.wall!=='tub';
    document.getElementById('views').hidden=ui.wall==='room';
    document.getElementById('viewport').classList.toggle('tub-focus',ui.wall==='tub-profile');
    const tgEl=document.getElementById('tile-gap');if(tgEl)tgEl.hidden=true;
    document.getElementById('tile-gap-label').textContent=names[ui.lang].tile_gap;
    document.getElementById('tile-gap-note').textContent=text('tileGapNote');
    document.querySelector('button[data-view=flat]').textContent=ui.wall==='tub-profile'?text('sideView'):text('flat');
    if(ui.wall==='tub-profile')document.getElementById('datum-note').textContent=text('tubDatum');
    document.getElementById('datum-note').hidden=['west','room'].includes(ui.wall);
    document.querySelector('[data-i18n="unknown"]').textContent=text(ui.wall==='room'?'roomUnknown':ui.wall==='tub-profile'?'tubUnknown':ui.wall==='west'?'westUnknown':'unknown');
    document.querySelectorAll('[data-view]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',b.dataset.view===ui.view);});
    document.querySelectorAll('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.layer===ui.layer));
    document.getElementById('views').setAttribute('aria-label',ui.lang==='en'?'View':'Vista');
    document.getElementById('layers').setAttribute('aria-label',text('readings'));
    renderDrawing();
    const readings=document.getElementById('measurements');readings.replaceChildren();
    const widths=['wall_width',...derived.chain.segment_ids];
    const heights=['wall_height','large_height','small_height','large_bottom','small_bottom','large_top','small_top','large_top_gap','small_top_gap'];
    if(ui.wall==='room')readings.append(BathroomRoomView.summary(data,ui.lang));
    else if(ui.wall==='tub-profile')readings.append(table(['tub_height','tub_depth','tub_across','tile_gap']));
    else if(ui.wall==='west') readings.append(table(['west_span']));
    else {
      if(ui.layer!=='heights')readings.append(table(widths));
      if(ui.layer!=='widths')readings.append(table(heights));
      if(ui.layer!=='heights')readings.append(table(['large_left_position','large_right_position','small_left_position','small_right_position'],text('positions')));
    }
    const sources=document.getElementById('sources');sources.replaceChildren();
    for(const line of [text('photoSource')+': '+data.sources.photo.filename,text('provisional'),text('otherRefs')]){const p=document.createElement('p');p.textContent=line;sources.append(p);}
    const list=document.createElement('ul');
    for(const [id,source] of Object.entries(data.sources)){
      if(id==='photo')continue;const files=source.filenames||[source.filename].filter(Boolean);
      if(files.length){const li=document.createElement('li');li.textContent=files.join(' · ');list.append(li);}
    }
    sources.append(list);
    for(const photo of data.tub.evidence_photos){
      const figure=document.createElement('figure'),caption=document.createElement('figcaption'),img=document.createElement('img');
      caption.textContent=photo.filename;img.src=asset(photo.asset);img.alt=photo.filename;img.loading='lazy';img.style.width='100%';figure.append(caption,img);sources.append(figure);
    }
    for(const photo of data.wall_segments.west.photos){const p=document.createElement('p'),a=document.createElement('a');a.href=photo.original_url;a.textContent=photo.filename;a.target='_blank';a.rel='noopener';p.append(a);sources.append(p);}
    const cnEl=document.getElementById('chain-note');if(cnEl)cnEl.textContent=text('chain');
    if(window.U4ZoomPan&&typeof window.U4ZoomPan.attach==='function'){try{window.U4ZoomPan.attach();}catch(_){}}if(window.U4PinDragger&&typeof window.U4PinDragger.attach==='function'){try{window.U4PinDragger.attach();}catch(_){}}
  }
  function getScaleInfo(){
    const svg=document.querySelector('#drawing svg');
    if(ui.wall==='west')return{view:ui.view,dimensionCount:1,isTrueScale:false,scaleX:ui.view==='flat'?svg.getBoundingClientRect().width/600*10:null,scaleY:null,reason:'One horizontal span; height is unknown. Photo placement is approximate and the future finished start plane remains estimated.'};
    if(ui.wall!=='room'&&ui.view==='photo')return{view:'photo',isTrueScale:false,scaleX:null,scaleY:null,reason:'Perspective photo; anchors only. No pixel-to-inch conversion.'};
    const box=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;
    const base=ui.wall==='tub-profile'?12:8;
    const scale=Math.min(box.width/vb.width,box.height/vb.height)*base;
    return{view:'flat',isTrueScale:true,unit:'in',basePixelsPerInch:base,scaleX:scale,scaleY:scale,zoom:ui.zoom/100};
  }
  try {
    const embedded=document.getElementById('u4plan-seed');
    if(window.U4_BATHROOM_SEED)data=M.clone(window.U4_BATHROOM_SEED);
    else if(embedded)data=JSON.parse(embedded.textContent);
    else{const response=await fetch('../../content/data/bathroom-plan-data.json');if(!response.ok)throw new Error('Measurement seed unavailable.');data=await response.json();}
    M.validate(data);BathroomRoomModel.validate(data);render();
    document.querySelectorAll('button[data-wall]').forEach(button=>button.addEventListener('click',()=>{ui.wall=button.dataset.wall;ui.view=(ui.wall==='room'||ui.wall==='west')?'flat':'photo';ui.selected=null;ui.zoom=100;render();}));
    document.querySelectorAll('button[data-view]').forEach(button=>button.addEventListener('click',()=>{ui.view=button.dataset.view;ui.selected=null;render();}));
    document.querySelectorAll('button[data-layer]').forEach(button=>button.addEventListener('click',()=>{ui.layer=button.dataset.layer;ui.selected=null;render();}));
    if(document.getElementById('language'))document.getElementById('language').addEventListener('click',()=>{ui.lang=ui.lang==='en'?'es':'en';render();});
    if(document.getElementById('theme'))document.getElementById('theme').addEventListener('click',()=>{ui.theme=ui.theme==='light'?'dark':'light';render();});
    window.U4PlanControl={
      getState:()=>({wall:ui.wall,view:ui.view,layer:ui.layer,summary:'Wall='+ui.wall+', View='+ui.view}),
      showView:args=>{
        if(!args)return;
        if(args.wall&&['room','tub','tub-profile','west'].includes(String(args.wall)))ui.wall=String(args.wall);
        if(args.view&&['photo','flat'].includes(String(args.view)))ui.view=String(args.view);
        else if(args.wall)ui.view=(ui.wall==='room'||ui.wall==='west')?'flat':'photo';
        render();
      }
    };
    if(window.U4PlanNav&&document.getElementById('u4hTopbar')){
      window.U4PlanNav.init({
        planId:'bathroom-measurements',
        headerEl:document.getElementById('u4hTopbar'),
        onLangChange:l=>{ui.lang=l==='es'?'es':'en';render();if(window.U4LiveAi&&typeof window.U4LiveAi.refreshPrompts==='function')window.U4LiveAi.refreshPrompts();},
        onThemeChange:th=>{ui.theme=th==='dark'?'dark':'light';document.documentElement.setAttribute('data-theme',ui.theme);render();}
      });
      ui.lang=window.U4PlanNav.getLang()==='es'?'es':'en';
      ui.theme=window.U4PlanNav.getTheme()==='dark'?'dark':'light';
      render();
    }
    if(window.U4LiveAi&&typeof window.U4LiveAi.init==='function'){
      window.U4LiveAi.init({
        planId:'bathroom-measurements',
        room:'bathroom',
        titleEn:'Bathroom Wall, Tub & Room Renderings',
        titleEs:'Baño: Planos de Muros, Tina y Cuarto',
        getContext:()=>'Wall='+ui.wall+', View='+ui.view+', Layer='+ui.layer,
        quickPrompts:lang=>lang==='es'
          ?['¿Cuánto mide el muro de fondo de la tina?','¿Cómo abre la puerta del baño?','¿Qué medidas faltan confirmar en los nichos?']
          :['How wide is the back tub wall?','How does the bathroom entry door swing?','What niche measurements still need site verification?']
      });
    }
    if(document.getElementById('zoom'))document.getElementById('zoom').addEventListener('input',event=>{ui.zoom=Number(event.target.value);if(document.getElementById('zoom-value'))document.getElementById('zoom-value').value=ui.zoom+'%';renderDrawing();});
    if(document.getElementById('reset-zoom'))document.getElementById('reset-zoom').addEventListener('click',()=>{ui.zoom=100;renderDrawing();});
    window.U4PLAN={
      ready:true,id:'bathroom-measurements',planId:data.plan_id,getLang:()=>ui.lang,setLang:l=>{ui.lang=l==='es'?'es':'en';render();},getState:()=>M.clone(data),getDerived:()=>M.clone(derived),getScaleInfo,
      getViewState:()=>({...ui}),getRoom:()=>BathroomRoomModel.derive(data),render,
      setWall:wall=>{if(!['room','tub','tub-profile','west'].includes(wall))throw new Error('Unknown wall');ui.wall=wall;render();},
      setView:view=>{if(!['photo','flat'].includes(view))throw new Error('Unknown view');ui.view=view;render();},
      setLayer:layer=>{if(!['widths','heights','all'].includes(layer))throw new Error('Unknown layer');ui.layer=layer;render();},
      applyLocalPatch:patch=>{data=M.patch(data,patch);render();return M.clone(data);}
    };
    window.dispatchEvent(new CustomEvent('u4plan:ready',{detail:{planId:data.plan_id,draft:true}}));
  } catch(error){
    const alert=document.getElementById('error');alert.hidden=false;alert.textContent=text('error');console.error(error);
  }
})();
