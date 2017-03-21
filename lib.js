/// HTML DOM ////
/**
 * if element has class1 but not class2, remove class1 and add class2 or vice
 * versa
 * @param {DOMelement} element 
 * @param {string} class1 css class string 
 * @param {string} class2 css class tring
 */
function swapClass(element, class1, class2){
    if(element.hasClass(class1) && element.hasClass(class2)) 
        throw new Error("Can't swap, has both")
    if(!element.hasClass(class1) && !element.hasClass(class2))
        throw new Error("Can't swap classes, has neither")
    var from = class1;
    var to = class2;
    if(element.hasClass(class2))
        [from, to] = [to, from];
    element.removeClass(from).addClass(to);
}

/// Vector related ////
function rotFromTo( fromVec, toVec){
    // finds rotation to take fromVec to toVec. vectors must be normalized

    var minDist = 1e-15;
    // first check if already there to prevent singularity
    if( fromVec.distanceTo(toVec) < minDist ) return [ new THREE.Vector3(1,0,0), 0];
    //TODO: antiparrallel case is breaking as well, since there are two 
    // equivalent,minimal, rotations to take you there
    var tmp = fromVec.clone();
    if( tmp.add(toVec).length() < minDist ) throw new RangeError('Antiparallel rotation requested.');

    // var y = new THREE.Vector3(0, 1, 0);
    var ang = fromVec.angleTo(toVec);
    var rotAx = fromVec.clone().cross(toVec).normalize();
    return [rotAx, ang];
}

function rotateObj3DTo(mesh, fromVec, toVec){
    // //rotate teh mesh's local coords in a rotation taking fromVec to toVec
    // //vectors must be normalized
    axAng = rotFromTo(fromVec, toVec);

    mesh.rotateOnAxis(axAng[0], axAng[1]);
}

function randVec3(r=1){
    var theta = rand(0, 2*Math.PI);
    var phi = rand(0,Math.PI);
    var s = new THREE.Spherical(r, phi, theta);
    return new THREE.Vector3().setFromSpherical(s);
}

/// THREE core/////
/**
 * deletes child objects that are THREE types included in the 'types' parameter
 * array
 * @param {THREE.Object3D} threeObj3D 
 * @param {array} types strings representing THREE.types 
 */
function emptyTHREEChildTypes(threeObj3D, types){
    if(!exists(threeObj3D.children)) return;
    if( threeObj3D.children.constructor != Array) throw Error("expected child array");
    var loopArray = threeObj3D.children.slice(0);  //need to copy since changed in loop
    for(const child of loopArray){
        if(exists(child.type) && types.includes(child.type)){
            switch(child.type){
                case 'Mesh':
                case 'Points':
                case 'LineSegments':
                    threeObj3D.remove(child);
                    child.geometry.dispose();
                    child.material.dispose();
                    break;
                case 'Group':
                    threeObj3D.remove(child);
                    emptyTHREEChildTypes(child, types);
                    break;
                default:
                    throw Error("emptyTHREEChildTypes was asked to remove a \
                                "+child.type+" but doesn't know how");
            }
        }
    }
}

/////assorted helpers //////
function rand(min,max){
    return Math.random()*(max-min)+min
}

function exists( object ){
    return (typeof object !== "undefined");
}

function existsOr( object, val ){
    return (typeof object !== "undefined")?object:val;
}

/**
 * Measures of nearness of two THREE.Colors in RGB space
 * @param {THREE.Color} c1 color 1
 * @param {THREE.Color} c3 color 2
 */
function colorDist(c1, c2){
    return Math.sqrt((c1.r-c2.r)**2+(c1.g-c2.g)**2+(c1.b-c2.b)**2)
}

/**
 * Shuffles array in place. ES6 version (thanks SO)
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

//// type identifcation and copying ////
function isDict(obj) {
    if(!obj) return false;
    if(Array.isArray(obj)) return false;
    if(obj.constructor != Object) return false;
    return true;
};

function isPrimitive(obj) {
    return (typeof obj == "number" || typeof obj == "string" || typeof obj =="boolean");
}

function isTHREE(obj){
    //identifies certain THREE.js types that have .clone prototypes
    var con = obj.constructor;
    var cloneable = [THREE.Vector2, THREE.Vector3, THREE.VEctor4, 
    THREE.Euler, THREE.Spherical, THREE.Cylindrical];
    //dont add THREE.Texture to the above, if it isn't finished loading hwen 
    //  the copy occurs, it never fills in evidently
    for( let c of cloneable )
        if( con==c) return true;
    return false;
}

function cloneObj(obj){
    ///recursive copying for objects composed of a small subset of 
    // supported object types. now:
    //  literals, arrays, basic dicts, adn THREE types with
    // a .clone method)
    if( isPrimitive(obj) ){
        return obj;
    } else if(isTHREE(obj)){
        return obj.clone();
    } else if( Array.isArray(obj) ) {
        return cloneArray(obj);
    } else if( isDict(obj) ) {
        return cloneDict(obj);
    } else throw "cloneObj Unknown type"+ (typeof obj);
}

function cloneArray(array){
    var nArray = [];
    for( const el of array){
        nArray.push( cloneObj( el));
    }
    return nArray;
}

function cloneDict(object){
    var nDict = {};
    for(k of Object.keys(object))
        nDict[k] = cloneObj( object[k] );
    return nDict;
}