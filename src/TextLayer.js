let TextLayer = function(startCallBack) {

    var divElement;
    var spanElement;
    var btnElement;
    this.changeText = (text) => {
        spanElement.innerHTML = text;
    }  

    this.nowInnerHtml = () => {
        return spanElement.innerHTML;
    }

    this.addButton = (text) => {
        divElement.removeChild(spanElement);
        btnElement.innerHTML = text;
        divElement.appendChild(btnElement);
    }

    this.removeButton = () => {
        divElement.removeChild(btnElement);
        if (startCallBack) startCallBack();
    }

    let init = () => {
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
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
            "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
            sans-serif;
            margin: 1em;
            width: 80%;
            text-align: center;
            font-size: 6em;
            font-weight: 100;
            color: black;`
        spanElement.innerHTML='0%';
        btnElement = document.createElement('button');
        btnElement.style.cssText = `
            width: 7em;
            height: 3em;
            margin: 0;
            margin-top: 0.5em;
            font-size: 3em;
            font-weight: 200;
            color: black;
            margin: auto;
            border: 2px solid black;
            background: transparent;

        `
        btnElement.onclick = this.removeButton;
        divElement.appendChild(spanElement);
        document.body.appendChild(divElement);   
    }
    init();
    //this.changeText('yoyo')
}


export {TextLayer};