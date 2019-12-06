import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';
import { SoftVolume } from './SoftVolume';

var camera, scene, renderer;
var softVolume;
var mesh;
var controls;

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

    
    //controls = new OrbitControls(camera, renderer.domElement);
    // controls.enablePan = false;
    // controls.maxDistance = 400;
    // controls.minDistance = 150;
    // controls.minPolarAngle = 0.8;
    // controls.maxPolarAngle = Math.PI * 2 / 5 ;
    // controls.target.y = 0;
    // controls.update();

    let directionalLight = new THREE.DirectionalLight(0xffffff, 7);
    scene.add(directionalLight);

    let amblight = new THREE.AmbientLight( 0x999999 ); // soft white light
    scene.add(amblight);

    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();



    let loader = new GLTFLoader();
    loader.load( maskPath, gltf => {
        var model = gltf.scene
        console.log('model', model);
        // model.scale.set(0.008, 0.008, 0.008)
        // model.position.set(0, -2.5, -0)
        // model.rotation.set(0, 1.7, 0)
        var flag = false;
        model.traverse(child => {
            if (flag) return;
            if (child.isMesh) {
                flag = true;
                child.geometry.rotateY(1.7);
                child.geometry.scale(0.008, 0.008, 0.008);
                child.geometry.translate(0, -2.5, -0);
                scene.add(child);
                mesh = child;
                softVolume = new SoftVolume(scene, mesh, true);
                softVolume.effectRange = 0.5;
                softVolume.setGUI();
            }
        })
                
    })
    
    
    // geometry = new THREE.SphereGeometry(100, 50, 50);
    // geometry.translate(0,0,-200);
    // mesh = new THREE.Mesh( geometry );
    // scene.add(mesh);
    // softVolume = new SoftVolume(scene, mesh, false);
    // softVolume.effectRange = 10;
    // softVolume.setGUI();
    
    //console.log(mesh);
    

    document.body.appendChild(renderer.domElement);

}

function animate() {
    requestAnimationFrame(animate);
    if (softVolume) softVolume.update(camera);
    //controls.update();
    renderer.render(scene, camera);
    
    
}

window.onresize = function () {
    let w = window.innerWidth;
    let h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );
};