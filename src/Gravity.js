import { SceneUtils, MeshStandardMaterial } from 'three/build/three.module';
import * as THREE from 'three';
import * as OIMO from 'oimo';
import {Vec3} from 'oimo/src/math/Vec3';

var Gravity = function (scene, mesh) {
    let geo = {

        plane     : new THREE.PlaneBufferGeometry(1, 1),
        box       : new THREE.BoxBufferGeometry(1, 1, 1),
        hardbox   : new THREE.BoxBufferGeometry(1, 1, 1),
        cone      : new THREE.CylinderBufferGeometry(0, 1, 0.5),
        wheel     : new THREE.CylinderBufferGeometry(1, 1, 1, 18),
        sphere    : new THREE.SphereBufferGeometry(1, 24, 18),
        highsphere: new THREE.SphereBufferGeometry(1, 32, 24),
        cylinder  : new THREE.CylinderBufferGeometry(1, 1, 1, 12, 1),
        mouse     : new THREE.CylinderBufferGeometry(0.25, 0, 0.5),

    }


    let world;
    let bodys = [];
    let size = 200;
    this.uuid = []

    this.applyN = true;
    this.scene  = scene;
    this.enabled = false;
    this.center = new THREE.Vector3(0, 0, 0);
    this.all = false
    this.mesh = mesh


    let rand = (low, high) => low + Math.random() * (high - low);
    let randInt = (low, high) => low + Math.floor(Math.random() * (high - low + 1));
    let initWorld = () => {
        return new OIMO.World({
                timestep: 1 / 60,
                iterations: 8,
                broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
                worldscale: 1,
                random: true,
                gravity: [0, 0, 0],
            });
    }

    let createParticle = (width) => {
        let particle = {
            move: true,
            density: 1,
            pos: [
                rand(10, 100) * (randInt(0, 1) ? -1 : 1),
                rand(10, 500) * (randInt(0, 1) ? -1 : 1),
                rand(10, 100) * (randInt(0, 1) ? -1 : 1),
            ],
            rot: [
                randInt(0, 360),
                randInt(0, 360),
                randInt(0, 360),
            ]
        };
        particle.type = 'sphere';
        particle.size = [width];
        return particle
    }

    let add2World = (o, noMesh) => {

        if (world) {
            var b = world.add(o);
            bodys.push(b);
        }

        let s;
        if (o.geometry) {
            s = o.geometry;
        } else {
            s = new THREE.SphereGeometry(1, 32, 32);
        }

        let MeshMaterial = new THREE.MeshStandardMaterial({
            color: 0xffe6e6,
            side: THREE.DoubleSide,
            alphaTest: 0.7,
            shininess: 30 });

        if (!noMesh) {
            
            let meshtemp = new THREE.Mesh(s, MeshMaterial);
            this.scene.add(meshtemp);
            meshtemp.position.set(b.pos[0], b.pos[1], b.pos[2]);
            s.scale(o.size[0], o.size[1], o.size[2]);
            if (world) b.connectMesh(meshtemp);
        }

        if (world) return b;

    }

    let postLoop = (pos) => {
        
        var force, m;
        var r = 3;
        let applyN = this.applyN
        //let center = this.center
        let center = new Vec3(pos.x, pos.y, pos.z);
        let all    = this.all

        bodys.forEach(function (b, id) {
            
            if (b.type === 1) {
                m = b.mesh;
                force = center.clone().sub(m.position).normalize().multiplyScalar(1);
                //force = m.position.clone().negate().normalize().multiplyScalar(0.2);
                if (applyN && (Math.floor(Math.random() * 4) || all)) {
                    if (!all) force = force.negate().multiplyScalar(Math.random() * 50);
                    else force = force.negate().multiplyScalar(Math.random() * 70);
                } 
                b.applyImpulse(center, force);

            } else {
                b.setPosition(center);
            }

        });
        if (this.applyN) this.applyN = false;
        if (this.all) this.all = false
    }

    let init = () => {
        changeTexture()
        for (var child of this.scene.children) {
            this.uuid.push(child.uuid)
        } 
        world = initWorld()
        add2World({ type: 'sphere', geometry: geo.highsphere, size: [10, 30, 8], pos: [0, 0, 0], density: 1 }, true);
        for (var i = 0; i < size; i++) {
            var b = add2World(createParticle(rand(0.5, 1)))
        }
        

    };
    let changeTexture = () => {
        var textureLoader = new THREE.TextureLoader();
        var texture = textureLoader.load("https://raw.githubusercontent.com/aatishb/drape/master/textures/patterns/circuit_pattern.png");

        let MeshMaterial = new THREE.MeshStandardMaterial({
            color: 0xebaf09,
            emissive: 0xc325e,
            specular: 0x441833,
            map: texture,
            side: THREE.DoubleSide,
            // alphaTest: 0.7,
            // shininess: 30,
            roughness: 0.32,
            metalness: 0.28

        });

        this.mesh.material = MeshMaterial;

    }


    this.enable = () => {
        this.enabled = true
        world.play()
    }


    this.disable = () => {
        this.enabled = false
        world.stop()

        for (var i = this.scene.children.length - 1; i >= 0; i--) {
            let obj = this.scene.children[i]
            if (!this.uuid.includes(obj.uuid)) {
                clearObject(obj, this.scene)
            }

        }
    }

    function clearObject(obj, scene) {
        scene.remove(obj);
        if (obj.geometry) {
            obj.geometry.dispose()
        }
        if (obj.material) {
            Object.keys(obj.material).forEach(prop => {
                if (!obj.material[prop])
                    return
                if (typeof obj.material[prop].dispose === 'function')
                    obj.material[prop].dispose()
            })
            obj.material.dispose()
        }
    }

    this.update = (pos) => {
        postLoop(pos)
    }


    let applyForce = () => {
        this.applyN = true
        this.all    = false 
    }
    
    let applyAllForce = () => {
        this.applyN = true
        this.all    = true 
    }

    document.addEventListener('click'   , applyForce, false);
    document.addEventListener('dblclick', applyAllForce, false)

    init()
}

export { Gravity }