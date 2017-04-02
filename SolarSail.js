function TestObject(){

    this.group = new THREE.Group();
    this.group.position.copy( new THREE.Vector3() );
    this.group.rotation.copy( new THREE.Euler(0, 0,0) );
    var len = 20;
    this.group.scale.copy( new THREE.Vector3(1,1,1) );

    var geo = new THREE.BoxGeometry(1,20,20,2,2,2);  //leave size here = 1, change size in scale
    var mat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.4, depthWrite: false, color:0xFF0000});
    var mesh = new THREE.Mesh(geo, mat);
    mesh.name = "box"
    this.group.add(mesh);
    this.main = mesh;

    var ax = new THREE.AxisHelper(10);
    this.group.add(ax);

    //velo is in global coords
    var velocity = new THREE.Vector3(0,0,0);
    var angVelocity = 0;  //just one local axis for now

    var mass = 100;
    var centerOfMass = new THREE.Vector3();
    // I for local Z-axis, through midpoint of plane
    var momentInertia = mass/12*len*len;

    this.update = function(frame){
        this.group.position.add( velocity );
        //temporary
        this.group.rotateZ( angVelocity );
    }
    this.applyForce = function( pushVec, pushPos, pushMag){
        //args are in world coords, as are velo and angVelo for object
        //calcs easier to do in local however
        
        // local direction of force
        var locPushVec = pushVec.clone().applyEuler(this.group.rotation);
        // local position on object 
        var locPushPos = this.group.worldToLocal(pushPos.clone());
        // linear part
        var dv_gl = pushVec.clone().multiplyScalar(pushMag/mass);
        // console.log(dv_gl);
        velocity = velocity.add(dv_gl);
        // angular part 
        var r = new THREE.Vector3(locPushPos.x, locPushPos.y, 0);
        var rXdv = r.clone().cross(locPushVec.clone());
        var dAngVelo = rXdv.z*mass/momentInertia*pushMag;
        angVelocity += dAngVelo;
        // console.log("pvl:",locPushVec, ' ppl: ', locPushPos);
    }

    this.getGroup = function(){
        return this.group;
    }
}

function SolarSail(params){

    this.group = new THREE.Group();
    this.group.rotation.copy( params.euler );
    this.group.position.copy( params.position );
    this.group.scale.copy( params.scale );

    //these are in global coords
    var velocity = new THREE.Vector3(0,0.00,0); //default
    if( exists(params.velocity0))
        velocity.copy(params.velocity0);
    
    // var angVelocity = new THREE.Vector3(0.0,0.0,0.000); //default
    // if( exists(params.angVelocity0))
    //     angVelocity.copy(params.angVelocity0);
    var angVelocity = 0;

    //center of mass in local coords
    var mass = 100;
    var sz =5;
    var centerOfMass = new THREE.Vector3();
    // I for local Z-axis, through midpoint of plane
    var momentInertia = mass/0.1*sz*sz;

    if(exists(params.tex))
        var tex = new THREE.TextureLoader().load( 'assets/earth_tex_sm.jpg' );
    else
        var tex = undefined;

    var points = [];
    var npts = 20;
    for ( var i = 0; i < npts; i ++ ) {
	    points.push( new THREE.Vector2( sz*i/npts, sz*(i/npts/2)**2 ) );
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

    this.sailmesh = THREE.SceneUtils.createMultiMaterialObject( geo, [mat, mat2] );
    // this.sailmesh = new THREE.Mesh( geo, mat );
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
    this.update = function(frame){

        this.group.position.add( velocity );
        //temporary
        this.group.rotateZ( angVelocity );

    }
    this.lastMagAng =0;
    this.applyForce = function(  pushVec, pushPos, pushMag ){
        // local direction of force
        var locPushVec = pushVec.clone().applyEuler(this.group.rotation);
        // local position on object 
        var locPushPos = this.group.worldToLocal(pushPos.clone());
        // linear part
        var dv_gl = pushVec.clone().multiplyScalar(pushMag/mass);
        // console.log(dv_gl);
        velocity = velocity.add(dv_gl);
        // angular part 
        var r = new THREE.Vector3(locPushPos.x, locPushPos.y, 0);
        var rXdv = r.clone().cross(locPushVec.clone());
        var dAngVelo = -rXdv.z*mass/momentInertia*pushMag;
        angVelocity += dAngVelo;
        // console.log("pvl:",locPushVec, ' ppl: ', locPushPos);
    }

    this.getGroup = function(){
        return this.group;
    }

}