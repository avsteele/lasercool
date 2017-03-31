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

var currentChapter;
var demo1;
var test;
// var stats = new Stats();
// stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );

var frame=0; //frame counter

///////////////////setup and update functions per demo ////////////

//////testing
// var mouse = { down:false, lastX: 0, lastY:0};
// var cube;
var laser; 
var earth;
var sail;
var raycaster;
var stars;

function testIni(){
    test = true;

    camera1.position.z = 35;

    earth = new Earth(p.chapter1.slide2.earth);
    scene1.add(earth.getGroup());

    var pi = Math.PI;

    laser =  new Laser(p.chapter1.slide2.beam, false, false, false, false );
    laser.getGroup().scale.z = 1e-3;
    // var axes = new THREE.AxisHelper(5);
    // laser.getGroup().add(axes);
    // laser.beam.add(axes);
    scene1.add(laser.getGroup());

    sail = new SolarSail(p.chapter1.slide2.sail);
    scene1.add(sail.getGroup());

    stars = new StarField(p.chapter1.slide2.stars);
    scene1.add(stars.getGroup());

    raycaster = new THREE.Raycaster();

    var mmov = function(x,y, ang2D){
        //reset angle to origin, or may get strange accumulation errors that flip
        //   unrelated axes
        laser.getGroup().rotation.copy( p.chapter1.slide2.beam.euler);
        laser.getGroup().rotateX(-ang2D);

        raycaster.set(p.chapter1.slide2.beam.position, 
                laser.getGroup().getWorldDirection());
    }

    var mdwn = function(x,y, ang2D){
        //reset
        laser.getGroup().scale.z = 0.01;  //reset
        laser.getGroup().position.copy( p.chapter1.slide2.beam.position ); //reset
        //set aiming
        mmov(x,y, ang2D);

        raycaster.set(p.chapter1.slide2.beam.position, 
                        laser.getGroup().getWorldDirection());

    }
    var mup = function(x, y, ang2D){
        // laser.getGroup().scale.z = 0.01;
        // laser.beam.position.z = 0;
        return;
    }
    controls1 = new FireControls(renderer1, camera1,
                                p.chapter1.slide2.beam.position, 0,
                                mdwn, mup, mmov);
    // controls1 = new THREE.OrbitControls(camera1, renderer1.domElement)

}

function testUpdate(){
    var mag =5;
    if(exists(controls1.isMouseDown)){    
        if(controls1.isMouseDown()){
            laser.getGroup().scale.z += mag;

            var intersect = raycaster.intersectObject(sail.sailmesh);
            // var intersect = raycaster.intersectObject(scene1, true);
            if(intersect.length){
                sail.applyForce( laser.getGroup().getWorldDirection(), 
                                intersect[0].point, 1 );
                console.log('hit');   
            }
        } else {
            // var mag = 1;
            var vec = laser.getGroup().getWorldDirection().multiplyScalar(mag);
            laser.getGroup().position.add( vec );
        }
    } else {
        controls1.update();
    }
    laser.update();
    earth.update();
    sail.update(frame);
    stars.update();
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

    // testIni();
    $('nav').on('click', '#navc1', 
        function(event){
            event.preventDefault();
            currentChapter = new Chapter1(renderer1, camera1, scene1);
            console.log('load chapter 1');
        }
    );
    $('nav').on('click', '#navc2', 
        function(event){
            event.preventDefault();
            // currentChapter = new Chapter2(renderer1, camera1, scene1);
            console.log('load chapter 2');
        }
    );

    $('body').hide();
    $('body').fadeIn({duration:600});

    testIni();
}
/////////////////////main////////////////////////
function animate(){

    var time = Date.now() * 0.0005;
    frame++;

    requestAnimationFrame(animate);

    if(typeof test !== "undefined")
        testUpdate(frame);

    if(exists(currentChapter)) 
        currentChapter.update(frame);

    // stats.begin();

}