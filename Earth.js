function Earth(params){
    
    this.group = new THREE.Group();
    this.group.rotation.copy( params.euler );
    this.group.position.copy( params.position );
    this.group.scale.copy( params.scale );

    if(exists(params.tex))
        var tex = new THREE.TextureLoader().load( 'assets/earth_tex_sm.jpg' );
    else
        var tex = undefined;

    var geo = new THREE.SphereBufferGeometry(1, 32, 32);
    var mat = new THREE.MeshPhongMaterial( {
        emissive: 0x444444,
        map: tex});

    var mesh = new THREE.Mesh(geo, mat);
    // mesh.position.x = -len/2;
    this.group.add(mesh);

    this.update = function(){
        this.group.rotation.y += Math.PI/3000;
        return;
    }

    this.getGroup = function(){
        return this.group;
    }
}