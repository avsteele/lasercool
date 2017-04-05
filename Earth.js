function Earth(params){
    
    this.group = new THREE.Group();
    this.group.rotation.copy( params.euler );
    this.group.position.copy( params.position );
    this.group.scale.copy( params.scale );

    var longitude_adjust = 100;
    if(exists(params.tex))
        var tex = new THREE.TextureLoader().load( params.tex );
        if( params.tex == 'assets/earth_tex_sm.jpg')
            longitude_adjust = 157;
    else
        var tex = undefined;

    var geo = new THREE.SphereBufferGeometry(1, 32, 32);
    var mat = new THREE.MeshPhongMaterial( {
        emissive: 0x444444,
        map: tex});

    var sphereMesh = new THREE.Mesh(geo, mat);
    // mesh.position.x = -len/2;
    this.group.add(sphereMesh);

    var ax = new THREE.AxisHelper(10);
    this.group.add(ax);

    this.update = function(){
        // this.group.rotation.y += Math.PI/3000;
        return;
    }

    this.rotateTo = function(lat,long){
        //get my texture and value in agreement with position along global +X
        var llong = long+longitude_adjust;   
        var sph = new THREE.Spherical(1, lat*Math.PI/180+Math.PI/2, (llong%180)*Math.PI/180);
        var lk = new THREE.Vector3().setFromSpherical(sph)
        // var lkp = lk.clone().add(this.group.position);
        // this.group.lookAt(lkp);
        sphereMesh.lookAt(lk);
    }

    this.getGroup = function(){
        return this.group;
    }
}