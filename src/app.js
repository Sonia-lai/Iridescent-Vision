import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';
import maskPath2 from './models/MaskUV2.gltf';
import { SoftVolume } from './SoftVolume';

var camera, scene, renderer;
var softVolume, softVolume1;
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
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.5;
    // controls.enablePan = false; 
    // controls.enableZoom = false;
    // controls.minPolarAngle = Math.PI * 2 / 4 - 0.4;
    // controls.maxPolarAngle = Math.PI * 2 / 3;
    // controls.rotateSpeed = 0.7;
    // //controls.target.y = 0;
    // controls.update();

    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(-1,-0.4,1);
    scene.add(directionalLight);
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5));

    // let amblight = new THREE.AmbientLight( 0x999999 ); // soft white light
    // scene.add(amblight);

    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();

    let loader = new GLTFLoader();
    loader.load( maskPath, gltf => {
        let model = gltf.scene
        let flag = false;

        model.traverse(child => {
            if (flag) return;
            if (child.isMesh) {
                flag = true;

                child.geometry.rotateY(1.7);
                child.geometry.scale(0.009, 0.009, 0.009);
                child.geometry.translate(0, -2.5, -0);

                scene.add(child);

                mesh = child;
                softVolume = new SoftVolume(scene, mesh, true);
                softVolume.setGUI();
                softVolume.computeNormal();
            }
        })    

        
    })

    // softVolume = new SoftVolume(scene, null, false);
    // softVolume.setGUI();
    
    document.body.appendChild(renderer.domElement);

}

function animate() {
    requestAnimationFrame(animate);
    if (softVolume) softVolume.update(camera);
    if (softVolume1) softVolume1.update(camera);
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