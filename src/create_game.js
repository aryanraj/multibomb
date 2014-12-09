"use strict";
module.exports = function(data, user) {
	var backgrndArray =[[-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2],
  				      	[-2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-2],
  				      	[-2, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-2],
  				      	[-2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-2],
  				      	[-2, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-2],
  				      	[-2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-2],
  				      	[-2, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-2],
  				      	[-2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-2],
  				      	[-2, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-2],
  				      	[-2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-2],
  				      	[-2, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-2],
  				      	[-2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-2],
  				      	[-2, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-1, 0,-2],
  				      	[-2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-2],
  				      	[-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2,-2]],
	  	man = [],
	  	enemy = [],
        exitGate = [],
	  	nMan = user.length,
	  	nEnemy = data.nEnemy,
	  	nBox = data.nBox,
        i,j;
	var rand = function(n)   {
            return parseInt(Math.random()*n);
        };

    switch(nMan){
        case 4:
            var tman = {};
            tman.x = 32;
            tman.y = 13*32;
            tman.id = user[3];
            man.push(tman);
            backgrndArray[13][1] = -5;
            backgrndArray[13][2] = -5;
            backgrndArray[12][1] = -5;
        case 3:
            var tman = {};
            tman.x = 17*32;
            tman.y = 32;
            tman.id = user[2];
            man.push(tman);
            backgrndArray[1][17] = -5;
            backgrndArray[1][16] = -5;
            backgrndArray[2][17] = -5;
        case 2:
            var tman = {};
            tman.x = 17*32;
            tman.y = 13*32;
            tman.id = user[1];
            man.push(tman);
            backgrndArray[13][17] = -5;
            backgrndArray[13][16] = -5;
            backgrndArray[12][17] = -5;
        case 1:
            var tman = {};
            tman.x = 32;
            tman.y = 32;
            tman.id = user[0];
            man.push(tman);
            backgrndArray[1][1] = -5;
            backgrndArray[1][2] = -5;
            backgrndArray[2][1] = -5;
    }

    //making Enemy
    for(i=0;i<nEnemy;){
        var xx = rand(19),
            yy = rand(15);
        if(backgrndArray[yy][xx] == 0) {
            var tenemy = {};
            tenemy.x = xx*32;
            tenemy.y = yy*32;
            tenemy.id = rand(10000);
            tenemy.d = (function(){
            	switch(rand(4)){
            		case 0: return "left";
            		case 1: return "right";
            		case 2: return "up";
            		case 3: return "down";
            	}
            })();
            enemy.push(tenemy);
            backgrndArray[yy][xx] = -5;
            i++;
        }
    }

    //get num of gates
    for(i=0;i<nMan;)
    {
        j = rand(nBox);
        if(!(j in exitGate)) {
            exitGate[j] = true;
            i++;
        }
    }
    //Box Placer
    for(i=0;i<nBox;)
    {
        xx = rand(19);
        yy = rand(15);
        if(backgrndArray[yy][xx] == 0){
            if(exitGate[i])
                backgrndArray[yy][xx] = -4;
            else
                backgrndArray[yy][xx] = -3;
            i++;
        }
    }
    for(i=0;i<15;i++)
        for(j=0;j<19;j++){
            if(backgrndArray[i][j] == -5)
                backgrndArray[i][j] = 0;
        }
    return {
    	man : man,
    	enemy : enemy,
    	token : {
    		backgrndArray : backgrndArray,
    		manSpeed : data.manSpeed,
    		enemySpeed : data.enemySpeed
    	}
    }
}