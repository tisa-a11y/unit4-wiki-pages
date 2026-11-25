(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BathroomRoomModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const rank={model:10,field_photo:20,owner:30,accepted_baseline:100};
 const safeId=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(x)&&!['constructor','prototype','__proto__'].includes(x);
 const convert=(value,from,to='in')=>{if(value===null)return null;const m={in:.0254,m:1,mm:.001,cm:.01};if(!Number.isFinite(value)||!m[from]||!m[to])throw Error('Invalid unit conversion');return value*m[from]/m[to];};
 const finiteOrNull=x=>x===null||Number.isFinite(x);
 function validate(data){
  const r=data.room_model;if(!r||r.version!==1||data.units!=='in')throw Error('Room schema/version/units invalid');
  for(const key of ['project_id','plan_id','floor_uid','room_uid'])if(!r.identity[key])throw Error('Missing source identity: '+key);
  if(r.baseline.immutable!==true||r.baseline.source_room.uid!==r.identity.room_uid)throw Error('Baseline identity/immutability invalid');
  if(r.frame.id!=='room_plan'||r.frame.unit!=='in'||r.frame.cardinal_rotation_degrees!==null)throw Error('Room frame must preserve unknown compass registration');
  const ids=new Set();
  for(const [id,p] of Object.entries(data.points)){
   if(!safeId(id)||p.unit!=='in')throw Error('Invalid point identity/unit: '+id);
   for(const a of ['x','y','z'])if(a in p&&!finiteOrNull(p[a]))throw Error('Point coordinates must be finite or null: '+id);
  }
  for(const id of r.outline.point_ids){const p=data.points[id];if(!p||p.coordinate_system!=='room_plan'||!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('Missing room outline point');}
  if(r.outline.point_ids.length!==4)throw Error('Four accepted room corners required');
  const [a,b,c,d]=r.outline.point_ids.map(id=>data.points[id]);
  if(!(a.x===0&&a.y===0&&b.y===0&&d.x===0&&b.x===c.x&&c.y===d.y&&b.x>0&&c.y>0))throw Error('Invalid accepted room envelope');
  for(const item of [...r.walls,...r.fixtures,...r.openings]){if(!safeId(item.id)||ids.has(item.id))throw Error('Duplicate/invalid room object ID');ids.add(item.id);}
  for(const w of r.walls)if(!data.points[w.from]||!data.points[w.to])throw Error('Unknown wall endpoint');
  const objects=new Map(r.baseline.source_room.objects.map(x=>[x.uid,x]));
  for(const o of [...r.fixtures,...r.openings])if(!objects.has(o.baseline_object_uid)||o.magicplan_uid!==o.baseline_object_uid)throw Error('Source object identity changed');
  for(const g of Object.values(r.point_groups))if(!g.frame||!Array.isArray(g.point_ids)||g.point_ids.some(id=>!data.points[id]))throw Error('Unknown measurement group point');
  for(const o of r.openings)if(!r.walls.some(w=>w.id===o.wall_id))throw Error('Unknown opening wall');
  for(const key of ['window','medicine_cabinet'])if(r.decisions[key].replacement_product===undefined||r.decisions[key].replacement_dimensions===undefined)throw Error('Unknown replacement must be explicit null');
  return true;
 }
 function svgPoint(data,matrix,x=0,y=0){
  const f=data.room_model.frame,[a,b,c,d,tx,ty]=matrix,[s,, ,sy,ox,oy]=f.source_svg_root_matrix;
  return {x:convert((a*x+c*y+tx-ox)/s-f.source_native_origin[0],'m'),y:convert((b*x+d*y+ty-oy)/sy-f.source_native_origin[1],'m')};
 }
 function derive(data){
  validate(data);const r=data.room_model,objects=new Map(r.baseline.source_room.objects.map(x=>[x.uid,x]));
  const outline=r.outline.point_ids.map(id=>({id,x:data.points[id].x,y:data.points[id].y}));
  const walls=r.walls.map(w=>({...w,start:clone(data.points[w.from]),end:clone(data.points[w.to]),length:Math.hypot(data.points[w.to].x-data.points[w.from].x,data.points[w.to].y-data.points[w.from].y)}));
  const fixtures=r.fixtures.map(f=>{const raw=objects.get(f.baseline_object_uid),m=r.baseline.svg_object_transforms[f.id].matrix,w=Number(raw.fields.width),d=Number(raw.fields.depth),polygon=[[0,0],[w,0],[w,d],[0,d]].map(([x,y])=>svgPoint(data,m,x,y));
   return {...f,x:Math.min(...polygon.map(p=>p.x)),y:Math.min(...polygon.map(p=>p.y)),width:Math.max(...polygon.map(p=>p.x))-Math.min(...polygon.map(p=>p.x)),depth:Math.max(...polygon.map(p=>p.y))-Math.min(...polygon.map(p=>p.y)),symbol_width:convert(w,'m'),symbol_depth:convert(d,'m'),symbol_height:convert(Number(raw.fields.height),'m'),rotation:Math.atan2(m[1],m[0])*180/Math.PI,polygon};});
  const openings=r.openings.map(o=>{const raw=objects.get(o.baseline_object_uid),width=convert(Number(raw.fields.width),'m'),height=convert(Number(raw.fields.height),'m');let start,end;
   if(o.kind==='door'){[start,end]=r.baseline.svg_door_jambs_native.map(([x,y])=>({x:convert(x-r.frame.source_native_origin[0],'m'),y:convert(y-r.frame.source_native_origin[1],'m')}));}
   else {const m=r.baseline.svg_object_transforms[o.id].matrix;start=svgPoint(data,m,0,0);end=svgPoint(data,m,Number(raw.fields.width),0);}
   return {...o,start,end,width,height,sill_height:null,current_action:clone(r.decisions[o.current_action_ref])};});
  const measurement=(a,b,axis)=>data.points[a][axis]===null||data.points[b][axis]===null?null:Math.abs(data.points[b][axis]-data.points[a][axis]);
  return {outline,walls,fixtures,openings,measurements:{room_width:measurement('room_back_left','room_back_right','x'),room_depth:measurement('room_back_left','room_entry_left','y'),backer_clear_width:measurement('wall_bl','wall_br','x'),backer_rise:measurement('wall_bl','wall_tl','z'),tub_outer_depth:measurement('tub_side_tl','tub_side_tr','x'),tub_current_floor_height:measurement('tub_side_bl','tub_side_tl','z'),west_span:measurement('west_estimated_finished_edge','west_window_sill_tile_stop','x')},point_groups:clone(r.point_groups),decisions:clone(r.decisions),materials:clone(r.materials)};
 }
 function currentRank(data,p,axis){if(p.precedence)return rank[p.precedence]||10;const ref=typeof p.source==='string'?p.source:p.source?.[axis],kind=data.sources[ref]?.kind||'';return /owner/.test(kind)?30:/photo/.test(kind)?20:10;}
 function addCorrection(data,event){
  validate(data);if(!event||!safeId(event.id)||!event.recorded_at||!data.sources[event.source_id]||!rank[event.precedence]||!event.measure_boundary||!event.confidence)throw Error('Correction provenance required');
  if(data.room_model.corrections.some(x=>x.id===event.id))throw Error('Duplicate correction ID');
  const next=clone(data),before={},added=[],changed=[];
  for(const [id,p] of Object.entries(event.point_additions||{})){
   if(!safeId(id)||next.points[id])throw Error('New point ID already exists/invalid');
   if(!p.coordinate_system||p.unit!=='in'||!['x','z'].every(a=>a in p))throw Error('New point requires named frame, inches and x/z coordinates');
   for(const a of ['x','y','z'])if(a in p&&!finiteOrNull(p[a]))throw Error('New point coordinate must be finite or null');
   next.points[id]={...clone(p),source:event.source_id,measure_boundary:event.measure_boundary,confidence:event.confidence,precedence:event.precedence};before[id]=null;added.push(id);
  }
  for(const [id,axes] of Object.entries(event.point_changes||{})){
   const p=next.points[id];if(!p)throw Error('Unknown point; use point_additions');
   if(next.room_model.outline.point_ids.includes(id))throw Error('Field correction cannot resize accepted room baseline');
   before[id]=clone(p);
   for(const [axis,v] of Object.entries(axes)){if(!['x','y','z'].includes(axis)||!finiteOrNull(v))throw Error('Only typed coordinate changes allowed');if(rank[event.precedence]<currentRank(data,p,axis))throw Error('Lower-precedence correction rejected');p[axis]=v;}
   p.source=event.source_id;p.confidence=event.confidence;p.measure_boundary=event.measure_boundary;p.precedence=event.precedence;changed.push(id);
  }
  for(const [id,g] of Object.entries(event.point_groups||{})){if(!safeId(id)||next.room_model.point_groups[id])throw Error('Point group ID already exists/invalid');next.room_model.point_groups[id]=clone(g);}
  next.room_model.corrections.push({id:event.id,recorded_at:event.recorded_at,kind:'point_update',source_ids:[event.source_id],precedence:event.precedence,measure_boundary:event.measure_boundary,confidence:event.confidence,before,added_point_ids:added,after_point_refs:[...added,...changed]});
  validate(next);return next;
 }
 return {validate,derive,convert,svgPoint,addCorrection};
});
