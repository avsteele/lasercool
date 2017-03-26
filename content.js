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

    // var descLoc = $('#slide-desc');
    var fetchURL = 'chapter1.html';  //additional content
    var updateObjects = [];
    var chapter = 1;
    var slide = 1;
    var chapterContext = this;

    //keyboard, mouse, touch control sets
    var controls = [];
    //setup controls for each slide
    var buttons = [];
    buttons[1] = ["#navback", "#buttonControl", "#navreset", "#empty", "#navforward"];
    buttons[2] = ["#navback", "#empty", "#navreset", "#empty", "#navforward"];
    //TODO: setup camera settings for each scene
    camera.position.z = 15;

    /**
     * common setup for all slides in this chapter
     */
    this.loadSlideCommon = function(){
        //empty scene
        emptyTHREEChildTypes(scene, ['Group', 'Mesh', 'Points', 'LineSegments']);
        
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
                slide++;
                chapterContext.loadSlide(slide);
            }
        );
        $('#navback'+controlIDPostFix).on('click', 
            function(event){ 
                event.preventDefault();
                slide--;
                chapterContext.loadSlide(slide);
            }
        ); 
    }

    this.loadSlide1 = function(){
        this.loadSlideCommon();
        //// slide 1
        var l1 = new Laser(p.chapter1.beams.slide1, true, false, false, true);
        l1.togglePhotonVis();
        updateObjects.push(l1);
        scene.add(l1.getGroup());

        controls.push(new THREE.OrbitControls(camera1, renderer1.domElement));

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

    this.loadSlide2 = function(){
        this.loadSlideCommon();


    }

    this.loadSlide = function(){
        //validate slide change
        switch(slide){
            case 1:
                this.loadSlide1();
                break;
            case 2:
                this.loadSlide2();
                break;
            default:
                throw new Error("unknown slide :"+slide);
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
        renderer.render( scene, camera);
        // TODO: update, then render legend
    }

    this.loadSlide();
}
