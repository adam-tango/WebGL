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
	this.getLookAtPoint = function() {
		return [at[0], at[1], at[2]];
	}
	
	// Calculate adjusted u,v,w axis in world space
	this.uAxis = function() {
		return cross(up, this.wAxis());	
	};
	this.vAxis = function() {
		return cross(this.wAxis(), this.uAxis());
	};
	this.wAxis = function() {
		return normalize(subtractVectors(eye, at));	
	};
	
	
	// PAN: rotate camera around Y-axis (V-axis) - left, right
	this.pan = function(direction){
		var angle = (direction)?rotationAngle:rotationAngle*-1;	
		var V = this.vAxis();
		var m = new Matrix4().setTranslate(at[0],at[1],at[2]).rotate(-angle,V[0],V[1],V[2]);
		m.translate(-at[0],-at[1],-at[2]);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;		
		eye[0]=e[0]; eye[1]=e[1]; eye[2]=e[2];
	};

	// TILT: Rotate around x-axis (U-axis) - up,down
	this.tilt = function(direction) { 
		var angle = (direction)?rotationAngle:rotationAngle*-1;	
		var step = eye[2];
		var U = this.uAxis();
		var m = new Matrix4().setTranslate(at[0],at[1],at[2]).rotate(-angle,U[0],U[1],U[2]).translate(-at[0],-at[1],-at[2]);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		step = Math.abs(step - e[2]);
		if(e[2] > step || e[2] < step*-1) { // prevent crossing up vector (flipping over)
			eye[0]=e[0]; eye[1]=e[1]; eye[2]=e[2];
		}
	};
	
	// ZOOM: in and out
	this.zoom = function(direction) {
		FOV = (direction)?FOV-1:FOV+1;	
		// Prevent null frustrum & large FOV causing model to flip vertically
		if(FOV==0) FOV++; 
		if(FOV==180) FOV--;
	};

	// DOLLY: Move camera closer or farther back (W axis)
	this.dolly = function(direction) { 
		var d = (direction)?delta:delta*-1;
		var W = this.wAxis();
		var m = new Matrix4().setTranslate(W[0]*-d, W[1]*-d, W[2]*-d);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		eye[0]=e[0]; eye[1]=e[1]; eye[2]=e[2];
		var d = new Matrix4().setTranslate(W[0]*-d, W[1]*-d, W[2]*-d);
		var a = d.multiplyVector4(new Vector4([at[0],at[1],at[2],1])).elements;
		at[0]=a[0]; at[1]=a[1]; at[2]=a[2];
	};
	
	// PEDESTAL: Move camera up or down (V axis)
	this.pedestal = function(direction) { 
		var d = (direction)?delta:delta*-1;
		var V = this.vAxis();
		var m = new Matrix4().setTranslate(V[0]*d, V[1]*d, V[2]*d);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		eye[0]=e[0]; eye[1]=e[1]; eye[2]=e[2];
		var d = new Matrix4().setTranslate(V[0]*d, V[1]*d, V[2]*d);
		var a = d.multiplyVector4(new Vector4([at[0],at[1],at[2],1])).elements;
		at[0]=a[0]; at[1]=a[1]; at[2]=a[2];
	};
	
	// TRUCK: Move camera left or right  (U axis)
	this.truck = function(direction) { 
		var d = (direction)?delta:delta*-1;
		var U = this.uAxis();
		var m = new Matrix4().setTranslate(U[0]*-d, U[1]*-d, U[1]*-d);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		eye[0]=e[0]; eye[1]=e[1]; eye[2]=e[2];
		
		var d = new Matrix4().setTranslate(U[0]*-d, U[1]*-d, U[1]*-d);
		var a = d.multiplyVector4(new Vector4([at[0],at[1],at[2],1])).elements;
		at[0]=a[0]; at[1]=a[1]; at[2]=a[2];
	};
}

// vector math functions
function normalize(v) {
  var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // make sure we don't divide by 0.
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1],
          a[2] * b[0] - a[0] * b[2],
          a[0] * b[1] - a[1] * b[0]];
}

function subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
