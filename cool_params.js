// demo configuration parameters
var p = {};

p.std = {};

//define standard beams
p.std.beam1 = {};
p.std.beam1.euler = new THREE.Euler( 0, Math.PI/2, 0);
p.std.beam1.scale = new THREE.Vector3( 3, 3, 24 );
p.std.beam1.position = new THREE.Vector3( 0, 0, 0);
p.std.beam1.tex = "./assets/noise4.png";
p.std.beam1.color= 0x00FF00;
p.std.beam1.num = 1000;
p.std.beam1.photTexPath = "./assets/particle.png";
// p.std.beam1.photTexPath = './assets/photon.svg';
p.std.beam1.photSize = 0.2;
p.std.beam1.lights = {};
p.std.beam1.lights.num = 0;
p.std.beam1.rfactor = 1.3;

//define standard atoms
p.std.atom1 = {};
p.std.atom1.color_g = 0xFF00FF;  //ground state color
p.std.atom1.color_e = 0xFFFFFF;  //excited state color
p.std.atom1.color_phot = 0x00FF00;
p.std.atom1.scale_g = 0.20;  // size when in ground state
p.std.atom1.scale_e = 0.40;   // size in excited state
p.std.atom1.decayProb = 0.1; //base-max
p.std.atom1.exciteProb = 0.2; //base-max
// p.std.atom1.euler = new THREE.Euler( 0, 0, 0);
p.std.atom1.position = new THREE.Vector3( 0, 0, 0);
p.std.atom1.atomTexPath = './assets/particle.png';
p.std.atom1.photTexPath = p.std.atom1.atomTexPath;
// p.std.atom1.photTexPath = './assets/photon.svg';

p.chapter1 = {};
p.chapter1.beams = {};
p.chapter1.beams.slide1 = cloneObj(p.std.beam1);
p.chapter1.beams.slide1.dz = 1/300;
