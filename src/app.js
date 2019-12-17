import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';
import headPath from './models/Taj.gltf';
import { MouseLight } from './MouseLight';
import { GlassSkin } from './GlassSkin';
import { SoftVolume } from './SoftVolume';
import { Background } from './Background'
import { HeadMove } from './HeadMove'
import {Activity} from './Activity'
import * as dat from 'dat.gui';
import { Gravity } from './Gravity'
import { SoundHandler } from './SoundHandler';

// import bgImage from './images/poster.jpg'
// import linkImage from './images/sonia.jpg'

var camera, scene, renderer;

var mesh, face; //model mesh
var mouseLight, glassSkin; // use for transparent effect
var softVolume; // use for softvolume effect

var background, gravity, headmove, activity;
var controls;
var directionalLight;

// var raycaster = new THREE.Raycaster(), INTERSECTED;
// var mouse = new THREE.Vector2();
// var eventType, sphere;

var soundHandler;




init();
animate();

function initSound() {
    soundHandler = new SoundHandler();
    //call soundHandler.play() when click?
    soundHandler.schedule(() => {
        console.log('start');
        testSoft();
        testBackground();
        controls.enable = false;
    }, 0, 0);

    soundHandler.schedule(() => {
        console.log('change to gravity');
        if (softVolume) softVolume.disable();
        gravity = new Gravity(scene, mesh)
        gravity.enable()
        background.direction = 'up'
        // background.speed     = 0.3
    }, 0, 30);

    soundHandler.schedule(() => {
        console.log('change to transparent');
        gravity.disable()
        testTransparent();
    }, 1, 9);

    soundHandler.schedule(() => {
        console.log('seperate mask and head?');
    }, 1, 38);

    soundHandler.schedule(() => {
        console.log('???');
    }, 1, 54);
}

function init() {
    initSound();

    let width = window.innerWidth
    let height = window.innerHeight

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 10, 40);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor('#FFFFFF');

    controls = new OrbitControls(camera, renderer.domElement)

    initLight()
    initModel()



    document.body.appendChild(renderer.domElement);
    testEvent();



}




function initLight() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(-1, -0.4, 1);
    scene.add(directionalLight);
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5));
}


function initModel() {
    let loader = new GLTFLoader();

    loader.load(maskPath, gltf => {
        let model = gltf.scene
        model.traverse(child => {
            if (child.isMesh) {
                child.geometry.rotateY(1.7);
                child.geometry.scale(0.1, 0.1, 0.1)
                child.geometry.translate(0, -30, 0)
                child.geometry.computeVertexNormals();
                mesh = child;
                mesh.name = 'mask'
                scene.add(mesh);
            }
        })
    });

    loader.load(headPath, gltf => {
        face = gltf.scene;
        face.position.set(2, 0, -15);
        face.scale.set(0.08, 0.08, 0.08);
        face.rotation.set(0, Math.PI, 0);
        face.name = 'face'
        scene.add(face);
    });


}


function animate() {
    requestAnimationFrame(animate);
    if (softVolume) softVolume.update(camera);
    if (glassSkin) glassSkin.update(renderer, camera);
    if (mouseLight) mouseLight.update(mesh);
    if (background) background.update(camera, mesh, face);
    if (gravity) gravity.update(mesh.position)
    if (headmove) headmove.update(controls)
    if (activity) activity.update(camera)

    renderer.render(scene, camera);


}


function testEvent() {
    window.addEventListener('keydown', function (e) {
        var keyID = e.code;
        console.log(keyID);
        if (keyID === 'KeyA') {
            if (background) {
                background.disable()
                background = undefined
            }

            if (softVolume) softVolume.disable();
            if (gravity) {
                gravity.disable()
                gravity = undefined
            }
            testTransparent();
            e.preventDefault();
        }
        if (keyID == 'KeyB') {
            if (mouseLight) mouseLight.disable();
            if (glassSkin) glassSkin.disable();
            if (gravity) {
                gravity.disable()
                gravity = undefined
            }
            testSoft();
            e.preventDefault();
        }
        if (keyID == 'KeyC') {
            testOrigin();
            if (gravity) {
                gravity.disable()
                gravity = undefined
            }
            e.preventDefault();
        }
        if (keyID == 'KeyD') {
            if (mouseLight) mouseLight.disable();
            if (glassSkin) glassSkin.disable();
            if (gravity) {
                gravity.disable()
                gravity = undefined
            }
            testBackground();
            e.preventDefault();
        }
        if (keyID == 'KeyE') {
            camera.position.x += 1;
            mesh.position.z -= 1;
            e.preventDefault();
        }

        if (keyID == 'KeyF') {
            if (mouseLight) mouseLight.disable();
            if (glassSkin) glassSkin.disable();
            if (softVolume) softVolume.disable();
            if (!gravity) {
                gravity = new Gravity(scene, mesh)
                gravity.enable()
            } else {
                gravity.disable()
                gravity = undefined
            }
            e.preventDefault();
        }
        if (keyID == 'KeyG') {

            if (gravity) {
                gravity.applyN = true
            }
            e.preventDefault();
        }


        if (keyID == 'KeyO') {
            if (background) {
                background.speed += 1
            }
        }


        if (keyID == 'KeyP') {
            if (background) {
                background.speed -= 1
            }
        }

        if (keyID == 'KeyI') {
            backgroundFlash()
        }

        if (keyID == 'KeyQ') {
            headmove = new HeadMove(renderer, camera, scene, face, mesh, controls)
            headmove.enable()
        }
        if (keyID == 'KeyW') {
            headmove.changeMode('shake', camera, face, mesh)
        }

        if (keyID == 'KeyE') {
            headmove.changeMode('flake', camera, face, mesh)
        }
        if (keyID == 'KeyR') {
            headmove.changeMode('up', camera, face, mesh)
        }
        if (keyID == 'KeyT') {
            headmove.changeMode('rotate', camera, face, mesh)
        }

        if (keyID == 'KeyU') {
            if (headmove) {
                headmove.disable()
                headmove = undefined
            }
            activity = new Activity(camera, scene, controls)
            activity.enable()
        }


    }, false);

}



function testBackground() {
    controls.enabled = false;

    if (!background) {
        background = new Background(renderer, scene);
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
    if (background) {
        background.disable()
        background = undefined
    }
    if (softVolume) softVolume.disable();
    directionalLight.intensity = 1;

    if (!mouseLight)
        mouseLight = new MouseLight(scene, camera);
    mouseLight.enable();

    if (!glassSkin)
        glassSkin = new GlassSkin(scene, mesh);

    renderer.setClearColor('#457552');  
    directionalLight.intensity = 0.8;

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


function backgroundFlash() {
    face.visible = false
    mesh.visible = false
    renderer.setClearColor('#FFFFFF');
    setTimeout(() => {
        renderer.setClearColor('#457552');
        face.visible = true
        mesh.visible = true
    }, 100);
}

window.onresize = function () {
    let w = window.innerWidth;
    let h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}






