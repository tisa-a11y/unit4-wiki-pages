(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.BathroomModel = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  function bounds(data, id) {
    const points = data.rectangles[id].point_ids.map(key => data.points[key]);
    return {left: Math.min(...points.map(p => p.x)), right: Math.max(...points.map(p => p.x)),
      bottom: Math.min(...points.map(p => p.z)), top: Math.max(...points.map(p => p.z))};
  }
  function validate(data) {
    if (data.units !== 'in') throw new Error('Expected inch coordinates.');
    for (const id of ['wall', 'large', 'small', ...(data.rectangles.tub_side?['tub_side']:[])]) {
      const ids = data.rectangles[id]?.point_ids;
      if (!ids || ids.length !== 4) throw new Error('Four corners required: ' + id);
      const ps = ids.map(key => data.points[key]);
      if (ps.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.z))) throw new Error('Numeric coordinates required.');
      const [bl, br, tr, tl] = ps;
      if (!(bl.x === tl.x && br.x === tr.x && bl.z === br.z && tl.z === tr.z && br.x > bl.x && tl.z > bl.z)) throw new Error('Invalid rectangle: ' + id);
    }
    const w = bounds(data, 'wall'), a = bounds(data, 'large'), b = bounds(data, 'small');
    if (w.left !== 0 || w.bottom !== 0) throw new Error('Keep the named origin at zero.');
    for (const r of [a, b]) if (r.left < w.left || r.right > w.right || r.bottom < 0 || r.top > w.top) throw new Error('Niche must remain within wall.');
    if (a.right >= b.left) throw new Error('Niches must keep a positive gap.');
    if (!data.photo.not_to_scale) throw new Error('Photo must be marked not to scale.');
    if(data.tub){const r=bounds(data,'tub_side');if(r.left!==0||r.top!==0||r.bottom>=0)throw new Error('Tub profile keeps back wall x=0 and rim z=0; current floor is below rim.');}
    if (data.wall_segments?.west) {
      const [a,b]=data.wall_segments.west.point_ids.map(id=>data.points[id]);
      if (![a.x,b.x].every(Number.isFinite) || a.x!==0 || b.x<=a.x || a.z!==null || b.z!==null) throw new Error('West span requires zero origin, positive width and unknown z.');
    }
    return true;
  }
  function derive(data) {
    validate(data);
    const w = bounds(data, 'wall'), a = bounds(data, 'large'), b = bounds(data, 'small');
    const result = {};
    const add = (id, start, end, axis, approximate, group) => {
      const from = data.points[start], to = data.points[end];
      result[id] = {id, from: start, to: end, axis, value: Number.isFinite(from[axis])&&Number.isFinite(to[axis])?Math.abs(to[axis] - from[axis]):null, approximate, group};
    };
    add('wall_width','wall_bl','wall_br','x',false,'widths');
    add('wall_height','wall_bl','wall_tl','z',false,'heights');
    add('left_gap','wall_bl','large_bl','x',true,'widths');
    add('large_width','large_bl','large_br','x',true,'widths');
    add('between_gap','large_br','small_bl','x',true,'widths');
    add('small_width','small_bl','small_br','x',true,'widths');
    add('right_gap','small_br','wall_br','x',true,'widths');
    for (const id of ['large','small']) {
      add(id+'_height',id+'_bl',id+'_tl','z',true,'heights');
      add(id+'_bottom','wall_bl',id+'_bl','z',true,'heights');
      add(id+'_top','wall_bl',id+'_tl','z',true,'heights');
      add(id+'_top_gap',id+'_tl','wall_tl','z',true,'heights');
      add(id+'_left_position','wall_bl',id+'_bl','x',true,'widths');
      add(id+'_right_position','wall_bl',id+'_br','x',true,'widths');
    }
    const chainIds = ['left_gap','large_width','between_gap','small_width','right_gap'];
    if(data.wall_segments?.west) add('west_span','west_estimated_finished_edge','west_window_sill_tile_stop','x',false,'widths');
    if(data.tub){
      add('tub_depth','tub_side_tl','tub_side_tr','x',true,'widths');
      add('tub_height','tub_side_bl','tub_side_tl','z',false,'heights');
      add('tub_across','tub_across_left','tub_across_right','x',false,'widths');
      add('tile_gap','tub_side_tr','shower_tile_stop','x',false,'widths');
    }
    return {dimensions:result, wall:w, large:a, small:b, chain:{point_x:[0,a.left,a.right,b.left,b.right,w.right],
      segment_ids:chainIds, total:chainIds.reduce((sum,id)=>sum+result[id].value,0), overall:w.right-w.left,
      residual:chainIds.reduce((sum,id)=>sum+result[id].value,0)-(w.right-w.left)}};
  }
  function format(value, approximate=false) {
    if(value===null)return '?';
    const number = approximate ? Math.round(value * 4) / 4 : value;
    const whole = Math.floor(number), numerator = Math.round((number-whole)*16);
    const fractions = {1:'1/16',2:'⅛',3:'3/16',4:'¼',5:'5/16',6:'⅜',7:'7/16',8:'½',9:'9/16',10:'⅝',11:'11/16',12:'¾',13:'13/16',14:'⅞',15:'15/16'};
    const fraction = fractions[numerator] || '';
    return (approximate?'≈ ':'') + (whole || !fraction ? whole : '') + (fraction ? (whole && fraction.includes('/')?' ':'') + fraction : '') + '″';
  }
  function patch(data, patchValue) {
    if (!patchValue || Object.keys(patchValue).some(k=>k!=='points')) throw new Error('Only named-point local patches are supported.');
    const next = clone(data), changes = patchValue.points || {}, operations = new Map();
    for (const [key, change] of Object.entries(changes)) {
      if (!next.points[key]) throw new Error('Unknown point: '+key);
      for (const [axis,value] of Object.entries(change)) {
        if (!['x','z'].includes(axis) || !Number.isFinite(value)) throw new Error('Patches accept finite x/z values only.');
        const rect = Object.values(next.rectangles).find(r=>r.point_ids.includes(key));
        // A rectangle edge is shared by two corners. Moving one corner's axis moves that whole edge.
        if (!rect && axis==='z') throw new Error('West-wall height is unknown; do not fabricate z.');
        const companions = rect ? rect.point_ids.filter(id=>next.points[id][axis]===next.points[key][axis]) : [key];
        for (const id of companions) {
          const op = id+':'+axis;
          if (operations.has(op) && operations.get(op)!==value) throw new Error('Conflicting changes on one edge.');
          operations.set(op,value);
        }
      }
    }
    for (const [op,value] of operations) {
      const [id,axis]=op.split(':'); next.points[id][axis]=value;
      next.points[id].local_override = true;
      if (axis==='z') delete next.points[id].z_interval_in;
    }
    validate(next);
    return next;
  }
  return {clone,bounds,validate,derive,format,patch};
});
