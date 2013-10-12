function Camera(gl,d,modelUp) // Compute a camera from model's bounding box dimensions
{
	var center = [(d.min[0]+d.max[0])/2,(d.min[1]+d.max[1])/2,(d.min[2]+d.max[2])/2];
	var diagonal = Math.sqrt(Math.pow((d.max[0]-d.min[0]),2)+Math.pow((d.max[1]-d.min[1]),2)+Math.pow((d.max[2]-d.min[2]),2));
	
	var name = "auto";
	var at = center;
	var eye = [center[0], center[1]+diagonal*0.5, center[2]+diagonal*1.5];
	var up = [modelUp[0],modelUp[1],modelUp[2]];
	var near = diagonal*0.1;
	var far = diagonal*3;
	var FOV = 32;
	
	var delta = diagonal * 0.01; // movement step length
	var rotationAngle = 3; 		 // rotation step angle (degrees)
	
	// update matrices for draw()
	this.getViewMatrix=function(e){
		if (e==undefined) e = eye;
		return new Matrix4().setLookAt(e[0],e[1],e[2],at[0],at[1],at[2],up[0],up[1],up[2]);
	};
	this.getProjMatrix=function(){
		return new Matrix4().setPerspective(FOV, gl.canvas.width / gl.canvas.height, near , far);
	};
	this.getCameraPosition=function(){
		return [eye[0], eye[1], eye[2]];
	};
	
	/*
		ROTATIONS AND SHIFTS ASSUME UP VECTOR IS POSITIVE Y AXIS
	*/
	// PAN: rotate camera around up-axis (V-axis) - left, right
	this.pan = function(direction){
		var angle = (direction)?rotationAngle:rotationAngle*-1;	
		var m = new Matrix4().setTranslate(at[0],at[1],at[2]).rotate(-angle,up[0],up[1],up[2]);
		m.translate(-at[0],-at[1],-at[2]);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;		
		eye[0]=e[0]; eye[1]=e[1]; eye[2]=e[2];
	};

	// TILT: Rotate around x-axis (U-axis) - up,down
	this.tilt = function(direction) { 
		var angle = (direction)?rotationAngle:rotationAngle*-1;	
		var step = eye[2];
		var m = new Matrix4().setTranslate(at[0],at[1],at[2]).rotate(-angle,1,0,0).translate(-at[0],-at[1],-at[2])
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		step = Math.abs(step - e[2]);
		if(e[2] > step || e[2] < step*-1) { // prevent crossing up vector
			eye[0]=e[0]; eye[1]=e[1]; eye[2]=e[2];
		}
	};
	
	// ZOOM: in and out
	this.zoom = function(direction) {
		FOV = (direction)?FOV-1:FOV+1;	
		// Prevent null frustrum or FOV causing model to flip vertically
		if(FOV==0) FOV++; 
		if(FOV==180) FOV--;
	};

	// DOLLY: Move camera closer or farther back
	this.dolly = function(direction) { 
		var d = (direction)?delta:delta*-1;
	
		var m = new Matrix4().setTranslate(0, 0, -d);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		eye[0]=e[0]; eye[1]=e[1]; eye[2]=e[2];
		
		var d = new Matrix4().setTranslate(0, 0, -d);
		var a = d.multiplyVector4(new Vector4([at[0],at[1],at[2],1])).elements;
		at[0]=a[0]; at[1]=a[1]; at[2]=a[2];
	};
	
	// PEDESTAL: Move camera up or down
	this.pedestal = function(direction) { 
		var d = (direction)?delta:delta*-1;
	
		var m = new Matrix4().setTranslate(up[0]*d, up[1]*d, up[2]*d);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		eye[0]=e[0]; eye[1]=e[1]; eye[2]=e[2];
		
		var d = new Matrix4().setTranslate(up[0]*d, up[1]*d, up[2]*d);
		var a = d.multiplyVector4(new Vector4([at[0],at[1],at[2],1])).elements;
		at[0]=a[0]; at[1]=a[1]; at[2]=a[2];
	};
	
	// TRUCK: Move camera left or right  
	this.truck = function(direction) { 
		var d = (direction)?delta:delta*-1;
	
		var m = new Matrix4().setTranslate(-d, 0, 0);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		eye[0]=e[0]; eye[1]=e[1]; eye[2]=e[2];
		
		var d = new Matrix4().setTranslate(-d, 0, 0);
		var a = d.multiplyVector4(new Vector4([at[0],at[1],at[2],1])).elements;
		at[0]=a[0]; at[1]=a[1]; at[2]=a[2];
	};
}