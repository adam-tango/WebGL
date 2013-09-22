// ObjectSelector manages the current object type: skull, teapot, cube
function ObjectSelector(gl) {

	var mCurrentObject = new RenderableModel(gl, cubeObject); // default to cube
		
	// Change current object
	// @param obj String denoting the object to change too
	this.switchTo = function(obj) 
	{
		if(obj == "SKULL") {
			mCurrentObject = new RenderableModel(gl, skullObject);
		}
		else if(obj == "TEAPOT") {
			mCurrentObject = new RenderableModel(gl, teapotObject);
		}
		else {
			mCurrentObject = new RenderableModel(gl, cubeObject);
		}
	};
	
	// Get current object
	// @return the renderableModel of the current object
	this.getCurrentObject = function() {
		return mCurrentObject;	
	};
}