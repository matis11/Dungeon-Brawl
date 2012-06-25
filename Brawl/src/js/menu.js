

window.onresize = function(){
    
}
//bootstrap
window.onload = function(){
    //declaring public HTML elements
    dMenu = document.getElementById("dMenu");
    dGame = document.getElementById("dGame");
    dMapChoose = document.getElementById("dMapChoose");
    canvasMapBase = document.getElementById("canvasMapBase");
    canvasPlayer = document.getElementById("canvasPlayer");
    canvasGUI = document.getElementById("canvasGUI");
    //setting up the width and height of canvases
    canvasMapBase.width = canvasPlayer.width = canvasGUI.width = 
        dMenu.clientWidth;
    canvasMapBase.height = canvasPlayer.height = canvasGUI.height = 
        dMenu.clientHeight;
    //function run everytime a map i chosen
    function dMapChooseHide(){
        dMapChoose.hidden = true;
        dGame.hidden = false;
    }
    //setting up listeners
    document.getElementById("bStart").onclick = function(){
        dMapChoose.hidden = false;
        dMenu.hidden = true;
    }
    document.getElementById("bMap1").onclick = function(){
        dMapChooseHide();
        initializeStages();
        GameMap.onParsed = function(){
            GameMap.draw();
        }
        GameMap.parseMap(map1);
    }
}