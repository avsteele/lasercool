    ///raycast test
    var dY = camera1.position.z*Math.tan(camera1.fov/2*pi/180);
    var dX = dY*camera1.aspect;
    var geometry = new THREE.PlaneGeometry( 2*dX, 2*dY, 2 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    // scene1.add( plane );
    var raycaster = new THREE.Raycaster();

    //raycast test
    // x,y are mouse position
    raycaster.setFromCamera(new THREE.Vector2(x,y), camera1);
    var intersect = raycaster.intersectObject(plane);
    console.log(intersect[0].point);



    //     // testObj.applyForce( laser.getGroup().getWorldDirection(), 
    //     //                 lastHit.point, 0.05 );                
    //     console.log('hit', lastHit.distance);
    //     // testObj.update(frame);
    //     // if((l.scale.z+l.position.z) > lastHit.distance){
        // l.scale.z = lastHit.distance - l.position.z;
    //     if(l.scale.z <= 0) l.scale.z = 0.001;
    //     console.log('shorten')
    //     // }
    // }

function testUpdate(){
    var mag =5;
    var l = laser.getGroup();

    if(exists(controls1.isMouseDown)){    
        if(controls1.isMouseDown()){
            l.scale.z += mag;
            // l.visible= true;

            intersect = raycaster.intersectObject(sail.sailmesh, true);
            // var intersect = raycaster.intersectObject(scene1, true);
            // var intersect = raycaster.intersectObject(testObj.main, true);            
            if(intersect.length) {
                lastHit = intersect[0];
                sail.applyForce( l.getWorldDirection(), lastHit.point, 0.05 );
            }
        } else {
            // var mag = 1;
            var vec = l.getWorldDirection().multiplyScalar(mag);
            l.position.add( vec );
        }
    } else {
        controls1.update();
    }
    //fix length of beam to not pierce the sail
    var dist = l.position.clone().sub(p.chapter1.slide2.beam.position).length();
    if( dist + l.scale.z > lastHit.distance ){
        l.scale.z = lastHit.distance - dist;
        if(l.scale.z <=0 ) l.scale.z =0.001;
    }

    laser.update();
    earth.update();
    sail.update(frame);
    // testObj.update(frame);
    stars.update();
    renderer1.render(scene1, camera1);
    return;
}

function testIni(){
    test = true;

    var pi = Math.PI;

    camera1.position.z = 35;

    earth = new Earth(p.chapter1.slide2.earth);
    scene1.add(earth.getGroup());

    laser =  new Laser(p.chapter1.slide2.beam, false, false, false, false );
    laser.getGroup().scale.z = 1e-3;

    scene1.add(laser.getGroup());

    sail = new SolarSail(p.chapter1.slide2.sail);
    scene1.add(sail.getGroup());

    stars = new StarField(p.chapter1.slide2.stars);
    scene1.add(stars.getGroup());

    // testObj= new TestObject();
    // scene1.add(testObj.getGroup());

    raycaster = new THREE.Raycaster();

    var mmov = function(x,y, ang2D){
        //reset angle to origin, or may get strange accumulation errors that flip
        //   unrelated axes
        laser.getGroup().rotation.copy( p.chapter1.slide2.beam.euler);
        laser.getGroup().rotateX(-ang2D);

        raycaster.set(laser.getGroup().position, 
                laser.getGroup().getWorldDirection());
    }

    var mdwn = function(x,y, ang2D){
        //reset
        laser.getGroup().scale.z = 0.01;  //reset
        laser.getGroup().position.copy( p.chapter1.slide2.beam.position ); //reset
        //set aiming
        mmov(x,y, ang2D);

    }
    var mup = function(x, y, ang2D){
        return;
    }
    controls1 = new FireControls(renderer1, camera1,
                                p.chapter1.slide2.beam.position, 0,
                                mdwn, mup, mmov);
    // controls1 = new THREE.OrbitControls(camera1, renderer1.domElement);

}
