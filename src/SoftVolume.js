import * as THREE from 'three';
import {Particle} from './Particle';
import { Vector3, Mesh } from 'three/build/three.module';
//TODO: bounding too slow
import * as dat from 'dat.gui';


var SoftVolume = function(scene, mesh, gltf) {
    this.scene = scene;
    this.mesh = mesh;
    this.gltf = gltf;

    this.PULL = 7.5; //7.5
    this.TIMESTEP = 30 / 1000; //18/1000
    this.mass = 0.1;
    this.effectRange = 10;
    this.DRAG = 0.97; //0.97
    this.BACKDRAG = 0.6;
    this.mult = 14;
    this.plane = -2;
    this.constraintRate = 0.5;
    this.constraintTime = 3;

    var TIMESTEP_SQ = this.TIMESTEP * this.TIMESTEP * 10;
    let particles = [];
    let constraints = [];
    let helper;

    let firstClick = false;
    let click = false;
    let psel = undefined;

    let mouse = new THREE.Vector2( 0.5, 0.5 );
    let mouse3d = new THREE.Vector3( 0, 0, 0 );
    let raycaster = new THREE.Raycaster();
    
    let timeout = undefined;

    let init = () => {
        let geo = this.mesh.geometry;
        //console.log(geo);
        let vertices = geo.attributes.position.array;
        
        for (let i = 0; i < vertices.length; i++) {
            particles.push( new Particle( vertices[i], vertices[++i], vertices[++i], this.mass));
        }

        let faces = geo.index.array;
        for (let i = 0; i < faces.length; i++ ) {
            let face = {};
            face.a = faces[i];
            face.b = faces[++i];
            face.c = faces[++i];

            if ( !particles[face.b].adj.includes(face.a) && !particles[face.a].adj.includes(face.b))
                particles[face.a].adj.push(face.b);
            if ( !particles[face.c].adj.includes(face.a) && !particles[face.a].adj.includes(face.c))
                particles[face.a].adj.push(face.c);
        }
    
        for(let i = 0; i < particles.length; i++ ) {
            for(let j = 0; j < particles[i].adj.length; j++) {
                constraints.push( [
                    particles[ i ],
                    particles[ particles[i].adj[j] ],
                    particles[i].original.distanceTo(particles[particles[i].adj[j]].original)
                ] );
            }
        }

        geo.computeVertexNormals();
        // helper = new THREE.VertexNormalsHelper( this.mesh, 10, 0x00ff00, 1 );
        //this.scene.add(helper);
    }

    let initGeo = () => {

        let geometry = mesh.geometry;
        for (var i = 0; i < geometry.vertices.length; i++) {
            var t = geometry.vertices[i];
            particles.push( new Particle( t.x, t.y, t.z, this.mass) );
        }

        for ( i = 0; i < geometry.faces.length; i++ ) {
            let face = geometry.faces[i];
            if ( !particles[face.b].adj.includes(face.a) && !particles[face.a].adj.includes(face.b))
                particles[face.a].adj.push(face.b);
            if ( !particles[face.c].adj.includes(face.a) && !particles[face.a].adj.includes(face.c))
                particles[face.a].adj.push(face.c);
        }

        for( i = 0; i < particles.length; i++ ) {
            for(let j = 0; j < particles[i].adj.length; j++) {
                constraints.push( [
                    particles[ i ],
                    particles[ particles[i].adj[j] ],
                    particles[i].original.distanceTo(particles[particles[i].adj[j]].original)
                ] );
            }
        }
    }

    let changeTexture = () => {
        var textureLoader = new THREE.TextureLoader();
        var texture = textureLoader.load( "https://raw.githubusercontent.com/aatishb/drape/master/textures/patterns/circuit_pattern.png" );

        let MeshMaterial = new THREE.MeshPhongMaterial( {
            color: 0xaa2949,
            specular: 0x030303,
            map: texture,
            side: THREE.DoubleSide,
            alphaTest: 0.7
            
        } );
        
        this.mesh.material = MeshMaterial;

    }

    this.update = (camera) => {

        updateMouse(camera);
        if (!firstClick) return;
        simulate();
        updateMeshPos();
        if (helper !== undefined) helper.update();
    }


    let updateMeshPos = () => {
        //clone particle position to mesh
        if (!this.gltf) {
            for ( var i = 0, il = particles.length; i < il; i ++ ) {
                this.mesh.geometry.vertices[ i ].copy( particles[ i ].position );
            }
        } else {
            for ( var i = 0, il = particles.length; i < il; i ++ ) {
                this.mesh.geometry.attributes.position.array[ i*3 ] = particles[ i ].position.x;
                this.mesh.geometry.attributes.position.array[ i*3+1 ] = particles[ i ].position.y;
                this.mesh.geometry.attributes.position.array[ i*3+2 ] = particles[ i ].position.z;
            }
        }
        if (this.gltf)
            this.mesh.geometry.attributes.position.needsUpdate = true;

        this.mesh.geometry.computeFaceNormals();
        this.mesh.geometry.computeVertexNormals();
    
        this.mesh.geometry.normalsNeedUpdate = true;
        this.mesh.geometry.verticesNeedUpdate = true;

        //mesh.geometry.attributes.normal.needsUpdate = true;
    }

    let simulate = () => {
        TIMESTEP_SQ = this.TIMESTEP * this.TIMESTEP * 10;
        let i, il;
        for (i = 0, il = particles.length; i < il; i ++ ) {
    
            let particle = particles[ i ];
    
            let force = new THREE.Vector3().copy ( particle.original );
            particle.addForce( force.sub(particle.position).multiplyScalar( this.PULL ) );
            particle.integrate( TIMESTEP_SQ );
            
        }
        
        il = constraints.length;
    
        for (let j = 0; j < this.constraintTime; j++) {
    
            if ( j % 2 == 1) {
                for (i = il-1; i >=0; i-- ) {
                    let constraint = constraints[ i ];
                    satisfyConstraints( constraint[ 0 ], constraint[ 1 ], constraint[ 2 ] );
                }
            }
            else {
                for (i = 0; i < il; i ++ ) {
                    let constraint = constraints[ i ];
                    satisfyConstraints( constraint[ 0 ], constraint[ 1 ], constraint[ 2 ] );
                }
            }
            let c = 0;
            if ( click && psel ) {
                let offset = mouse3d.clone().sub(particles[ psel ].position);
                let offsetOri = mouse3d.distanceTo(particles[ psel ].original);
                for ( i = 0; i < particles.length; i++ ) {
                    let distance = particles[psel].original.distanceTo( particles[i].original );
                    //TODO: calculate distance threshold, mult change with offset
                    if ( particles[i].distance+0.*distance < this.effectRange) {
                        let tmp = 1.0 - this.mult*offsetOri*(particles[i].distance/10);
                        tmp = Math.max(tmp, 0);
                        tmp = Math.min(tmp, 1);
                        particles[ i ].position.add( offset.clone().multiplyScalar(tmp) );
                    } 
                }
            }
    
    
        }
    
    }

    let diff = new THREE.Vector3();
    let satisfyConstraints = ( p1, p2, distance ) => {

        diff.subVectors( p2.position, p1.position );
        let currentDist = diff.length();
        if ( currentDist === 0 ) return; // prevents division by 0
        let correction = diff.multiplyScalar( 1 - distance / currentDist );
        let correctionHalf = correction.multiplyScalar( this.constraintRate );
        p1.position.add( correctionHalf );
        p2.position.sub( correctionHalf );

    }

    let updateMouse = (camera) => {
        raycaster.setFromCamera( mouse, camera);
        var intersects = raycaster.intersectObjects([this.mesh], true );

        mouse3d.set(0,0,0);
        if ( intersects.length != 0 ) {
            mouse3d.copy( intersects[0].point );
        }

        if (psel == undefined && click && !mouse3d.equals( new THREE.Vector3(0,0,0)) ) {
            setFirstClick(true);
            let dist = 9999;
            // find nearest particle
            for (let i = 0; i < particles.length; i++ ){
                let tmp = mouse3d.distanceTo(particles[i].position);
                if ( tmp < dist) {
                    dist = tmp;
                    psel = i;
                }
            }

            for (let i = 0; i < particles.length; i++ ) {
                particles[i].distance = particles[psel].original.distanceTo( particles[i].original );

                // let ps = particles[psel].original.clone();
                // let pi = particles[i].original.clone();
                // let zDis = Math.abs(ps.z - pi.z);
                // ps.z = 0;
                // pi.z = 0;
                // particles[i].distance = ps.distanceTo( pi ) + zDis;

            }

        }
        //TODO: plane depth calculate?
        let tmpmouse = new Vector3();
        let newPlane = new THREE.Plane( camera.position.clone().normalize(), this.plane);
        raycaster.ray.intersectPlane( newPlane, tmpmouse );
        // let newSphere = new THREE.Sphere( this.mesh.position.clone(), this.plane);
        // raycaster.ray.intersectSphere (newSphere, tmpmouse);
        if ( tmpmouse != null ) {
            mouse3d.copy(tmpmouse);
        }
        
    }

    let onMouseMove = function(e) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        e.preventDefault();
    }

    let onMouseDown = function(e) {
        if (e.button == 0)
            click = true;
    }
    
    let onMouseUp = function (e) { 
        if (e.button == 0) {
            if (click && psel) waitForFinished();
            click = false;
            psel = undefined;
        }
    }
    
    let onMouseOut = function (e) { 
        if (e.button == 0) {
            if (click && psel) waitForFinished();
            click = false;
            psel = undefined;
            
        }
    }
    
    let waitForFinished = function () {
        //console.log('waitForFinished');
        timeout = setTimeout(() => {setFirstClick(false)}, 2000);
    }

    let setFirstClick = function(bool) {
        if (bool) {
            if (timeout) clearTimeout(timeout);
        }
        //console.log('setFirstClick', bool);
        firstClick = bool;
    }

    this.setGUI = () => {
        var gui = new dat.GUI();
        gui.add(this, 'PULL').min(0).step(0.1);
        gui.add(this, 'TIMESTEP');
        gui.add(this, 'effectRange');
        gui.add(this, 'mass');
        gui.add(this, 'mult');
        gui.add(this, 'plane');
        gui.add(this, 'constraintRate');
        gui.add(this, 'constraintTime');
        let drag = gui.add(this, 'DRAG');
        let backdrag = gui.add(this, 'BACKDRAG');
        drag.onFinishChange(function(value) {
            //console.log('changed!');
            for (let i=0; i<particles.length; i++) {
                particles[i].DRAG = value;
            }
        });
        backdrag.onFinishChange(function(value) {
            for (let i=0; i<particles.length; i++) {
                particles[i].BACKDRAG = value;
            }
        });
    }

    if (this.gltf) init();
    else initGeo();
    changeTexture();
    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mouseup', onMouseUp, false );
    document.addEventListener( 'mousedown', onMouseDown, false );
    document.addEventListener( 'mouseout', onMouseOut, false );

    
}
export {SoftVolume};