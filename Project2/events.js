// KEY CODES
var ROTATE_UP = 105; 	// i
var ROTATE_DOWN = 107; // k
var ROTATE_LEFT = 106; // j
var ROTATE_RIGHT = 108; // l

var ZOOM_IN = 61; // +/=
var ZOOM_OUT = 45; // -/_

var MOVE_UP = 101; // e
var MOVE_DOWN = 113; // q
var MOVE_LEFT = 97; // a
var MOVE_RIGHT = 100; // d
var MOVE_IN = 119; // w
var MOVE_OUT = 115; // s

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
