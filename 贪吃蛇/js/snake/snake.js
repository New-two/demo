
// 屏幕分辨率的宽高
var w_width = $(window).width();
var w_height = $(window).height();


/*********************************游戏主代码**************************************/

//游戏常量
var CANVAS_W = 640;
var CANVAS_H = 640;

//音效
var backgroundMusic;
//var eat_apple = $("#eat_apple")[0];
//var eat_gold = $("#eat_gold")[0];
//var snake_die = $("#snake_die")[0];
var eat_apple;
var eat_gold;
var snake_die;

//图片
var imglist = {};
var imgData = {};

//背景层
var backLayer;
//加载层
var loadingLayer;
//存放总坐标的数组
var coordinates_arr = [];
//蛇的坐标集合
var snake_arr = [];
//障碍物集合
var obstacles_arr = [];
//障碍物个数
var obstacles_num = 7;
//苹果集合
var apple_arr = [];
//苹果个数
var apple_num = 5;
//金币集合
var gold_arr = [];
//金币个数
var gold_num = 5;
//是否可以点击的判断变量
var is_click = true;
//蛇默认的方向
var co = 39; 
//游戏是否开始标志
var game_start = true;
//速度
var snakeSpeed=35;




//主函数
function main(){
	// 溢出部分隐藏
	$("body,#game-box,#game-box>div").css("height",w_height+"px");

	// 设置全屏
 LGlobal.align = LStageAlign.TOP_MIDDLE;
 // LGlobal.align = LStageAlign.MIDDLE;
 LGlobal.stageScale = LStageScaleMode.SHOW_ALL;
 // LGlobal.stageScale = LStageScaleMode.NO_BORDER;
 LSystem.screen(LStage.FULL_SCREEN);


 // 背景
 backLayer = new LSprite();
 addChild(backLayer);

 // 加载音效
 
 backgroundMusic =$('#backgroundMusic')[0];
 backgroundMusic.src=gameConfig.music['backgroundMusic'];
 if(isOpenMusic){
	 backgroundMusic.play();
	 document.addEventListener("WeixinJSBridgeReady", function () {
	     WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
	     	if(isOpenMusic){
	     		backgroundMusic.play();
	     	}else{
	     		 backgroundMusic.pause();
	     	 }
	     });
	 }, false);		 
 } else{
	 backgroundMusic.pause();
 }
 
 eat_apple = new LSound();
 eat_apple.load(gameConfig.music["eat_apple"]);


 eat_gold = new LSound();
 eat_gold.load(gameConfig.music["eat_gold"]);


 snake_die = new LSound();
 snake_die.load(gameConfig.music["snake_die"]);
 

 // 加载
	LLoadManage.load(imgData,null,gameInit);
}

//游戏开始函数
function gameInit(result){

	//加载完的图片资源  
	imglist = result; 

	// 显示背景图
	backLayer.x = 40;
	backLayer.y = 40;
	// backLayer.graphics.drawRect(1,"#ffffff",[0,0,CANVAS_W-backLayer.x*2,CANVAS_H-backLayer.y*2],true,"#FFF0F0");

	// 生成蛇
	Snake.Init();

	// // 生成物品
	// for(var oi=0; oi<obstacles_num; oi++){
	// 	// 生成障碍物
	// 	obstacles_arr[oi] = new Items("cactus");
	// }
	// for(var ai=0; ai<apple_num; ai++){
	// 	// 生成苹果
	// 	apple_arr[ai] = new Items("apple");
	// }
	// for(var gi=0; gi<gold_num; gi++){
	// 	// 生成金币
	// 	gold_arr[gi] = new Items("gold");
	// }
	
	// 替换背景图
	$("body").css({
		'color':'red',
	    'background': "url("+imglist['background'].src+") no-repeat",
		'background-size': '100%'
	})

	// 画方格
	// for(var i=35; i<CANVAS_W-backLayer.x*2; i+=35){
	// 	backLayer.graphics.drawLine(1,"black",[0,i,CANVAS_W-backLayer.x*2,i]);
	// 	backLayer.graphics.drawLine(1,"black",[i,0,i,CANVAS_W-backLayer.x*2]);
	// }

	//绑定循环事件
 // backLayer.addEventListener(LEvent.ENTER_FRAME,Snake.move);
}

//生成随机坐标
var Arr = [];	//全局的坐标
function random_coordinates(img_width,img_height){

	var multiple = (CANVAS_W - backLayer.x*2)/img_width;
	
	var x = Math.floor(Math.random()*multiple)*img_width;
	var y = Math.floor(Math.random()*multiple)*img_height;

	var arr = [x,y];

	// 判断是否坐标是否重复
	for(var i = 0; i < coordinates_arr.length; i++){
		if(arr.toString() == coordinates_arr[i].toString()){
			random_coordinates(img_width,img_height);
			break;
		}else if(i == coordinates_arr.length-1){
			Arr = arr;
		}
	}

}

//物品类
function Items(img_name){

	base(this,LSprite,[]);
	var self = this;

	self.bitmap = new LBitmap(new LBitmapData(imglist[img_name],0,0));
	self.addChild(self.bitmap);

	// 把坐标存入总坐标数组
	random_coordinates(self.bitmap.getWidth(),self.bitmap.getHeight());

	self.x = Arr[0];
	self.y = Arr[1];

	// var rect1 = new LSprite();
//    rect1.graphics.drawRect(1,"#FF0000",[5, 5, self.bitmap.getWidth()-10, self.bitmap.getHeight()-10]);
//    self.addChild(rect1);

	// 设置碰撞形状和范围
	self.addShape(LShape.RECT,[5, 5, self.bitmap.getWidth()-10, self.bitmap.getHeight()-10]);

	// 把坐标存入总坐标数组
	coordinates_arr.push(Arr);

	// 加入背景里
	backLayer.addChild(self);
}


//蛇类
var Snake = {

	born: function(img,x,y,angle){

		var snake_sprite = new LSprite();
		backLayer.addChild(snake_sprite);
		snake_sprite.bitmap = new LBitmap(new LBitmapData(imglist[img],0,0));
		snake_sprite.bitmap.rotate = angle;
		snake_sprite.addChild(snake_sprite.bitmap);
		snake_sprite.x = x;
		snake_sprite.y = y;

		if(img == "head"){

			// 撞晕状态
			snake_sprite.bitmap2 = new LBitmap(new LBitmapData(imglist["head2"],0,0));
			snake_sprite.bitmap2.rotate = angle;
			snake_sprite.bitmap2.alpha = 0;
			snake_sprite.addChild(snake_sprite.bitmap2);

			// 吃东西状态
			snake_sprite.bitmap3 = new LBitmap(new LBitmapData(imglist["head3"],0,0));
			snake_sprite.bitmap3.rotate = angle;
			snake_sprite.bitmap3.alpha = 0;
			snake_sprite.addChild(snake_sprite.bitmap3);
		}

		if(img == "body"){
			// 蛇身体弯曲的部分
			snake_sprite.bitmap1 = new LBitmap(new LBitmapData(imglist["body1"],0,0));
			snake_sprite.bitmap1.alpha = 0;
			snake_sprite.addChild(snake_sprite.bitmap1);

			snake_sprite.bitmap2 = new LBitmap(new LBitmapData(imglist["body2"],0,0));
			snake_sprite.bitmap2.alpha = 0;
			snake_sprite.addChild(snake_sprite.bitmap2);

			snake_sprite.bitmap3 = new LBitmap(new LBitmapData(imglist["body3"],0,0));
			snake_sprite.bitmap3.alpha = 0;
			snake_sprite.addChild(snake_sprite.bitmap3);

			snake_sprite.bitmap4 = new LBitmap(new LBitmapData(imglist["body4"],0,0));
			snake_sprite.bitmap4.alpha = 0;
			snake_sprite.addChild(snake_sprite.bitmap4);
		}

		// 设置碰撞形状和范围
		snake_sprite.addShape(LShape.RECT,[5, 5, snake_sprite.bitmap.getWidth()-10, snake_sprite.bitmap.getHeight()-10]);

		// 存入蛇的数组
		snake_arr.push(snake_sprite);
		// 存入总坐标数组
		coordinates_arr.push([snake_sprite.x,snake_sprite.y]);
	},

	Init: function(){ // 初始化
		// 随机出口位置
		switch(Math.floor(Math.random()*2)+1){
			// 37 left - 38 up - 39 right - 40 down
			case 1: //左出口
				co = 39;
				Snake.born("head",0,8*35,0);
				Snake.born("body",-35,8*35,0);
				Snake.born("tail",-35*2,8*35,0);
				break;
			// case 2: //上出口
			// 	co = 40;
			// 	Snake.born("head",8*35,0,90);
			// 	Snake.born("body",8*35,-35,90);
			// 	Snake.born("tail",8*35,-35*2,90);
			// 	break;
			// case 3: //下出口
			// 	co = 38;
			// 	Snake.born("head",8*35,CANVAS_H-backLayer.y*2-35,-90);
			// 	Snake.born("body",8*35,CANVAS_H-backLayer.y*2,-90);
			// 	Snake.born("tail",8*35,CANVAS_H-backLayer.y*2+35,-90);
			// 	break;
			case 2: //右出口
				co = 37;
				Snake.born("head",CANVAS_H-backLayer.y*2-35,8*35,-180);
				Snake.born("body",CANVAS_H-backLayer.y*2,8*35,-180);
				Snake.born("tail",CANVAS_H-backLayer.y*2+35,8*35,-180);
				break;
		}
		
	},

	move: function(){ // 移动

		if(co == 37){
			for(var i=0; i<obstacles_arr.length; i++){
				if(snake_arr[0].x-35==obstacles_arr[i].x && snake_arr[0].y==obstacles_arr[i].y){
					console.log("撞到障碍物")
					if(isOpenMusic){
						try{
							snake_die.play();
						}catch(e){
							
						}
						
					}
					is_click = false;
					// 更换蛇头的状态图片
					snake_arr[0].bitmap.alpha = 0;
					snake_arr[0].bitmap3.alpha = 0;
					snake_arr[0].bitmap2.alpha = 1;

					// 停止轮循
					backLayer.removeEventListener(LEvent.ENTER_FRAME,Snake.move);
					callback();
					// 跳出函数
					return;
				}
			}

	    	snake_arr[0].bitmap.rotate = -180;
	    	snake_arr[0].bitmap2.rotate = -180;
	    	snake_arr[0].bitmap3.rotate = -180;
	    	
	    }
	    if(co == 38){

	    	for(var i=0; i<obstacles_arr.length; i++){
				if(snake_arr[0].y-35==obstacles_arr[i].y && snake_arr[0].x==obstacles_arr[i].x){
					console.log("撞到障碍物")
					if(isOpenMusic){
						try{
							snake_die.play();
						}catch(e){
							
						}
						
					}
					is_click = false;
					// 更换蛇头的状态图片
					snake_arr[0].bitmap.alpha = 0;
					snake_arr[0].bitmap3.alpha = 0;
					snake_arr[0].bitmap2.alpha = 1;

					// 停止轮循
					backLayer.removeEventListener(LEvent.ENTER_FRAME,Snake.move);
					callback();
					// 跳出函数
					return;
				}
			}

	    	snake_arr[0].bitmap.rotate = -90;
	    	snake_arr[0].bitmap2.rotate = -90;
	    	snake_arr[0].bitmap3.rotate = -90;
	    	
	    }
	    if(co == 39){

	    	for(var i=0; i<obstacles_arr.length; i++){
				if(snake_arr[0].x+35==obstacles_arr[i].x && snake_arr[0].y==obstacles_arr[i].y){
					console.log("撞到障碍物")
					if(isOpenMusic){
						try{
							snake_die.play();
						}catch(e){
							
						}
						
					}
					
					is_click = false;
					// 更换蛇头的状态图片
					snake_arr[0].bitmap.alpha = 0;
					snake_arr[0].bitmap3.alpha = 0;
					snake_arr[0].bitmap2.alpha = 1;

					// 停止轮循
					backLayer.removeEventListener(LEvent.ENTER_FRAME,Snake.move);
					callback();
					// 跳出函数
					return;
				}
			}

	    	snake_arr[0].bitmap.rotate = 0;
	    	snake_arr[0].bitmap2.rotate = 0;
	    	snake_arr[0].bitmap3.rotate = 0;
	    	
	    }
	    if(co == 40){

	    	for(var i=0; i<obstacles_arr.length; i++){
				if(snake_arr[0].y+35==obstacles_arr[i].y && snake_arr[0].x==obstacles_arr[i].x){
					console.log("撞到障碍物")
					if(isOpenMusic){
						try{
							snake_die.play();
						}catch(e){
							
						}
						
					}
					is_click = false;
					// 更换蛇头的状态图片
					snake_arr[0].bitmap.alpha = 0;
					snake_arr[0].bitmap3.alpha = 0;
					snake_arr[0].bitmap2.alpha = 1;

					// 停止轮循
					backLayer.removeEventListener(LEvent.ENTER_FRAME,Snake.move);
					callback();
					// 跳出函数
					return;
				}
			}

	    	snake_arr[0].bitmap.rotate = 90;
	    	snake_arr[0].bitmap2.rotate = 90;
	    	snake_arr[0].bitmap3.rotate = 90;
	    	
	    }

		// 更换蛇头的状态图片
		snake_arr[0].bitmap.alpha = 1;
		snake_arr[0].bitmap3.alpha = 0;

		// // 重新生成物品
		// rebuild_items();	


		// 移动蛇的所有格子
		for(var num=snake_arr.length; num>0; num--){
			
			if(num>1){
				
				snake_arr[num - 1].x = snake_arr[num - 2].x;
				snake_arr[num - 1].y = snake_arr[num - 2].y;
				snake_arr[num - 1].bitmap.rotate = snake_arr[num - 2].bitmap.rotate;
			}
		}


		// 判断键盘按下的方向
		// 37 left - 38 up - 39 right - 40 down
		if(co == 37){
			
			if(snake_arr[0].x-35 < 0){
	    		snake_arr[0].x = CANVAS_W - backLayer.x*2;
	    	}
	    	// snake_arr[0].x -= snakeSpeed*LGlobal.deltaTime;
			snake_arr[0].x -= 35;

		}else if(co == 38){
			if(snake_arr[0].y-35 < 0){
	    		snake_arr[0].y = CANVAS_H - backLayer.y*2;
	    	}
			// snake_arr[0].y -= snakeSpeed*LGlobal.deltaTime;
			snake_arr[0].y -= 35;
		}else if(co == 39){
			if(snake_arr[0].x+35 >= CANVAS_W - backLayer.x*2){
	    		snake_arr[0].x = -35;
	    	}
			// snake_arr[0].x += snakeSpeed*LGlobal.deltaTime;
			snake_arr[0].x += 35;
		}else if(co == 40){
			if(snake_arr[0].y+35 >= CANVAS_H - backLayer.y*2){
	    		snake_arr[0].y = -35;
	    	}
			// snake_arr[0].y += snakeSpeed*LGlobal.deltaTime;
			snake_arr[0].y += 35;
		}

		

		// 蛇身体弯曲
		find_bending();	

		// 蛇是否晕了
		// Snake.die();

		// 蛇吃东西
		// Snake.eat();

		// 更新总坐标数组
		updata_arr();

		// 操作参数更改
		is_click = true;
	},

	die: function(){ // 游戏是否结束




		// 判断蛇头是否跟障碍物碰撞
		for(var i=0; i<obstacles_arr.length; i++){
			if(snake_arr[0].hitTestObject(obstacles_arr[i])){
				console.log("撞到障碍物")
				if(isOpenMusic){
					try{
						snake_die.play();
					}catch(e){
						
					}
					
				}
				is_click = false;
				// 更换蛇头的状态图片
				snake_arr[0].bitmap.alpha = 0;
				snake_arr[0].bitmap2.alpha = 1;

				// 停止轮循
				backLayer.removeEventListener(LEvent.ENTER_FRAME,Snake.move);
				
				callback();
				// 跳出函数
				return;
			}
		}

		// // 判断蛇是否咬到自己
		for(var j=1; j<snake_arr.length; j++){
			if(snake_arr[0].hitTestObject(snake_arr[j])){
				console.log("咬到自己")
				if(isOpenMusic){
					try{
						snake_die.play();
					}catch(e){
						
					}
				
				}
				
				is_click = false;
				// 更换蛇头的状态图片
				snake_arr[0].bitmap.alpha = 0;
				snake_arr[0].bitmap2.alpha = 1;
				
				// 停止轮循
				backLayer.removeEventListener(LEvent.ENTER_FRAME,Snake.move);
				
				
				callback();
				return;
			}
		}
	},
	
}

function callback(){
	 backgroundMusic.pause();
	//传分数
	if(overCallback&&typeof overCallback=='function'){					
	
		overCallback( parseInt($("#totalScore").text()) );
		$("body").off("touchstart");
		LGlobal.preventDefault=false;

	}
}

//更新总坐标数组的函数
function updata_arr(){

		// 重置总坐标数组
		coordinates_arr = [];

		// 蛇
		for(var n=0; n<snake_arr.length; n++){
			coordinates_arr.push([snake_arr[n].x, snake_arr[n].y]);
		}
}

//判断蛇身体弯曲部分
function find_bending(){

	for(var i=0; i<snake_arr.length; i++){

		if(i <= snake_arr.length-3){

			snake_arr[i+1].bitmap.alpha = 1;
			snake_arr[i+1].bitmap1.alpha = 0;
			snake_arr[i+1].bitmap2.alpha = 0;
			snake_arr[i+1].bitmap3.alpha = 0;
			snake_arr[i+1].bitmap4.alpha = 0;
			
			if(snake_arr[i].x != snake_arr[i+2].x && snake_arr[i].y != snake_arr[i+2].y){

				snake_arr[i+1].bitmap.alpha = 0;

				if(Math.abs(snake_arr[i].x - snake_arr[i+2].x) == 35 && Math.abs(snake_arr[i].y - snake_arr[i+2].y) == 35){
					// 上右
					if(snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x || snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y){
		
						snake_arr[i+1].bitmap4.alpha = 1;

					}
					// 上左
					if(snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y || snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x){
			
						snake_arr[i+1].bitmap1.alpha = 1;

					}
					// 左下
					if(snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y || snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x){
					
						snake_arr[i+1].bitmap2.alpha = 1;

					}
					// 右下
					if(snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x || snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y){
				
						snake_arr[i+1].bitmap3.alpha = 1;

					}
				}
				if(Math.abs(snake_arr[i].x - snake_arr[i+2].x) != 35 || Math.abs(snake_arr[i].y - snake_arr[i+2].y) != 35){
					// 上下
					if(snake_arr[i].y + snake_arr[i+2].y + 35 == 560){
						// 上右
						if(snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x || snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y){
							snake_arr[i+1].bitmap4.alpha = 1;
						}
						// 上左
						if(snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x || snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y){
							snake_arr[i+1].bitmap1.alpha = 1;
						}
						// 右下
						if(snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x || snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y){
							snake_arr[i+1].bitmap3.alpha = 1;
						}
						// 左下
						if(snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x || snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y){
							snake_arr[i+1].bitmap2.alpha = 1;
						}
					}
					// 左右
					else{
						// 左下
						if(snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x || snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y){
							snake_arr[i+1].bitmap2.alpha = 1;
						}
						// 右下
						if(snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x || snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y){
							snake_arr[i+1].bitmap3.alpha = 1;
						}
						// 右上
						if(snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x || snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y){
							snake_arr[i+1].bitmap4.alpha = 1;
						}
						// 左上
						if(snake_arr[i].x < snake_arr[i+2].x && snake_arr[i].y < snake_arr[i+2].y && snake_arr[i].x == snake_arr[i+1].x || snake_arr[i].x > snake_arr[i+2].x && snake_arr[i].y > snake_arr[i+2].y && snake_arr[i].y == snake_arr[i+1].y){
							snake_arr[i+1].bitmap1.alpha = 1;
						}
					}
								
				}
				

			}

		}
		
	}
}

//第一次开始移动蛇
function move_start(){
	
	if(game_start){
		 $("#gameGuide").hide();
		 $.cookie(cookieGuideKey,true);
		// 绑定循环事件
		backLayer.addEventListener(LEvent.ENTER_FRAME,Snake.move);
		
		game_start = false;
	}
}

//加入键盘事件，用方向键来控制蛇前进的方向 
document.onkeydown = function(event){

	// 第一次开始移动蛇
	move_start();

	if(is_click){

		is_click = false;

		// 37 left - 38 up - 39 right - 40 down
	    co = event.keyCode>=37 && event.keyCode<=40 && (Math.abs(event.keyCode-co) != 2) ? event.keyCode : co;
	  
	}
 
}

//手机滑屏事件
$("#game-box,#gameGuide").on("swipeLeft",function(){
	// 第一次开始移动蛇
	move_start();
	co = co!=39 ? 37 : co;
}).on("swipeRight",function(){
	// 第一次开始移动蛇
	move_start();
	co = co!=37 ? 39 : co;
}).on("swipeUp",function(){
	// 第一次开始移动蛇
	move_start();
	co = co!=40 ? 38 : co;
}).on("swipeDown",function(){
	// 第一次开始移动蛇
	move_start();
	co = co!=38 ? 40 : co;
})
//手机旋转事件

window.addEventListener("deviceorientation",orientationHandler , false);
    function orientationHandler(e) { //改变蛇方向 
        var data=Math.round(e.alpha);
        switch(data){ 
            case 90: move_start();
				co = co!=39 ? 37 : co;
            break;//上 

            case 180: move_start();
				co = co!=37 ? 39 : co;
            break;//右 
            case 270: move_start();
            	co = co!=40 ? 38 : co;
            break;//下 
            case 360 : move_start();
				co = co!=38 ? 40 : co;
            break;//左 
        }
		document.querySelector('.asd').innerHTML=data;
    } 

