/*
* 小型游戏引擎
*/

// requestAnimationFrame
if (!Date.now)
  Date.now = function() { return new Date().getTime(); };
(function() {
  'use strict';
  let vendors = ['webkit', 'moz'];
  for (let i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    let vp = vendors[i];
    window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
    window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame'] || window[vp+'CancelRequestAnimationFrame']);
  }
  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
    || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    let lastTime = 0;
    window.requestAnimationFrame = function(callback) {
      let now = Date.now();
      let nextTime = Math.max(lastTime + 16, now);
      return setTimeout(function() { callback(lastTime = nextTime); },
        nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
}());

function Game(id,params){
  let that = this;
  let settings = {
    width:960,						//画布宽度
    height:640						//画布高度
  };
  Object.assign(that,settings,params);
  let $canvas = document.getElementById(id);
  let context = $canvas.getContext('2d'); //画布上下文
  let stages = [];           //布景对象队列
  let events = [];          //事件集合
  let index;                //当前布景索引
  let handle;               //帧动画控制
  //初始化游戏引擎
  this.init = function(){
    index = 0;
    // this.start();
  };
  //动画开始
  this.start = function () {
    let f = 0;		//帧数计算
    let fn = function() {
      // let stage = stages[index];
      context.clearRect(0, 0, that.width, that.height);		//清除画布
      context.fillStyle = '#000';
      context.fillRect(0, 0, that.width, that.height);
      f++;
      // console.log(f)
      // if (stages[index].timeout) {
      //   stages[index].timeout--;
      // }


      stages[index].items.forEach(function (item) {
        if (!(f % item.frames)) {
          item.times = f / item.frames;		   //计数器
        }

        // item.times++;
        // $canvas.clear(that.context);
        // console.log(item,item.times)
        // if(item.times % item.frames === 0)
        item.draw(context);
        // else that.start()
      });
      requestAnimationFrame(fn);
    }
    requestAnimationFrame(fn);
  };
  this.stop = function () {
    handler && clearInterval(handler);
  }
  //活动对象构造
  let Item = function(params){
    this.id = 0;               //在布景中的索引值
    this.stage = null;         //与所属布景绑定
    let settings = {
      x:0,					//位置坐标:横坐标
      y:0,					//位置坐标:纵坐标
      width:20,				//宽
      height:20,				//高
      type:0,					//对象类型,0表示普通对象(不与地图绑定),1表示玩家控制对象,2表示程序控制对象
      color:'#F00',			//标识颜色
      status:1,				//对象状态,0表示未激活/结束,1表示正常,2表示暂停,3表示临时,4表示异常
      orientation:0,			//当前定位方向,0表示右,1表示下,2表示左,3表示上
      speed:0,				//移动速度
      //地图相关
      location:null,			//定位地图,Map对象
      coord:null,				//如果对象与地图绑定,需设置地图坐标;若不绑定,则设置位置坐标
      path:[],				//NPC自动行走的路径
      vector:null,			//目标坐标
      //布局相关
      frames:1,				//速度等级,内部计算器times多少帧变化一次
      times:0,				//刷新画布计数(用于循环动画状态判断)
      timeout:0,				//倒计时(用于过程动画状态判断)
      control:{},				//控制缓存,到达定位点时处理
      update:function(){}, 	//更新参数信息
      draw:function(){}		//绘制
    };
    Object.assign(this,settings,params);
  };
  //布景对象构造器
  let Stage = function(params){
    let settings = {
      index:0,                        //布景索引
      status:0,						//布景状态,0表示未激活/结束,1表示正常,2表示暂停,3表示临时状态
      maps:[],						//地图队列
      audio:[],						//音频资源
      images:[],						//图片资源
      items:[],						//对象队列
      timeout:0,						//倒计时(用于过程动画状态判断)
      update:function(){}				//嗅探,处理布局下不同对象的相对关系
    };
    Object.assign(this,settings,params);
  };
  //创建布景
  this.createStage = function(options){
    let stage = new Stage(options);
    stage.index = stages.length;
    stages.push(stage);
    return stage;
  };
  Stage.prototype.createItem = function (params) {
    let item = new Item(params);
    item.stage = this;
    item.id = this.items.length;
    this.items.push(item);
    return item;
  };

}

export default Game
