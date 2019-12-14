import { SceneUtils, MeshStandardMaterial } from 'three/build/three.module';
import * as THREE from 'three';
import * as OIMO from 'oimo';

var Gravity = function (scene) {
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
    let size = 300;

    this.applyN = true;
    this.scene  = scene;
    this.enabled = false;
    this.center = new THREE.Vector3(0, 0, 0);
    this.all = false


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

        if (!noMesh) {
            let meshtemp = new THREE.Mesh(s, new MeshStandardMaterial());
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
        let center = this.center
        let all    = this.all

        bodys.forEach(function (b, id) {
            
            if (b.type === 1) {
                m = b.mesh;
        
                force = m.position.clone().negate().normalize().multiplyScalar(0.2);
                if (applyN && (Math.floor(Math.random() * 4) || all)) {
                    if (!all) force = force.negate().multiplyScalar(Math.random() * 20);
                    else force = force.negate().multiplyScalar(Math.random() * 50);
                } 
                
 
                b.applyImpulse(center, force);

            }

        });
        if (this.applyN) this.applyN = false;
        if (this.all) this.all = false
    }

    let init = () => {
        world = initWorld()
        add2World({ type: 'sphere', geometry: geo.highsphere, size: [10, 30, 8], pos: [0, 0, 0], density: 1 }, true);
        for (var i = 0; i < size; i++) {
            var b = add2World(createParticle(rand(0.1, 0.3)))
        }
    };

    this.enable = () => {
        this.enabled = true
        world.play()
    }

    this.disable = () => {
        this.enabled = false
        world.stop()
    }

    this.update = (pos) => {
        postLoop(pos)
    }

    init()

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
}

export { Gravity }