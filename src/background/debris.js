import * as THREE from 'three';

export default class Debris {
    constructor(x, y, z, width, height, depth, rotX = 0, rotY = 0, rotZ = 0, bldgColor, scene) {


        this.geo = new THREE.CubeGeometry(width, height, depth);
        this.mat = new THREE.MeshLambertMaterial({
            color: bldgColor
        });
        this.mesh = new THREE.Mesh(this.geo, this.mat);
        this.mesh.position.set(x, y, z);
        this.mesh.rotation.set(
            rotX * Math.PI / 180,
            rotY * Math.PI / 180,
            rotZ * Math.PI / 180
        );
    }
} 
