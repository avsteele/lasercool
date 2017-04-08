function Atom( params={}, atomTex, photTex){
    //object for a two-level atom
    //params:
    // javascript object setting one or many internals
    
    this.excited = false; //ground state initally
    this.excite_dv = existsOr(params.excite_dv, 0.001);  //velocity change on state change
    //TODO: allow initial position/velocity generators (check types)
    this.velocity = exists(params.velocity)? params.velocity.clone():new THREE.Vector3();
    this.position = exists(params.position)? params.position.clone():new THREE.Vector3();
    this.excitePrBase = existsOr(params.exciteProb, 0.1);
    this.decayPrBase = existsOr(params.decayProb, 0.1);

    this.group = new THREE.Group();  // graphics objects associated with atom

    //graphics options below
    this.color_g = existsOr( params.color_g, 0xFF0000);
    this.color_e = existsOr( params.color_e, 0x00FF00);
    this.scale_g = existsOr( params.scale_g, 1.0);
    this.scale_e = existsOr( params.scale_e, 1.5);

    ///Make body of atom
    var mat = new THREE.SpriteMaterial({color: this.color_g, map: atomTex, 
                transparent:true, opacity: 1.0, depthWrite: false,
                blending: THREE.AdditiveBlending});
    this.body = new THREE.Sprite(mat);
    this.body.scale.copy( new THREE.Vector3().addScalar(this.scale_g) );
    this.body.position.copy( this.position );    
    this.group.add(this.body);

    /// Setup scattered photons
    this.photons = [];
    this.photSpeed = existsOr(params.photonSpeed, 0.2);
    this.nextPhot = 0;// index of next one to be used to for emission event
    var photNum = 5;  //total number ot keep for this purpose
    var photCol = existsOr( params.photonColor, 0xFFFFFF);
    var photScale = existsOr(params.photonScale, this.body.scale.x*0.3);
    var photMat = new THREE.SpriteMaterial({color: photCol, map: photTex, 
                    transparent:true, opacity: 1.0, depthWrite: false,
                    blending: THREE.AdditiveBlending});
    for(let p=0;p<photNum;p++){
        var phot = new THREE.Sprite(photMat);
        this.group.add(phot);
        this.photons.push(phot);
        this.photonReset(phot);
        phot.scale.set( photScale, photScale, photScale);
    }
}

/**
 * Advances internal state of atom one time step.  Incorporates interation with
 * and array of laser beams
 * @param {number} frame a frame number (integer)
 * @param {Array} lasers Laser objects that may excite this atom
 * @param {number} dt time step
 */
Atom.prototype.update = function(frame, lasers, dt=1){
    /////update physical representation
    shuffle(lasers); //ensures proper operation even if excitation Pr high
    for(const b of lasers) 
        if( b.in(this.position)) this.exciteStep(b, dt=1);
    this.position.add( this.velocity.clone().multiplyScalar(dt));
    this.decayStep();
    ////update graphicical representation
    this.body.position.copy(this.position);
    this.colorUpdate();
    this.sizeUpdate();
    this.photonsUpdate();
}

Atom.prototype.photonReset = function(photon){
    photon.position.x = 1e9;  //far away
    photon.velocity = new THREE.Vector3().multiplyScalar(0);
}

Atom.prototype.colorUpdate = function(rate=0.1){
    var to = new THREE.Color(this.excited? this.color_e: this.color_g);

    var from = this.body.material.color;
    var color = new THREE.Color().copy(from).lerp(to, rate);
    this.body.material.setValues({color: color});

    this.body.material.needsUpdate = true;
}

Atom.prototype.sizeUpdate = function(rate=0.1){

    var from =  this.body.scale.x;
    var to = this.excited? this.scale_e: this.scale_g;
    var next = from + (to-from)*rate;

    this.body.scale.x = next;
    this.body.scale.y = next;
    this.body.scale.z = next;
}

Atom.prototype.exciteStep = function(beam, dt=1){
    //returns true on state change ground->excited
    if( this.excited ) return false;
    if( Math.random() < this.exciteProb(beam)){
        this.excited = true;
        this.velocity.add( beam.getAxis().normalize().multiplyScalar(this.excite_dv) );
        // console.log("absorb:"+ console.log(this.velocity));
    }
    return this.excited;
}

Atom.prototype.exciteProb = function(beam, dt=1){
    return this.excitePrBase; //TODO: make dependent on beam properties: detuning, intensity
}

Atom.prototype.decayStep = function(dt=1){
    if( !this.excited) return false;
    if( Math.random() < this.decayProb()){
        this.excited= false;
        var vec = randVec3();
        // console.log("decay");
        this.velocity.add( vec.multiplyScalar(this.excite_dv) );
        this.emitPhoton(vec.normalize().multiplyScalar(-1));
        return true;
    }
    return false;
}

Atom.prototype.decayProb = function(dt=1){
    return this.decayPrBase;  //TODO: change based on constructor parameters
}

Atom.prototype.getGroup = function(){
    return this.group;
}

Atom.prototype.emitPhoton = function(dir){
    
    var phot = this.photons[this.nextPhot];
    phot.position.copy( this.body.position);
    phot.velocity.copy(dir.multiplyScalar(this.photSpeed));
    this.nextPhot++;
    this.nextPhot %= this.photons.length;
}

Atom.prototype.photonsUpdate = function(dt=1){
    for(const p of this.photons){
        // console.log(p.velocity);
        p.position.add( p.velocity.clone().multiplyScalar(dt));
    }
}