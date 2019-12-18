import * as THREE from 'three';

var Background = function (renderer, scene) {
    let ambientLight, hemiLight
    let Building = require('./background/building').default;
    let bldgs  = []
    let delta_speed = 0
    let bldgColor = 0x8e57b5, lightColor = 0x444444, skyColor = 0x343161, recoverColor = 0xFFFFFF,
        chunkSize = 200, chunksAtATime = 6, lgBldgSize = 12;


    this.speedup = false
    this.scene = scene;
    this.direction = 'up'
    this.speed = 0.05;
    this.fogDistance = 10; 
    this.brightness  = 0.1;
    this.enabled = false
    this.uuid = []

    this.update = (camera, mesh, face) => {
        if (!this.enabled) return 
        backgroundUpdate(camera, mesh, face)
        if (this.scene.fog.far <= 720) {
            if (scene.fog.far <= 100) this.scene.fog.far += 0.5
            else this.scene.fog.far += 1
        }

        if (this.speedup) {
            if (this.speed < 500) delta_speed += 0.001
            else speedup = false
            this.speed += delta_speed
            
        }
    }
    
    this.disable = () => {
        for (var i = this.scene.children.length - 1; i >= 0; i--) {
            let obj = this.scene.children[i]
            if (!this.uuid.includes(obj.uuid)) {
                doDispose(obj, this.scene)
            }

        }
        renderer.setClearColor(new THREE.Color(recoverColor))
        this.enabled = false
    }

    function doDispose(obj, scene) {
        scene.remove(obj);
        if (obj !== null) {
            for (var i = 0; i < obj.children.length; i++) {
                doDispose(obj.children[i]);
            }
            if (obj.geometry) {
                obj.geometry.dispose();
                obj.geometry = undefined;
            }
            if (obj.material) {
                if (obj.material.map) {
                    obj.material.map.dispose();
                    obj.material.map = undefined;
                }
                obj.material.dispose();
                obj.material = undefined;
            }
        }
        obj = undefined;
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



    function forestGenerate(zMove) {
        var buildings = []

        for(var i = 0; i < 200; i++) {
            var x = Math.random() * 1000 - 500
            var y = Math.random() * 100 - 50
            var z = Math.random() * 100 - 50
            var d = Math.random() * 20  + 30
            buildings.push(new Building(x, y, z + zMove, lgBldgSize, d, lgBldgSize, bldgColor))
        }
        return buildings

    }

    let lightGenerate = (lightColor, brightness) => {

        ambientLight = new THREE.AmbientLight(lightColor);
        
        this.scene.add(ambientLight);

        hemiLight = new THREE.HemisphereLight(lightColor, 0xffffff, brightness);
        hemiLight.position.set(0, 8, 0);
        hemiLight.name = 'hemiLight'
        this.scene.add(hemiLight);

    }   
 
    let backgroundGenerate = (chunkSize, chunksAtATime) => {
        for (var cz = 1; cz > -chunksAtATime; --cz) {
            var zMove = chunkSize * cz;
            bldgs  = forestGenerate(zMove)

            for(var i =0;i < bldgs.length;i++) {
                bldgs[i].mesh.name = 'bldgs'
                this.scene.add(bldgs[i].mesh)
            }
            
        }
    }

    let backgroundUpdate = (camera, mesh, face) => {

        let delta = this.speed;

        if(this.direction == 'up') {
            camera.position.y += delta;
            mesh.position.y   += delta;
            face.position.y   += delta;
        } else if (this.direction == 'down') {
            camera.position.y -= delta;
            mesh.position.y   -= delta;
            face.position.y   -= delta;
        } else if(this.direction == 'forward') {
            camera.position.z += delta;
            mesh.position.z   += delta;
            face.position.z   += delta;
        } else if(this.direction == 'back') {
            camera.position.z -= delta;
            mesh.position.z   -= delta;
            face.position.z   -= delta;
        }

    }

    let initBackground = (renderer) => {

        for (var child of this.scene.children) {
            this.uuid.push(child.uuid)
        } 

        renderer.setClearColor(new THREE.Color(skyColor));
        renderer.shadowMap.enabled = true;
        backgroundGenerate(chunkSize, chunksAtATime)
        lightGenerate(lightColor, this.brightness)
        this.scene.fog = new THREE.Fog(skyColor, 0.01, this.fogDistance);
        

    }

    this.enable = () => {
        this.enabled = true
    }

    initBackground(renderer, scene)

}

export { Background };