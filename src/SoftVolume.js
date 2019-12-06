import * as THREE from 'three';
import {Particle} from './Particle';
import { Vector3, Mesh } from 'three/build/three.module';

var SoftVolume = function(scene, mesh, gltf) {
    this.scene = scene;
    this.mesh = mesh;
    this.gltf = gltf;

    this.PULL = 3.5; //7.5
    this.TIMESTEP = 30 / 1000; //18/1000
    this.mass = 1;
    
    var TIMESTEP_SQ = this.TIMESTEP * this.TIMESTEP;
    let particles = [];
    let constraints = [];
    let helper;

    let click = false;
    let psel = undefined;

    let mouse = new THREE.Vector2( 0.5, 0.5 );
    let mouse3d = new THREE.Vector3( 0, 0, 0 );
    let raycaster = new THREE.Raycaster();
    
    let init = () => {
        let geo = this.mesh.geometry;
        console.log(geo);
        let vertices = geo.attributes.position.array;
        let i;
        
        for ( i = 0; i < vertices.length; i++) {
            particles.push( new Particle( vertices[i], vertices[++i], vertices[++i], this.mass));
        }

        let faces = geo.index.array;
        for ( i = 0; i < faces.length; i++ ) {
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
        var texture1 = textureLoader.load( "https://raw.githubusercontent.com/aatishb/drape/master/textures/patterns/circuit_pattern.png" );

        let MeshMaterial = new THREE.MeshPhongMaterial( {
            color: 0xaa2949,
            specular: 0x030303,
            map: texture1,
            side: THREE.DoubleSide,
            alphaTest: 0.7
            
        } );
        this.mesh.material = MeshMaterial;

    }

    this.update = (camera) => {
    
        updateMouse(camera);
        simulate();
        updateMeshPos();
        if (helper != undefined) helper.update();
        
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
        //this.mesh.geometry.computeFaceNormals();
        this.mesh.geometry.computeVertexNormals();
    
        this.mesh.geometry.normalsNeedUpdate = true;
        this.mesh.geometry.verticesNeedUpdate = true;

        if (this.gltf)
            this.mesh.geometry.attributes.position.needsUpdate = true;
        //mesh.geometry.attributes.normal.needsUpdate = true;
    }

    let simulate = () => {
        let i, il;
        for (i = 0, il = particles.length; i < il; i ++ ) {
    
            let particle = particles[ i ];
    
            let force = new THREE.Vector3().copy ( particle.original );
            particle.addForce( force.sub(particle.position).multiplyScalar( this.PULL ) );
            particle.integrate( TIMESTEP_SQ );
            
        }
        
        il = constraints.length;
    
        for (let j = 0; j < 5; j++) {
    
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
    
            if ( click && psel ) {
                let offset = mouse3d.clone().sub(particles[ psel ].position);
                
                for ( i = 0; i < particles.length; i++ ) {
                    let distance = particles[psel].original.distanceTo( particles[i].original );
                    //console.log(offset, distance);
                    //TODO: calculate distance threshold
                    if ( particles[i].distance < 1) {
                        particles[ i ].position.add( offset.multiplyScalar( 1.0 - 0.*(distance/10) ) );
                    } 
                }
            }
    
    
        }
    
    }

    let diff = new THREE.Vector3();
    let satisfyConstraints = function( p1, p2, distance ) {

        diff.subVectors( p2.position, p1.position );
        let currentDist = diff.length();
        if ( currentDist === 0 ) return; // prevents division by 0
        let correction = diff.multiplyScalar( 1 - distance / currentDist );
        let correctionHalf = correction.multiplyScalar( 0.5 );
        p1.position.add( correctionHalf );
        p2.position.sub( correctionHalf );

    }

    let updateMouse = (camera) => {
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects([this.mesh], true );

        mouse3d.set(0,0,0);
        //console.log('updateMouse');
        if ( intersects.length != 0 ) {
            //console.log('intersect');
            mouse3d.copy( intersects[0].point );

        }

        if (psel == undefined && click && !mouse3d.equals( new THREE.Vector3(0,0,0)) ) {
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
            }
        }
        //TODO: plane depth calculate?
        let tmpmouse = new Vector3();
        let newPlane = new THREE.Plane( camera.position.clone().normalize(), 0 );
        raycaster.ray.intersectPlane( newPlane, tmpmouse );
        if ( tmpmouse != null ) {
            mouse3d.copy(tmpmouse);
        }
        //console.log(this.mesh.position, mouse3d);
    }

    let onMouseMove = function(e) {
        mouse.x = (e.pageX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.pageY / window.innerHeight) * 2 + 1;
        e.preventDefault();
    }

    let onMouseDown = function(e) {
        if (e.button == 0)
            click = true;
    }
    
    let onMouseUp = function (e) { 
        if (e.button == 0) {
            click = false;
            psel = undefined;
        }
    }
    
    let onMouseOut = function (e) { 
        if (e.button == 0) {
            click = false;
            psel = undefined;
        }
    }

    if (this.gltf) init();
    else initGeo();
    changeTexture();
    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mouseup', onMouseUp, false );
    document.addEventListener( 'mousedown', onMouseDown, false );
    document.addEventListener( 'mouseout', onMouseOut, false );
    console.log('set up ready!');
}
export {SoftVolume};