//Function should be self explanatory, but I'll describe here anyways.
//Scale is the scale of the whole thing.  By default the 0,0 cube will be 10 away from 10,10.
//It should return based on time the position of each cube.  Note that the returned parameter
//is 

function ObjectPositionManager() 
{
	var SCALE = 1;
	var SPAWNHEIGHT = 10;
	var FALLSPEED = .001;
	var SPAWNRATE = .01;
	
	
	var spawntimer = 30;
	var mObjects = new Array();
	var mStackHeight = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0]
	];

	
	
	//Moves each object down and brings it to the front.
	var lastTime = new Date().getTime();
	this.tick() = function()
	{
		var timeNow = new Date().getTime();
		var timeElapsed = timeNow - lastTime;
		
		//move each falling object down and bring it to rest if it needs to be.
		for (var i = 0; i < mObjects.length; i++) {
			mObjects[i].z -= mObjects[i].FallSpeed * timeElapsed ;
			if mObjects[i].z / SCALE < mStackHeight[Math.floor(mObjects[i].x/SCALE)][Math.floor(mObjects[i]/SCALE.y)] {
				mObjects[i].FallSpeed = 0;
				mStackHeight[Math.floor(mObjects[i].x/SCALE)][Math.floor(mObjects[i]/SCALE.y)] ++;
			}
		}
		
		//spawn new object if we need to.
		spawntimer -= SPAWNRATE*timeElapsed;
		if spawntimer < 0{
			spawnFallingObject();
			spawntimer = 30;
		}
		
		//Debug prints mObjects
		for (var i = 0; i < mObjects.length; i++) {
			
		}
		
		requestAnimationFrame(tick, canvas);
	}
	
	this.getObjectList() = function()
	{
		return mObjects;
	}
	
	this.spawnFallingObject() = function()
		{
			//The location the object will fall onto.
			var newx = Math.floor(Math.random() * 11);
			var newy = Math.floor(Math.random() * 11);
			mObjects[mObjects.length] = new ObjPosition(newx*SCALE, newy*SCALE, SPAWNHEIGHT, FALLSPEED);
		}
}



function ObjPosition(ix,iy,iz,f)
{
	var x = ix;
	var y = iy;
	var z = iz;
	var FallSpeed = f;
}

function main()
{
	var man = new ObjectPositionManager();
	man.tick();
}