var messageField = null;
var options =
{
	'drawMethod': null,
	'model': null
};

function addMessage(message)
{
	var st = "-"+message + "\n";
	messageField.value += st;
}

function menuHandler()
{
	var m = document.getElementById("menu");
	var id = m.selectedIndex;
	addMessage(m.options[id].text);
	var toRender = m.options[id].text;
	if (toRender === 'cube')
	{
		options.model = cubeObject;
	}
	else if (toRender === 'teapot')
	{
		options.model = teapotObject;	
	}
	else if (toRender === 'skull')
	{	
		options.model = skullObject;
	}

	// Calls the scale function to identify the model.
	setScale(toRender);
	drawSelectedObject();
}

function toggleLightingFlag(obj)
{
	addMessage(obj.value+" Flag Toggled");
}

function setRenderMode(obj)
{
	addMessage("setRenderMode entered with value: "+obj.value);
	if(obj.value === 'wireframe')
	{
		options.drawMethod = 'wireframe';
	}
	else
	{
		options.drawMethod = 'solid';
	}

	drawSelectedObject();
}

function loadFile(files)
{
	addMessage("File name: "+files[0].name);
}

function init()
{
	options.drawMethod = 'solid';
	options.model = cubeObject;

	function setupMessageArea() 
	{
		messageField = document.getElementById("messageArea");
		document.getElementById("messageClear").setAttribute("onclick","messageField.value='';");
	}

	function setupMenu()
	{
		var menuItemList = ["cube", "teapot", "skull"]; // Some list. May be list of objects to render.
		var m = document.getElementById("menu");
		var option;
		for (var i=0; i<menuItemList.length;i++)
		{
			option=document.createElement("option");
			option.text = menuItemList[i];
			m.add(option);
		}
	}
	setupMessageArea();
	setupMenu();
	
	function canvasMouseHandler(ev)
	{
		var b = ev.target.getBoundingClientRect();
		addMessage("button: "+ev.button+" event type: "+ev.type+" "+"("+ev.clientX+","+ev.clientY+")"+" of bounding box "+
			"[("+b.top+","+b.left+")"+"("+b.bottom+","+b.right+")]");
		if (ev.ctrlKey)
		{
			addMessage("CTRL key was down");
		}
		if (ev.shiftKey)
		{
			addMessage("SHIFT key was down");
		}
		if (ev.altKey)
		{
			addMessage("ALT key was down");
		}
	}
	//canvas.onmousedown=canvasMouseHandler;
	//canvas.onmouseup=canvasMouseHandler;
	//canvas.onclick=canvasMouseHandler;
}