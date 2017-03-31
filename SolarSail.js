function SolarSail(params){

    this.group = new THREE.Group();
    this.group.rotation.copy( params.euler );
    this.group.position.copy( params.position );
    this.group.scale.copy( params.scale );

    //these are in global coords
    var velocity = new THREE.Vector3(0,0.00,0); //default
    if( exists(params.velocity0))
        velocity.copy(params.velocity0);
    
    var angVelocity = new THREE.Vector3(0.0,0.0,0.000); //default
    if( exists(params.angVelocity0))
        angVelocity.copy(params.angVelocity0);

    //center of mass in local coords
    var centerOfMass = new THREE.Vector3(0,5,0);
    var mass = 10000;
    var momentInertia = 10000;

    if(exists(params.tex))
        var tex = new THREE.TextureLoader().load( 'assets/earth_tex_sm.jpg' );
    else
        var tex = undefined;

    var points = [];
    var npts = 10;
    for ( var i = 0; i < npts; i ++ ) {
	    points.push( new THREE.Vector2( i/npts, (i/npts)**1.5 ) );
    }
    var geo = new THREE.LatheBufferGeometry(points, 32);
    var mat = new THREE.MeshPhongMaterial( {
        emissive: 0xFFD700,
        map: tex,
        side:THREE.DoubleSide,
    });
    var mat2 = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true, 
        transparent: true
    });

    // this.sailmesh = THREE.SceneUtils.createMultiMaterialObject( geo, [mat, mat2] );
    this.sailmesh = new THREE.Mesh( geo, mat );
    this.group.add(this.sailmesh);

    var ax = new THREE.AxisHelper(1);
    this.group.add(ax);

    // var wiregeo = new THREE.WireframeGeometry( geo );
    // var wiremat = new THREE.LineBasicMaterial( {
    //     color: 0x000000,
    //     depthTest: false,
    //     opacity: 1.0,
    //     transparent: true,        
    // } );
    // var wiremesh = new THREE.LineSegments( wiregeo);
    // this.group.add(wiremesh)

    /**
     * pushVec applies a psudo force along its k vector
     *      assumed to be in world axes
     * pushPos is location (should be one that intersects the sail) where the 
     *     force is applied
     */
    this.update = function(frame, pushVec, pushPos, pushMag){

        this.group.position.add( velocity );
        //temporary
        this.group.rotateZ( angVelocity.z );
        if(frame%100==0){
            console.log(velocity.x, angVelocity.z, this.lastMagAng.z);
        }
        return;
    }
    this.lastMagAng =0;
    this.applyForce = function(  pushVec, pushPos, pushMag ){
        var loc = pushVec.clone();
        loc.applyEuler(this.group.rotation);
        // if(frame%100==0){
        //     var vecX = new THREE.Vector3(1,0,0);
        //     var vecY = new THREE.Vector3(0,1,0);
        //     this.group.worldToLocal(vecX);
        //     this.group.worldToLocal(vecY);
        //     console.log(vecX.length(), vecY.length(), pushVec.length() ,loc.length());
        //     // console.log(vecX.add(this.group.position));
        //     // console.log(vecX.length());
        //     console.log(loc);
        // }
        //linear momentum
        velocity.add( pushVec.clone().multiplyScalar(pushMag/mass) );
        //angular momentum
        var comGlobal = centerOfMass.clone();
        this.group.localToWorld(comGlobal);
        // console.log(comGlobal);
        var r = pushPos.clone().sub(comGlobal);
        var magAng = comGlobal.clone().normalize().cross(r.normalize());
        // var sign = Math.sign(magAng.z);
        // magAng.normalize();
        this.lastMagAng = magAng;
        angVelocity.z += magAng.z/momentInertia;
        // console.log(magAng);
    }

    this.getGroup = function(){
        return this.group;
    }

}