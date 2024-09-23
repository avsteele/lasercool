function StarField(params){

    this.group = new THREE.Group();
    this.group.rotation.copy( params.euler );
    this.group.position.copy( params.position );
    this.group.scale.copy( params.scale );

    var num = existsOr(params.num, 1500);
    var minR = existsOr(params.minR, 350);
    var maxR = existsOr(params.maxR, 600);
    var rotSpeed = existsOr(params.rotSpeed, 0.00003);

    var starGeo = new THREE.Geometry();
    var starColorPalette = [0xFFFFFF, 0xBBEEFF, 0xFF8888, 0x8888FF]
    var starColors = []
    for( var i=0;i<num;i++){
        var r = (minR+Math.random()*(maxR-minR))
        var theta = Math.random()*2*Math.PI;
        var phi = Math.random()*Math.PI;
        var r = new THREE.Spherical(r,phi,theta);
        var v = new THREE.Vector3().setFromSpherical(r);
        starGeo.vertices.push(v);
        starGeo.colors.push(new THREE.Color(starColorPalette[i%starColorPalette.length]));

    }
    var starMat = new THREE.PointsMaterial( {
        color: 0xffffff, 
        // shading: THREE.FlatShading, 
        vertexColors: THREE.VertexColors
    });
    var stars = new THREE.Points(starGeo, starMat);

    this.group.add(stars);

    this.update = function(){
        var rotSpeed =0.00003;
        this.group.rotation.x += rotSpeed;
        this.group.rotation.y -= 2*rotSpeed;
    }

    this.getGroup = function(){
        return this.group;
    }
}