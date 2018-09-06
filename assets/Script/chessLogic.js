global.GBagDataModel = {
    setPage:function(page)
    {
        this.page = page;
    },

    setChessArray:function(array)
    {
        this.chessArray = array;
        this.tempChessArray = [];
        for (let index = 0; index < array.length; index++) {
            this.tempChessArray.push(array[index]);
        }
    },
    
    ai:function(array,selfColor)
    {
        this.setChessArray(array);
        this.result =null;
        this.selfColor = selfColor;
        this.aiColor= (selfColor == global.GameColor.white)?this.page.chessMapWihte:this.page.chessMapBlack; 
        let tempA = [...this.tempChessArray];
        this.DEPTH = 3;
        this.negaMax(true, 3,-99999999, 99999999,tempA);
        return this.result;
    },

    negaMax:function(is_ai, depth, alpha, beta,tempA)
    {
       if(this.isGameOver(tempA)||depth==0)
       {
           return this.evaluate();
       } 
       
        let blankList=this.getReasobalPos(is_ai?this.aiColor:this.selfColor,tempA);
        let value = 0;
        
        for (let index = 0; index < blankList.length; index++) 
        {
            const element = blankList[index];
            let tempB = [...tempA];
            //走棋
            this.moveChess(element.from,element.toPos,tempB);
            value = -negaMax(!is_ai,depth - 1, -beta, -alpha,tempB);
            if(value >alpha)
            {
                if(depth == this.DEPTH)
                {
                    this.result = element;
                }
                if(value >=beta)
                {
                    return beta;
                }
                alpha = value;
            }
        }
        return alpha;
    },

    getReasobalPos:function(color,array)
    {
        let resultArray = [];
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if(element.color == color)
            {
                if((index%4!=0)&&array[index-1]==null)
                {
                    let result = {};
                    result.from = index;
                    result.toPos = index-1;
                    resultArray.push(result);
                }

                if(((index+1)%4!=0)&&array[index+1]==null)
                {
                    let result = {};
                    result.from = index;
                    result.toPos = index+1;
                    resultArray.push(result);
                }

                if(((index-4)>0)&&array[index-4]==null)
                {
                    let result = {};
                    result.from = index;
                    result.toPos = index-4;
                    resultArray.push(result);
                }

                if(((index+4)<16)&&array[index+4]==null)
                {
                    let result = {};
                    result.from = index;
                    result.toPos = index+4;
                    resultArray.push(result);
                }
            }
        }
    },

    isGameOver:function(array)
    {
        let whiteNum=0;
        let blackNum =0; 
        let surroundChessWhite =0;
        let surroundChessBlack =0;
        for (let index = 0; index < array.length; index++)
        {
            if(array[index]&&array[index].color == global.GameColor.white)
            {
                whiteNum++;
                if(this.isChessSourround(index)== true)
                {
                    surroundChessWhite++;
                }
            }
            else if(array[index]&&array[index].color == global.GameColor.black)
            {
                blackNum++;
                if(this.isChessSourround(index)== true)
                {
                    surroundChessBlack++;
                }
            }
        }

        //一方剩一颗棋子
        if(whiteNum<=1)
        {
            return true;
        }
        if(blackNum<=1)
        {
            return true;
        }

        //被围住
        if(surroundChessBlack == blackNum)
        {
            return true;
        }

        if(surroundChessWhite ==whiteNum)
        {
            return true;
        }

        return false;
    },

    isChessSourround:function(index,array)
    {
        let tempIndex = index+4;
        //上
        if(tempIndex<16 && array[tempIndex]==null)
        {
            return false;
        }
        tempIndex = index-4;
        //下
        if(tempIndex>=0 && array[tempIndex]==null)
        {
            return false;
        }
        tempIndex = index-1;
        //左
        if(index%4!=0 && array[tempIndex]==null)
        {
            return false;
        }
        tempIndex = index+1;
        //右
        if((index+1)%4!=0 && array[tempIndex]==null)
        {
            return false;
        }
        return true;
    },

    moveChess:function(fromPos,toPos,array)
    {
        array[toPos]= array[fromPos];
        array[fromPos] = null; 
        //根据走棋去掉棋子
        let data = this.isShootChess(array,toPos,array[toPos].color);
        if(data[0])
        {
            array[data[2]] = null;
        }
        if(data[1])
        {
            array[data[3]] = null;
        }
    },
    
    isShootChess:function(array,currentIndex,myColor)
    {
        //判断横向
        let horizontal = currentIndex%4;
        let h1 = -1;
        let resultH = false;
        switch (horizontal) 
        {
            case 0:
                resultH =this.shoot(currentIndex,1,1,3,array,myColor);
                if(resultH == true){h1 = currentIndex+3;}
                break;
            case 1:
                resultH =this.shoot(currentIndex,1,1,-1,array,myColor);
                if(resultH == true){h1 = currentIndex-1;}
                break;
            case 2:
                resultH =this.shoot(currentIndex,-1,1,1,array,myColor);
                if(resultH == true){h1 = currentIndex+1;}
                break;
            case 3:
                resultH =this.shoot(currentIndex,-1,1,-3,array,myColor);
                if(resultH == true){h1 = currentIndex-3;}
                break;
            default:
                break;
        }

        //纵向
        let vertical = currentIndex/4;
        let resultV = false;
        let v1 = -1;
        switch (vertical) 
        {
            case 0:
                resultV =this.shoot(currentIndex,1,4,12,array,myColor);
                if(resultV == true){v1 = currentIndex+12;}
                break;
            case 1:
                resultV =this.shoot(currentIndex,1,4,-4,array,myColor);
                if(resultV == true){v1 = currentIndex-4;}
                break;
            case 2:
                resultV =this.shoot(currentIndex,-1,4,4,array,myColor);
                if(resultV == true){v1 = currentIndex+4;}
                break;
            case 3:
                resultV =this.shoot(currentIndex,-1,4,-12,array,myColor);
                if(resultV == true){v1 = currentIndex-12;}
                break;
            default:
                break;
        }

        return [resultH,resultV,h1,v1];
    },

    shoot:function(currentIndex,flag,delta,emptyDelta,array,myColor)
    {
        if(this.isEnemyChess(currentIndex+flag*delta,myColor,array)== false
        &&this.isEnemyChess(currentIndex+flag*2*delta,myColor,array)== false
        &&array[currentIndex+emptyDelta] == null)
        {
            return true;
        } 
        return false;
    },
    isEnemyChess:function(pos,mycolor,array)
    {
        if(array[pos] && array[pos].color !=mycolor)
        {
            return true;
        }
        return false;
    },

    evaluate:function(player,pos,array)
    {
        let data = this.isShootChess(array,pos);
        let result = 0;
        if(data[0]&&data[1])
        {
            result = 400;
        }
        else if(data[0] || data[1])
        {
            result = 100;
        }
        else {
            result = 0;
        }
        if(this.isGameOver(array)==true)
        {
            result = 600;
        }  
    },

};