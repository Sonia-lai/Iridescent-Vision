import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';

var camera, scene, renderer;


init();
animate();

function init() {

    let width  = window.innerWidth
    let height = window.innerHeight
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 4);
    

    // camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    // camera.position.z = 1;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor('#FFFFFF');

    


    let controls = new OrbitControls(camera, renderer.domElement)

    let directionalLight = new THREE.DirectionalLight(0xffffff, 7);
    scene.add(directionalLight);

    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();



    let loader = new GLTFLoader();
    loader.load( maskPath, gltf => {
        var model = gltf.scene
        model.scale.set(0.008, 0.008, 0.008)
        model.position.set(0, -2.5, -0)
        model.rotation.set(0, 1.7, 0)
        scene.add(gltf.scene);
        console.log(scene);
    })




    document.body.appendChild(renderer.domElement);


}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

}