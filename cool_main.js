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

function testIni(){

}

var lastHit = 0;

function testUpdate(){

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
            currentChapter.loadSlide(1);
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

    // if(typeof test !== "undefined")
    //     testUpdate(frame);

    if(exists(currentChapter)) 
        currentChapter.update(frame);

    // stats.begin();

}