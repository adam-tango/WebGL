// KEY CODES
var ROTATE_UP = 101; 	// e
var ROTATE_DOWN = 100; // d
var ROTATE_LEFT = 115; // s
var ROTATE_RIGHT = 102; // f

var ZOOM_IN = 61; // +/=
var ZOOM_OUT = 45; // -/_

var MOVE_UP = 38; // up arrow
var MOVE_DOWN = 40; // down arrow
var MOVE_LEFT = 37; // left arrow
var MOVE_RIGHT = 39; // right arrow
var MOVE_IN = 13; // enter
var MOVE_OUT = 8; // backspace

// Handle user input
document.onkeypress=function(e) {	

	var code = (e.keyCode ? e.keyCode : e.which);

	switch(code) 
	{	
		case ROTATE_UP:
		camera.tilt(1);
		break;
		
		case ROTATE_DOWN:
		camera.tilt(0);
		break;
		
		case ROTATE_LEFT:
		camera.pan(1);
		break;
		
		case ROTATE_RIGHT:
		camera.pan(0);
		break;

		case ZOOM_IN:
		camera.zoom(1);
		break;
		
		case ZOOM_OUT:
		camera.zoom(0);
		break;
		
		case MOVE_UP:
		camera.pedestal(1);
		break;
		
		case MOVE_DOWN:
		camera.pedestal(0);
		break;
		
		case MOVE_LEFT:
		camera.truck(1);
		break;
		
		case MOVE_RIGHT:
		camera.truck(0);
		break;
		
		case MOVE_IN:
		camera.dolly(1);
		break;
		
		case MOVE_OUT:
		camera.dolly(0);
		break;
	}

	e.stopPropagation();
};
