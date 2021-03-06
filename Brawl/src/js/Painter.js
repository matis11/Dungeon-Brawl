
/**
 * Loads and paints images
 */
Painter = {
    loadImages: function(){
        var playerSpritesheetData = {
            images: ["graphics/maleWalk.png", "graphics/maleSlash.png", 
                "graphics/maleHurt.png", "graphics/maleSpellcast.png"],
            frames: {width: 64, height: 64, regX: 16, regY:32},
            animations: {
                standDown: 18,
                standUp: 0,
                standLeft: 9,
                standRight: 27,
                fallUp: 71,
                fallLeft: 78,
                fallDown: 85,
                fallRight: 92,
                walkRight: [27,35],
                walkLeft: [9,17],
                walkUp: [0,8],
                walkDown: [18,26],
                slashUp: [36,41, "standUp"],
                slashLeft: [42,47, "standLeft"],
                slashDown: [48,53, "standDown"],
                slashRight: [54,59, "standRight"],
                die: [60,65],
                dead: [65],
                stand: {
                    frames: [64,63,62,61,60],
                    next: 'standDown'
                }
            }
        }
        Painter.playerImage = new SpriteSheet(playerSpritesheetData);
    },
    /**
     * Draws the map on the canvases
     */
    drawMap: function(){
        if(!GameMap.tmxMap) throw "no map parsed";
        var map = GameMap.map;
        //Graphics used to draw the grid
        var g = new Graphics();
        g.beginStroke(Graphics.getRGB(256,256,256));
        for(var y = 0; y < map.length; y++){
            g.moveTo(0, y*33).lineTo(GameMap.tmxMap.width*33, y*33);
            for(var x = 0; x <  map[y].length; x++){
                if(map[y][x].image){
                    var btm = new Bitmap(map[y][x].image);
                    btm.y = y*33;
                    btm.x = x*33;
                    stageBaseMap.addChild(btm);
                    //delete map[y][x].image;
                }
                var images = map[y][x].imageDecB;
                if(images.length > 0){
                    for(var j in images){
                        btm = new Bitmap(images[j]);
                        btm.y = y*33;
                        btm.x = x*33;
                        stageBaseMap.addChild(btm);
                        //delete map[y][x].decImage;
                    }
                }
                images = map[y][x].imageDecF;
                if(images.length > 0){
                    for(j in images){
                        btm = new Bitmap(images[j]);
                        btm.y = y*33;
                        btm.x = x*33;
                        stageBaseMap.addChild(btm);
                        //delete map[y][x].decImage;
                    }
                }
                if(y == 0) g.moveTo(x*33, 0).lineTo(x*33, GameMap.tmxMap.height*33);
            }
        }
        //drawing the final lines of the grid
        g.moveTo(0, y*33).lineTo(GameMap.tmxMap.width*33, y*33).moveTo(x*33, 0)
            .lineTo(x*33, GameMap.tmxMap.height*33);
        stageBaseMap.addChild(new Shape(g));
        stageMapFront.update();
        stageBaseMap.update();
        stageMarker.update();
        console.timeEnd("map load");
    },
    /**
     * Creates invisible shapes
     * @namespace
     */
    easelShapes: {
        _createSquare: function(r,g,b,x,y,visible){
            var gr = new Graphics();
            gr.beginStroke(Graphics.getRGB(r,g,b)).setStrokeStyle(3)
                .beginFill(Graphics.getRGB(r,g,b,0.1))
                .drawRoundRect(2,2,29,29,2);
            var s = new Shape(gr);
            s.x = x*33;
            s.y = y*33;
            if(!visible) s.alpha = 0;
            return s; 
        },
        /**
         * Creates a green square at given coords
         * @param {Number} x Coord x
         * @param {Number} y Coord y
         */
        createGreenSquare: function(x,y,visible){
            var s = this._createSquare(30,200,30,x,y,visible);
            s.color = 'green';
            return s;    
        },
        createBlackSquare: function(x,y,visible){
            var s = this._createSquare(0,0,0,x,y,visible);
            s.color = 'black';
            return s;
        },
        createBlueSquare: function(x,y,visible){
            var s = this._createSquare(30,30,200,x,y,visible);
            s.color = 'blue';
            return s;
        },
        createRedSquare: function(x,y, visible){
            var s = this._createSquare(200,30,30,x,y,visible);
            s.color = 'red';
            return s;
        }
    }
}

/**
 * Image of tha player, moves it around, changes animation, etc.
 */
function PlayerImage(){
    this.bitmap = new BitmapAnimation(Painter.playerImage);
    var colorFilter = new ColorFilter(0,0,0,0.5);
    this.shadows = {
        init: function(parent){
            this.down = new Bitmap(
                SpriteSheetUtils.extractFrame(parent.bitmap.spriteSheet, 18));
            this.up = new Bitmap(
                SpriteSheetUtils.extractFrame(parent.bitmap.spriteSheet, 0));
            this.left = new Bitmap(
                SpriteSheetUtils.extractFrame(parent.bitmap.spriteSheet, 9));
            this.right = new Bitmap(
                SpriteSheetUtils.extractFrame(parent.bitmap.spriteSheet, 27));
            this.down.filters = this.left.filters = this.right.filters =
                this.up.filters = [colorFilter];
            this.down.cache(0,0,64,64);
            this.left.cache(0,0,64,64);
            this.right.cache(0,0,64,64);
            this.up.cache(0,0,64,64);
            this.down.alpha = this.left.alpha = this.right.alpha = this.up.alpha
                = 0;
        },
        down: null,
        up: null,
        left: null,
        right: null
    }
    this.shadows.init(this);
    this.bitmap.gotoAndStop("standDown");
    stagePlayer.addChild(this.bitmap);
    stagePlayer.addChild(this.shadows.up);
    stagePlayer.addChild(this.shadows.down);
    stagePlayer.addChild(this.shadows.left);
    stagePlayer.addChild(this.shadows.right);
}

/**
 * Places the image at specified coordinates
 * @param {Number} x Coord x
 * @param {Number} y Coord y
 */
PlayerImage.prototype.placeAt = function(x,y){
    this.bitmap.x = x*33;
    this.bitmap.y = y*33;
    stagePlayer.update();
}

/**
 * Moves the bitmap
 * @param {number} right How far to the right (in tiles) the bitmap should be
 * moved
 * @param {number} down How far down (in tiles) the bitmap should be
 * moved
 * @param {number} timeOfAnimation How long the movement should take, the longer,
 * the slower the movement will be
 */
PlayerImage.prototype.moveTo = function(right,down,timeOfAnimation){
    var that = this;
    var i = 0;
    right = right * 33 / timeOfAnimation;
    down = down * 33 / timeOfAnimation;
    var previousTime = Date.now();
    var callback = function(time){
        if(time - previousTime > 50 && i < timeOfAnimation){
            that.bitmap.x = that.bitmap.x+right;
            that.bitmap.y = that.bitmap.y+down;
            ++i
            stagePlayer.update();
            previousTime = Date.now();
        }else if(i >= timeOfAnimation){
            that.onAnimationEnd();
            return;
        }
        requestAnimationFrame(callback);
    }
    requestAnimationFrame(callback);
}

/**
 * Places the shadow at specified coords, in the direction given
 * @param {number} x Coord x
 * @param {number} y Coord y
 * @param {string} dir Direction to face ('down', 'up', 'left', 'right')
 */
PlayerImage.prototype.placeShadowAt = function(x,y,dir){
    this.hideShadows();
    var shadow;
    switch(dir){
        case 'down' :
            shadow = this.shadows.down;
            shadow.x = x*33-16;
            shadow.y = y*33-32;
            shadow.alpha = 1;
            shadow.updateCache();
            stagePlayer.update();
            break;
        case 'up' :
            shadow = this.shadows.up;
            shadow.x = x*33-16;
            shadow.y = y*33-32;
            shadow.alpha = 1;
            shadow.updateCache();
            stagePlayer.update();
            break;
        case 'left' :
            shadow = this.shadows.left;
            shadow.x = x*33-16;
            shadow.y = y*33-32;
            shadow.alpha = 1;
            shadow.updateCache();
            stagePlayer.update();
            break;
        case 'right' :
            shadow = this.shadows.right;
            shadow.x = x*33-16;
            shadow.y = y*33-32;
            shadow.alpha = 1;
            shadow.updateCache();
            stagePlayer.update();
            break;
    }
}

/**
 * Hides all the shadows of the PlayerImage
 */
PlayerImage.prototype.hideShadows = function(){
    for(var i in this.shadows){
        var shadow = this.shadows[i]
        if(typeof shadow === 'object'){
            shadow.alpha = 0;
            shadow.updateCache();
        }
    }
    stagePlayer.update();
}

/**
 * Sets the walking animation and moves the bitmap
 * @param {Number} right By how many tiles to the right move. 1 is one tile, -1 is
 * one tile to the left.
 * @param {Number} down By how many tiles down move. 1 is one tile, -1 is
 * one tile to the up.
 */
PlayerImage.prototype.walk = function(right,down){
    if(down > 0){
        this.bitmap.gotoAndPlay("walkDown")
    }else if(down <= 0 && right > 0){
        this.bitmap.gotoAndPlay("walkRight");
    }else if(down <= 0 && right < 0){
        this.bitmap.gotoAndPlay("walkLeft");
    }else{
        this.bitmap.gotoAndPlay("walkUp");
    }
    var event = this.onAnimationEnd;
    this.onAnimationEnd = function(){
        if(this.bitmap.currentAnimation === "walkDown"){
            this.bitmap.gotoAndStop("standDown");
        }else if(this.bitmap.currentAnimation === "walkRight"){
            this.bitmap.gotoAndStop("standRight");
        }else if(this.bitmap.currentAnimation === "walkLeft"){
            this.bitmap.gotoAndStop("standLeft");
        }else{
            this.bitmap.gotoAndStop("standUp");
        }
        stagePlayer.update();
        event();
    }
    this.moveTo(right, down,10);
}

PlayerImage.prototype._fall = function(right, down){
    if(this.bitmap.currentAnimation.indexOf("fall") === -1){
        if(Math.abs(right) > Math.abs(down)){
            if(right < 0){
                this.bitmap.gotoAndStop('fallLeft');
            }else{
                this.bitmap.gotoAndStop('fallRight');
            }
        }else if(down > 0){
            this.bitmap.gotoAndStop('fallDown');
        }else{
            this.bitmap.gotoAndStop('fallUp');
        }
    }
    this.moveTo(right, down, 3);
}

/**
 * Makes the player fall going through the specified path
 * @param {object[]} path An array of objects with parameters right and down
 */
PlayerImage.prototype.fall = function(path){
    var event = this.onAnimationEnd;
    var i = 0;
    var that = this;
    this.onAnimationEnd = function(){
        ++i;
        if(i >= path.length){
            that.onAnimationEnd = event;
            that.standUp();
            return;
        }
        var step = path[i];
        that._fall(step.right, step.down);
    }
    this._fall(path[i].right, path[i].down);
}

/**
 * Fires the malee attack animation 
 * @param {string} dir The direction the player should be facing when attacking,
 * possible values are 'down', 'left', 'right' and 'up'
 */
PlayerImage.prototype.attackMelee = function(dir){
    var ended;
    switch(dir){
        case 'down' :
            this.bitmap.gotoAndPlay('slashDown');
            this.bitmap.onAnimationEnd = function(){
                ended = true;
            }
            break;
        case 'left' :
            this.bitmap.gotoAndPlay('slashLeft');
            this.bitmap.onAnimationEnd = function(){
                ended = true;
            }
            break;
        case 'right' :
            this.bitmap.gotoAndPlay('slashRight');
            this.bitmap.onAnimationEnd = function(){
                ended = true;
            }
            break;
        case 'up' :
            this.bitmap.gotoAndPlay('slashUp');
            this.bitmap.onAnimationEnd = function(){
                ended = true;
            }
            break;
    }
    var previousTime = Date.now();
    var that = this;
    var callback = function(time){
        if(time - previousTime > 50 && !ended){
            previousTime = Date.now();
            stagePlayer.update();
        }else if(ended){
            that.onAnimationEnd();
            return;
        }
        requestAnimationFrame(callback);
    }
    requestAnimationFrame(callback);
}

/**
 * Changes the direction the player faces
 */
PlayerImage.prototype.faceDir = function(dir){
    switch(dir){
        case 'down' : this.bitmap.gotoAndStop('standDown'); break;
        case 'up' : this.bitmap.gotoAndStop('standUp'); break;
        case 'left' : this.bitmap.gotoAndStop('standLeft'); break;
        case 'right' : this.bitmap.gotoAndStop('standRight'); break;
    }
    stagePlayer.update();
},

/**
 * Fires the stand up animation
 */
PlayerImage.prototype.standUp = function(){
    this.bitmap.gotoAndPlay('stand');
    var ended;
    this.bitmap.onAnimationEnd = function(){
        ended = true;
    }
    var previousTime = Date.now();
    var that = this;
    var callback = function(time){
        if(time - previousTime > 75 && !ended){
            previousTime = Date.now();
            stagePlayer.update();
        }else if(ended){
            that.onAnimationEnd();
            return;
        }
        requestAnimationFrame(callback);
    }
    requestAnimationFrame(callback);
}

/**
 * Fires the die animation
 */
PlayerImage.prototype.die = function(){
    var ended;
    this.bitmap.gotoAndPlay('die');
    this.bitmap.onAnimationEnd = function(){
        ended = true;
        this.gotoAndStop('dead');
        stagePlayer.update();
    }
    var previousTime = Date.now();
    var that = this;
    var callback = function(time){
        if(time - previousTime > 50 && !ended){
            previousTime = Date.now();
            stagePlayer.update();
        }else if(ended){
            that.onAnimationEnd();
            return;
        }
        requestAnimationFrame(callback);
    }
    requestAnimationFrame(callback);
}

/**
 * Event listener, what to do when animation ends
 */
PlayerImage.prototype.onAnimationEnd = function(){}