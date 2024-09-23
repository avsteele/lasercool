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
p.std.beam1.num = 3000;
p.std.beam1.photTexPath = "./assets/particle.png";
p.std.beam1.photSize = 0.2;
p.std.beam1.lights = {};
p.std.beam1.lights.num = 0;
p.std.beam1.rfactor = 1.3;
p.std.beam1.dz = 1/300;

//define standard atom
p.std.atom1 = {};
p.std.atom1.color_g = 0xFF00FF;  //ground state color
p.std.atom1.color_e = 0xFFFFFF;  //excited state color
p.std.atom1.color_phot = 0x00FF00;
p.std.atom1.scale_g = 0.20;  // size when in ground state
p.std.atom1.scale_e = .40;   // size in excited state
p.std.atom1.decayProb = 0.1; //base-max
p.std.atom1.exciteProb = 0.2; //base-max
// p.std.atom1.euler = new THREE.Euler( 0, 0, 0);
p.std.atom1.position = new THREE.Vector3( 0, 0, 0);
p.std.atom1.atomTexPath = './assets/particle.png';
p.std.atom1.photTexPath = p.std.atom1.atomTexPath;
// p.std.atom1.photTexPath = './assets/photon.svg';

p.content = {};
///slide 1
p.content.slide1 = {};
p.content.slide1.beam = cloneObj(p.std.beam1);
// p.content.slide1.beam.dz = 1/300;

///slide 2
p.content.slide2 = {};
var sl2scale = 5;
p.content.slide2.earth = {};
var ref = p.content.slide2.earth;
// ref.euler = new THREE.Euler( Math.PI/10, 0, 0);
ref.euler = new THREE.Euler( 0, 0, 0);
ref.scale = new THREE.Vector3( sl2scale, sl2scale, sl2scale);
ref.position = new THREE.Vector3( -5*sl2scale, 0 , 0 );
//special thanks:
//http://www.shadedrelief.com/natural3/pages/textures.html
ref.tex = 'assets/earth_tex_sm.jpg';

p.content.slide2.beam = cloneObj(p.std.beam1);
ref = p.content.slide2.beam;
ref.scale = new THREE.Vector3(0.1, 0.1, 2*5*sl2scale);
// ref.euler.order = "YXZ";
ref.euler = new THREE.Euler( 0, Math.PI/2, 0, 'YXZ');
ref.position.x = -ref.scale.z/2+sl2scale;
ref.opacity = 1.0;
ref.geoOffset = new THREE.Vector3( 0, 0, 0.5);
ref.tex = "assets/beam_grad_tex.svg";

p.content.slide2.sail = {};
ref = p.content.slide2.sail;
ref.position = new THREE.Vector3();
ref.scale = new THREE.Vector3(1,1,1);
ref.euler = new THREE.Euler(0, 0, Math.PI/2);
ref.velocity0 = new THREE.Vector3(0.00,0.0,0);

p.content.slide2.stars = {};
ref = p.content.slide2.stars;
ref.position= new THREE.Vector3();
ref.euler= new THREE.Euler();
ref.scale = new THREE.Vector3(1,1,1);

//// slide 3
p.content.slide3 = {};
p.content.slide3.beam = cloneObj(p.std.beam1);
// p.content.slide3.beam.dz = 1/300;
p.content.slide3.atom = cloneObj(p.std.atom1);
p.content.slide3.maxAtoms = 30;
p.content.slide3.maxY = 8;
p.content.slide3.atom.position.y = -6;
p.content.slide3.atom.velocity = new THREE.Vector3(0,0.01,0);