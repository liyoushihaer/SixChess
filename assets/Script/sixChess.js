const startPosX = -307;
const startPosY = -325;
const width = 205;
const height = 220;
const area = 20;
global.GameColor={
    "white":0,
    "black":1
}
cc.Class({
    extends: cc.Component,

    properties: {
        chessNode:{
            default:null,
            type:cc.Prefab
        },
        chessNodeBlack:{
            default:null,
            type:cc.Prefab
        },
        boardNode:{
            default:null,
            type:cc.Node
        },
        _chessPos:{
            default:[],
            type:cc.Vec2
        },
        _selectChess:null,
        _isServerControl:false,
        _roundPlayerColor:global.GameColor.white,
        _selfColor:global.GameColor.white,
    },
    getSelfColor:function()
    {
        return this._selfColor;
    },
    // use this for initialization
    onLoad: function () {
        this.blackInitPos = [8,11,12,13,14,15];
        this.whiteInitPos = [0,1,2,3,4,7];
        this.calculatePos();
        this.addTouchEvent();
    },
    
    initChess:function()
    {
        if(!this.chessArray)
        {
            this.chessArray = [];
        }
        this.chessArray.length =16;
        this.chessArray.fill(null);
        this._roundPlayerColor=global.GameColor.white;
    },

    calculatePos:function()
    {
        let x,y;
        this._chessPos.length = 0;
        for (let i = 0; i < 4; i++)
        {
            for (let j = 0; j <4 ; j++) 
            {
                y =startPosY + i*height;
                x =startPosX+ j*width;
                this._chessPos.push(new cc.Vec2(x,y));
            }   
        }
    },

    addTouchEvent:function()
    {
        this.boardNode.on('touchend',function(event){
            this.onTouchend(event);
        }, this); 
        this.boardNode.on('touchcancel',function(event){
            this.onTouchend(event);
        }, this);  
        this.boardNode.on('mouseup',function(event){
            this.onTouchend(event);
        }, this);
    },
    
    onTouchend:function(event)
    {
        let pos = this.boardNode.convertToNodeSpaceAR(event.getLocation());
        let posIndex =this.getTouchIndex(pos);
        if(this._selectChess != null && posIndex != -1 
        &&this.chessArray[posIndex] == null && this._roundPlayerColor == this._selectChess.color)
        {
            let chessPos = this._selectChess.getPosIndex();
            let delta = Math.abs(chessPos-posIndex);
            if(delta==1 || delta == 4)
            {
                this.chessArray[chessPos] = null;
                this._selectChess.node.position = this._chessPos[posIndex];
                this._selectChess.setPosIndex(posIndex);
                this.chessArray[posIndex] = this._selectChess;
                this._selectChess = null;
                this.changeColor();
            }
        }
    },

    changeColor:function()
    {
        if(this._isServerControl== true)
        {
            return;
        }
        if(this._roundPlayerColor ==global.GameColor.white )
        {
            this._roundPlayerColor = global.GameColor.black;
        }
        else{
            this._roundPlayerColor = global.GameColor.white;
        }
    },

    getTouchIndex:function(pos)
    {
        for (const key in this._chessPos) {
            if ( this._chessPos.hasOwnProperty(key)) {
                const vec =  this._chessPos[key];
                if(pos.x>(vec.x-area) && pos.x<(vec.x+area) &&pos.y>(vec.y-area) &&pos.y<(vec.y+area))
                {
                    return key;
                }
            }
        }
        return -1;
    },

    initBoardChess:function()
    {
        this.initChess();
        this.boardNode.removeAllChildren();
        //白方
        for (const index1 of this.whiteInitPos) {
            this.initNode(index1,false);
        }
        //黑方
        for (const index2 of this.blackInitPos) {
            this.initNode(index2,true);
        }
    },
    
    setSelectChess:function(nodeScript)
    {
        this._selectChess = nodeScript;
    },

    initNode:function(index,isBlack)
    {
        let obj;
        let color;
        if(isBlack == false)
        {
            color = 0;
            obj = cc.instantiate(this.chessNode);
        }
        else
        {
            color = 1;
            obj = cc.instantiate(this.chessNodeBlack);
        }
        let script = obj.getComponent('chessNode');
        script.initNode(index,this,color);
        obj.parent = this.boardNode;
        obj.position = this._chessPos[index];
        this.chessArray[index] = script;
    },

    onStart:function()
    {
        this.initBoardChess();
    },

    isShootChess:function(currentIndex)
    {
        let myColor = this._roundPlayerColor;
        //判断横向
        let horizontal = currentIndex%4;
        let result = false;
        switch (horizontal) 
        {
            case 0:
                result =this.shoot(currentIndex,1,1,3);
                break;
            case 1:
                result =this.shoot(currentIndex,1,1,-1);
                break;
            case 2:
                result =this.shoot(currentIndex,-1,1,1);
                break;
            case 3:
                result =this.shoot(currentIndex,-1,1,-3);
                break;
            default:
                break;
        }

        //纵向
        let vertical = currentIndex/4;
        switch (vertical) 
        {
            case 0:
                result =this.shoot(currentIndex,1,4,12);
                break;
            case 1:
                result =this.shoot(currentIndex,1,4,-4);
                break;
            case 2:
                result =this.shoot(currentIndex,-1,4,4);
                break;
            case 3:
                result =this.shoot(currentIndex,-1,4,-12);
                break;
            default:
                break;
        }

        return result;
    },

    shoot:function(currentIndex,flag,delta,emptyDelta)
    {
        if(this.isEnemyChess(currentIndex+flag*delta,myColor)== true&&this.isEnemyChess(currentIndex+flag*2*delta,myColor)== true
        &&this.ifPosEmpty(currentIndex+emptyDelta)== true)
        {
            return true;
        } 
        return false;
    },

    isEnemyChess:function(pos,mycolor)
    {
        let enemyColor = (mycolor==global.GameColor.black)?global.GameColor.white:global.GameColor.black
        if(this.chessArray[pos]!= null && enemyColor ==this.chessArray[pos].color)
        {
            return true
        }
        else{
            return false
        }
    },
    
    ifPosEmpty:function(pos)
    {
        if(this.chessArray[pos]!= null)
        {
            return false;
        }
        else{
            return true;
        }
    },
    
    isGameOver:function()
    {
        //一方剩一颗棋子
        let whiteNum=0;
        let blackNum =0;
        for (let index = 0; index < this.chessArray.length; index++) {
            const element = array[index];
            if(element)
            {
                if(element.color ==global.GameColor.black)
                {
                    blackNum =blackNum+1;
                }
                else{
                    whiteNum =whiteNum+1;
                }
            }
        }

        if(blackNum<=1)
        {
            return true;
        }
        if(whiteNum<=1)
        {
            return true;
        }

        //被围住
        
        return false;
    },
});
