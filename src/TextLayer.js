
let TextLayer = function(startCallBack) {

    var divElement;
    var spanElement;
    var spanElement2;
    var btnElement;

    this.changeText = (text) => {
        spanElement.innerHTML = text;
    }  

    this.nowInnerHtml = () => {
        return spanElement.innerHTML;
    }

    this.addMoreSpan = (text) => {
        this.changeText(text);
        spanElement.style.cssText = `
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
            "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
            sans-serif;
            margin: 1em;
            width: 80%;
            text-align: center;
            font-size: 2em;
            font-weight: 200;
            color: rgba(255,255,255,0.4);`
        divElement.addChild(spanElement);
        
    }

    this.addButton = (text) => {
        divElement.removeChild(spanElement);
        divElement.removeChild(spanElement2);
        btnElement.innerHTML = text;
        divElement.appendChild(btnElement);
        divElement.appendChild(spanElement2);
    }

    this.removeButton = () => {
        divElement.removeChild(btnElement);
        if(navigator.userAgent.indexOf("Chrome") != -1 ) {
            divElement.removeChild(spanElement2);
        }
        if (startCallBack) startCallBack();
    }

    let init = () => {
        // Get HTML head element 
        var head = document.getElementsByTagName('HEAD')[0];  
        
        // Create new link Element 
        var link = document.createElement('link'); 

        // set the attributes for link element  
        link.rel = 'stylesheet';  
        link.type = 'text/css'; 
        link.href = 'https://fonts.googleapis.com/css?family=Dancing+Script:400,500,600,700&display=swap';  

        // Append link element to HTML head 
        head.appendChild(link);  

        divElement = document.createElement('div');
        divElement.style.cssText = `
            margin: 0 auto;
            position: absolute;
            width: 100%;
            height: 100%;
            display:flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;`;
        spanElement = document.createElement('span');
        spanElement.style.cssText = `
            font-family: 'Dancing Script', cursive;
            margin: 1em;
            width: 80%;
            text-align: center;
            font-size: 4em;
            font-weight: 200;
            color: rgba(255,255,255,0.4);`
        spanElement.innerHTML='0%';
        spanElement2 = document.createElement('span');
        spanElement2.style.cssText = `
            margin: 1em;
            width: 80%;
            text-align: center;
            font-size: 1.2em;
            font-weight: 200;
            color: rgba(255,255,255,0.3);`
        spanElement2.innerHTML='use Chrome for best experience';
        btnElement = document.createElement('button');
        btnElement.style.cssText = `
            font-family: 'Dancing Script', cursive;
            width: 7em;
            height: 3em;
            margin-top: 0.5em;
            font-size: 2em;
            font-weight: 200;
            color: rgba(255,255,255,0.4);
            margin: auto;
            border: 2px solid rgba(255,255,255,0.4);
            background: transparent;
        `
        btnElement.onmouseover = function() {
            this.style.backgroundColor = "rgba(255,255,255,0.3)";
        }
        btnElement.onmouseout = function() {
            this.style.backgroundColor = "transparent";
        }
        btnElement.onclick = this.removeButton;
        divElement.appendChild(spanElement);
        divElement.appendChild(spanElement2);
        document.body.appendChild(divElement);   
    }
    init();
    //this.changeText('yoyo')
}


export {TextLayer};