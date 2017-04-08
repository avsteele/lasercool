/*
author: AV Steele
to be used with three.min.js v84
*/

var DEBUG=false;
// bit of bad form for these all to be globals, but this is a simple demo
var camera1;
var scene1; // will be a THREE.Scene
var renderer1;  // will be a THREE.WebGLRenderer
var controls1;

var slides;
var demo1;
var test;
// var stats = new Stats();
// stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );

var frame=0; //frame counter

///////////////////setup and update functions per demo ////////////

//////testing

var earth,l1, cameraTrack;

function testIni(){
    test=true;
    earth = new Earth(p.content.slide2.earth);
    // scene1.add(earth.getGroup());
    camera1.position.set(0,0,100);
    camera1.rotation.set(0,0,0);
    // camera1.position.z = 100;

    // var ax = new THREE.AxisHelper(10);
    // ax.position.copy( earth.getGroup().position );
    
    // scene1.add(ax);

    controls1 = new THREE.OrbitControls(camera1, renderer1.domElement);

    l1 = new SimpleLaser({euler: new THREE.Euler(0, 0, 0), scale: new THREE.Vector3(1,1,10), tex: "assets/beam_grad_tex.svg"});
    // scene1.add(l1.getGroup());

    var atomTex = new THREE.TextureLoader().load(p.std.atom1.atomTexPath);
    var photTex = new THREE.TextureLoader().load(p.std.atom1.photTexPath);
    for(var a=0;a<5;a++){
        scene1.add((new Atom(p.std.atom1, atomTex, photTex)).getGroup());
    }

    var posTrack = new THREE.CatmullRomCurve3(
        [new THREE.Vector3(-100,100,-100), new THREE.Vector3(0,66,-100),
        new THREE.Vector3(100,33,0), new THREE.Vector3(0,0,50) ]);
    var lookTrack = new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0)]);
    var upTrack = new THREE.CatmullRomCurve3([new THREE.Vector3(0,1,0),new THREE.Vector3(0,1,0)]);
    
    cameraTrack = new objFly( 0.003, posTrack, lookTrack, upTrack, camera1); 

}
var lati = 39.23;
var longi = -77;
function testUpdate(frame){
    // earth.rotateTo(lati, longi);
    // l1.camRot(camera1);
    l1.update(frame, camera1);
    cameraTrack.update();
    // longi+=1.1;
    // lati+=0.33
    controls1.update();
    renderer1.render(scene1, camera1);
    return;
}

/////////////////// INITALIZE /////////////////////////
function init() {

    // initInterface();    // in interface.js
	renderer1 = new THREE.WebGLRenderer({antialias: true});
    renderer1.setPixelRatio( window.devicePixelRatio );
    var drawTo = document.querySelector(".oGLRender");
    while (drawTo.hasChildNodes()) {
        drawTo.removeChild(drawTo.lastChild);
    }
	renderer1.setSize(drawTo.clientWidth, drawTo.clientHeight);
	drawTo.appendChild(renderer1.domElement);
    renderer1.setClearColor( 0x000000, 1 );

    scene1 = new THREE.Scene();

    var axes = new THREE.AxisHelper(10);
    scene1.add(axes);

	// Camera 
    var dims = renderer1.getSize();
    var aspect = dims.width/dims.height;
    camera1 = new THREE.PerspectiveCamera(45, aspect, 1, 500);

    var light = new THREE.AmbientLight( 0x888888);
    scene1.add(light);

    $('nav').on('click', '#navc1', 
        function(event){
            event.preventDefault();
            slides = new Slides(renderer1, camera1, scene1);
            slides.loadSlide(1);
            console.log('load chapter 1');
        }
    );
    $('nav').on('click', '#navc2', 
        function(event){
            event.preventDefault();
            slides = new Slides(renderer1, camera1, scene1);
            slides.loadSlide(3);
            console.log('load chapter 2');
        }
    );

    $('body').hide();
    $('body').fadeIn({duration:600});

    navigator.geolocation.getCurrentPosition(showPosition);
    function showPosition(position) {
        console.log("Latitude: " , position.coords.latitude, 
            "Longitude: ", position.coords.longitude); 
    }

    // testIni();
}
/////////////////////main////////////////////////
function animate(){

    var time = Date.now() * 0.0005;
    frame++;

    requestAnimationFrame(animate);

    if(typeof test !== "undefined")
        testUpdate(frame);

    if(exists(slides)) 
        slides.update(frame);

    // stats.begin();

}