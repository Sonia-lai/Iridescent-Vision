import * as THREE from 'three';
import { Vector3 } from 'three/build/three.module';

var MouseLight = function (scene, camera) {

    this.scene = scene;
    this.camera = camera;

    this.initIntensity = 0.3;
    this.initAngle = 0.1;

    this.intensityStep = 0.02;
    this.angleStep = 0.005;

    let light, target;
    let raycaster = new THREE.Raycaster();
    let mouse = {x:0, y:0}
    let count = 0;
    let update = false;

    let initLight = () => {
        light = new THREE.SpotLight( 0xffffff, this.initIntensity);
        light.position.copy(camera.position);
        light.angle = this.initAngle;
        light.penumbra = 1;
        this.scene.add(light);
    
        target = new THREE.Object3D();
        this.scene.add(target);
        light.target = target; 
    }
    
    // Follows the mouse event
    let onMouseMove = (event) => {
      // Update the mouse variable
      event.preventDefault();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    this.update = (mesh) => {
        if (!update) return;

        light.position.copy(this.camera.position);

        if (!raycaster || !light || !mesh) return;

        raycaster.setFromCamera( mouse, this.camera );
        var intersects = raycaster.intersectObjects([mesh], true );
    
        if ( intersects.length != 0 ) {
            count ++;
            if (count % 50 == 0) {
                light.intensity += this.intensityStep; 
                light.angle += this.angleStep; 
            }
            target.position.copy(intersects[0].point);
        } else {
            target.position.copy(new Vector3(-100,-100,-100));
        }
    }

    this.enable = () => {
        update = true;
    }

    this.disable = () => {
        update = false;
    }

    this.dispose = () => {
        this.scene.remove(light);
        this.scene.remove(target);
        //light.dispose();
        //arget.dispose();
        document.removeEventListener( 'mousemove', onMouseMove, false );
    }

    document.addEventListener('mousemove', onMouseMove, false);
    initLight();
}

export {MouseLight};