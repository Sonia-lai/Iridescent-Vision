import * as THREE from 'three';
import { Vector3 } from 'three/build/three.module';


var headShake = function(camera, scene, face, mesh, controls) {

    let randomPoints = [], camPosIndex = 0, spline;
    this.camera = camera
    this.scene  = scene
    this.face   = face
    this.mesh   = mesh
    this.controls = controls


    let resetPos = () => {
        this.camera.position.set(0, 10, 40);
        this.face.position.set(2, 0, -30);
        this.mesh.position.set(0, 0, 0)
    }

    let initRandomPoints = () => {
        for (var i = 0; i < 1000; i++) {
            randomPoints.push(
                new THREE.Vector3(Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * 30 - 15)
            );
        }
        spline = new THREE.SplineCurve3(randomPoints);
    }

    let setPos = (model, pos, rot, index) => {
        model.position.x = pos.x;
        model.position.y = pos.y;
        model.position.z = pos.z;

        model.rotation.x = rot.x;
        model.rotation.y = rot.y;
        model.rotation.z = rot.z;

        model.lookAt(spline.getPoint((index + 1) / 10000));
    }

    let randomMovement= () => {
        controls.autoRotate = false
        camPosIndex += 1;
        if (camPosIndex > 10000) camPosIndex = 0;

        var camPos = spline.getPoint(camPosIndex / 10000);
        var camRot = spline.getTangent(camPosIndex / 10000);
        
        setPos(this.camera, camPos, camRot, camPosIndex)
        setPos(this.face, camPos, camRot, camPosIndex)
        setPos(this.mesh, camPos, camRot, camPosIndex)
    }
}