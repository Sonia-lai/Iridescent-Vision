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
import {SoundHandler} from './SoundHandler';

var camera, scene, renderer;

var mesh, face; //model mesh
var mouseLight, glassSkin; // use for transparent effect
var softVolume; // use for softvolume effect

var background, gravity;
var controls;
var directionalLight;

var soundHandler;

var spline;
var camPosIndex = 0;
var randomPoints = [];
var start = false



init();
animate();

function initSound() {
    soundHandler = new SoundHandler();
    //call soundHandler.play() when click?
    soundHandler.schedule(()=>{
        console.log('start');
        testSoft();
        testBackground();
        controls.enable = false;
    }, 0, 0);
    
    soundHandler.schedule(()=>{
        console.log('change to gravity');
        if (softVolume) softVolume.disable();
        gravity = new Gravity(scene, mesh)
        gravity.enable()
        background.direction = 'up'
        // background.speed     = 0.3
    }, 0, 30);

    soundHandler.schedule(()=>{
        console.log('change to transparent');
        gravity.disable()
        testTransparent();
    }, 1, 9);

    soundHandler.schedule(()=>{
        console.log('seperate mask and head?');
    }, 1, 38);

    soundHandler.schedule(()=>{
        console.log('???');
    }, 1, 54);
}

function init() {
    initSound();

    let width  = window.innerWidth
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
    initRandomPoints()



    
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
                scene.add(mesh);

            }
        })
    });

    loader.load(headPath, gltf => {
        face = gltf.scene;
        face.position.set(2, 0, -15);
        face.scale.set(0.08, 0.08, 0.08);
        face.rotation.set(0, Math.PI, 0);
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
    // if (start) coverMeshFace()
    if (controls.autoRotate) {
        controls.update();
        if (controls.autoRotateSpeed < 100)  controls.autoRotateSpeed += 0.1

    };
    renderer.render(scene, camera);
}


function testEvent() {
    window.addEventListener('keydown', function(e){  
        var keyID = e.code;
        console.log(keyID);
        if(keyID === 'KeyA')  {
            if(background) {
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
            if (glassSkin)  glassSkin.disable();
            if (softVolume) softVolume.disable();
            if(!gravity) {
                gravity = new Gravity(scene, mesh)
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

        if (keyID == 'ArrowLeft') {
            if (background) {
                background.direction = 'up'
            }
            e.preventDefault();
        }
        if (keyID == 'ArrowRight') {
            if (background) {
                background.direction = 'down'
            }
            e.preventDefault();
        }

        if (keyID == 'ArrowUp') {
            if (background) {
                background.direction = 'forward'
            }
            e.preventDefault();
        }
        if (keyID == 'ArrowDown') {
            if (background) {
                background.direction = 'back'
            }
            e.preventDefault();
        }

        if(keyID == 'KeyZ') {
            camera.position.set(0, 20, 100);
            controls.update();
        }

        if(keyID == 'KeyK') {
            if (background) {
                background.scene.fog.far += 10
                console.log(background.scene.fog.far)
            }

        }
        if (keyID == 'KeyL') {
            if (background) {
                background.scene.fog.far -= 10
                console.log(background.scene.fog.far)
            }
        }

        if(keyID == 'KeyO') {
            if (background) {
                background.speed += 1
            }
        }
        if (keyID == 'KeyP') {
            if (background) {
                background.speed -= 1
            }
        }

        if(keyID == 'KeyI') {
            start = true
            // coverMeshFace()
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
    controls.enabled = true;
    directionalLight.intensity = 1;

    if (!mouseLight)
        mouseLight = new MouseLight(scene, camera);
    mouseLight.enable();
    
    if (!glassSkin)
        glassSkin = new GlassSkin(scene, mesh);
    renderer.setClearColor('#457552');
    directionalLight.intensity = 0.8;
    

    // glassSkin.addTestBackground();
    camera.position.set(0, 10, 40);
    face.position.set(2, 0, -15);
    mesh.position.set(0, 0, 0)
    controls.autoRotate = true
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


function initRandomPoints() {
    for (var i = 0; i < 1000; i++) {
        randomPoints.push(
            new THREE.Vector3(Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * 30 - 15)
        );
    }
    spline =  new THREE.SplineCurve3(randomPoints);
}


function randomMovement() {
    controls.autoRotate = false

    camPosIndex += 5;
    if (camPosIndex > 10000) {
        camPosIndex = 0;
    }
    var camPos = spline.getPoint(camPosIndex / 10000);
    var camRot = spline.getTangent(camPosIndex / 10000);



    face.position.x = camPos.x;
    face.position.y = camPos.y;
    face.position.z = camPos.z;

    face.rotation.x = camRot.x;
    face.rotation.y = camRot.y;
    face.rotation.z = camRot.z;

    mesh.position.x = camPos.x;
    mesh.position.y = camPos.y;
    mesh.position.z = camPos.z;

    mesh.rotation.x = camRot.x;
    mesh.rotation.y = camRot.y;
    mesh.rotation.z = camRot.z;

    face.lookAt(spline.getPoint((camPosIndex + 1) / 10000));
    mesh.lookAt(spline.getPoint((camPosIndex + 1) / 10000));
}



function separateFaceMesh() {

    controls.autoRotate = false

    // face.position.x -= 1
    // face.position.y -= 1
    face.position.z -= 1

    // mesh.position.x += 1
    // mesh.position.y += 1
    mesh.position.z += 1
}


function coverMeshFace() {
    face.visible = false
    mesh.visible = false
    renderer.setClearColor('#FFFFFF');
    setTimeout(() => {

        console.log('start')
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
    renderer.setSize( w, h );
}






