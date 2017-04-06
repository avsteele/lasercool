function demo1Setup(){
    
    var description = document.querySelector("#frame-desc");
    description.innerHTML = p.demo1.desc[0];

    // var ptcl = false;
    demo1 = {};
    demo1.beams = [];
    for(const pd1b of p.demo1.beams){
        var laser = new Laser(pd1b, true, false, false, true);
        demo1.beams.push(laser);
        scene1.add(laser.getGroup());
    }

    demo1.atoms = [];
    var atomTex = new THREE.TextureLoader().load(p.std.atom1.atomTexPath);
    var photTex = new THREE.TextureLoader().load(p.std.atom1.photTexPath);
    for(let a=0;a<p.demo1.natoms;a++){
        var atom = new Atom( p.demo1.atom1, atomTex, photTex );
        scene1.add( atom.getGroup());
        demo1.atoms.push(atom);
    }
}

function demo1Update(f){

    for(const b of demo1.beams) 
        b.update(f);

    for(const a of demo1.atoms)
        a.update(f, demo1.beams);
    // demo1.beam2.update(f);

    renderer1.render(scene1, camera1);
}

/**
 * containerize entry actions and animations in case I decide to move to using
 * css laster
 */
function onEntryAnimateStd(element){
    //hate to put styling here, but between x-browser issues and finikyness
    //    with it not working if the section loads too quickly...    
    element.hide();
    element.fadeIn({duration:400});
}

function replaceSlideDesc(chapter, slide){
    var loc = $('#slide-desc');
    
    var selector = '#c'+chapter+'s'+slide;
    if( ! $(selector).length) return false;  //don't have it
    newDesc = $(selector).clone().attr("id",selector+'-clone');
    loc.empty();
    loc.append(newDesc);
    onEntryAnimateStd(newDesc);
    return true;
}

function loadChildren(container, idArray, idPostFix){
    container.empty();
    for(let id of idArray){
        var newEl = $(id).clone();
        newEl.attr("id",id.slice(1)+idPostFix);
        newEl.appendTo(container);
        onEntryAnimateStd(newEl);
    }
}

var Chapter1 = function(mainRenderer, mainCamera, mainScene,
                        legendRender, legendCamera, legendScene){
    var renderer = mainRenderer;
    var camera = mainCamera;
    var scene = mainScene; 
    // TODO: Legend

    var pi = Math.PI;

    // var descLoc = $('#slide-desc');
    var fetchURL = 'chapter1.html';  //additional content
    //each object added here will have an update method called each frame
    var updateObjects = []; 
    //per-slide objects requiring more complex interaction go into this
    var slideObjects = {};
    var chapter = 1;
    var slide = 1;
    var chapterContext = this;

    //keyboard, mouse, touch control sets
    var controls = [];
    //setup controls for each slide
    var buttons = [];
    buttons[1] = ["#navback", "#buttonControl", "#navreset", "#empty", "#navforward"];
    buttons[2] = ["#navback", "#empty", "#navreset", "#empty", "#navforward"];
    
    /// to hold non-standard slide initalization
    var slideInit = [];
    /// to hold slide non-standard updates
    var slideUpdate = [];

    /**
     * common setup for all slides in this chapter
     */
    var loadSlideCommon = function(){
        //empty scene
        emptyTHREEChildTypes(scene, ['Group', 'Mesh', 'Points', 'LineSegments']);
        //empty controls, updateObj, special obj
        for( c of controls){
            c.dispose();
        }
        controls = [];
        updateObjects = [];
        slideObjects = {};

        //load slide description
        if( ! replaceSlideDesc( chapter, slide)){
            $.get( fetchURL, function(result){
                $('body').append(result);
                replaceSlideDesc(chapter,slide);
            });
        }

        /// build nav/control bar
        var controlContainer = $('#controls');
        var controlIDPostFix =  chapter.toString()+slide;
        loadChildren(controlContainer, buttons[slide], controlIDPostFix);

        $('#navforward'+controlIDPostFix).on('click', 
            function(event){ 
                event.preventDefault();
                chapterContext.loadSlide(slide+1);
            }
        );
        $('#navback'+controlIDPostFix).on('click', 
            function(event){ 
                event.preventDefault();
                chapterContext.loadSlide(slide-1);
            }
        ); 
    }

    slideInit[1] = function(){
        loadSlideCommon();
        ////camera
        camera.position.set(0,0,15);
        camera.rotation.set(0,0,0);
        ///objects
        var l1 = new Laser(p.chapter1.beams.slide1, true, false, false, true);
        l1.togglePhotonVis();
        updateObjects.push(l1);
        scene.add(l1.getGroup());
        ////controls
        // controls.push(new THREE.OrbitControls(camera, renderer.domElement));

        //button config
        $('#buttonControl11').on('click', 'button', 
            function(){ 
                l1.togglePhotonVis();
                swapClass($(this), 'on', 'off');
            }
        ).find('button').text('Photons');

        $('#navreset11').on('click', 
            function(event){ 
                event.preventDefault();
                chapterContext.loadSlide(slide);
            }
        );        
    }

    slideInit[2] = function(){
        loadSlideCommon();
        //camera
        var posTrack = new THREE.CatmullRomCurve3(
            [new THREE.Vector3(-100,100,-100), new THREE.Vector3(0,66,-100),
            new THREE.Vector3(100,33,0), new THREE.Vector3(0,0,35) ]);
        var lookTrack = new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0)]);
        var upTrack = new THREE.CatmullRomCurve3([new THREE.Vector3(0,1,0),new THREE.Vector3(0,1,0)]);
        
        cameraTrack = new camFly( 0.003, posTrack, lookTrack, upTrack, camera); 
        updateObjects.push(cameraTrack);

        // camera.position.set(0,0,35);
        // camera.rotation.set(0,0,0);

        // convenience variables
        var pRef = p.chapter1.slide2;
        
        ////build objects
        slideObjects.earth = new Earth(pRef.earth);
        scene.add(slideObjects.earth.getGroup());
        updateObjects.push(slideObjects.earth);
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                slideObjects.earth.rotateTo(position.coords.latitude,position.coords.longitude);
            });
        }

        // slideObjects.laser =  new Laser(pRef.beam, false, false, false, false );
        slideObjects.laser =  new SimpleLaser(pRef.beam);
        slideObjects.laser.getGroup().scale.z = 1e-3; //'hide'
        scene.add(slideObjects.laser.getGroup());
        updateObjects.push(slideObjects.laser);

        slideObjects.sail = new SolarSail(pRef.sail);
        scene.add(slideObjects.sail.getGroup());
        updateObjects.push(slideObjects.sail);

        slideObjects.stars = new StarField(pRef.stars);
        scene.add(slideObjects.stars.getGroup());
        updateObjects.push(slideObjects.stars);

        /// 
        slideObjects.raycaster = new THREE.Raycaster();
        slideObjects.lastHit = {distance: 1e9};  //initalize to 'very big'

        ///// setup controls
        var mmov = function(x,y, ang2D){
            //reset angle to origin, or may get strange accumulation errors that flip
            //   unrelated axes
            slideObjects.laser.getGroup().rotation.copy( pRef.beam.euler);
            if( Math.abs(ang2D) > Math.PI/2 ) ang2D = Math.sign(ang2D)*Math.PI/2;
            slideObjects.laser.getGroup().rotateX(-ang2D);

            slideObjects.raycaster.set(slideObjects.laser.getGroup().position, 
                    slideObjects.laser.getGroup().getWorldDirection());
        }
        var mdwn = function(x,y, ang2D){
            //reset
            slideObjects.laser.getGroup().scale.z = 0.01;  //reset
            slideObjects.laser.getGroup().position.copy( pRef.beam.position ); //reset
            //set aiming
            mmov(x,y, ang2D);

        }
        controls.push( new FireControls(renderer, camera, pRef.beam.position, 0,
                                    mdwn, undefined, mmov));

        $('#navreset12').on('click', 
            function(event){ 
                event.preventDefault();
                chapterContext.loadSlide(slide);
            }
        );                                    

    }

    slideUpdate[2] = function(){ 
        //aliases
        var pRef = p.chapter1.slide2;
        var l = slideObjects.laser.getGroup();

        // camera.position.z -= 1;
        // camera.lookAt(new THREE.Vector3(0,0,0));

        var lightSpeed = 2;

        if(controls[0].isMouseDown()){
            l.scale.z += lightSpeed;
            
            var intersect = slideObjects.raycaster.intersectObject(slideObjects.sail.sailmesh, true);        
            if(intersect.length) {
                slideObjects.lastHit = intersect[0];
                slideObjects.sail.applyForce( l.getWorldDirection(), slideObjects.lastHit.point, 0.05 );
            } else {
                slideObjects.lastHit = 1e9;
            }
        } else {
            // var lightSpeed = 1;
            var vec = l.getWorldDirection().multiplyScalar(lightSpeed);
            l.position.add( vec );
        }
        //fix length of beam to not pierce the sail
        var dist = l.position.clone().sub(pRef.beam.position).length();
        if( dist + l.scale.z > slideObjects.lastHit.distance ){
            l.scale.z = slideObjects.lastHit.distance - dist;
            if(l.scale.z <=0 ) l.scale.z =0.001;
        }
    }

    this.loadSlide = function(newSlide){
        if( exists(slideInit[newSlide]) ){
            slide = newSlide;
            slideInit[newSlide]();
        }
    }

    /**
     * Update the slide by a single frame.
     */
    this.update = function(frame){
        for(const o of updateObjects)
            o.update(frame);
        for( const c of controls){
            c.update()
        }

        if(exists(slideUpdate[slide]))
            slideUpdate[slide]();
        renderer.render( scene, camera);
        // TODO: update, then render legend
    }

    // this.loadSlide(1);
}
