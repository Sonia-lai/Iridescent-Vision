import * as THREE from 'three';
import { throws } from 'assert';

export default class Building {
    constructor(x, y, z, width, height, depth, bldgColor, bldgTexture, scene, rotX = 0, rotY = 0, rotZ = 0) {
        function CustomSinCurve(scale) {

            THREE.Curve.call(this);

            this.scale = (scale === undefined) ? 1 : scale;

        }

        CustomSinCurve.prototype = Object.create(THREE.Curve.prototype);
        CustomSinCurve.prototype.constructor = CustomSinCurve;

        CustomSinCurve.prototype.getPoint = function (t) {

            var tx = t * 3 - 1.5;
            var ty = Math.sin(2 * Math.PI * t);
            var tz = 0;

            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

        };

        var path = new CustomSinCurve(10);
        var geometry = new THREE.TubeGeometry(path, 20, 2, 8, false);
        this.geo = geometry
        // this.geo = new THREE.CubeGeometry(width / 2, height / 2, depth);
        this.mat = new THREE.MeshLambertMaterial({
            color: bldgColor,
            map: bldgTexture
        });

        this.mat.map.wrapS = THREE.RepeatWrapping;
        this.mat.map.wrapT = THREE.RepeatWrapping;
        this.mat.map.repeat.set(1, height / width > 2 ? 1 : 2);

        let halfHeight = height / 2,
            isRotated = rotX != 0 || rotY != 0 || rotZ != 0;

        this.mesh = new THREE.Mesh(this.geo, this.mat);
        this.mesh.position.set(x, isRotated ? y : y + halfHeight, z);

        if (isRotated) {
            this.geo.translate(0, halfHeight, 0);
            this.mesh.rotation.x = rotX * Math.PI / 180;
            this.mesh.rotation.y = rotY * Math.PI / 180;
            this.mesh.rotation.z = rotZ * Math.PI / 180;
        }
        this.mesh.castShadow = true;



        // scene.add(this.mesh);
    }
}