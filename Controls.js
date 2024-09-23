/**
 * supports a webgl renderer for actions on a mouse click
 * without any camera movement
 * @param {*} renderer webGL renderer made by THREE.js
 * @param {*} mouseDownCallback attah extra actions on mouse down
 * @param {*} mouseUpCallback 
 * @param {*} mouseMoveCallback 
 */
var FireControls = function(renderer, cameraIn,
                    fireCenter, zPlane,
                    mouseDownCallback, mouseUpCallback, mouseMoveCallback){

    //define internal state
    //TODO: does canvas get recreated on screen change?
    var canvas = renderer.getContext().canvas;
    
    //camera used for ray casting
    var camera = cameraIn;

    //mouse internal state
    var mouse = { down:false, x: 0, y:0 };

    ///  center from which firing originates
    //TODO: consider keeping this as a refernce, this way can trakc object movement
    //       problem is now i have teh object moving with the beam
    // in world coordinates
    var center = new THREE.Vector3().copy(fireCenter);

    //angle, from 0..2*pi around center along which fire will travel
    var ang2D = 0;

    if( !exists(mouseDownCallback) ) 
        var mouseDownCallback = function(){};
    if( !exists(mouseUpCallback) ) 
        var mouseUpCallback = function(){};
    if( !exists(mouseMoveCallback) ) 
        var mouseMoveCallback = function(){};

    var setMousePos = function(event){
        // var canvas = renderer1.getContext().canvas;
        // mouse x,y in normalized device coordinates
        mouse.x = (event.clientX - canvas.offsetLeft)/canvas.width*2-1;
        mouse.y = (event.clientY - canvas.offsetTop)/canvas.height*2-1;
        updateAng2D();
    }

    var handleMouseDown = function(event){
        mouse.down=true;
        setMousePos(event);
        // console.log(mouse.x, mouse.y);
        //do extra actions
        mouseDownCallback(mouse.x, mouse.y, ang2D);
    }
    var handleMouseUp = function(event){
        mouse.down = false;
        // cube.visible = false;
        mouseUpCallback(mouse.x, mouse.y, ang2D);
    }
    /**
     * mouse event for this type of control *only* when a button/touch is down
     * @param {*} event 
     */
    var handleMouseMove = function(event) {
        if( mouse.down == false) return;
        setMousePos(event);
        mouseMoveCallback(mouse.x, mouse.y, ang2D);
    }

    var updateAng2D = function(){

        //convert center to NDC
        var mvm4 = camera.matrixWorldInverse;
        var pm4 = camera.projectionMatrix;
        var centerNDC = center.clone().applyMatrix4(mvm4).applyMatrix4(pm4);

        var ny = -(mouse.y-centerNDC.y);  //since -Y at top
        var nx = (mouse.x-centerNDC.x)*camera1.aspect;
        // nx = Math.max(0.1, nx);  //limit so it doesnt pierce earth
        ang2D = Math.sign(ny)*Math.acos(nx/Math.sqrt(nx**2+ny**2))
    }
    this.getAng2d = function(){
        return ang2D;
    }

    //TODO: add callbacks
    renderer.domElement.addEventListener( 'mousedown', handleMouseDown, false );
    renderer.domElement.addEventListener( 'mouseup', handleMouseUp, false );
    renderer.domElement.addEventListener( 'mousemove', handleMouseMove, false );

    /**
     * per frame actions
     */
    this.update = function(){
        return;
    }
    this.update();//update once on ini?

    this.dispose = function(){
        renderer.domElement.removeEventListener( 'mousedown', handleMouseDown, false );
        renderer.domElement.removeEventListener( 'mouseup', handleMouseUp, false );
        renderer.domElement.removeEventListener( 'mousemove', handleMouseMove, false );
    }

    this.isMouseDown = function(){return mouse.down;}
}