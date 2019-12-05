import * as THREE from 'three';
import Stats from './examples/jsm/libs/stats.module.js';
import { PLYLoader } from './examples/jsm/loaders/PLYLoader.js';
import GLTFLoader from 'three-gltf-loader';
import maskPath from './models/mask.gltf';

//import r from './textures/Park3Med/';
//import luckyModel from './models/test/Lucy100k.ply';

var container, stats;
var camera, scene, renderer;
var pointLight;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
init();
animate();
function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    // camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100000 );
    // camera.position.z = - 4000;
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 4);
    //
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
    scene = new THREE.Scene();
    //scene.background = textureCube;
    // LIGHTS
    var ambient = new THREE.AmbientLight( 0xffffff );
    scene.add( ambient );
    pointLight = new THREE.PointLight( 0xffffff, 2 );
    scene.add( pointLight );
    // light representation
    var sphere = new THREE.SphereBufferGeometry( 100, 16, 8 );
    var mesh = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
    mesh.scale.set( 0.05, 0.05, 0.05 );
    pointLight.add( mesh );
    // material samples
    var cubeMaterial3 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: textureCube, refractionRatio: 0.98, reflectivity: 0.9 } );
    var cubeMaterial2 = new THREE.MeshPhongMaterial( { color: 0xccfffd, envMap: textureCube, refractionRatio: 0.985 } );
    var cubeMaterial1 = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.98 } );
    //
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    stats = new Stats();
    container.appendChild( stats.dom );
    

    // var modelContext = require.context('./models/test/', true, /\.(ply)$/);
    // var luckyModel = "";
    // modelContext.keys().forEach((filename)=>{
    //     if (filename == './Lucy100k.ply') {
    //         luckyModel = modelContext(filename);
    //     }
    // });
    // console.log(luckyModel);

    var loader = new GLTFLoader();
    //var loader = new PLYLoader();
    // loader.load(maskPath, function ( geometry ) {
    //     createScene( geometry, cubeMaterial1, cubeMaterial2, cubeMaterial3 );
    // } );
    loader.load( maskPath, gltf => {
        var model = gltf.scene
        model.scale.set(0.008, 0.008, 0.008)
        model.position.set(0, 0, -0)
        model.rotation.set(0, 1.7, 0)
        var mesh = new THREE.Mesh( gltf.geometry, cubeMaterial1 );
        scene.add(mesh);
        console.log(scene);
    })
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    //
    window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function createScene( geometry, m1, m2, m3 ) {
    geometry.computeVertexNormals();
    var s = 0.008;
    var mesh = new THREE.Mesh( geometry, m1 );
    mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
    scene.add( mesh );
    return;
    var mesh = new THREE.Mesh( geometry, m2 );
    mesh.position.x = - 1500;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
    scene.add( mesh );
    var mesh = new THREE.Mesh( geometry, m3 );
    mesh.position.x = 1500;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = s;
    scene.add( mesh );
}
function onDocumentMouseMove( event ) {
    mouseX = ( event.clientX - windowHalfX ) * 4;
    mouseY = ( event.clientY - windowHalfY ) * 4;
}
//
function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}
function render() {
    var timer = - 0.0002 * Date.now();
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;
    camera.lookAt( scene.position );
    pointLight.position.x = 1500 * Math.cos( timer );
    pointLight.position.z = 1500 * Math.sin( timer );
    renderer.render( scene, camera );
}