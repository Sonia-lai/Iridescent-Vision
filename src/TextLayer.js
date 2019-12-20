import loadingPage from './loading.html';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

let TextLayer = function(startCallBack) {

    var divElement;
    var divElement2;
    var spanElement;
    var spanElement2;
    var btnElement;
    let loader, start;
    disableBodyScroll(document.body);

    this.changeText = (text) => {
        //spanElement.innerHTML = text;
    }  

    this.nowInnerHtml = () => {
        //return "50%";
        return "50%";
        return spanElement.innerHTML;
    }

    this.addMoreSpan = (text) => {
        this.changeText(text);
        spanElement.style.cssText = `
        font-family: helvetica;
            margin: 1em;
            width: 80%;
            text-align: center;
            font-size: 2em;
            font-weight: 200;
            color: rgba(255,255,255,0.4);`
        divElement.addChild(spanElement);
        
    }

    this.addButton = (text) => {
        //divElement.removeChild(spanElement);
        //divElement.removeChild(spanElement2);
        //btnElement.innerHTML = text;
        //divElement.appendChild(btnElement);
        start.className = 'start';
        loader.className = 'fadeout';
        start.onclick = ()=> {
            start.className = 'fadeout';
            document.getElementById('chrome').className += ' fadeout';
            if (startCallBack) startCallBack();
        }
        //divElement.appendChild(spanElement2);
    }

    this.removeButton = () => {
        divElement.removeChild(btnElement);
        if(navigator.userAgent.indexOf("Chrome") != -1 ) {
            divElement.removeChild(spanElement2);
        }
        
    }

    let init2 = () => {
        divElement2 = document.createElement('div');
        divElement2.style.cssText = `
            margin: 0 auto;
            position: absolute;
            width: 100%;
            height: 100%;
            display:flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;`;
        document.body.appendChild(divElement2);
        divElement2.innerHTML = loadingPage;
        loader = divElement2.getElementsByClassName('loader')[0];
        start = document.getElementById('start');
        //.className = "aClassName";
        console.log(loader);
    }

    let init = () => {
        init2()

        // divElement = document.createElement('div');
        // divElement.style.cssText = `
        //     margin: 0 auto;
        //     position: absolute;
        //     width: 100%;
        //     height: 100%;
        //     display:flex;
        //     justify-content: center;
        //     align-items: center;
        //     flex-direction: column;`;
        // spanElement = document.createElement('span');
        // spanElement.style.cssText = `
        //     font-family: helvetica;
        //     margin: 1em;
        //     width: 80%;
        //     text-align: center;
        //     font-size: 4em;
        //     font-weight: 200;
        //     color: rgba(255,255,255,0.4);`
        // spanElement.innerHTML='0%';
        // spanElement2 = document.createElement('span');
        // spanElement2.style.cssText = `
        //     font-family: helvetica;
        //     margin: 1em;
        //     width: 80%;
        //     text-align: center;
        //     font-size: 1.2em;
        //     font-weight: 200;
        //     color: rgba(255,255,255,0.3);`
        // spanElement2.innerHTML='use Chrome for best experience';
        // btnElement = document.createElement('button');
        // btnElement.style.cssText = `
        //     font-family: helvetica;
        //     width: 7em;
        //     height: 3em;
        //     margin-top: 0.5em;
        //     font-size: 2em;
        //     font-weight: 200;
        //     color: rgba(255,255,255,0.4);
        //     margin: auto;
        //     border: 2px solid rgba(255,255,255,0.4);
        //     background: transparent;
        // `
        // btnElement.onmouseover = function() {
        //     this.style.backgroundColor = "rgba(255,255,255,0.3)";
        // }
        // btnElement.onmouseout = function() {
        //     this.style.backgroundColor = "transparent";
        // }
        // btnElement.onclick = this.removeButton;
        // divElement.appendChild(spanElement);
        // divElement.appendChild(spanElement2);
        // document.body.appendChild(divElement);   
    }
    init();
    //this.changeText('yoyo')
}


export {TextLayer};