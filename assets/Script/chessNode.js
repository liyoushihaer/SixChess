cc.Class({
    extends: cc.Component,

    properties: {
        _posIndex:-1,
        state:-1, // 1存活 0 死亡
        color:0,   //0 白 1 黑
        _page:null
    },

    // use this for initialization
    onLoad: function () {

    },
    getPosIndex:function()
    {
        return this._posIndex;
    },

    setPosIndex:function(index)
    {
        this._posIndex = index;
    },

    resetState:function()
    {
        this.state = -1;
         this._posIndex = -1;
        this.color = 0;
        this.state = -1;
    },
    initNode:function(index,page,color)
    {
        this._posIndex = index;
        this._page = page;
        this.color = color;
        this.state = 1;
    },

    onNodeBeTouch:function()
    {
        if(this._page.getSelfColor()!= this.color)
        {
            return;
        }
        
        this._page.setSelectChess(this);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
