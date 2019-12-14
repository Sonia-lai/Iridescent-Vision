import * as THREE from 'three';
import { Vector3 } from 'three/build/three.module';

var GlassSkin = function(scene, mesh) {
    
    this.scene = scene;
    this.mesh = mesh;
    this.uuid = []
    let cubeCamera;
    let enabled = false;
    let oriMaterial = mesh.material;
    let cubeMaterial;

    let init = () => {

        for (var child of this.scene.children) {
            this.uuid.push(child.uuid)
        } 

        cubeCamera = new THREE.CubeCamera(1, 100, 256); 
        this.scene.add(cubeCamera);
    
        cubeCamera.renderTarget.texture.mapping = THREE.CubeRefractionMapping;
        cubeMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: cubeCamera.renderTarget.texture, refractionRatio: 0.93} );
        var cubeMaterial2 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: cubeCamera.renderTarget.texture, refractionRatio: 0.98, reflectivity: 0.5} );
        var cubeMaterial3 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: cubeCamera.renderTarget.texture, refractionRatio: 0.98, reflectivity: 0.9 } );
    
        this.mesh.material = cubeMaterial;
    }
    
    this.update = (renderer, camera) => {
        if (!enabled) return;
        this.mesh.visible = false;
        //let disVec = this.mesh//this.mesh.position.clone().add(camera.position.clone().multiplyScalar(0.1))
        cubeCamera.position.copy( camera.position );

        cubeCamera.update( renderer, this.scene );
        this.mesh.visible = true;
    }

    this.addTestBackground = () => {
        var r = "./";
        var url_temp = [
            r + "px.jpg", r + "nx.jpg",
            r + "py.jpg", r + "ny.jpg",
            r + "pz.jpg", r + "nz.jpg"
        ];
        var urls = [];
        for (var i=0; i<6; i++) urls.push("");
    
        var context = require.context('./textures/Park3Med/', true, /\.(jpg)$/);
        context.keys().forEach((filename)=>{
            let idx = url_temp.indexOf(filename);
            if (idx !== -1) {
                urls[idx] = context(filename);
            }
        });

        var textureCube = new THREE.CubeTextureLoader().load( urls );
        this.scene.background = textureCube;
    }

    this.enable = () => {
        enabled = true;
        this.mesh.material = cubeMaterial;
    }

    this.disable = () => {
        enabled = false;
        this.scene.background = undefined;
        this.mesh.material = oriMaterial;
    }

    this.dispose = () => {
        this.scene.background = undefined;
        this.mesh.material = oriMaterial;
        this.scene.remove(CubeCamera);
    }

    init();
    
}

export {GlassSkin};