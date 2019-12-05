import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';
import { MouseLight } from './MouseLight';
import { GlassSkin } from './GlassSkin';


var camera, scene, renderer;
var mesh;
var mouseLight;
var glassSkin;
  
init();
animate();

function init() {

    let width  = window.innerWidth
    let height = window.innerHeight
    
    scene = new THREE.Scene();

    //scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor('#FFFFFF');

    let controls = new OrbitControls(camera, renderer.domElement)

    let directionalLight = new THREE.DirectionalLight(0xffffff, 7);
    scene.add(directionalLight);

    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();

    let loader = new GLTFLoader();
    // loader.load( maskPath, gltf => {
    //     var model = gltf.scene
    //     model.scale.set(0.008, 0.008, 0.008)
    //     model.position.set(3, -2.5, 0)
    //     //model.rotation.set(0, 1.7, 0)
        
    //     scene.add(gltf.scene);
    //     console.log(scene);
    // })

    loader.load( maskPath, gltf => {
        var model = gltf.scene
        // model.scale.set(0.008, 0.008, 0.008)
        // model.position.set(0, -2.5, -0)
        model.rotation.set(0, 1.7, 0)
        model.traverse(child => {
            if (child.isMesh) {
                child.geometry.scale(0.008, 0.008, 0.008)
                child.geometry.translate(0, -2.5, -0)
                child.geometry.computeVertexNormals();
                //mesh = new THREE.Mesh( child.geometry, cubeMaterial3 );
                mesh = child;
                scene.add(mesh);
            }
        })
        
        console.log(model);
        
        //scene.add(gltf.scene);
        //console.log(scene);
    })
    

    document.body.appendChild(renderer.domElement);
    
    testEvent();
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);

    if (glassSkin) glassSkin.update(renderer);
    if (mouseLight) mouseLight.update(mesh);
}

function testEvent() {
    window.addEventListener('keydown', function(e){  
        var keyID = e.code;
        
        if(keyID === 'KeyA')  {
            mouseLight = new MouseLight(scene, camera);
            mouseLight.enable();

            glassSkin = new GlassSkin(scene, mesh);
            glassSkin.addTestBackground();
            
            e.preventDefault();
        }
    }, false);

}

