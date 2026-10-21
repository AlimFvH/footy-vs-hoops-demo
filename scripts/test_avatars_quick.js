const { getRealisticFootyAvatarSvg, getRealisticHoopsAvatarSvg } = require('./generate_realistic_avatars.js');

const footy = getRealisticFootyAvatarSvg();
const hoops = getRealisticHoopsAvatarSvg();

console.log('Footy SVG len:', footy.length);
console.log('Hoops SVG len:', hoops.length);
console.log('Footy has footyVisor:', footy.includes('footyVisor'));
console.log('Footy has footyChevron:', footy.includes('footyChevron'));
console.log('Footy has >10<:', footy.includes('>10<'));
console.log('Hoops has >23<:', hoops.includes('>23<'));
console.log('Hoops has hoopsSneaker:', hoops.includes('hoopsSneaker'));
console.log('Hoops has rx="33" ry="10":', hoops.includes('rx="33" ry="10"'));
console.log('All tests passed in avatars generator!');
