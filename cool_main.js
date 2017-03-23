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

function testIni(){
    test = true;

    var geo = new THREE.SphereBufferGeometry(5, 32, 32);
    //special thanks:
    //http://www.shadedrelief.com/natural3/pages/textures.html
    this.tex= new THREE.TextureLoader().load( 'assets/earth_tex_sm.jpg' );
    var mat = new THREE.MeshPhongMaterial( {
        // color: 0x0000FF, 
        emissive: 0x444444,
        specular: 0x00FF00,
        shininess: 0,
        map: tex});

    var mesh = new THREE.Mesh(geo, mat);
    scene1.add(mesh);

    return;
}
function testUpdate(){
    renderer1.render(scene1, camera1);
    return;
}

/////////////////// INITALIZE /////////////////////////
function init() {

    // initInterface();    // in interface.js
	renderer1 = new THREE.WebGLRenderer();
    renderer1.setPixelRatio( window.devicePixelRatio );
    var drawTo = document.querySelector(".oGLRender");
    while (drawTo.hasChildNodes()) {
        drawTo.removeChild(drawTo.lastChild);
    }
	renderer1.setSize(drawTo.clientWidth, drawTo.clientHeight);
	drawTo.appendChild(renderer1.domElement);
    renderer1.setClearColor( 0x000000, 1 );

    scene1 = new THREE.Scene();

    // var axes = new THREE.AxisHelper(10);
    // scene1.add(axes);

	// Camera 
    var dims = renderer1.getSize();
    var aspect = dims.width/dims.height;
    camera1 = new THREE.PerspectiveCamera(45, aspect, 1, 500);
    camera1.position.z = 35;
    controls = new THREE.OrbitControls(camera1, renderer1.domElement);

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

    // if(frame%100==0){
    //     let sl = document.querySelector("#sl1");
    //     console.log(sl1.value);
    // }

    requestAnimationFrame(animate);

    if(typeof test !== "undefined")
        testUpdate();

    if(exists(currentChapter)) currentChapter.update(frame);

    controls.update();
    // TODO: reset pan?
    // stats.begin();

    // stats.end();

}