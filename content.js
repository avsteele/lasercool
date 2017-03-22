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

function replaceSlideDesc(chapter, slide){
    var loc = $('#slide-desc');
    
    var selector = '#c'+chapter+'s'+slide;
    if( ! $(selector).length) return false;  //don't have it
    newDesc = $(selector).clone().attr("id",selector+'-clone');
    loc.empty();
    newDesc.hide();
    loc.append(newDesc);
    // newDesc.addClass('live');

    //hate to put styling here, but between x-browser issues and finikyness
    //    with it not working if the section loads too quickly...
    newDesc.fadeIn({duration:600});  
    return true;
}

function loadChildren(container, idArray, idPostFix){
    container.empty();
    for(let id of idArray){
        var newel = $(id).clone();
        newel.attr("id",id.slice(1)+idPostFix);
        newel.appendTo(container);
    }
}

var Chapter1 = function(mainRenderer, mainCamera, mainScene,
                        legendRender, legendCamera, legendScene){
    var renderer = mainRenderer;
    var camera = mainCamera;
    camera.position.z = 8;
    var scene = mainScene; 
    // TODO: Legend

    // var descLoc = $('#slide-desc');
    var fetchURL = 'chapter1.html';  //additional content
    var beams = [];
    var chapter = 1;
    var slide = 1;
    var chapterContext = this;
    var controls = [];
    //setup controls for each slide
    controls[1] = ["#navback", "#buttonControl", "#navreset", "#empty", "#navforward"];
    controls[2] = ["#navback", "#empty", "#navreset", "#empty", "#navforward"];

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
        loadChildren(controlContainer, controls[slide], controlIDPostFix);

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
        beams.push(l1);
        scene.add(l1.getGroup());

        //speciality
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
        for(const b of beams)
            b.update(frame);

        renderer.render( scene, camera);
        // TODO: update, then render legend
    }

    this.loadSlide();
    // emptyTHREEChildTypes(scene, ['Group', 'Mesh', 'Points', 'LineSegments']);  //lights too?
}
