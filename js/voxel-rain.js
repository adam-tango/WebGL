/*** vvv not important/ needs work vvv ***/
var ANGLE_STEP = 20.0; // rotate 20 degrees per second
var DISTANCE_STEP = 20.0;
var HEIGHT_STEP = 20.0;
var ANGLE_MAX = 360; // rotate 20 degrees per second
var DISTANCE_MAX = 200;
var HEIGHT_MAX = 200;
var DIRECTION = [1,1]; // used to tell if height or distance are inc/dec
/*** ^^^ not important/needs work ^^^ ***/

function main()
{
	// Get canvas and setup GL System
	var canvas = document.getElementById("webgl");
	var gl = getWebGLContext(canvas);	
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST); 
	
	// Pick current object
	var selector = new ObjectSelector(gl);
	selector.switchTo("SKULL");
	var model = selector.getCurrentObject();
	
	// set up camera
	var camera = new Camera(gl, model.getBounds(),[0,1,0]);
	
	// set movement proportional
	/*** REDACTED, MAY NOT BE NECCESSARY ***/
	
	// animation
	var cameraPosition = [0.0,0.0,0.0]; // start angle, distance, height
	var tick = function() 
	{
		// clear canvas and depth buffers
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		cameraPosition = animate(cameraPosition); // update camera angle
		var viewMatrix = camera.getRotatedViewMatrix(cameraPosition);
		var projMatrix = camera.getProjMatrix();
		model.draw(projMatrix, viewMatrix);
		requestAnimationFrame(tick); // tell browser to call tick
	};
	tick();
}

// Calc new camera position
var g_last = Date.now();
function animate(changes) 
{
	var now = Date.now();
	var elapsed = now - g_last; // milliseconds
	g_last = now;
	
	// angle
	var newAngle = (changes[0] + ANGLE_STEP * elapsed / 1000.0) % ANGLE_MAX;	
	
	// get newDistance and height ****
	var newDistance = 5;
	var newHeight = 5;
	// ^^^ These are place holders for code I REDACTED, I or someone else 
	// needs to modify, or approach problem differently
	
	return [newAngle, newDistance, newHeight];
}