/**
 * supports actions on a webgl renderer for actions on a mouse click
 * without any camera movement
 * @param {*} renderer 
 * @param {*} mouseDownCallback 
 */
var FireControls = function(renderer, 
                    mouseDownCallback, mouseUpCallback, mouseMoveCallback){

    //define internal state
    var canvas = renderer.getContext().canvas;

    var mouse = { down:false, x: 0, y:0};
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
    }
    var handleMouseDown = function(event){
        mouse.down=true;
        setMousePos(event);
        // console.log(mouse.x, mouse.y);
        //do extra actions
        mouseDownCallback(mouse.x, mouse.y);
    }
    var handleMouseUp = function(event){
        mouse.down = false;
        // cube.visible = false;
        mouseUpCallback(mouse.x, mouse.y);
    }
    /**
     * mouse event for this type of control *only* when a button/touch is down
     * @param {*} event 
     */
    var handleMouseMove = function(event) {
        if( mouse.down == false) return;
        setMousePos(event);
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
    this.update();

    this.dispose = function(){
        renderer.domElement.removeEventListener( 'mousedown', handleMouseDown, false );
        renderer.domElement.removeEventListener( 'mouseup', handleMouseUp, false );
        renderer.domElement.removeEventListener( 'mousemove', handleMouseMove, false );
    }
}