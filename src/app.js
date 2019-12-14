import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';
import headPath from './models/Taj.gltf';
import { MouseLight } from './MouseLight';
import { GlassSkin } from './GlassSkin';
import { SoftVolume } from './SoftVolume';
import { Background } from './Background'
import * as dat from 'dat.gui';
import { Gravity } from './Gravity'



var camera, scene, renderer;

var mesh, face; //model mesh
var mouseLight, glassSkin; // use for transparent effect
var softVolume; // use for softvolume effect

var background, gravity;
var controls;
var directionalLight;




init();
animate();

function init() {

    let width  = window.innerWidth
    let height = window.innerHeight
    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
<<<<<<< HEAD
    //camera.position.set(0, 50, 50);
    camera.position.set(0, 0, 4);
=======
    // camera.position.set(0, 50, 50);

    camera.position.set(0, 10, 40);

>>>>>>> 403310612a70b1f8a3fb92338e8b60f44a409d05

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
                child.geometry.rotateY(1.7);
<<<<<<< HEAD
                child.geometry.scale(0.009, 0.009, 0.009)
                child.geometry.translate(0, -2.5, 0)
=======
                child.geometry.scale(0.1, 0.1, 0.1)
                child.geometry.translate(0, -30, 0)
>>>>>>> 403310612a70b1f8a3fb92338e8b60f44a409d05
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
        side: THREE.DoubleSide,
        alphaTest: 0.7,
        shininess: 30,
        
    } );

    loader.load( headPath, gltf => {
        let model = gltf.scene;
        model.position.set(2, 0, -15);
        model.scale.set(0.08, 0.08, 0.08);
        model.rotation.set(0, Math.PI, 0);
        face = model
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
    if (background) background.update(camera, mesh, face);
    if (gravity) gravity.update()   
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
        if (keyID == 'KeyD') {
            testBackground();
            e.preventDefault();
        }
        if (keyID == 'KeyE') {
            camera.position.x += 1;
            mesh.position.z -= 1;
            e.preventDefault();
        }

        if (keyID == 'KeyF') {
            if(!gravity) {
                gravity = new Gravity(scene)
                gravity.enable()
            } else {
                gravity.disable()
                gravity = undefined
            }
            e.preventDefault();
        }
        if (keyID == 'KeyG') {
            if(gravity) {
                gravity.applyN = true
            }
            e.preventDefault();
        }

    }, false);

}

function testBackground() {
    controls.enabled = false;
    if (!background) {
        background = new Background(renderer, scene);  
        console.log(background)
    } 
    else {
        background.disable()
        background = undefined
    }
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
}
