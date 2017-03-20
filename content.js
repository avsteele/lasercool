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
    if( ! $(selector).length) return false;
    loc.empty();
    loc.append($(selector));
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
    // TODO: set legend variables

    // TODO: delete all objects in scene

    var descLoc = $('#slide-desc');
    var fetchURL = 'chapter1.html';  //additional content
    var beams = [];
    var chapter = 1;
    var slide = 1;
    var chapterContext = this;
    var controls = [];
    //setup controls for each slide
    controls[1] = ["#navback", "#buttonControl", "#navreset", "#empty", "#navforward"];

    this.loadSlideCommon = function(){
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
        )
        $('#navback'+controlIDPostFix).on('click', 
            function(event){ 
                event.preventDefault();
                slide--;
                chapterContext.loadSlide(slide);
            }
        )        
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
    }

    this.loadSlide = function(){
        //validate slide change
        switch(slide){
            case 1:
                this.loadSlide1();
                break;
            default:
                throw new Error("unknown slide :"+slide);
        }
    }

    this.update = function(frame){
        for(const b of beams)
            b.update(frame);

        renderer.render( scene, camera);
        // TODO: update, then render legend
    }

    this.loadSlide();
}
