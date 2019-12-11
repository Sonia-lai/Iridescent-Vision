import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import maskPath from './models/mask.gltf';
import { MouseLight } from './MouseLight';
import { GlassSkin } from './GlassSkin';
import { SoftVolume } from './SoftVolume';
import * as dat from 'dat.gui';
import * as OIMO from 'oimo';
import { SceneUtils, MeshStandardMaterial } from 'three/build/three.module';
//import * as OimoMain from 'oimo/examples/js/main';
//import * as OimoMain from 'oimo/examples/js/main';



var camera, scene, renderer;

var mesh; //model mesh
var mouseLight, glassSkin; // use for transparent effect
var softVolume; // use for softvolume effect
var controls;
var directionalLight;

//temp
var world;
var bodys=[];
var geo = {

    plane:      new THREE.PlaneBufferGeometry( 1, 1 ),
    box:        new THREE.BoxBufferGeometry(1,1,1),
    hardbox:    new THREE.BoxBufferGeometry(1,1,1),
    cone:       new THREE.CylinderBufferGeometry( 0,1,0.5 ),
    wheel:      new THREE.CylinderBufferGeometry( 1,1,1, 18 ),
    sphere:     new THREE.SphereBufferGeometry( 1, 24, 18 ),
    highsphere: new THREE.SphereBufferGeometry( 1, 32, 24 ),
    cylinder:   new THREE.CylinderBufferGeometry( 1,1,1,12,1 ),

    mouse:      new THREE.CylinderBufferGeometry( 0.25,0,0.5 ),

}

init();
animate();

function init() {

    let width  = window.innerWidth
    let height = window.innerHeight
    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    //camera.position.set(0, 0, 4);
    camera.position.set(0, 10, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor('#FFFFFF');
    
    // move controls to global for furthur disable
    controls = new OrbitControls(camera, renderer.domElement)

    //let directionalLight = new THREE.DirectionalLight(0xffffff, 7);

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
                child.geometry.scale(0.1, 0.1, 0.1)
                child.geometry.translate(0, -30, 0)
                child.geometry.computeVertexNormals();

                mesh = child;
                console.log(mesh.material);
                scene.add(mesh);
                //testSoft();
                //testTransparent();
                demo();
            }
        })
    })
    // let s = new THREE.SphereGeometry( 10, 24, 18 );
    // scene.add(new THREE.Mesh(s));
    

    document.body.appendChild(renderer.domElement);
    
    testEvent();
}

function animate() {
    requestAnimationFrame(animate);
    if (softVolume) softVolume.update(camera);
    if (glassSkin) glassSkin.update(renderer);
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
        if (keyID == 'KeyD') {
            applyN = true;
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
    controls.enabled = false;
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

function rand( low, high ) { return low + Math.random() * ( high - low ); };
function randInt( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); };


function demo() {

    world = new OIMO.World({ 
        timestep: 1/60, 
        iterations: 8, 
        broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
        worldscale: 1, 
        random: true, 
        info:true, // display statistique
        gravity: [0,0,0],
    });

    add({ type:'sphere', geometry: geo.highsphere, size:[10, 30, 8], pos:[0,0,0], density:1 }, true);
    //addModel();
    // basic geometry body

    var i = 500, d, h, w, o;
    
    while( i-- ) {

        w = rand(0.1,0.3);
        h = rand(0.3,4);
        d = rand(0.3,1);


        o = {

            move:true, 
            density:1,
            pos : [ 
                rand(10,100) * ( randInt(0,1) ? -1:1 ),
                rand(10,500) * ( randInt(0,1) ? -1:1 ),
                rand(10,100) * ( randInt(0,1) ? -1:1 ),
            ],
            rot : [
                randInt(0,360),
                randInt(0,360),
                randInt(0,360),
            ]

        };

        // switch( randInt(0,2) ){

        //     case 0 : o.type = 'sphere'; o.size = [w]; break;
        //     case 1 : o.type = 'box';  o.size = [w,w,d]; break;
        //     case 2 : o.type = 'cylinder'; o.size = [d,h,d]; break;

        // }
        o.type = 'sphere';
        o.size = [w];

        add( o );

    }

    // world internal loop

    world.postLoop = postLoop;
    world.play();

};

var applyN = false;
function postLoop () {
    
    var force, m;
    var center = new THREE.Vector3(0, 0, 0);
    var r = 3;
    bodys.forEach( function ( b, id ) {

        if( b.type === 1 ){
            //console.log(b);
            m = b.mesh;
            force = m.position.clone().negate().normalize().multiplyScalar(0.2);
            if (applyN) force = force.negate().multiplyScalar(50);
            b.applyImpulse( center, force );

        }

    });
    if (applyN) applyN = false;
}

function add( o, noMesh ){

    if( world ){
        var b = world.add( o );
        bodys.push( b );
    }

    let s;
    if (o.geometry) {
        s = o.geometry;
    } else {
        s = new THREE.SphereGeometry( 1, 24, 24 );
    }

    if( !noMesh ){
        let meshtemp = new THREE.Mesh(s, new MeshStandardMaterial());
        scene.add(meshtemp);
        meshtemp.position.set(b.pos[0], b.pos[1], b.pos[2]);
        s.scale(o.size[0], o.size[1], o.size[2]);
        if( world ) b.connectMesh( meshtemp );
    }
    
    if( world ) return b;

}

function toRad ( r ) {
    let torad = 0.0174532925199432957;

    var i = r.length;
    while(i--) r[i] *= torad;
    return r;

}