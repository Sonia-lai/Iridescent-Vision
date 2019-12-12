import * as THREE from 'three';
import * as OIMO from 'oimo';

var gravity = () => {

    let world;
    let size = 500, depth, height, width, particle;



    let initWorld = () => {
        return new OIMO.World({
                timestep: 1 / 60,
                iterations: 8,
                broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
                worldscale: 1,
                random: true,
                info: true, // display statistique
                gravity: [0, 0, 0],
            });
    }
    let init = () => {
        world = initWorld()
        add({ type: 'sphere', geometry: geo.highsphere, size: [10, 30, 8], pos: [0, 0, 0], density: 1 }, true);
    };

    this.update = () => {
        
    }
}

function gravity() {

    world = new OIMO.World({
        timestep: 1 / 60,
        iterations: 8,
        broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
        worldscale: 1,
        random: true,
        info: true, // display statistique
        gravity: [0, 0, 0],
    });

    
    //addModel();
    // basic geometry body

    var i = 500, d, h, w, o;

    while (i--) {

        width  = rand(0.1, 0.3);
        height = rand(0.3, 4);
        depth  = rand(0.3, 1);


        particle = {
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

        // switch( randInt(0,2) ){

        //     case 0 : o.type = 'sphere'; o.size = [w]; break;
        //     case 1 : o.type = 'box';  o.size = [w,w,d]; break;
        //     case 2 : o.type = 'cylinder'; o.size = [d,h,d]; break;

        // }
        o.type = 'sphere';
        o.size = [w];

        add(o);

    }

    // world internal loop

    world.postLoop = postLoop;
    world.play();

};