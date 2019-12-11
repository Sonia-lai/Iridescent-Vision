import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';
import headPath from './models/Taj.gltf';
import { MouseLight } from './MouseLight';
import { GlassSkin } from './GlassSkin';
import { SoftVolume } from './SoftVolume';
import * as dat from 'dat.gui';

var camera, scene, renderer;

var mesh; //model mesh
var mouseLight, glassSkin; // use for transparent effect
var softVolume; // use for softvolume effect
var controls;
var directionalLight;

init();
animate();

function init() {

    let width  = window.innerWidth
    let height = window.innerHeight
    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor('#FFFFFF');
    
    // move controls to global for furthur disable
    controls = new OrbitControls(camera, renderer.domElement)

    //let directionalLight = new THREE.DirectionalLight(0xffffff, 7);

    directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(-1,-0.4,1);
    scene.add(directionalLight);
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5));

    let loader = new GLTFLoader();

    loader.load( maskPath, gltf => {
        let model = gltf.scene

        // move scene add model inside traverse
        model.traverse(child => {
            if (child.isMesh) {
                // TODO: ensure gltf file has only one mesh child!
                child.geometry.rotateY(Math.PI/2 + 0.2);
                child.geometry.scale(0.009, 0.009, 0.009)
                child.geometry.translate(0, -2.5, -0)
                child.geometry.computeVertexNormals();

                mesh = child;
                console.log(mesh.material);
                scene.add(mesh);
            }
        })
    })

    let MeshMaterial = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        // emissive: 0xc325e,
        // specular: 0x441833,
        map: headTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.7,
        shininess: 30,
        
    } );

    loader.load( headPath, gltf => {
        let model = gltf.scene;
        model.position.set(0.1, -0.5, -1.7);
        model.scale.set(0.009, 0.009, 0.009);
        model.rotation.set(0, Math.PI, 0);
        scene.add(model);
    })
    

    document.body.appendChild(renderer.domElement);
    
    testEvent();
}

function animate() {
    requestAnimationFrame(animate);
    if (softVolume) softVolume.update(camera);
    if (glassSkin) glassSkin.update(renderer, camera);
    if (mouseLight) mouseLight.update(mesh);

    renderer.render(scene, camera);
    
}


function testEvent() {
    window.addEventListener('keydown', function(e){  
        var keyID = e.code;
        console.log(keyID);
        if(keyID === 'KeyA')  {
            if (softVolume) softVolume.disable();
            testTransparent();
            e.preventDefault();
        }
        if (keyID == 'KeyB') {
            if (mouseLight) mouseLight.disable();
            if (glassSkin) glassSkin.disable();
            testSoft();
            e.preventDefault();
        }
        if (keyID == 'KeyC') {
            testOrigin();
            e.preventDefault();
        }

    }, false);

}

function testOrigin() {
    controls.enabled = true;
    directionalLight.intensity = 0.5;
    if (mouseLight) mouseLight.disable();
    if (glassSkin) glassSkin.disable();
    if (softVolume) softVolume.disable();
}

function testTransparent() {
    controls.enabled = true;
    directionalLight.intensity = 1;
    if (!mouseLight)
        mouseLight = new MouseLight(scene, camera);
    mouseLight.enable();
    
    if (!glassSkin)
        glassSkin = new GlassSkin(scene, mesh);
    glassSkin.addTestBackground();
    glassSkin.enable();
}

function testSoft() {
    controls.enabled = false;
    directionalLight.intensity = 0.5;
    if (!softVolume) {
        softVolume = new SoftVolume(scene, mesh, true);
        let gui = new dat.GUI();
        softVolume.setGUI(gui);
    }
    softVolume.enable();
}

window.onresize = function () {
    let w = window.innerWidth;
    let h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );
};
