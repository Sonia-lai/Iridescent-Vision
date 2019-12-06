import * as THREE from 'three';

function Particle( x, y, z, mass ) {

    this.position = new THREE.Vector3();
    this.previous = new THREE.Vector3();
    this.original = new THREE.Vector3();
    this.a = new THREE.Vector3( 0, 0, 0 ); 
    this.mass = mass;
    this.invMass = 1 / mass;
    this.tmp = new THREE.Vector3();
    this.tmp2 = new THREE.Vector3();
    this.distance = 0;
    this.adj = [];
    this.DRAG = 0.97; //0.97
    this.BACKDRAG = 0.3;

    this.position.set( x, y, z);
    this.previous.set( x, y, z);
    this.original.set( x, y, z);
}



Particle.prototype.addForce = function ( force ) {

    this.a.add(
        this.tmp2.copy( force ).multiplyScalar( this.invMass )
    );

};

Particle.prototype.integrate = function ( timesq ) {

    var newPos = this.tmp.subVectors( this.position, this.previous );
    var tmpD = this.DRAG
    if (this.position.distanceTo(this.original) < this.previous.distanceTo(this.original)){
        tmpD = this.BACKDRAG;
    }

    newPos.multiplyScalar( tmpD ).add( this.position );
    
    newPos.add( this.a.multiplyScalar( timesq ) );

    this.tmp = this.previous;
    this.previous = this.position;
    this.position = newPos;

    this.a.set( 0, 0, 0 );
};

export {Particle};