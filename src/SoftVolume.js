import * as THREE from 'three';
import {Particle} from './Particle';
import { Vector3, Mesh } from 'three/build/three.module';
import * as dat from 'dat.gui';

var SoftVolume = function(scene, mesh, isGltf) {
    
    //public variable
    this.scene = scene;
    this.mesh = mesh;
    this.isGltf = isGltf;
    this.gui;

    this.pull = 8.5; //7.5
    this.drag = 0.97; //0.97
    this.backdrag = 0.6;
    this.timestep = 40 / 1000; //18/1000
    
    this.effectRange = 2.5;
    this.depressRate = 4;
    
    this.pullTo = -2;
    this.constraintTime = 3;
    this.timeoutms = 4000;
    
    //private variable
    var enabled = false;
    let timesq = this.timestep * this.timestep * 10;
    let particles = [];
    let constraints = [];
    let helper;
    let mass = 0.1;

    let firstClick = false;
    let click = false;
    let psel = undefined;

    let mouse = new THREE.Vector2( 0.5, 0.5 );
    let mouse3d = new THREE.Vector3( 0, 0, 0 );
    let raycaster = new THREE.Raycaster();
    
    let timeout = undefined;

    let oriMaterial;

    //public function
    this.update = (camera) => {

        if (!enabled) return;
        updateMouse(camera);
        if (!firstClick) return;
        simulate();
        updateMeshPos();
        if (helper !== undefined) helper.update();
    }

    this.setGUI = (gui) => {
        this.gui = gui;
        let guiFolder = gui.addFolder('soft volume');
        guiFolder.add(this, 'pull').min(0).step(0.1);
        guiFolder.add(this, 'timestep');
        guiFolder.add(this, 'effectRange');
        guiFolder.add(this, 'depressRate');
        guiFolder.add(this, 'pullTo');
        guiFolder.add(this, 'constraintTime');
        guiFolder.add(this, 'timeoutms');
        let drag = guiFolder.add(this, 'drag');
        let backdrag = guiFolder.add(this, 'backdrag');
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
    
    this.computeNormal = () => {
        this.mesh.geometry.computeVertexNormals();
    }

    this.enable = () => {
        changeTexture();
        enabled = true;
    }

    this.disable = () => {
        if (oriMaterial) {
            this.mesh.material = oriMaterial;
            oriMaterial = undefined;
        }
        enabled = false;
    }

    this.dispose = () => {
        //TODO: remove dat.gui
        //gui.destroy();
        this.gui.removeFolder('soft volume');
        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );
        document.removeEventListener( 'mousedown', onMouseDown, false );
        document.removeEventListener( 'mouseout', onMouseOut, false );
    }

    //private function

    let initMesh = () => {
        let geometry = new THREE.SphereGeometry(100, 50, 50);
        geometry.translate(0,0,-200);
        this.mesh = new THREE.Mesh( geometry );
        this.scene.add(this.mesh);
        this.pullTo = 100;
        this.timestep = 18/1000;
        this.backdrop = 0.9;
        this.effectRange = 10;
    }

    let init = () => {
        let geo = this.mesh.geometry;
        //console.log(geo);
        let vertices = geo.attributes.position.array;
        
        for (let i = 0; i < vertices.length; i++) {
            particles.push( new Particle( vertices[i], vertices[++i], vertices[++i], mass));
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
        // helper = new THREE.VertexNormalsHelper( this.mesh, 10, 0x00ff00, 1 );
        //this.scene.add(helper);
    }

    let initGeo = () => {
        let geometry = this.mesh.geometry;

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
            color: 0x12aaf7,
            emissive: 0xc325e,
            specular: 0x441833,
            map: texture,
            side: THREE.DoubleSide,
            alphaTest: 0.7,
            shininess: 30,
            
        } );
        
        oriMaterial = this.mesh.material;
        this.mesh.material = MeshMaterial;
        
    }

    let updateMeshPos = () => {
        //clone particle position to mesh
        if (!this.isGltf) {
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
        if (this.isGltf)
            this.mesh.geometry.attributes.position.needsUpdate = true;

        this.mesh.geometry.computeFaceNormals();
        this.mesh.geometry.computeVertexNormals();
    
        this.mesh.geometry.normalsNeedUpdate = true;
        this.mesh.geometry.verticesNeedUpdate = true;

        //mesh.geometry.attributes.normal.needsUpdate = true;
    }

    let simulate = () => {
        timesq = this.timestep * this.timestep * 10;
        let i, il;
        for (i = 0, il = particles.length; i < il; i ++ ) {
    
            let particle = particles[ i ];
    
            let force = new THREE.Vector3().copy ( particle.original );
            particle.addForce( force.sub(particle.position).multiplyScalar( this.pull ) );
            particle.integrate( timesq );
            
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
                //console.log(offsetOri);
                for ( i = 0; i < particles.length; i++ ) {
                    let distance = particles[psel].original.distanceTo( particles[i].original );
                    //TODO: calculate distance threshold, mult change with offset
                    if ( particles[i].distance < this.effectRange) {
                        let tmp = 1.0 - this.depressRate*(particles[i].distance/10);
                        tmp = Math.max(tmp, 0);
                        tmp = Math.min(tmp, 1);
                        particles[ i ].position.add( offset.clone().multiplyScalar(tmp) );
                    }
                }
            }
    
    
        }
    
    }

    
    let satisfyConstraints = ( p1, p2, distance ) => {
        
        let diff = new THREE.Vector3();
        diff.subVectors( p2.position, p1.position );
        let currentDist = diff.length();
        if ( currentDist === 0 ) return; // prevents division by 0
        let correction = diff.multiplyScalar( 1 - distance / currentDist );
        let correctionHalf = correction.multiplyScalar( 0.5 );
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
        let newPlane = new THREE.Plane( camera.position.clone().normalize(), this.pullTo);
        raycaster.ray.intersectPlane( newPlane, tmpmouse );
        // let newSphere = new THREE.Sphere( this.mesh.position.clone(), this.pullTo);
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
    
    let waitForFinished = () => {
        timeout = setTimeout(() => {setFirstClick(false)}, this.timeoutms);
    }

    let setFirstClick = function(bool) {
        if (bool) {
            if (timeout) clearTimeout(timeout);
        }
        firstClick = bool;
    }

    // construct code here

    if (this.mesh == null) initMesh();
    if (this.isGltf) init();
    else initGeo();
    //changeTexture();
    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mouseup', onMouseUp, false );
    document.addEventListener( 'mousedown', onMouseDown, false );
    document.addEventListener( 'mouseout', onMouseOut, false );

}

dat.GUI.prototype.removeFolder = function(name) {
    var folder = this.__folders[name];
    if (!folder) {
        return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
}


export {SoftVolume};