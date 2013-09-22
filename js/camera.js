// Compute a camera from model's bounding box dimensions
function Camera(gl, d, modelUp) 
{
	var center = [(d.min[0]+d.max[0])/2,(d.min[1]+d.max[1])/2,(d.min[2]+d.max[2])/2];
	var diagonal = Math.sqrt(Math.pow((d.max[0]-d.min[0]),2)+Math.pow((d.max[1]-d.min[1]),2)+Math.pow((d.max[2]-d.min[2]),2));
		
	var name = "auto";
	var at = center;
	var eye = [center[0], center[1]+diagonal*0.5, center[2]+diagonal*1.5];
	var up = [modelUp[0],modelUp[1],modelUp[2]];
	var near = diagonal*0.1;
	var far = diagonal*50; // was 3, move clipping plane back 
	var FOV = 32;

	// move[angle, height, distance]
	// angle used to rotate around the object horizontally
	// height used to move camera up/down
	// distance used to move camera back/forward
	this.getRotatedCameraPosition= function(move)
	{
		var m = new Matrix4().setTranslate(at[0],at[1],at[2]).rotate(move[0],up[0],up[1],up[2]).translate(-at[0],-at[1],-at[2]);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1]+move[2],eye[2]+move[1],1])).elements;
		return [e[0],e[1],e[2]]; 
	};
	
	// View Matrix
	this.getViewMatrix = function(e)
	{
		if (e==undefined) e = eye;
		return new Matrix4().setLookAt(e[0],e[1],e[2],at[0],at[1],at[2],up[0],up[1],up[2]);
	}

	// Moves the camera using move array, and generates view matrix from camera matrix
	this.getRotatedViewMatrix=function(move)
	{
		return this.getViewMatrix(this.getRotatedCameraPosition(move));
	}

	// Standard projection matrix, not dynamic
	this.getProjMatrix=function()
	{
		return new Matrix4().setPerspective(FOV, gl.canvas.width / gl.canvas.height, near , far);
	};
	
}