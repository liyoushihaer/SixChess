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

    onLoad: function () {
        this.blackInitPos = [8,11,12,13,14,15];
        this.whiteInitPos = [0,1,2,3,4,7];
        this.calculatePos();
        this.addTouchEvent();
    },
    
    initChess:function()
    {
        if(!this.chessMapWihte)
        {
            this.chessMapWihte = new Map();
        }
        if(!this.chessMapBlack)
        {
            this.chessMapBlack = new Map();
        }
        this._roundPlayerColor= global.GameColor.white;
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
        &&this.isPosEmpty(posIndex)==true && this._roundPlayerColor == this._selectChess.color)
        {
            let chessPos = this._selectChess.getPosIndex();
            let delta = Math.abs(chessPos-posIndex);
            if(delta==1 || delta == 4)
            {
                let temp = (this._roundPlayerColor ==global.GameColor.white )?this.chessMapWihte:this.chessMapBlack;
                temp.delete(chessPos);
                this._selectChess.node.position = this._chessPos[posIndex];
                this._selectChess.setPosIndex(posIndex);
                temp.set(posIndex,this._selectChess)
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
        let tempMap;
        if(isBlack == false)
        {
            color = 0;
            obj = cc.instantiate(this.chessNode);
            tempMap = this.chessMapWihte;
        }
        else
        {
            color = 1;
            obj = cc.instantiate(this.chessNodeBlack);
            tempMap = this.chessMapBlack;
        }
        let script = obj.getComponent('chessNode');
        script.initNode(index,this,color);
        obj.parent = this.boardNode;
        obj.position = this._chessPos[index];
        tempMap.set(index,script);
    },

    onStart:function()
    {
        this.initBoardChess();
    },

    //是否吃掉棋子
    isShootChess:function(currentIndex,myColor)
    {
        //判断横向
        let horizontal = currentIndex%4;
        let resultH = false;
        switch (horizontal) 
        {
            case 0:
                resultH =this.shoot(currentIndex,1,1,3);
                break;
            case 1:
                resultH =this.shoot(currentIndex,1,1,-1);
                break;
            case 2:
                resultH =this.shoot(currentIndex,-1,1,1);
                break;
            case 3:
                resultH =this.shoot(currentIndex,-1,1,-3);
                break;
            default:
                break;
        }

        //纵向
        let vertical = currentIndex/4;
        let resultV = false;
        switch (vertical) 
        {
            case 0:
                resultV =this.shoot(currentIndex,1,4,12);
                break;
            case 1:
                resultV =this.shoot(currentIndex,1,4,-4);
                break;
            case 2:
                resultV =this.shoot(currentIndex,-1,4,4);
                break;
            case 3:
                resultV =this.shoot(currentIndex,-1,4,-12);
                break;
            default:
                break;
        }

        return [resultH,resultV];
    },

    shoot:function(currentIndex,flag,delta,emptyDelta)
    {
        if(this.isEnemyChess(currentIndex+flag*delta,myColor)== true&&this.isEnemyChess(currentIndex+flag*2*delta,myColor)== true
        &&this.isPosEmpty(currentIndex+emptyDelta)== true)
        {
            return true;
        } 
        return false;
    },

    isEnemyChess:function(pos,mycolor)
    {
        if(mycolor==global.GameColor.black)
        {
            if(this.chessMapWihte.has(pos))
            {
                return true;
            }
        }
        else{
            if(this.chessMapBlack.has(pos))
            {
                return true;
            }
        }
        return false;
    },
    
    isPosEmpty:function(pos)
    {
        if(this.chessMapBlack.has(pos)||this.chessMapWihte.has(pos))
        {
            return false;
        }
        else{
            return true;
        }
    },
    
    isChessSourround:function(index)
    {
        let tempIndex = index+4;
        //上
        if(tempIndex<16 && this.isPosEmpty(tempIndex))
        {
            return false;
        }
        tempIndex = index-4;
        //下
        if(tempIndex>=0 && this.isPosEmpty(tempIndex))
        {
            return false;
        }
        tempIndex = index-1;
        //左
        if(index%4!=0 && this.isPosEmpty(tempIndex))
        {
            return false;
        }
        tempIndex = index+1;
        //右
        if((index+1)%4!=0 && this.isPosEmpty(tempIndex))
        {
            return false;
        }
        return true;
    },
    
    isGameOver:function(array)
    {
        let whiteNum=0;
        let blackNum =0; 
        let surroundChessWhite =0;
        let surroundChessBlack =0;

        for (const value of this.chessMapBlack.keys()) {
            if(this.isChessSourround(value)== true)
            {
                surroundChessBlack++;
            }
        }
        for (const value of this.chessMapWihte.keys()) {
            if(this.isChessSourround(value)== true)
            {
                surroundChessWhite++;
            }
        }

        //一方剩一颗棋子
        if(this.chessMapBlack.size<=1)
        {
            return true;
        }
        if(this.chessMapWihte.size<=1)
        {
            return true;
        }

        //被围住
        if(surroundChessBlack == this.chessMapBlack.size)
        {
            return true;
        }

        if(surroundChessWhite == this.chessMapWihte.size)
        {
            return true;
        }

        return false;
    },
    
});
