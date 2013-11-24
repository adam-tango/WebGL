"use strict";
function RenderableModel(gl,model, path)
{
    function Drawable(attribLocations, vArrays, nVertices, indexArray, drawMode)
    {
      // Create a buffer object
      var vertexBuffers=[];
      var nElements=[];
      var nAttributes = attribLocations.length;
      //debugger;
      for (var i=0; i<nAttributes; i++)
      {
          if (vArrays[i])
          {
                  vertexBuffers[i] = gl.createBuffer();
                  if (!vertexBuffers[i]) 
                  {
                        console.log('Failed to create the buffer object');
                        return null;
                  }
                  // Bind the buffer object to an ARRAY_BUFFER target
                  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
                  // Write date into the buffer object
                  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vArrays[i]), gl.STATIC_DRAW);
                  nElements[i] = vArrays[i].length/nVertices;
          }
          else
          {
                  vertexBuffers[i]=null;
          }
      }

      var indexBuffer=null;
      if (indexArray)
      {
            indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
      }
      
      this.draw = function ()
      {
            //console.log(vertexBuffers);
            for (var i=0; i<nAttributes; i++)
            {
              if (vertexBuffers[i] != null)
              {
                      gl.enableVertexAttribArray(attribLocations[i]);
                      // Bind the buffer object to target
                      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
                      // Assign the buffer object to a_Position variable
                      gl.vertexAttribPointer(attribLocations[i], nElements[i], gl.FLOAT, false, 0, 0);
              }
              else
              {
                      gl.disableVertexAttribArray(attribLocations[i]); 
                      gl.vertexAttrib3f(attribLocations[i],1,1,1);
                      //console.log("Missing "+attribLocations[i])
              }
            }
            if (indexBuffer)
            {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                    gl.drawElements(drawMode, indexArray.length, gl.UNSIGNED_SHORT, 0);
            }
            else
            {
                    gl.drawArrays(drawMode, 0, nVertices);
            }
      }
    }
        
		// Store properties for each material
		var materialProperties = []; // material objects

		function addMaterial(count, emissionColor, diffuseReflectance, ambientReflectance, specularReflectance, shininess, texture)
		{
			//console.log('here');
			materialProperties[count] = [];
			materialProperties[count][0] = [emissionColor[0],emissionColor[1],emissionColor[2]];
			materialProperties[count][1] = [diffuseReflectance[0],diffuseReflectance[1],diffuseReflectance[2]];
			materialProperties[count][2] = [ambientReflectance[0],ambientReflectance[1],ambientReflectance[2]];
			materialProperties[count][3] = [specularReflectance[0],specularReflectance[1],specularReflectance[2]];
			materialProperties[count][4] = shininess;
      if(texture)
      {
        materialProperties[count][5] = createTexture(texture);  
      }
      else
      {
        materialProperties[count][5] = undefined;
      }
		}
		
		
    // create program
    var program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!program) 
    {
            console.log('Failed to create program');
            return false;
    }

    var aPosition = gl.getAttribLocation(program, 'aPosition');                  
    var aNormal = gl.getAttribLocation(program, 'aNormal'); // for lighting
    var aTextCoord = gl.getAttribLocation(program, 'texCoordinates');
    var aLocations = [aPosition,aNormal, aTextCoord];

    // Get the location/address of the uniform variable inside the shader program.
    var mmLoc = gl.getUniformLocation(program,"modelT");
    var vmLoc = gl.getUniformLocation(program,"viewT");
    var pmLoc = gl.getUniformLocation(program,"projT");
    var inverseTransposeMMatrixLocation = gl.getUniformLocation(program,"inverseTransposeModelMatrix");
    // Needed for lighting
    var nmLoc = gl.getUniformLocation(program,"normalMatrix");
    var uLightTypeLoc = gl.getUniformLocation(program,"uLightType");
    var uLightColorLoc = gl.getUniformLocation(program,"uLightColor");
    var uEyePositionLoc = gl.getUniformLocation(program,"uEyePosition");
    var EyePositionLoc = gl.getUniformLocation(program, "EyePosition");
    var uSceneAmbientLoc = gl.getUniformLocation(program,"uSceneAmbient");
    var uHasTextureLoc = gl.getUniformLocation(program, "uHasTexture");
    // specific mesh material properties from models.json
    var emissionColorLoc = gl.getUniformLocation(program,"uEmissionColor");
    var diffuseReflLoc = gl.getUniformLocation(program,"uDiffuseReflectance");
    var ambientReflLoc = gl.getUniformLocation(program,"uAmbientReflectance");
    var specularReflLoc = gl.getUniformLocation(program,"uSpecularReflectance");
    var shininessLoc = gl.getUniformLocation(program,"uShininess");
    var spotAngleLoc = gl.getUniformLocation(program,"uSpotlightAngle");
    var alphaLoc = gl.getUniformLocation(program, "uAlpha");

    var sampLoc = gl.getUniformLocation(program, "texSampler");
    var envSampLoc = gl.getUniformLocation(program, "texUnit");
    //debugger;
    var drawables=[];
    var modelTransformations=[];
    var materialIndex=[]; // store material index
    var nDrawables=0;
    var nNodes = (model.nodes)? model.nodes.length:1;

    var drawMode=(model.drawMode)?gl[model.drawMode]:gl.TRIANGLES;
		
    var hasMaterials = false;
    if (model.materials)
    {
      hasMaterials = true;
  		var nMaterials = model.materials.length;
  		for (var count=0; count<nMaterials; count++) 
      {
  			
  			var aMaterial = model.materials[count];
  			//console.log(aMaterial.diffuseTexture);
        if(aMaterial.diffuseTexture && aMaterial.diffuseTexture[0])
        {
  			   addMaterial(count, aMaterial.emissionColor, aMaterial.diffuseReflectance, aMaterial.ambientReflectance, aMaterial.specularReflectance, aMaterial.shininess, aMaterial.diffuseTexture[0]);
        }
        else
        {
          addMaterial(count, aMaterial.emissionColor, aMaterial.diffuseReflectance, aMaterial.ambientReflectance, aMaterial.specularReflectance, aMaterial.shininess);
        }
  		}
    }


    for (var i= 0; i<nNodes; i++)
    {
        var nMeshes = (model.nodes)?(model.nodes[i].meshIndices.length):(model.meshes.length);
        for (var j=0; j<nMeshes;j++)
        {
            var index = (model.nodes)?model.nodes[i].meshIndices[j]:j;
            var mesh = model.meshes[index];
            var arrays = [mesh.vertexPositions, mesh.vertexNormals];
            if (mesh.vertexTexCoordinates && mesh.vertexTexCoordinates[0])
            {
              arrays.push(mesh.vertexTexCoordinates[0]);
            };
            drawables[nDrawables] = new Drawable(
                    aLocations, arrays,
                    mesh.vertexPositions.length/3,
                    mesh.indices, drawMode
            );

            materialIndex[nDrawables] = mesh.materialIndex;
            
            var m = new Matrix4();
            if (model.nodes)
                    m.elements=new Float32Array(model.nodes[i].modelMatrix);
            modelTransformations[nDrawables] = m;
            nDrawables++;
        }
    }

    function drawEnvironment(env)
    {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, env);
      gl.uniform1i(envSampLoc, 1);
    }

    // Get the location/address of the vertex attribute inside the shader program.
    this.draw = function(sunSpot,lightType,cameraPosition,lookAt,pMatrix,vMatrix,spotLightAngle, cubeMap, alpha)
    {
        gl.useProgram(program);
        
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
        gl.uniform1i(envSampLoc, 1);

        gl.uniformMatrix4fv(pmLoc, false, pMatrix.elements);
        gl.uniformMatrix4fv(vmLoc, false, vMatrix.elements);

        gl.uniform1i(uLightTypeLoc, lightType);
        gl.uniform3f(uLightColorLoc, 1.0, 1.0, 1.0); // white
        gl.uniform3f(uEyePositionLoc, sunSpot[0], sunSpot[1], sunSpot[2]);
        gl.uniform3f(EyePositionLoc, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
        gl.uniform3f(uSceneAmbientLoc, 0.02, 0.02, 0.02); // scene ambience
        gl.uniform1f(spotAngleLoc, spotLightAngle); // Custom Spotlight size from slider
        if (alpha)
        {
          gl.uniform1f(alphaLoc, alpha);
        }
        else
        {
          gl.uniform1f(alphaLoc, 1.0);  
        }

        // pass variables determined at runtime
        for (var i= 0; i<nDrawables; i++)
        {
            // pass model matrix
            var mMatrix=modelTransformations[i];
            gl.uniformMatrix4fv(mmLoc, false, mMatrix.elements);
            // pass inverse transpose model matrix
            gl.uniformMatrix4fv(inverseTransposeMMatrixLocation, false, modelMatrixToNormalMatrix(mMatrix).elements);

            var normalMatrix = new Matrix4();  // Model matrix
            // Calculate the matrix to transform the normal based on the model matrix
              normalMatrix.setInverseOf(mMatrix);
              normalMatrix.transpose();
            // Pass the transformation matrix for normals to u_NormalMatrix
              gl.uniformMatrix4fv(nmLoc, false, modelMatrixToNormalMatrix(mMatrix).elements);
            if (hasMaterials)
            {
  						// pass material properties
  						var v = materialProperties[materialIndex[i]][0];	  
  						gl.uniform3f(emissionColorLoc, v[0],v[1],v[2]);
  						v = materialProperties[materialIndex[i]][1];	
          		gl.uniform3f(diffuseReflLoc, v[0],v[1],v[2]);
  						v = materialProperties[materialIndex[i]][2];	
          		gl.uniform3f(ambientReflLoc, v[0],v[1],v[2]);
  						v = materialProperties[materialIndex[i]][3];	   
  						gl.uniform3f(specularReflLoc, v[0],v[1],v[2]);
    				  gl.uniform1f(shininessLoc, materialProperties[materialIndex[i]][4]);

              v = materialProperties[materialIndex[i]][5];
              //console.log(v);
              if(v)
              {
                //console.log("haz v!");
                gl.uniform1i(uHasTextureLoc, 1);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, v);
                gl.uniform1i(sampLoc,0);
              }
              else
              {
                //console.log("Model doesn't have a texture!");
                gl.uniform1i(uHasTextureLoc, 0);
              }
            }

            drawables[i].draw();
        }
        gl.useProgram(null);
    }
    this.getBounds=function() // Computes Model bounding box
    {                
        var xmin, xmax, ymin, ymax, zmin, zmax;
        var firstvertex = true;
        var nNodes = (model.nodes)?model.nodes.length:1;
        for (var k=0; k<nNodes; k++)
        {
            var m = new Matrix4();
            if (model.nodes)m.elements=new Float32Array(model.nodes[k].modelMatrix);
            //console.log(model.nodes[k].modelMatrix);
            var nMeshes = (model.nodes)?model.nodes[k].meshIndices.length:model.meshes.length;
            for (var n = 0; n < nMeshes; n++)
            {
                var index = (model.nodes)?model.nodes[k].meshIndices[n]:n;
                var mesh = model.meshes[index];
                for(var i=0;i<mesh.vertexPositions.length; i+=3)
                {
                    var vertex = m.multiplyVector4(new Vector4([mesh.vertexPositions[i],mesh.vertexPositions[i+1],mesh.vertexPositions[i+2],1])).elements;
                    //if (i==0){
                    //        console.log([mesh.vertexPositions[i],mesh.vertexPositions[i+1],mesh.vertexPositions[i+2]]);
                    //        console.log([vertex[0], vertex[1], vertex[2]]);
                    //}
                    if (firstvertex)
                    {
                        xmin = xmax = vertex[0];
                        ymin = ymax = vertex[1];
                        zmin = zmax = vertex[2];
                        firstvertex = false;
                    }
                    else
                    {
                        if (vertex[0] < xmin) xmin = vertex[0];
                        else if (vertex[0] > xmax) xmax = vertex[0];
                        if (vertex[1] < ymin) ymin = vertex[1];
                        else if (vertex[1] > ymax) ymax = vertex[1];
                        if (vertex[2] < zmin) zmin = vertex[2];
                        else if (vertex[2] > zmax) zmax = vertex[2];
                    }
                }
            }
        }
        var dim= {};
        dim.min = [xmin,ymin,zmin];
        dim.max = [xmax,ymax,zmax];
        //console.log(dim);
        return dim;
    }
    var imagecount;
    function createTexture(imageFileName)
    {
        var tex = gl.createTexture();
        tex.width = 0; tex.height = 0;
        var img = new Image();
        imagecount++;
        img.onload = function()
        {
          var nPOT = false; // nPOT: notPowerOfTwo
         // console.log(imageFileName+" loaded : "+img.width+"x"+img.height);
          tex.complete = img.complete;
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          if (!isPowerOfTwo(img.width) || !isPowerOfTwo(img.height)) nPOT = true;
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
          //void texImage2D(enum target, int level, enum internalformat, enum format, enum type, Object object);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, (nPOT)?gl.CLAMP_TO_EDGE:gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, (nPOT)?gl.CLAMP_TO_EDGE:gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, ((nPOT)?gl.LINEAR:gl.LINEAR_MIPMAP_LINEAR));
          if (!nPOT)gl.generateMipmap(gl.TEXTURE_2D);
          gl.bindTexture(gl.TEXTURE_2D, null);
          tex.width = img.width;
          tex.height = img.height;
          imagecount--; 
        };
        img.src = path+imageFileName.substring(3,imageFileName.length);
        return tex;
    }
	
	
	
	
	function modelMatrixToNormalMatrix(mat)
	{ 
		var a00 = mat.elements[0], a01 = mat.elements[1], a02 = mat.elements[2],
			a10 = mat.elements[4], a11 = mat.elements[5], a12 = mat.elements[6],
			a20 = mat.elements[8], a21 = mat.elements[9], a22 = mat.elements[10],
			b01 = a22 * a11 - a12 * a21,
			b11 = -a22 * a10 + a12 * a20,
			b21 = a21 * a10 - a11 * a20,
			d = a00 * b01 + a01 * b11 + a02 * b21,
			id;

		if (!d) { return null; }
		id = 1 / d;

		var dest = new Matrix4();

		dest.elements[0] = b01 * id;
		dest.elements[4] = (-a22 * a01 + a02 * a21) * id;
		dest.elements[8] = (a12 * a01 - a02 * a11) * id;
		dest.elements[1] = b11 * id;
		dest.elements[5] = (a22 * a00 - a02 * a20) * id;
		dest.elements[9] = (-a12 * a00 + a02 * a10) * id;
		dest.elements[2] = b21 * id;
		dest.elements[6] = (-a21 * a00 + a01 * a20) * id;
		dest.elements[10] = (a11 * a00 - a01 * a10) * id;

		return dest;
	}
	
	this.getModelTransformations = function() 
	{
		
		var clone = [];

    for (var i=0; i<modelTransformations.length; i++)
    {
      clone[i] = new Matrix4(modelTransformations[i]);
    }	
		return clone;
	}

  this.setModelTransformations = function(transformationsArray)
  {
    modelTransformations = transformationsArray;
  }

	this.scaleModel = function(percentage) {
	
		for (var i= 0; i<nDrawables; i++)
    {
			modelTransformations[i] = modelTransformations[i].scale(percentage,percentage,percentage);
			//modelNormals[i] = modelMatrixToNormalMatrix(modelTransformations[i]);
		}
		return modelTransformations;
	}
	this.translateModel=function(x, y, z)
	{
		for (var i= 0; i<nDrawables; i++)
    {
			modelTransformations[i] = modelTransformations[i].translate(x,y,z);
			//modelNormals[i] = modelMatrixToNormalMatrix(modelTransformations[i]);

			//console.log(moveObj[0] + " - " + moveObj[1] + " - " +moveObj[2]);
			//mMatrix.translate(moveObj[0], moveObj[1], moveObj[2]);
		}
    return modelTransformations;
	}
}

function createReflectingPool(dimensions, materials)
{
  var diag = Math.pow((dimensions.max[0]-dimensions.min[0]),2);
  diag += Math.pow((dimensions.max[1]-dimensions.min[1]),2);
  diag += Math.pow((dimensions.max[2]-dimensions.min[2]),2);
  diag = Math.sqrt(diag);

  var size = diag*0.6;
  var modelMatrix = [size,0,0,0,
                     0,size,0,0, 
                     0,0,size,0, 
                     (dimensions.min[0]+dimensions.max[0])/2, 
                     dimensions.min[1], 
                     (dimensions.min[2]+dimensions.max[2])/2,
                     1];
  var thePool = {};
  thePool.name = "Reflecting Pool";
  
  thePool.meshes = [];
  thePool.meshes[0]={};
  thePool.meshes[0].vertexPositions = [-1,0,-1, -1,0,1, 1,0,1, 1,0,-1];
  thePool.meshes[0].vertexNormals = [0,1,0,0,1,0,0,1,0,0,1,0];
  thePool.meshes[0].indices = [0,1,2,2,3,0];
  thePool.meshes[0].materialIndex = 0;

  thePool.nodes = [];
  thePool.nodes[0] = {};
  thePool.nodes[0].modelMatrix = modelMatrix;
  thePool.nodes[0].meshIndices = [0];
  //thePool.materials=[];
  //thePool.materials[0]=materials;

  console.log(thePool);

  return thePool;
}


