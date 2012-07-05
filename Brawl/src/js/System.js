System = {
    /**
     * Loads the map
     * @param {String} map Name of the map to load
     */
    loadGame: function(map){
        GameMap.onParsed = function(){
            Painter.drawMap();
            Painter.loadImages();
            Game.players.push(new Player());
            Game.round();
        }
        GameMap.parseMap(map);
    }
}

/**
 * Creates and hold the map
 */
GameMap = {
    /**
     * Converts a JSON map to a game readable JSON object
     * @param {Object} map Map to parse
     */
    parseMap: function(map){
        console.time("map load");
        var imageArray = [];
        //getting the JSON file
        var x = new XMLHttpRequest();
        x.open("GET", "maps/" + map + ".json", true);
        x.overrideMimeType("application/json");
        x.send(null);
        var JSONparsed = false;
        x.onreadystatechange = function(){
            if(x.responseText != "" && !JSONparsed){
                map = JSON.parse(x.responseText);
                _continueMapParse1();
                JSONparsed = true;
            }
        }
        /**
         * Cutting the images in pieces
         */
        function _continueMapParse1(){
            GameMap.tmxMap = map;
            //checking which tiles will be used and how many of them are there
            var used = [],
            usedCount = 0,
            loadedCount = 0;
            map.layers.forEach(function(i){
                var name = i.name;
                if(name.indexOf("obj") != -1 || name.indexOf("lev") != -1) return;
                for(var j in i.data){
                    //console.log(i.data[j], !used[parseInt(i.data[j])]);
                    if(!used[parseInt(i.data[j])] && i.data[j] != 0){
                        used[parseInt(i.data[j])] = true;
                        ++usedCount;
                    }
                }
            });
            map.tilesets.forEach(function(i){
                //checking if it's not the object or levels layer
                if(i.name != "Objects" && i.name != "Levels"){
                    var img = new Image();
                    //needs change
                    img.src = "graphics" + i.image.substring(11,i.image.length);
                    img.addEventListener('load', function(){
                        //cutting the image
                        var index = parseInt(i.firstgid); //(SIC)
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        canvas.width = canvas.height = 32;
                        for(var y = 0; y < i.imageheight/32; y++){
                            w:
                            for(var x = 0; x < i.imagewidth/32; x++){
                                if(!used[index]){
                                    ++index;
                                    continue w;
                                }
                                canvas.width = canvas.height = 32;
                                context.drawImage(img, x * 32, y * 32, 32, 32, 0, 0,
                                    canvas.width, canvas.height);
                                var imgTemp = new Image();
                                imgTemp.src = canvas.toDataURL();
                                imgTemp.onload = function(){
                                    ++loadedCount;
                                    //checking if all images are loaded
                                    if(loadedCount === usedCount) _continueMapParse2();
                                }
                                imageArray[index] = imgTemp;
                                ++index;
                            }
                        }
                    }, true);
                }
            });

        }
        /**
         * Adding the images and other properties to the GameMap.map array of
         * objects
         */
        function _continueMapParse2(){
            var objUsed = false;
            var levUsed = false;
            map.layers.forEach(function(i){
                var name = i.name;
                if(name.indexOf("tile") !== -1){
                    for(var j in i.data){
                        var image = imageArray[i.data[j]];
                        var y = Math.floor(j / i.width);
                        var x = j % i.width
                        //init if not initialized
                        if(!GameMap.map[y]) GameMap.map[y] = [];
                        if(!GameMap.map[y][x]){
                            GameMap.map[y][x] = {y:y,x:x};
                        }
                        if(image) GameMap.map[y][x].image = image;
                    }
                }else if(name === "dec"){
                    for(j in i.data){
                        image = imageArray[i.data[j]];
                        y = Math.floor(j / i.width);
                        x = j % i.width
                        if(!GameMap.map[y]) GameMap.map[y] = [];
                        if(!GameMap.map[y][x]){
                            GameMap.map[y][x] = {y:y,x:x};
                        }
                        if(image) GameMap.map[y][x].decImage = image;
                    }
                }else if(name.indexOf("dec") !== -1){
                    for(j in i.data){
                        image = imageArray[i.data[j]];
                        y = Math.floor(j / i.width);
                        x = j % i.width
                        if(!GameMap.map[y]) GameMap.map[y] = [];
                        if(!GameMap.map[y][x]){
                            GameMap.map[y][x] = {y:y,x:x};
                        }
                        if(image) GameMap.map[y][x].decFrontImage = image;
                    }
                }else if(name === "lev"){
                    var firstgrid = 0;
                    var tilesets = GameMap.tmxMap.tilesets
                    for(j in tilesets){
                        if(tilesets[j].name === "Levels"){
                            firstgrid = tilesets[j].firstgid; //(SIC)
                        }
                    }
                    if(!firstgrid) return;
                    for(j in i.data){
                        //because 0 - 1, 1 - 1.5, 2 - 2 and so on
                        var level = (i.data[j] - firstgrid) / 2 + 1;
                        y = Math.floor(j / i.width);
                        x = j % i.width
                        if(!GameMap.map[y]) GameMap.map[y] = [];
                        if(!GameMap.map[y][x]){
                            GameMap.map[y][x] = {y:y,x:x};
                        }
                        if(level >= 0 ) GameMap.map[y][x].level = level;
                    }
                    levUsed = true;
                }else if(name.indexOf("obj") !== -1){
                    var actions = ['walk',                    //0
                                    'jump',                   //1
                                    'fall right',             //2
                                    'climb ladder',           //3
                                    'fall left',              //4
                                    'die',                    //5
                                    'fall to death',          //6
                                    'walk',                   //7
                                    null,                     //8
                                    'item',                   //9
                                    'walk on uneven terrain', //10
                                    'spawn'];                 //11
                    firstgrid = 0;
                    tilesets = GameMap.tmxMap.tilesets
                    for(j in tilesets){
                        if(tilesets[j].name === "Objects"){
                            firstgrid = parseInt(tilesets[j].firstgid); //(SIC)
                        }
                    }
                    if(!firstgrid) return;
                    for(j in i.data){
                        var action = actions[i.data[j] - firstgrid];
                        y = Math.floor(j / i.width);
                        x = j % i.width
                        if(!GameMap.map[y]) GameMap.map[y] = [];
                        if(!GameMap.map[y][x]){
                            GameMap.map[y][x] = {y:y,x:x};
                        }
                        if(!action) continue;
                        if(action === 'spawn'){
                            GameMap._spawnPoints.push(GameMap.map[y][x]);
                        }else if(action === 'item'){
                            
                        }else{
                            GameMap.map[y][x].action = action;
                            switch(action){
                                case 'walk' : GameMap.map[y][x].marker = 
                                        Painter.easelShapes.createGreenSquare(x,y);
                                        var mark = GameMap.map[y][x].marker;
                                        mark.onClick = function(){
                                            console.log("lol");
                                            Game.currentPlayer.action('walk',
                                                x,y);
                                        }
                                        stageMarker.addChild(
                                            GameMap.map[y][x].marker);
                                        break;
                            }
                        }
                    }
                    objUsed = true;
                }
            });
            if(!levUsed) throw "Leveles layer not used";
            if(!objUsed) throw "Objects layer not used";
            if(GameMap._spawnPoints.length === 0) throw "No spawn points declared";
            if(GameMap.onParsed) GameMap.onParsed();
        }
    },
    /**
     * Moves the map by the specified vector
     * @param {Number} x Vector x
     * @param {Number} y Vector y
     */
    move: function(x,y){
        containerGlobal.x += x;
        containerGlobal.y += y;
        requestAnimationFrame(function(){
            stageBaseMap.update();
            stageMapFront.update();
            stagePlayer.update();
            stageMarker.update();
        });
    },
    /**
     * Moves the map to the specified coordinates
     * @param {Number} x Coord x
     * @param {Number} y Coord y
     */
    moveTo: function(x,y){
        containerGlobal.x = x;
        containerGlobal.y = y;
        requestAnimationFrame(function(){
            stageBaseMap.update();
            stageMapFront.update();
            stagePlayer.update();
            stageMarker.update();
        });
    },
    /**
     * Moves the map to specified (by coords) tile
     * @param {Number} x Coord x
     * @param {Number} y Coord y
     */
    showTile: function(x,y){
        var vec = GameMap.getVectors(x,y);
        GameMap.move(vec.x, vec.y);
    },
    /**
     * Shows by how much the map should be moved to show the tile (specified
     * by coords) in the middle of the map
     * @param {Number} x Coord x
     * @param {Number} y Coord y
     * @returns {Object} Object with values x and y
     */
    getVectors: function(x,y){
        x = -containerGlobal.x - x*33 + canvasMapBase.width/2 - 32;
        y = -containerGlobal.y - y*33 + canvasMapBase.height/2 - 32;
        return {x: x, y:y}
    },
    /**
     * Moves the map with a fluid motion
     * @param {Number} x Coord x
     * @param {Number} y Coord y
     */
    moveToTile: function(x,y){
        var i = 1;
        var time = 80;
        var vec = GameMap.getVectors(x, y);
        x = vec.x;
        y = vec.y;
        var tet = time*(time-1)*(time+1)/6
        function callback(){
            if(i < time){
                GameMap.move(x*(time-i)*i/tet, y*(time-i)*i/tet);
                ++i;
                requestAnimationFrame(callback);
            }else return;
        }
        requestAnimationFrame(callback);
    },
    /**
     * Shows levels of each tile in its top right corner, for debug
     */
    _showLevels: function(){
        for(var y = 0; y < GameMap.map.length; y++){
            for(var x = 0; x < GameMap.map[y].length; x++){
                var text = new Text(GameMap.map[y][x].level);
                text.y = y*33+10;
                text.x = x*33+24;
                containerMapFront.addChild(text);
            }
        }
        stageMapFront.update();
    },
    getASpawnPoint: function(){
        return GameMap._spawnPoints[Math.floor(
                Math.random()*GameMap._spawnPoints.length
            )];
    },
    map: [],
    tmxMap: null,
    onParsed: null,
    _spawnPoints: []
}

Game = {
    round: function(){
        var player = this.players[this.currentPlayerIndex];
        this.currentPlayer = player;
        player.takeTurn();
        ++this.currentPlayerIndex;
    },
    players: [],
    /** @type Player */
    currentPlayer: null,
    currentPlayerIndex: 0
}

/**
 * Creates the stages used with EaselJS
 */
function initializeStages(){
    stageBaseMap = new Stage(canvasMapBase);
    stageMapFront = new Stage(canvasMapFront);
    stagePlayer = new Stage(canvasPlayer);
    stageMarker = new Stage(canvasMarker);
    containerGlobal = new Container();
    containerGlobal.addChild(stageBaseMap);
    containerGlobal.addChild(stageMapFront);
    containerGlobal.addChild(stagePlayer);
    containerGlobal.addChild(stageMarker);
    containerGlobal.scaleX = containerGlobal.scaleY = 2;
}

/**
 * The player object, constructor automatically spawns it
 */
function Player(){
    this.playerImage = new PlayerImage();
    this.spawn();
}

/**
 * Gets a random spawn point from GameMap and places the player image there
 * @param {Number} [x] Coord x of where to spawn
 * @param {Number} [y] Coord y of where to spawn
 */
Player.prototype.spawn = function(x,y){
    if(!x){
        var spawnPoint = GameMap.getASpawnPoint();
        x = spawnPoint.x;
        y = spawnPoint.y;
    }
    this.x = x;
    this.y = y;
    this.playerImage.placeAt(x, y);
}

/**
 * Moves the player by the numbers in parameters
 * @param {Number} right By how many tiles to the right move. 1 is one tile, -1 is
 * one tile to the left.
 * @param {Number} down By how many tiles down move. 1 is one tile, -1 is
 * one tile to the up.
 */
Player.prototype.walk = function(right,down){
    this.x += right;
    this.y += down;
    this.playerImage.walk(right,down);
}

Player.prototype.takeTurn = function(){
    var mark = GameMap.map[this.y-1][this.x-1].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.y][this.x-1].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.y+1][this.x-1].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.y-1][this.x].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.y+1][this.x].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.y-1][this.x+1].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.y][this.x+1].marker;
    if(mark) mark.alpha = 1;
    mark = GameMap.map[this.y+1][this.x+1].marker;
    if(mark) mark.alpha = 1;
    stageMarker.update();
}

Player.prototype.action = function(action, x, y){
    switch(action){
        case 'walk' : this.walk(x-this.x, y-this.y);
    }
}

var requestAnimationFrame = window.requestAnimationFrame || 
                            window.mozRequestAnimationFrame ||  
                            window.webkitRequestAnimationFrame || 
                            window.msRequestAnimationFrame;
                        
if(!requestAnimationFrame){
    requestAnimationFrame = function(x){
        x(Date.now());
    };  
}