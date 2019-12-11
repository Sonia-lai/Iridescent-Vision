import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';
import { MouseLight } from './MouseLight';
import { GlassSkin } from './GlassSkin';
import { SoftVolume } from './SoftVolume';
import { Background } from './Background'
import * as dat from 'dat.gui';

var camera, scene, renderer;

var mesh; //model mesh
var mouseLight, glassSkin; // use for transparent effect
var softVolume; // use for softvolume effect
var background;
var controls;
var directionalLight;

// var textureLoader = new THREE.TextureLoader(),
//     asphaltTexture,
//     bldgTexture,
//     bldgs = [],
//     debris = [],
//     debrisIdealSet = [],
//     ambientLight,
//     hemiLight,

//     // user adjustable
//     brightness = 0.5,
//     fogDistance = 720,
//     speed = 0.5,

//     // should stay as is
//     bldgColor = 0x242424,
//     lightColor = 0x444444,
//     skyColor = 0xaaaaaa,
//     chunkSize = 100,
//     chunksAtATime = 6,
//     debrisPerChunk = 32,
//     debrisMaxChunkAscend = 2,
//     smBldgSize = 10,
//     lgBldgSize = 12, 
//     GUI;


init();
animate();

function init() {

    let width  = window.innerWidth
    let height = window.innerHeight
    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    //camera.position.set(0, 50, 50);
    camera.position.set(0, 0, 4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor('#FFFFFF');
    
    // move controls to global for furthur disable
    controls = new OrbitControls(camera, renderer.domElement)

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
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
                child.geometry.rotateY(1.7);
                child.geometry.scale(0.009, 0.009, 0.009)
                child.geometry.translate(0, -2.5, 0)
                child.geometry.computeVertexNormals();

                mesh = child;
                console.log(mesh.material);
                scene.add(mesh);
            }
        })
    })
    
    // initBackground(renderer, scene)
    document.body.appendChild(renderer.domElement);
    
    testEvent();
}

function animate() {
    requestAnimationFrame(animate);
    if (softVolume) softVolume.update(camera);
    if (glassSkin)  glassSkin.update(renderer);
    if (mouseLight) mouseLight.update(mesh);
    // backgroundUpdate(camera)
    if (background) background.update(camera, mesh);
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
    directionalLight.intensity = 0;
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



// function randomInt(min, max) {
//     return Math.floor(Math.random() * (max - min)) + min;
// }

// function randomAngle() {
//     return Math.floor(Math.random() * 360);
// }




// function cityGenerate(zMove) {

//     return [
//         // northwest
//         new Building(-44, 4, -44 + zMove, lgBldgSize, 40, lgBldgSize, bldgColor, bldgTexture, scene, 0, 35, -85),
//         new Building(-56, -2, -32 + zMove, smBldgSize, 52, smBldgSize, bldgColor, bldgTexture, scene, 15, 0, -12),
//         new Building(-36, 0, -16 + zMove, lgBldgSize, 52, lgBldgSize, bldgColor, bldgTexture, scene, 0, 0, -10),
//         new Building(-24, 0, -36 + zMove, smBldgSize, 52, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, -10),
//         new Building(-16, 0, -20 + zMove, smBldgSize, 52, smBldgSize, bldgColor, bldgTexture, scene, 30, 0, 0),

//         // northeast
//         new Building(24, -2, -44 + zMove, lgBldgSize, 44, lgBldgSize, bldgColor, bldgTexture, scene, -15, 0, 15),
//         new Building(40, 0, -36 + zMove, smBldgSize, 48, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, 15),
//         new Building(48, 0, -36 + zMove, smBldgSize, 38, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, 12),
//         new Building(20, 0, -24 + zMove, smBldgSize, 40, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, 15),
//         new Building(32, 0, -24 + zMove, smBldgSize, 48, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, 15),
//         new Building(42, 0, -24 + zMove, smBldgSize, 38, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, 15),
//         new Building(48, 2, 1 + zMove, lgBldgSize, 32, lgBldgSize, bldgColor, bldgTexture, scene, 0, -25, 80),

//         // southwest
//         new Building(-48, 0, 16 + zMove, smBldgSize, 44, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, -10),
//         new Building(-32, 0, 16 + zMove, smBldgSize, 48, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, -15),
//         new Building(-16, -2, 16 + zMove, smBldgSize, 40, smBldgSize, bldgColor, bldgTexture, scene, -10, 0, -12),
//         new Building(-32, 0, 32 + zMove, lgBldgSize, 48, lgBldgSize, bldgColor, bldgTexture, scene, 0, 0, 15),
//         new Building(-48, 0, 48 + zMove, smBldgSize, 20, smBldgSize, bldgColor, bldgTexture, scene),
//         new Building(-16, 0, 48 + zMove, smBldgSize, 36, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, 15),
//         new Building(-48, 19, 48 + zMove, smBldgSize, 20, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, -15),

//         // southeast
//         new Building(30, 0, 52 + zMove, lgBldgSize, 48, lgBldgSize, bldgColor, bldgTexture, scene, 0, 0, 20),
//         new Building(24, 0, 20 + zMove, smBldgSize, 40, smBldgSize, bldgColor, bldgTexture, scene, 0, 0, 5),
//         new Building(40, 0, 24 + zMove, smBldgSize, 40, smBldgSize, bldgColor, bldgTexture, scene),
//         new Building(24, 0, 32 + zMove, smBldgSize, 36, smBldgSize, bldgColor, bldgTexture, scene),
//         new Building(52, 0, 12 + zMove, smBldgSize, 20, smBldgSize, bldgColor, bldgTexture, scene),
//         new Building(36, 0, 32 + zMove, lgBldgSize, 48, lgBldgSize, bldgColor, bldgTexture, scene, 0, 0, -25)
//     ];
// }

// function debrisGenerate(zMove) {
//     var debrisIdealSet = []
//     var debris = []
//     for (var d = 0; d < debrisPerChunk; ++d) {
//         let halfChunk = chunkSize / 2,
//             debrisParams = {
//                 x: randomInt(-halfChunk, halfChunk),
//                 y: randomInt(0, chunkSize * debrisMaxChunkAscend),
//                 z: randomInt(-halfChunk, halfChunk)
//             };
//         debrisParams.size = Math.abs(debrisParams.x / halfChunk) * 6;
//         debrisParams.height = debrisParams.size * randomInt(2, 3);

//         debrisIdealSet.push({
//             x: debrisParams.x,
//             y: debrisParams.y,
//             z: debrisParams.z,

//             width: debrisParams.size,
//             height: debrisParams.height,
//             depth: debrisParams.size,

//             rotX: randomAngle(),
//             rotY: randomAngle(),
//             rotZ: randomAngle()
//         });
//     }

//     for (var fs of debrisIdealSet)
//         debris.push(new Debris(
//             fs.x,
//             fs.y,
//             fs.z + zMove,
//             fs.width,
//             fs.height,
//             fs.depth,
//             fs.rotX,
//             fs.rotY,
//             fs.rotZ,
//             bldgColor,
//             scene
//         ));

//     return debris
// }

// function floorGenerate(chunkSize, asphaltTexture, zMove) {
//     var groundGeo = new THREE.PlaneGeometry(chunkSize, chunkSize),
//         groundMat = new THREE.MeshLambertMaterial({
//             color: 0x969696,
//             map: asphaltTexture
//         });
//     var ground = new THREE.Mesh(groundGeo, groundMat);
//     ground.rotation.x = -0.5 * Math.PI;
//     ground.position.set(0, 0, zMove);
//     ground.receiveShadow = true;
//     scene.add(ground);
// }


// function backgroundGenerate(chunkSize, chunksAtATime, asphaltTexture) {
//     for (var cz = 1; cz > -chunksAtATime; --cz) {
//         var zMove = chunkSize * cz;
//         floorGenerate(chunkSize, asphaltTexture, zMove)
//         bldgs = cityGenerate(zMove)
//         debris = debrisGenerate(zMove)
//     }
// }

// function lightGenerate(lightColor, brightness) {
//     // lighting
//     ambientLight = new THREE.AmbientLight(lightColor);
//     scene.add(ambientLight);

//     hemiLight = new THREE.HemisphereLight(lightColor, 0xffffff, brightness);
//     hemiLight.position.set(0, 8, 0);
//     scene.add(hemiLight);
// }

// function initBackground(renderer, scene) {
//     asphaltTexture = textureLoader.load("https://i.ibb.co/hVK82BH/asphalt-texture.jpg");
//     bldgTexture = textureLoader.load("https://i.ibb.co/ZGLhtGv/building-texture.jpg");

//     renderer.setClearColor(new THREE.Color(skyColor));
//     renderer.shadowMap.enabled = true;
//     backgroundGenerate(chunkSize, chunksAtATime, asphaltTexture)

//     ambientLight = new THREE.AmbientLight(lightColor);
//     scene.add(ambientLight);

//     hemiLight = new THREE.HemisphereLight(lightColor, 0xffffff, brightness);
//     hemiLight.position.set(0, 8, 0);
//     scene.add(hemiLight);

//     scene.fog = new THREE.Fog(skyColor, 0.01, fogDistance);

// }

// function backgroundUpdate(camera) {
//     console.log(camera.position.z, mesh.position.z)
//     let delta = camera.position.z < -chunkSize ? -chunkSize : speed;
//     camera.position.z -= delta
//     mesh.position.z -= delta

//     for (var d of debris) {
//         if (d.mesh.position.y >= chunkSize * debrisMaxChunkAscend)
//             d.mesh.position.y += -chunkSize * debrisMaxChunkAscend;
//         else
//             d.mesh.position.y += speed;

//         let angleToAdd = speed / chunkSize * (Math.PI * 2);
//         d.mesh.rotation.x += d.mesh.rotation.x >= Math.PI * 2 ? -Math.PI * 2 : angleToAdd;
//         d.mesh.rotation.y += d.mesh.rotation.y >= Math.PI * 2 ? -Math.PI * 2 : angleToAdd;
//         d.mesh.rotation.z += d.mesh.rotation.z >= Math.PI * 2 ? -Math.PI * 2 : angleToAdd;
//     }
// }