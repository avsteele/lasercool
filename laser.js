//////////// Objects  ///////////////
function Laser(params={}, photons= false, lights = true, sprites=false, streaks=false){

    //params needs to have:
    // .  position, scale(size), euler
    //    color, dz, texture, ptclTexture
    // .lights. num, dTheta

    this.on = true;  //initally ON

    this.len = existsOr( params.scale.z, 2);
    this.ra = existsOr( params.scale.x, 1);
    this.rb = existsOr( params.scale.y, 1); 

    if( lights || photons )
        this.dz = existsOr( params.dz, 1/500);

    this.group = new THREE.Group();
    this.group.rotation.copy( params.euler );
    this.group.position.copy( params.position );
    this.group.scale.copy( params.scale );

    //add beam body to group
    if( exists(params.tex) ){
        this.texture = new THREE.TextureLoader().load( params.tex );
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.MirroredRepeatWrapping;
        // this.texture.repeat.set(Math.ceil(this.ra/5), this.len/5);
        this.texture.repeat.set(this.ra, Math.ceil(this.len/20));
    } else this.texture = undefined;
    
    this.color = existsOr( params.color, 0xFFFFFF);
    this.opacity = existsOr( params.opacity, 0.3);
    var mat = mat_beam_phong_tex(this.color, this.texture, this.opacity);

    this.beam = mesh_seg_beam(mat, 2);
    var geoOffset = existsOr(params.geoOffset, new THREE.Vector3(0,0,0));
    for( const b of this.beam.children)
        b.geometry.translate(geoOffset.x, geoOffset.y, 
                                geoOffset.z );
    this.group.add( this.beam );

    if( photons ){        
        //add photons to group
        var photSize = existsOr( params.photSize, 0.2);
        this.photons = particleBeam(params.num, params.color, 
                                    0.8, 0.8, 
                                    this.len, params.photTexPath, photSize);
        this.group.add(this.photons); //add photons as child
    }

    //add lights to group
    if( lights) {
        if( exists(params.lights) )
            var lightParams = params.lights;
        else 
            var lightParams = {};
        if( !exists(lightParams.num) )
            lightParams.num = 3;
        if( !exists(lightParams.rfactor) )
            lightParams.rfactor = 1.3;
        if( !exists(lightParams.dTheta) ){
            lightParams.dTheta = 0.08;
        }
        this.dTheta = lightParams.dTheta;

        this.lights = light_beam( lightParams.num, this.ra, this.rb, 
                                    lightParams.rfactor, 
                                    this.len, sprites);
        for(var i=0;i<this.lights.length;i++){
            this.group.add(this.lights[i]);
        }
    }

    if(streaks) {
        this.streak_dz = existsOr( params.streak_dz, 0.01);
        this.streak_len = existsOr(params.streak_len, 0.05);
        this.streak_num = existsOr(params.streak_num, 5);
        this.addStreaks();
    }
}

Laser.prototype.toggleVis = function(){
    this.group.visible = !this.group.visible;
}

Laser.prototype.togglePhotonVis = function(){
    if(exists(this.photons)) 
        this.photons.visible = !this.photons.visible;
}

Laser.prototype.update = function( frame, updateFrame=10){
    if(exists(this.photons)){
        this.photons.position.z += this.dz;
        if( frame%updateFrame == 0){
            var offset = this.photons.position.z; //store value before reset
            this.photons.position.z =0;
            for(var i=0; i< this.photons.geometry.vertices.length; i++){
                var ptcl = this.photons.geometry.vertices[i];
                ptcl.z += offset;
                ptcl.z = (ptcl.z+1/2)%1-1/2;
            }
            this.photons.geometry.verticesNeedUpdate = true;              
        }      
    }

    //move lights
    if(exists(this.lights)){
        for(var l=0; l<this.lights.length; l++){
            var pos = this.lights[l].position;
            pos.z += this.dz;
            pos.applyAxisAngle( new THREE.Vector3(0,0,1), 
                                                 -this.dTheta);
            if( frame%updateFrame == 0){
                // pos.z = (pos.z+this.len/2)%this.len-this.len/2;
                pos.z = (pos.z+1/2)%1-1/2;
            }
        }
    }

    if( exists(this.texture)){
        this.texture.offset.x += 0.001;
        this.texture.offset.y -= 0.001;
    }

    if(exists(this.streaks)){
        this.streaks.position.z += this.streak_dz;

        if( frame%updateFrame == 0){
            let offset2 = this.streaks.position.z;
            this.streaks.position.z=0;
            let verts = this.streaks.geometry.vertices;
            for( let i=0;i< verts.length;i+=2 ){
                let z0 = verts[i].z;
                verts[i].z += offset2;
                z0 = (z0+1/2)%1-1/2;
                verts[i].z = (verts[i].z+1/2)%1-1/2;
                verts[i+1].z = verts[i].z + this.streak_len;
                //new x and y on domain of beam 
                if( Math.abs(verts[i].z - z0 - offset2) > 1e-5 ){          
                    verts[i].x = Math.random()*2-1;  
                    verts[i+1].x = verts[i].x;
                    verts[i].y = Math.sign(Math.random()-0.5)*(1-verts[i].x**2);
                    verts[i+1].y = verts[i].y;
                }
            }
            this.streaks.geometry.verticesNeedUpdate = true;
        }
    }
}

Laser.prototype.getGroup = function(){
    return this.group;
}

Laser.prototype.focusBeam = function(focus = 1, rminx =0.05, rminy=0.05 ){
    //focuses the laser near its center
    //is slow, since it need to manipulate the geometry
    var r0=1;  // always unscaled radius
    var f = focus/this.len;

    this.focus = focus;  //save values
    this.rminx = rminx;
    this.rminy = rminy;

    // geo assumed ot be cylindrical beam along z
    // iterate over vertices
    var geo = this.beam.geometry;
    for(var v=0; v<geo.vertices.length; v++){
        var vert = geo.vertices[v];
        //reset vertex
        var theta = Math.atan(vert.x/vert.y);
        if( vert.y < 0 ) theta -= Math.PI;  //needed to avoid 'jumps'
        vert.x = Math.cos(theta); // reset
        vert.y = Math.sin(theta);
        //now scale down if near focus
        if(Math.abs(vert.z)>f) continue;
        var scalex = Math.sqrt(rminx**2+(vert.z/f)**2);
        var scaley = Math.sqrt(rminy**2+(vert.z/f)**2);
        vert.x *= scalex;
        vert.y *= scaley;
    }
    geo.verticesNeedUpdate = true;
    geo.computeVertexNormals();
}

Laser.prototype.scaleFocus = function(focusFactor=1, scalex=1, scaley=1){
    this.focusBeam( this.focus*focusFactor, this.rminx*scalex, this.rminy*scaley);
}

Laser.prototype.in = function(position){
    //returns true if the position is within the laser beam and laser is on
    //has sevreal limitations at present
    //ONLY WORKS IF beam along a world axis
    //ONLY works if beam is round
    if(!this.on) return false;
    if( this.ra != this.rb) throw "only round beams allowed";

    var k = this.getAxis();
    var eps = 1e-10;
    if( Math.abs(k.x)-1<eps ) {
        var val = Math.sqrt((position.y-this.group.position.y)**2+(position.z-this.group.position.z)**2);
    }
    else if( Math.abs(k.y)-1<eps ) {
        var val = Math.sqrt((position.x-this.group.position.x)**2+(position.z-this.group.position.z)**2);
    }
    else if( Math.abs(k.z)-1<eps ) {
        var val = Math.sqrt((position.y-this.group.position.y)**2+(position.x-this.group.position.x)**2);
    }
    else throw "pure x,y, or z axis beams only allowed right now";

    // console.log( "in: ", val < this.ra);
    return val < this.ra;
}

Laser.prototype.getAxis = function(){
    return this.group.getWorldDirection();  //TODO: check if normalized
}

/**
 * configures a laser visualization aid of lines moving through the beam bodt
 * @param {object} params a JSON object containing configuration parameters
 */
Laser.prototype.addStreaks = function(params={}){
    var geo  = new THREE.Geometry();
    for(let s=0;s<this.streak_num;s++){
        //note scaling by group.scale, so all here are 0..1
        var z0 = Math.random();
        var x0 = Math.random()*2-1;  
        var y0 = Math.sign(Math.random()-0.5)*(1-x0**2);
        geo.vertices.push( new THREE.Vector3(x0, y0, z0))
        geo.vertices.push( new THREE.Vector3(x0, y0, z0+this.streak_len));
    }
    var mat = new THREE.LineBasicMaterial({color: this.color, transparent:true, depthWrite:false, opacity:0.5});
    this.streaks = new THREE.LineSegments(geo, mat);
    this.group.add(this.streaks);
}

//////////// basic objects//////////
function geo_beam( lod=1){
    //makes a eliptical laser beam along z
    //lod = level of detail

    // geo: top, bot, height, theta_segs, height_segs
    var geo = new THREE.CylinderGeometry( 1, 1, 1, 32*lod, 64*lod );
    geo.rotateX(Math.PI/2); //rotate local Y(cyl axis) to Z

    return geo;    
}

function mesh_seg_beam(mat, lod=1, segments=4 ){
    //create a cylinder mesh group that is segmented so that it functions better
    // when using transparncy with transparent objects inside of it
    var group = new THREE.Group();
    var col = mat.color;
    if( segments!=2 && segments!=4 && segments!=8 ) 
        throw "illegal # segments (only 2,4,8)";
    var dAng = Math.PI*2/segments;
    for(let s=0;s<segments;s++){
        var geo = new THREE.CylinderGeometry(1,1,1, Math.ceil(32/segments*lod),
        64*lod, true, s*dAng, Math.PI*2/segments);
        
        geo.rotateX(Math.PI/2); //rotate local Y(cyl axis) to Z
        
        //move geometry
        var vec3 = new THREE.Vector3(Math.cos(dAng*(s+0.5)), -Math.sin(dAng*(s+0.5), 0));
        vec3.multiplyScalar(-Math.sign(vec3.x)*Math.sign(vec3.y));
        for( let v of geo.vertices)
            v.sub(vec3);

        var mat1  = mat.clone();
        // mat1.setValues({color: col});
        // col.r = Math.random();
        // col.g = Math.random();
        // col.b = Math.random();
        // mat1.needsUpdate = true;
        var mesh = new THREE.Mesh( geo, mat1);
        //now push mesh back so geo at original position
        mesh.position.add(vec3);
        group.add( mesh );
    }
    return group;
}

/**
 * Simplified beam object.  Extends along Z, with one end at the local origin.
 * @param {Object} params object with initalization parameters 
 */
function SimpleLaser(params){

    var group = new THREE.Group();
    if(exists(params.euler)) 
        group.rotation.copy( params.euler );
    if(exists(params.position))
        group.position.copy( params.position );
    if(exists(params.scale))
        group.scale.copy( params.scale );

    if( exists(params.tex) ){
        var texture = new THREE.TextureLoader().load( params.tex );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // this.texture.wrapT = THREE.MirroredRepeatWrapping;
        // this.texture.repeat.set(Math.ceil(this.ra/5), this.len/5);
        texture.repeat.set(2, 1);
    } else var texture = undefined;


    var geometry = new THREE.CylinderGeometry(1, 1, 1, 16, 8 );
    geometry.rotateX(Math.PI/2);  //to be along local z
    geometry.translate(0,0,0.5);
    var col = existsOr(params.color, 0x00FF00);
    var matl = new THREE.MeshBasicMaterial({color:col, map:texture, transparent:true,
                                        depthWrite:false, opacity: 1.0})
    var beamMesh = new THREE.Mesh(geometry, matl);
    group.add(beamMesh);

    //lastCam is an optimization for the routine that aligns the texture to the
    //   viewer's direction, see beamRot method
    this.lastCam = new THREE.Vector3(Infinity, Infinity, Infinity);

    this.update = function(frame, camera){
        if( exists(camera) )
            this.beamRot(frame, camera);
        return;
    }

    this.getGroup = function(){
        return group;
    }

    /** 
     * rotates the beam so that the X axis faces the camera.
    */
    this.beamRot = function(frame, camera){
        if( this.lastCam.equals(camera.position) ) return;

        var lk = camera.position.clone().multiplyScalar(-1); //world
        var lkl = group.worldToLocal(lk.clone()).multiply(group.scale);
        var lkl_x = lkl.clone().cross(new THREE.Vector3(0,0,1));  //local z (beam axis)
        var lkl_xn = lkl_x.clone().normalize();

        // console.log('lk: ',lk);
        // console.log('lkl: ', lkl);
        // console.log('x: ', lkl_x);
        // console.log('xn: ', lkl_xn);
        // console.log('ang: ', ang*180/Math.PI);
        //epsilon fixed math.sign==0 problem
        var ang = Math.asin(lkl_xn.x)*Math.sign(-lkl_xn.y+Number.EPSILON);
        beamMesh.rotation.z = ang;
        this.lastCam = camera.position.clone();
    }
}

function particleBeam(  num, color, 
                        ra, rb, len, 
                        tex, pointSize = 0.1){
    //distributes particles inside an elliptical/cylindrical domain

    var geometry =  new THREE.Geometry();
    for(var n =0; n<num; n++){
        var r = rand(0,1);
        var theta = rand(0, Math.PI*2);
        var h = rand(-1/2, 1/2);
        geometry.vertices.push( new THREE.Vector3(
                                r*ra*Math.cos(theta), 
                                r*rb*Math.sin(theta),
                                h ) );
    }

    var pointTex= new THREE.TextureLoader().load(tex);
    var material = new THREE.PointsMaterial({ 
        size: pointSize,
        map: pointTex,
        blending: THREE.AdditiveBlending,
		transparent: true,
        side: THREE.DoubleSide,
        color: color,
        depthWrite : false,
	});

    var particles = new THREE.Points( geometry, material);

    return particles;
}

function light_beam(num, ra, rb, rfactor, len, sprites=false){
    var lights =[];
    if(num==0) return lights;

    var dh = len/(num);
    for(var l=0; l<num; l++){
        // var maxdist = Math.max( ra*rfactor, rb*rfactor)*4;
        var maxdist=0;
        //color, intensity, maxdistance, decayrate
        lights.push( new THREE.PointLight( 0xFFFFFF, 1, maxdist, 2))
       
        // var r = rand(1, rfactor);
        var r = rfactor;
        // var theta = rand(0, Math.PI*2);
        var theta = 0 + Math.PI*2/(num)*l;
        var h = -0.5+1/(num+1)*l;
        lights[l].position.set(
                                r*Math.cos(theta), 
                                r*Math.sin(theta),
                                h );

        var sprite = new THREE.Sprite(  );
        sprite.scale.set(0.1,0.1,1);
        if(sprites) lights[l].add(sprite);  //aptionally add a sprite to aid light visualization
    }

    return lights;
}

/////materials/////////
function mat_beam_phong(color){
    //this one looks good for two beams, each with three lights
    var mat = new THREE.MeshPhongMaterial( {
        color: color, 
        opacity:0.5, 
        transparent: true,
        emissive: 0x222222,
        specular: 0x222222,
        shininess: 30,
        // side:THREE.DoubleSide,
        depthWrite : false,
    });

    return mat;
}

function mat_beam_std( color, tex){

    var mat  = new THREE.MeshStandardMaterial( {

        emissive: color,
        emissiveMap: tex,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
    })

    return mat;
}

function mat_beam_phong_tex(color, tex, opacity){
    //this one looks good for two beams, each with three lights
    var mat = new THREE.MeshPhongMaterial( {
        color: color, 
        opacity: opacity, 
        transparent: true,
        emissive: 0x000000,
        specular: color,
        shininess: 0,
        // side:THREE.DoubleSide,
        depthWrite : false,
        map: tex});
    return mat;
}

function mat_beam_basic_tex(color, tex){

    var mat = new THREE.MeshBasicMaterial( {
        color: color, 
        opacity:0.5, 
        transparent: true,
        // side:THREE.DoubleSide,
        depthWrite : false,
        map: tex});
    return mat;
}