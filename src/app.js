import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';
import maskPath2 from './models/MaskUV2.gltf';
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
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.5;
    // controls.enablePan = false; 
    // controls.enableZoom = false;
    // controls.minPolarAngle = Math.PI * 2 / 4 - 0.4;
    // controls.maxPolarAngle = Math.PI * 2 / 3;
    // controls.rotateSpeed = 0.7;
    // //controls.target.y = 0;
    // controls.update();

    let directionalLight = new THREE.DirectionalLight(0xffffff, 7);
    scene.add(directionalLight);

    let amblight = new THREE.AmbientLight( 0x999999 ); // soft white light
    scene.add(amblight);

    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshNormalMaterial();



    let loader = new GLTFLoader();
    loader.load( maskPath, gltf => {
        let model = gltf.scene
        console.log('model', model);
        // model.scale.set(0.008, 0.008, 0.008)
        // model.position.set(0, -2.5, -0)
        // model.rotation.set(0, 1.7, 0)
        let flag = false;
        // let meshes = [];
        model.traverse(child => {
            if (flag) return;
            if (child.isMesh) {
                flag = true;
                console.log(child.geometry);
                child.geometry.rotateY(1.7);
                child.geometry.scale(0.008, 0.008, 0.008);
                child.geometry.translate(0, -2.5, -0);
                // let tempGeo = new THREE.Geometry().fromBufferGeometry(child.geometry);
                // tempGeo.mergeVertices();
                // // after only mergeVertices my textrues were turning black so this fixed normals issues
                // tempGeo.computeVertexNormals();
                // tempGeo.computeFaceNormals();

                // child.geometry = new THREE.BufferGeometry().fromGeometry(tempGeo);

                var positions = child.geometry.attributes.position.array; 
                var vertices = []; 
                for(var i = 0, n = positions.length; i < n; i += 3) { 
                    var x = positions[i]; 
                    var y = positions[i + 1]; 
                    var z = positions[i + 2]; 
                    vertices.push(new THREE.Vector3(x, y, z)); 
                } 
                var faces = []; 
                for(var i = 0, n = vertices.length; i < n; i += 3) { 
                    //faces.push(new THREE.Face3(i, i + 1, i + 2)); 
                } 

                let idx = child.geometry.index.array;
                for (let i = 0; i < idx.length; i+=3 ) {
                    faces.push(new THREE.Face3(idx[i], idx[i + 1], idx[i + 2])); 
                }
                console.log(vertices, faces);

                var geometry = new THREE.Geometry(); 
                geometry.vertices = vertices; 
                geometry.faces = faces; 
                geometry.computeFaceNormals();    
                geometry.mergeVertices() 
                geometry.computeVertexNormals(); 
                child.geometry = geometry;
                // meshes.push(child.geometry)
                scene.add(child);
                console.log(child.geometry);
                mesh = child;
                softVolume = new SoftVolume(scene, mesh, false);
                softVolume.effectRange = 0.5;
                softVolume.setGUI();
                softVolume.computeNormal();
            }
        })

        // mesh = new THREE.BufferGeometryUtils.mergeBufferGeometries(meshes);
        // scene.add(mesh);     

        
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