import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';
import { MouseLight } from './MouseLight';

var camera, scene, renderer;
var mesh;
var mouseLight;
var cubeCamera;
  
init();
animate();

function init() {

    let width  = window.innerWidth
    let height = window.innerHeight
    
    scene = new THREE.Scene();
    useSkybox();

    //scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor('#FFFFFF');

    let controls = new OrbitControls(camera, renderer.domElement)

    let directionalLight = new THREE.DirectionalLight(0xffffff, 7);
    //scene.add(directionalLight);

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
                
                setGlassMaterial();
            }
        })
        
        console.log(model);
        
        //scene.add(gltf.scene);
        //console.log(scene);
    })
    

    document.body.appendChild(renderer.domElement);
    mouseLight = new MouseLight(scene, camera);
    mouseLight.enable();
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    if (!mesh) return;
    //mesh.setVisible( false );
    if (cubeCamera) {
        mesh.visible = false;
        cubeCamera.position.copy( mesh.position );
        cubeCamera.update( renderer, scene );
        mesh.visible = true;
    }
    mouseLight.update(mesh);
}

function useSkybox() {
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
    console.log('url', urls);
    //var r = "textures/cube/Park3Med/";
    var textureCube = new THREE.CubeTextureLoader().load( urls );
    textureCube.mapping = THREE.CubeRefractionMapping;
    scene.background = textureCube;
}

function setGlassMaterial() {

    cubeCamera = new THREE.CubeCamera(1, 100, 256); 
    scene.add(cubeCamera);

    cubeCamera.renderTarget.texture.mapping = THREE.CubeRefractionMapping;
    var cubeMaterial1 = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: cubeCamera.renderTarget.texture, refractionRatio: 0.93} );
    var cubeMaterial3 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: cubeCamera.renderTarget.texture, refractionRatio: 0.98, reflectivity: 0.9 } );
    var cubeMaterial2 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: cubeCamera.renderTarget.texture, refractionRatio: 0.98, reflectivity: 0.5} );

    mesh.material = cubeMaterial1;
}