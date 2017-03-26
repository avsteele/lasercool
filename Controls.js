/**
 * supports a webgl renderer for actions on a mouse click
 * without any camera movement
 * @param {*} renderer webGL renderer made by THREE.js
 * @param {*} mouseDownCallback attah extra actions on mouse down
 * @param {*} mouseUpCallback 
 * @param {*} mouseMoveCallback 
 */
var FireControls = function(renderer, 
                    fireCenter,
                    mouseDownCallback, mouseUpCallback, mouseMoveCallback){

    //define internal state
    var canvas = renderer.getContext().canvas;

    //mouse internal state
    var mouse = { down:false, x: 0, y:0 };

    //fire control state
    //for firing in 2D plane, record angle in relation to center
    // of last click or move
    var ang2D = 0;
    ///center for 2D cangle calculation in units of....
    var center = new THREE.Vector3().copy(fireCenter);

    if( !exists(mouseDownCallback) ) 
        var mouseDownCallback = function(){};
    if( !exists(mouseUpCallback) ) 
        var mouseUpCallback = function(){};
    if( !exists(mouseMoveCallback) ) 
        var mouseMoveCallback = function(){};

    var setMousePos = function(event){
        var canvas = renderer1.getContext().canvas;
        mouse.x = (event.clientX - canvas.offsetLeft)/canvas.width;
        mouse.y = (event.clientY - canvas.offsetTop)/canvas.height;
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
        // var xoffset = center.x;  //TODO: determin from params and FOV
        // var yoffset = center.y;
        var ny = center.y-mouse.y;
        var nx = (mouse.x-center.x)*camera1.aspect;
        nx = Math.max(0.1, nx);  //limit so it doesnt pierce earth
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