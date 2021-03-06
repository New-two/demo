
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
var snakeSpeed=17;




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
 

 

 // 加载
	LLoadManage.load(imgData,null,gameInit);
}

//游戏开始函数
function gameInit(result){

	//加载完的图片资源  
	imglist = result; 

	// 显示背景图
	backLayer.x = 0;
	backLayer.y = 0;
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
	// for(var i=17; i<CANVAS_W-backLayer.x*2; i+=17){
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
			snake_sprite.bitmap1 = new LBitmap(new LBitmapData(imglist["body"],0,0));
			snake_sprite.bitmap1.alpha = 0;
			snake_sprite.addChild(snake_sprite.bitmap1);

			snake_sprite.bitmap2 = new LBitmap(new LBitmapData(imglist["body"],0,0));
			snake_sprite.bitmap2.alpha = 0;
			snake_sprite.addChild(snake_sprite.bitmap2);

			snake_sprite.bitmap3 = new LBitmap(new LBitmapData(imglist["body"],0,0));
			snake_sprite.bitmap3.alpha = 0;
			snake_sprite.addChild(snake_sprite.bitmap3);

			snake_sprite.bitmap4 = new LBitmap(new LBitmapData(imglist["body"],0,0));
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
		switch(Math.floor(Math.random()*1)+1){
			// 37 left - 38 up - 39 right - 40 down
			// case 1: //左出口
			// 	co = 39;
			// 	Snake.born("head",0,8*17,0);
			// 	Snake.born("body",-17,8*17,0);
			// 	Snake.born("tail",-17*2,8*17,0);
			// 	break;
			case 1: //上出口
				co = 40;
				Snake.born("head",19*17,0,90);
				Snake.born("body",19*17,-17,90);
				Snake.born("tail",19*17,-17*2,90);
				break;
			// case 2: //下出口
			// 	co = 38;
			// 	Snake.born("head",8*17,CANVAS_H-backLayer.y*2-17,-90);
			// 	Snake.born("body",8*17,CANVAS_H-backLayer.y*2,-90);
			// 	Snake.born("tail",8*17,CANVAS_H-backLayer.y*2+17,-90);
			// 	break;
			// case 2: //右出口
			// 	co = 37;
			// 	Snake.born("head",CANVAS_H-backLayer.y*2-17,8*17,-180);
			// 	Snake.born("body",CANVAS_H-backLayer.y*2,8*17,-180);
			// 	Snake.born("tail",CANVAS_H-backLayer.y*2+17,8*17,-180);
			// 	break;
		}
		
	},

	move: function(){ // 移动

		if(co == 37){
			// Snake.eat();
			for(var i=0; i<obstacles_arr.length; i++){
				if(snake_arr[0].x-17==obstacles_arr[i].x && snake_arr[0].y==obstacles_arr[i].y){
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
				if(snake_arr[0].y-17==obstacles_arr[i].y && snake_arr[0].x==obstacles_arr[i].x){
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
				if(snake_arr[0].x+17==obstacles_arr[i].x && snake_arr[0].y==obstacles_arr[i].y){
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
				if(snake_arr[0].y+17==obstacles_arr[i].y && snake_arr[0].x==obstacles_arr[i].x){
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
			
			if(snake_arr[0].x-17 < 0){
	    		snake_arr[0].x = CANVAS_W - backLayer.x*2;
	    	}
	    	// snake_arr[0].x -= snakeSpeed*LGlobal.deltaTime;
			snake_arr[0].x -= 17;

		}else if(co == 38){
			if(snake_arr[0].y-17 < 0){
	    		snake_arr[0].y = CANVAS_H - backLayer.y*2;
	    	}
			// snake_arr[0].y -= snakeSpeed*LGlobal.deltaTime;
			snake_arr[0].y -= 17;
		}else if(co == 39){
			if(snake_arr[0].x+17 >= CANVAS_W - backLayer.x*2){
	    		snake_arr[0].x = -17;
	    	}
			// snake_arr[0].x += snakeSpeed*LGlobal.deltaTime;
			snake_arr[0].x += 17;
		}else if(co == 40){
			if(snake_arr[0].y+17 >= CANVAS_H - backLayer.y*2){
	    		snake_arr[0].y = -17;
	    	}
			// snake_arr[0].y += snakeSpeed*LGlobal.deltaTime;
			snake_arr[0].y += 17;
		}

		

		// 蛇身体弯曲
		find_bending();	

		// 蛇是否晕了
		Snake.die();

		// 蛇吃东西
		// Snake.eat();

		// 更新总坐标数组
		updata_arr();

		// 操作参数更改
		is_click = true;
	},
	eat: function(){ // 吃东西
		// 判断蛇头是否跟苹果碰撞
		for(var j=0; j<apple_arr.length; j++){
				var point = (Math.floor(Math.random()*3)+1)*10;
				$("#totalScore").text(parseInt($("#totalScore").text())+point);
	
				// 更换蛇头的状态图片
				snake_arr[0].bitmap.alpha = 0;
				snake_arr[0].bitmap3.alpha = 1;

				// 显示分数图片
				// var point_img = new LSprite();
				// backLayer.addChild(point_img);
				// console.log(backLayer);
				// if(point == 10){
				// 	point_img.addChild(new LBitmap(new LBitmapData(imglist["score10"],0,0)));
				// }else if(point == 20){
				// 	point_img.addChild(new LBitmap(new LBitmapData(imglist["score20"],0,0)));
				// }else if(point == 30){
				// 	point_img.addChild(new LBitmap(new LBitmapData(imglist["score30"],0,0)));
				// }
				
				// point_img.x = apple_arr[j].x;
				// point_img.y = apple_arr[j].y;

				// backLayer.setChildIndex(point_img,backLayer.numChildren-1);
				// LTweenLite.to(point_img,.5,{
				// 	y: point_img.y-50,
				// 	alpha: 0,
				// 	onComplete: function(){
				// 		point_img.remove(); 
				// 	}
				// })
				

				// 生成新的身体
				var new_body = new LSprite();
				backLayer.addChild(new_body);
				var body_bitmap = new LBitmap(new LBitmapData(imglist["body"],0,0));
				new_body.bitmap = body_bitmap;
				
				new_body.bitmap.alpha = 0;
				// new_body.bitmap.rotate = snake_arr[0].bitmap.rotate;
				new_body.addChild(body_bitmap);

				// 身体弯曲部分图片
				new_body.bitmap1 = new LBitmap(new LBitmapData(imglist["body"],0,0));
				new_body.bitmap1.alpha = 0;
				new_body.addChild(new_body.bitmap1);

				new_body.bitmap2 = new LBitmap(new LBitmapData(imglist["body"],0,0));
				new_body.bitmap2.alpha = 0;
				new_body.addChild(new_body.bitmap2);

				new_body.bitmap3 = new LBitmap(new LBitmapData(imglist["body"],0,0));
				new_body.bitmap3.alpha = 0;
				new_body.addChild(new_body.bitmap3);

				new_body.bitmap4 = new LBitmap(new LBitmapData(imglist["body"],0,0));
				new_body.bitmap4.alpha = 0;
				new_body.addChild(new_body.bitmap4);


				if(snake_arr[snake_arr.length-1].bitmap.rotate==37){
					snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].x+17;
				}
				if(snake_arr[snake_arr.length-1].bitmap.rotate==38){
					snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].y+17;
				}
				if(snake_arr[snake_arr.length-1].bitmap.rotate==39){
					snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].x-17;
				}
				if(snake_arr[snake_arr.length-1].bitmap.rotate==40){
					snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].y-17;
				}

				new_body.x = snake_arr[snake_arr.length-1].x;
				new_body.y = snake_arr[snake_arr.length-1].y;
				new_body.bitmap.rotate = snake_arr[snake_arr.length-1].bitmap.rotate;
				// new_body.x = apple_arr[j].x;
				// new_body.y = apple_arr[j].y;
				// new_body.x = -CANVAS_W;
				// new_body.y = -CANVAS_H;
				
				
				// 插入蛇的数组
				snake_arr.splice(snake_arr.length-1,0,new_body);

				// 移除苹果
				apple_arr[j].remove();
				apple_arr.splice(j,1);

				break;
			
		}
		

	

		// 设置层级
		backLayer.setChildIndex(snake_arr[0],backLayer.numChildren-1);

		backLayer.setChildIndex(snake_arr[snake_arr.length-1],backLayer.numChildren-2);
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
		//撞到墙了
		for(var i=1; i<snake_arr.length; i++){
			if(snake_arr[0].x==623||snake_arr[0].x==0||snake_arr[0].y==0||snake_arr[0].y==629){
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



				// if($('.tanchuang')){
				// 	$('.callBack .tanchuangBtn').on('touchstart',function(){
				// 		$('.callBack').hide();
				// 		main();
				// 		move_start();
				// 		// 更新总坐标数组
				// 		updata_arr();


				// 	})
				// }
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
	 //backgroundMusic.pause();
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

				if(Math.abs(snake_arr[i].x - snake_arr[i+2].x) == 17 && Math.abs(snake_arr[i].y - snake_arr[i+2].y) == 17){
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
				if(Math.abs(snake_arr[i].x - snake_arr[i+2].x) != 17 || Math.abs(snake_arr[i].y - snake_arr[i+2].y) != 17){
					// 上下
					if(snake_arr[i].y + snake_arr[i+2].y + 17 == 560){
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
		// 绑定循环事件
		backLayer.addEventListener(LEvent.ENTER_FRAME,Snake.move);
		
		game_start = false;
	}
}



function addpush(){
	// 生成新的身体
	var new_body = new LSprite();
	backLayer.addChild(new_body);
	var body_bitmap = new LBitmap(new LBitmapData(imglist["body"],0,0));
	new_body.bitmap = body_bitmap;
	new_body.bitmap.alpha = 0;
	// new_body.bitmap.rotate = snake_arr[0].bitmap.rotate;
	new_body.addChild(body_bitmap);

	// 身体弯曲部分图片
	new_body.bitmap1 = new LBitmap(new LBitmapData(imglist["body"],0,0));
	new_body.bitmap1.alpha = 0;
	new_body.addChild(new_body.bitmap1);

	new_body.bitmap2 = new LBitmap(new LBitmapData(imglist["body"],0,0));
	new_body.bitmap2.alpha = 0;
	new_body.addChild(new_body.bitmap2);

	new_body.bitmap3 = new LBitmap(new LBitmapData(imglist["body"],0,0));
	new_body.bitmap3.alpha = 0;
	new_body.addChild(new_body.bitmap3);

	new_body.bitmap4 = new LBitmap(new LBitmapData(imglist["body"],0,0));
	new_body.bitmap4.alpha = 0;
	new_body.addChild(new_body.bitmap4);


	if(snake_arr[snake_arr.length-1].bitmap.rotate==37){
		snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].x+35;
	}
	if(snake_arr[snake_arr.length-1].bitmap.rotate==38){
		snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].y+35;
	}
	if(snake_arr[snake_arr.length-1].bitmap.rotate==39){
		snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].x-35;
	}
	if(snake_arr[snake_arr.length-1].bitmap.rotate==40){
		snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].y-35;
	}

	new_body.x = snake_arr[snake_arr.length-1].x;
	new_body.y = snake_arr[snake_arr.length-1].y;
	new_body.bitmap.rotate = snake_arr[snake_arr.length-1].bitmap.rotate;
	// new_body.x = apple_arr[j].x;
	// new_body.y = apple_arr[j].y;
	// new_body.x = -CANVAS_W;
	// new_body.y = -CANVAS_H;
	
	
	// 插入蛇的数组
	snake_arr.splice(snake_arr.length-1,0,new_body);
	return snake_arr;
}
//加入键盘事件，用方向键来控制蛇前进的方向 
// document.onkeydown = function(event){

// 	// 第一次开始移动蛇
// 	move_start();

// 	if(is_click){

// 		is_click = false;

// 		// 37 left - 38 up - 39 right - 40 down
// 	    co = event.keyCode>=37 && event.keyCode<=40 && (Math.abs(event.keyCode-co) != 2) ? event.keyCode : co;
	  
// 	}
 
// }

//方向改变 蛇增长

var num=0;
//手机滑屏事件
$('#gameGuide').on('touchend',function(){
	setTimeout(function(){
		move_start();
	}, 500);
	
	// Snake.eat();
})
// $("#game-box,#gameGuide").on("swipeLeft",function(){
// 	// 第一次开始移动蛇
// 	move_start();
// 	co = co!=39 ? 37 : co;
// 	hadTp-=oHeight;
// 	$('.tapImg div').animate({
// 		top:hadTp+'px'
// 	},500);
// 	console.log(hadTp)
// }).on("swipeRight",function(){
// 	// 第一次开始移动蛇
// 	move_start();
// 	Snake.eat();
// 	co = co!=37 ? 39 : co;
// }).on("swipeUp",function(){
// 	// 第一次开始移动蛇
// 	move_start();
// 	sum();
// 	co = co!=40 ? 38 : co;
// }).on("swipeDown",function(){
// 	// 第一次开始移动蛇
// 	move_start();
// 	co = co!=38 ? 40 : co;
// })
//全局方向对象
var dction= {
	left:false,
	top:false,
	right:false,
	bottom:false
}

//手机旋转事件
function sum() {
		// 生成新的身体
	var new_body = new LSprite();
	backLayer.addChild(new_body);
	var body_bitmap = new LBitmap(new LBitmapData(imglist["body"],0,0));
	new_body.bitmap = body_bitmap;
	
	new_body.bitmap.alpha = 0;
	// new_body.bitmap.rotate = snake_arr[0].bitmap.rotate;
	new_body.addChild(body_bitmap);
	
	new_body.bitmap1 = new LBitmap(new LBitmapData(imglist["body"],0,0));
	new_body.bitmap1.alpha = 0;
	new_body.addChild(new_body.bitmap1);

	new_body.bitmap2 = new LBitmap(new LBitmapData(imglist["body"],0,0));
	new_body.bitmap2.alpha = 0;
	new_body.addChild(new_body.bitmap2);

	new_body.bitmap3 = new LBitmap(new LBitmapData(imglist["body"],0,0));
	new_body.bitmap3.alpha = 0;
	new_body.addChild(new_body.bitmap3);

	new_body.bitmap4 = new LBitmap(new LBitmapData(imglist["body"],0,0));
	new_body.bitmap4.alpha = 0;
	new_body.addChild(new_body.bitmap4);


	if(snake_arr[snake_arr.length-1].bitmap.rotate==37){
		snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].x+17;
	}
	if(snake_arr[snake_arr.length-1].bitmap.rotate==38){
		snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].y+17;
	}
	if(snake_arr[snake_arr.length-1].bitmap.rotate==39){
		snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].x-17;
	}
	if(snake_arr[snake_arr.length-1].bitmap.rotate==40){
		snake_arr[snake_arr.length-1].x = snake_arr[snake_arr.length-1].y-17;
	}

	new_body.x = snake_arr[snake_arr.length-1].x;
	new_body.y = snake_arr[snake_arr.length-1].y;
	new_body.bitmap.rotate = snake_arr[snake_arr.length-1].bitmap.rotate;
	// new_body.x = apple_arr[j].x;
	// new_body.y = apple_arr[j].y;
	// new_body.x = -CANVAS_W;
	// new_body.y = -CANVAS_H;
	
	
	// 插入蛇的数组
	snake_arr.splice(snake_arr.length-1,0,new_body);
	return snake_arr;

			
}
var oHeight=$(window).height();
var hadTp=0;
window.addEventListener("deviceorientation",orientationHandler , false);
    function orientationHandler(e) { //改变蛇方向 
        var data=Math.round(e.alpha);
        var acv=0;
		// var top=0,left=0,right=0,bottom=0;

        if(data==90&&dction.left==false){
        	dction.left=true;
        	// move_start();
        	acv+=1;
        	sum();
			co = co!=39 ? 37 : co;
			hadTp-=oHeight;
			$('.tapImg div').animate({
				top:hadTp+'px'
			},500);
			dction.bottom=false;
			dction.right=false;
			dction.top==false;
        }else
        if(data==180&&dction.bottom==false){
        	acv+=1;
			dction.bottom=true;
			hadTp-=oHeight;
        	// move_start();
        	sum();
        	$('.tapImg div').animate({
				top:hadTp+'px'
			},500);
			co = co!=37 ? 39 : co;
			dction.right=false;
			dction.left=false;
			dction.top==false;
        }else
        if(data==270&&dction.right==false){
        	acv+=1;
			dction.right=true;
			// move_start();
       		sum();
			hadTp-=oHeight;
			$('.tapImg div').animate({
				top:hadTp+'px'
			},500);
        	co = co!=40 ? 38 : co;
			dction.bottom=false;
			dction.left=false;
			dction.top==false;
        }else
        if(data==360&&dction.top==false){
        	acv+=1;
			dction.top=true;
        	// move_start();
       		sum();
			hadTp-=oHeight;
			$('.tapImg div').animate({
				top:hadTp+'px'
			},500);
			co = co!=38 ? 40 : co;
			dction.bottom=false;
			dction.left=false;
			dction.right==false;
		}

		  
		   
    	document.querySelector('.asd').innerHTML=data;
    } 

