function Arrow(params, particles= false, lights = true, sprites=false){

    this.group = new THREE.Group();

    this.group.rotation.copy( params.euler );
    this.group.position.copy( params.position );
    this.group.scale.copy( params.scale );

    //add arrow body to group
    if( exists(params.tex) ){
        this.texture = new THREE.TextureLoader().load( params.tex );
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;
    } else this.texture = undefined;
    
    var geo = geo_arrow(params.rf, params.lf );
    
    var mat = mat_arrow_tex(params.color, this.texture);
    this.arrow = new THREE.Mesh( geo, mat );
    this.group.add( this.arrow );

}

Arrow.prototype.update = function(frame, updateFrame=100){

    if( exists(this.texture)){
        this.texture.offset.x += 0.001;
        this.texture.offset.y += 0.001;
    }
}

Arrow.prototype.getGroup = function(){
    return this.group;
}

Arrow.prototype.toggleVis = function(){
    this.group.visible = !this.group.visible;
}

function geo_arrow( r_frac = 2, l_frac = 0.3, lod = 1){
    // makes a noramlized arrow goemetry
    var points = [];
    var npts = 100*lod;
    points.push(new THREE.Vector2(0,0));
    for(var p=0; p<npts*(1-l_frac); p++){
        points.push( new THREE.Vector2( 1, p/npts));
    }
    for(var p=0; p<=npts*l_frac; p++){
        points.push( new THREE.Vector2(r_frac*(1-p/(npts*l_frac)), (p+npts*(1-l_frac))/npts ));
    }
    var arrow = new THREE.LatheGeometry( points, 24*lod );
    arrow.translate(0,-0.5,0); //center
    arrow.rotateX(Math.PI/2); // orient in z
    return arrow;
}

function mat_arrow_tex(color, tex){

    var mat = new THREE.MeshPhongMaterial( {
        color: color, 
        // opacity:0.75, 
        // transparent: true,
        emissive: 0x660000,
        specular: 0x000000,
        shininess: 0,
        // side:THREE.DoubleSide,
        // depthWrite : false,
        map: tex,
        });

    return mat;
}