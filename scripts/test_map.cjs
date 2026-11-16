// Test piecewise linear mapping for 3D y to 2D projUV.y

function createPiecewiseMap(pts) {
  // pts is array of [y3d, projUV_y] sorted descending by y3d
  return function(y) {
    if (y >= pts[0][0]) return pts[0][1];
    if (y <= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const y0 = pts[i][0], uv0 = pts[i][1];
      const y1 = pts[i+1][0], uv1 = pts[i+1][1];
      if (y <= y0 && y >= y1) {
        const t = (y - y1) / (y0 - y1);
        return uv1 + t * (uv0 - uv1);
      }
    }
    return pts[0][1];
  };
}

const footyMap = createPiecewiseMap([
  [0.50, 80/960],
  [0.435, 160/960],
  [0.400, 180/960],
  [0.355, 200/960],
  [0.315, 220/960],
  [0.265, 260/960],
  [0.220, 315/960],
  [0.140, 380/960],
  [0.020, 510/960],
  [-0.190, 630/960],
  [-0.495, 925/960]
]);

console.log('Footy 3D Nose y=0.400 -> pixel Y:', Math.round(footyMap(0.400) * 960)); // Should be 180
console.log('Footy 3D Eyes y=0.435 -> pixel Y:', Math.round(footyMap(0.435) * 960)); // Should be 160
console.log('Footy 3D Mouth y=0.355 -> pixel Y:', Math.round(footyMap(0.355) * 960)); // Should be 200
console.log('Footy 3D Chin y=0.315 -> pixel Y:', Math.round(footyMap(0.315) * 960)); // Should be 220
console.log('Footy 3D Collar y=0.265 -> pixel Y:', Math.round(footyMap(0.265) * 960)); // Should be 260
console.log('Footy 3D Logo y=0.220 -> pixel Y:', Math.round(footyMap(0.220) * 960)); // Should be 315
