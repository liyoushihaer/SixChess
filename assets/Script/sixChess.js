const startPosX = -307;
const startPosY = -325;
const width = 205;
const height = 220;
const area = 20;

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
        _selectChess:null
        
    },

    // use this for initialization
    onLoad: function () {
        this.blackInitPos = [8,11,12,13,14,15];
        this.whiteInitPos = [0,1,2,3,4,7];
        this.calculatePos();
        this.addTouchEvent();
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
        if(this._selectChess != null && posIndex != -1)
        {
            this._selectChess.node.position = this._chessPos[posIndex];
            this._selectChess.setPosIndex(posIndex);
            this._selectChess = null;
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
        
        obj.getComponent('chessNode').initNode(index,this,color);
        obj.parent = this.boardNode;
        obj.position = this._chessPos[index];
    },

    onStart:function()
    {
        this.initBoardChess();
    },

    // called every frame
    update: function (dt) {

    },
});
