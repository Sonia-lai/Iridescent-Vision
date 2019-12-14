import Tone from 'tone';
import bgm from './sounds/bgm.mp3';

let SoundHandler = function(){
    var player = new Tone.Player(bgm, function(){
        console.log('bgm ready!');
        player.sync().start(0);
    }).toMaster();
    
    this.schedule = (f, min, sec) => {
        Tone.Transport.schedule(f, String(min*60+sec));
    }

    function play() {
        Tone.Transport.start();
    }

    window.addEventListener('keydown', function(e){  
        if(e.code === 'KeyP')  {
            e.preventDefault();
            play();
        }
    }, false);
}

export {SoundHandler};