import Tone from 'tone';
import bgm from './sounds/bgm.mp3';

let SoundHandler = function(onProgress){
    this.onProgress = onProgress;
    var loaded = 0;
    //var players = [];
    var player = new Tone.Player(bgm, function(){
        console.log('bgm ready!');
        player.sync().start(0);
        loaded += 1;
        onProgress(loaded);
    }).toMaster();
    //players.push(player);
    
    this.schedule = (f, min, sec) => {
        Tone.Transport.schedule(f, String(min*60+sec));
    }

    this.loadPlayer = (soundPlayer, fadeout = 0) => {
        let playerList = [];
        soundPlayer.forEach((e) => {
            playerList.push(new Tone.Player({
                "url": e,
                "fadeOut": fadeout,
            }).toMaster());
        }, function(){
            loaded += 1;
            onProgress(loaded);
        })
        //players.concat(playerList);
        return playerList;
    }

    this.calcLoadingPercentage = () => {
		//if (loading === 1.) return;
		//let loaded = 0;
		// players.forEach((e) => {
		// 	if (e.loaded) loaded++;
		// });
        //loading = Math.floor(100*loaded/players.length);
        //return loading;
	}

    this.start = () => {
        Tone.Transport.start();
    }

    window.addEventListener('keydown', function(e){  
        if(e.code === 'KeyP')  {
            e.preventDefault();
            this.start();
        }
    }, false);
}

export {SoundHandler};