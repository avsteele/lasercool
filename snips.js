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