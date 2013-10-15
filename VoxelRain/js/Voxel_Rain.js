var gl;
var program;

var scale = 1;

var perspectiveMatrix;
var myMatrix;
var MatrixStack = [];
var canvas;

function start()
{
  console.log('onload happened');
  
  init();

  canvas = document.getElementById('mainCanvas');

  addMessage(((canvas)?'Canvas acquired':'Error: Can not acquire canvas'));

  canvas.width = window.innerWidth*0.8;
  canvas.height = window.innerHeight*0.8;

  initGL(canvas);

  drawSelectedObject(true);
  drawSelectedObject(false);
}

function clearCanvas()
{
  initGL(canvas);
}

/*
  Scales the translations for the different models so they rain correctly.
*/
function setScale(toRender)
{
  addMessage(toRender);
  if(toRender == 'cube')
  {
    scale = 1;
  }
  else if(toRender == 'teapot')
  {
    scale = 40;
  }
  else
  {
    scale = 250;
  }
}

function drawSelectedObject(clear)
{
  console.log('drawSelectedObject');
  if(clear)
  {
      clearCanvas();
  }
  var angle = 0;
  var model;
  if (options.drawMethod === 'wireframe')
  {
    model = new ModelRenderer(options.model, gl.LINE_LOOP);
  }
  else if (options.drawMethod === 'solid')
  {
    model = new ModelRenderer(options.model, gl.TRIANGLES);
  }
  
  addMessage(((model)?'Model created successfully...probably':'Model creation failed!'))
  console.debug(model);

  /* 
	Height   (ex: 16 = 16 cubes high)
	Width
	Depth
  */
  
  var N = [8,4,4];
  var numObjects = N[0]*N[1]*N[2];

  var modelBounds = model.getBounds();
  console.log(modelBounds);

  var delta = Math.max(
      modelBounds.max[0]-modelBounds.min[0],
      modelBounds.max[1]-modelBounds.min[1],
      modelBounds.max[2]-modelBounds.min[2]
    );

  var center = 
  [
    0.5*(modelBounds.max[0]+modelBounds.min[0]),
    0.5*(modelBounds.max[1]+modelBounds.min[1]),
    0.5*(modelBounds.max[2]+modelBounds.min[2])
  ];

  var sceneBounds={};
  
  sceneBounds.min = [modelBounds.min[0],modelBounds.min[1],modelBounds.min[2]]; // clone
  sceneBounds.max = 
  [
    modelBounds.min[0]+N[0]*delta,
    modelBounds.min[1]+N[1]*delta,
    modelBounds.min[2]+N[2]*delta
  ];
  
 

  var camera = new Camera(sceneBounds,[0,1,0]);
  console.log(camera);
  var projMatrix = camera.getProjMatrix();

  /* Create the array that randomly assigns a starting height for the objects.
	 The value will be a number between 20 and 190.
	 The objects will not fall through each other.
  */
  var t = 0;
  var temp = 0;
  var rain = new Array(numObjects);
  
  for (var z=0; z<N[1]*N[2]; z++)
    {
		for (var y=1; y<N[0]+1; y++)
		{
			rain[t] = 20*scale + (Math.floor(Math.random()*75*scale));
			if (temp >= rain[t]){
				rain[t] = rain[t] + temp;
			}

			temp = rain[t];
			t++;
		}
		temp = 0;
	}


  /**
   * This is where the magic happens!
   * Uncomment the modelMatrix.rotate line to cause the items to rotate
   */

  function draw()
  {
	  var t = 0
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    var viewMatrix = camera.getRotatedViewMatrix(angle);
    var modelMatrix = new Matrix4();

    for (var z=0; z<N[2]; z++)
    {	
      for (var y=0; y<N[1]; y++)
      {
        for (var x=0; x<N[0]; x++)
        {
			    // Swapped x and y. Needed this to make sure the objects fell vertically.
		      modelMatrix.setTranslate(y*delta, x*delta, z*delta);
          modelMatrix.translate(center[0], rain[t], center[2]);
          //modelMatrix.rotate(angle*(x+y+z),0,1,1)
          //modelMatrix.translate(-center[0],-center[1],-center[2]);
          model.draw(projMatrix, viewMatrix, modelMatrix);
		      t++;
        }
      }
    }

    //projMatrix = camera.getProjMatrix();
    //model.draw(projMatrix, viewMatrix);
    angle++;
    if (angle > 360)
    {
      angle -= 360;
    }
  	/*
  		Translate the objects. They drop slower once they get below 0.1. 
  		This was done to make sure they would appear to be sitting flush to one another.
  		Otherwise there would be visible gaps.
  		This is caused by the delta value being a float value.
  	*/
  	for(var i = 0; i < numObjects; i++)
    {
  		if((rain[i]-0.1) > 0)
      {
  			rain[i] -= 0.1 * scale;
  		}
  		else if (rain[i] > 0 && (rain[i]-0.001 > 0))
      {
  			rain[i] -= 0.001 * scale;
  		}
  	}
	
    window.requestAnimationFrame(draw);
	}

  draw();
}

function ModelRenderer(modelMesh, method)
{
  function Drawable(vertexArrays, numVertices, drawMethod, indexArray)
  {
    var vertexBuffers=[];
    var numElements = [];
    var attributesEnabled=[];
    var numAttributes = vertexArrays.length;

    for (var i=0; i<numAttributes; i++)
    {
      if (vertexArrays[i])
      {
        vertexBuffers[i] = gl.createBuffer();
        if(!vertexBuffers[i])
        {
          addMessage('Failed to create buffer object from vertexArrays['+i+']!');
          return null;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArrays[i]), gl.STATIC_DRAW);
        numElements[i] = vertexArrays[i].length/numVertices;
      }
      else
      {
        vertexBuffers[i] = null;
        attributesEnabled[i] = true;
      }
    }

    var indexBuffer = null;

    if(indexArray)
    {
      indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
    }

    this.draw = function(attributeLocations)
    {
      for (var i=0; i<numAttributes; i++)
      {
        if (vertexBuffers[i])
        {
          if (!attributesEnabled[i])
          {
            gl.enableVertexAttribArray(attributeLocations[i]);
            attributesEnabled[i] = true;
          }

          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
          gl.vertexAttribPointer(attributeLocations[i], numElements[i], gl.FLOAT, false, 0, 0);
        }
        else
        {
          if (attributesEnabled[i])
          {
            gl.disableVertexAttribArray(attributeLocations[i]);
            attributeLocations[i] = false;
          }
        }
      }

      if (indexBuffer)
      {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(drawMethod, indexArray.length, gl.UNSIGNED_SHORT, 0);
      }
      else
      {
        gl.drawArrays(drawMethod, 0, numVertices);
      }
    }
  }

  var program = createRenderProgram(shaders.fragmentShader, shaders.vertexShader);

  var hasNodes = false;

  if (modelMesh.nodes) 
  {
    hasNodes = true;
  }
  console.log('hasNodes: ' + hasNodes);
  var attribPosition = gl.getAttribLocation(program, 'position');
  var attribColor = gl.getAttribLocation(program, 'color');
  var attribLocations = [attribPosition, attribColor];

  var vmLocation = gl.getUniformLocation(program, 'viewT');
  var mmLocation = gl.getUniformLocation(program, 'modelT');
  var pmLocation = gl.getUniformLocation(program, 'projT');

  var drawables = [];
  var modelMeshTransformations = [];
  var numDrawables = 0;
  var numNodes;
  if (hasNodes) 
  {
    numNodes = modelMesh.nodes.length;
  }
  else
  {
    numNodes = 1;
  }

  for (var i=0; i<numNodes; i++)
  {
    console.debug(modelMesh.meshes.length);
    console.debug(modelMesh);
    var numMeshes;
    if (hasNodes)
    {
      console.debug(modelMesh.nodes[i].meshIndices);
      numMeshes = modelMesh.nodes[i].meshIndices.length;
    }
    else
    {
      numMeshes = modelMesh.meshes.length;
    }

    for (var j=0; j<numMeshes; j++)
    {
      var index = (hasNodes)?modelMesh.nodes[i].meshIndices[j]:j;

      var mesh = modelMesh.meshes[index];

      drawables[numDrawables] = new Drawable([mesh.vertexPositions, mesh.vertexColors], mesh.vertexPositions.length/3, method, mesh.indices);

      var Mat = new Matrix4();

      if (hasNodes) 
      {
        Mat.elements = new Float32Array(modelMesh.nodes[i].modelMatrix);
      }

      modelMeshTransformations[numDrawables] = Mat;

      numDrawables++;
    }
  }

  this.getBounds = function()
  {
    var numNodes = (modelMesh.nodes)?modelMesh.nodes.length:1;
    var xMin, xMax, yMin, yMax, zMin, zMax;
    var firstVertex = true;
    console.log('getBounds');
    console.log('hasNodes: ' + hasNodes);
    for (var q=0; q<numNodes; q++)
    {
      var m = new Matrix4();

      if (hasNodes) 
      {
        m.elements = new Float32Array(modelMesh.nodes[q].modelMatrix);
      }

      var numMeshes = (hasNodes)?modelMesh.nodes[q].meshIndices.length:modelMesh.meshes.length;

      for(var w=0; w<numMeshes; w++)
      {
        var index = (hasNodes)?modelMesh.nodes[q].meshIndices[w]:w;
        var mesh = modelMesh.meshes[index];

        for (var i=0; i<mesh.vertexPositions.length; i+=3)
        {
          var vertex = m.multiplyVector4(new Vector4([mesh.vertexPositions[i], mesh.vertexPositions[i+1], mesh.vertexPositions[i+2], 1])).elements;

          if (firstVertex)
          {
            xMin = xMax = vertex[0];
            yMin = yMax = vertex[1];
            zMin = zMax = vertex[2];
            firstVertex = false;
          }
          else
          {
            if (vertex[0] < xMin)
            {
              xMin = vertex[0];
            }
            else if (vertex[0] > xMax)
            {
              xMax = vertex[0];
            }

            if (vertex[1] < yMin)
            {
              yMin = vertex[1];
            }
            else if (vertex[1] > yMax)
            {
              yMax = vertex[1];
            }

            if (vertex[2] < zMin)
            {
              zMin = vertex[2];
            }
            else if (vertex[2] > zMax)
            {
              zMax = vertex[2];
            }
          }
        }
      }
    }
    var retVal = {"min":[xMin, yMin, zMin], "max":[xMax, yMax, zMax]};
    return retVal; 
  }

  this.draw = function(perMatrix, verMatrix, modMatrix)
  {
    gl.useProgram(program);

    gl.uniformMatrix4fv(pmLocation, false, perMatrix.elements);
    gl.uniformMatrix4fv(vmLocation, false, verMatrix.elements);

    for (var i=0; i<numDrawables; i++)
    {
      //var mMatrix = modelMeshTransformations[i];
      //gl.uniformMatrix4fv(mmLocation, false, mMatrix.elements);
      gl.uniformMatrix4fv(mmLocation, false, (modMatrix)?(new Matrix4(modMatrix).multiply(modelMeshTransformations[i])).elements
            :modelMeshTransformations[i].elements);

      drawables[i].draw(attribLocations)

    }
  }
}

function initGL(canvas) 
{
    try 
    {
      gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
      console.debug(gl);
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } 
    catch(e) 
    {
      console.log("Error: " + e);
    }
    if (!gl) 
    {
      addMessage('Could not initialize WebGL, sorry');
    }
    else
    {
      addMessage('WebGL initialized!');
    }

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
}

function initShader(shader, type)
{
  retShader = gl.createShader(type);

  gl.shaderSource(retShader, shader);
  gl.compileShader(retShader);

  if(!gl.getShaderParameter(retShader, gl.COMPILE_STATUS))
  {
    addMessage('Error during fragment shader compilation:\n' + gl.getShaderInfoLog(retShader)); 
    return null;
  }
  else
  {
    addMessage('Fragment Shader compiled successfully!');
  }

  return retShader;
}

function createRenderProgram(fshader, vshader)
{
  var program = gl.createProgram();
  console.debug(program);

  var fragShader = initShader(fshader, gl.FRAGMENT_SHADER);
  var verShader = initShader(vshader, gl.VERTEX_SHADER);
  console.log('after init shaders:');
  console.debug(fragShader);
  console.debug(verShader);

  gl.attachShader(program, fragShader);
  gl.attachShader(program, verShader);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program, gl.LINK_STATUS))
  {
    addMessage('Error during program linking\n' + gl.getProgramInfoLog(program));
    return;
  }
  else
  {
    addMessage('Program Linking went fine!');
  }

  gl.validateProgram(program);
  if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
  {
    addMessage('Error during program validation\n' + gl.getProgramInfoLog(program));
    return;
  }
  else
  {
    addMessage('Program Validation went fine!');
  }
  
  gl.useProgram(program);

  return program;
}

function Camera(d, modelUp)
{
  var center = [(d.min[0]+d.max[0])/2, (d.min[1]+d.max[1])/2, (d.min[2]+d.max[2])/2];

  var diagonal = Math.sqrt(Math.pow((d.max[0]-d.min[0]),2)+Math.pow((d.max[1]-d.min[1]),2)+Math.pow((d.max[2]-d.min[2]), 2));

  name = "auto";
  at = center;
  eye = [center[0], center[1]+diagonal*0.5, center[2]+diagonal*1.5];
  up = [modelUp[0], modelUp[1], modelUp[2]];
  near = diagonal*0.1;
  far = diagonal*3;
  FOV = 45;

  this.getProjMatrix = function()
  {
    return new Matrix4().setPerspective(FOV, gl.canvas.width/gl.canvas.height, near, far);
  };

  this.getRotatedViewMatrix = function(angle)
  {
    return this.getViewMatrix(this.getRotatedCameraPosition(angle));
  };

  this.getViewMatrix = function(e)
  {
    if (e == undefined)
    {
      e = eye;
    }
    return new Matrix4().setLookAt(e[0],e[1],e[2],at[0],at[1],at[2],up[0],up[1],up[2]);
  };

  this.getRotatedCameraPosition = function(angle)
  {
    var m = new Matrix4().setTranslate(at[0], at[1], at[2]).rotate(angle, up[0], up[1], up[2]).translate(-at[0], -at[1], -at[2]);
    var e = m.multiplyVector4(new Vector4([eye[0], eye[1], eye[2], 1])).elements;
    return [e[0], e[1], e[2]];
  };
}