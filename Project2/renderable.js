"use strict";
function RenderableModel(gl,model){
        function Drawable(attribLocations, vArrays, nVertices, indexArray, drawMode){
          // Create a buffer object
          var vertexBuffers=[];
          var nElements=[];
          var nAttributes = attribLocations.length;

          for (var i=0; i<nAttributes; i++){
                  if (vArrays[i]){
                          vertexBuffers[i] = gl.createBuffer();
                          if (!vertexBuffers[i]) {
                                console.log('Failed to create the buffer object');
                                return null;
                          }
                          // Bind the buffer object to an ARRAY_BUFFER target
                          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
                          // Write date into the buffer object
                          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vArrays[i]), gl.STATIC_DRAW);
                          nElements[i] = vArrays[i].length/nVertices;
                  }
                  else{
                          vertexBuffers[i]=null;
                  }
          }

          var indexBuffer=null;
          if (indexArray){
                indexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
          }
          
          this.draw = function (){

                for (var i=0; i<nAttributes; i++){
                  if (vertexBuffers[i]){
                          gl.enableVertexAttribArray(attribLocations[i]);
                          // Bind the buffer object to target
                          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
                          // Assign the buffer object to a_Position variable
                          gl.vertexAttribPointer(attribLocations[i], nElements[i], gl.FLOAT, false, 0, 0);
                  }
                  else{
                          gl.disableVertexAttribArray(attribLocations[i]); 
                          gl.vertexAttrib3f(attribLocations[i],1,1,1);
                          //console.log("Missing "+attribLocations[i])
                  }
                }
                if (indexBuffer){
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                        gl.drawElements(drawMode, indexArray.length, gl.UNSIGNED_SHORT, 0);
                }
                else{
                        gl.drawArrays(drawMode, 0, nVertices);
                }
          }
        }
        
        
        // create program
        var program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
        if (!program) {
                console.log('Failed to create program');
                return false;
        }

        var aPosition = gl.getAttribLocation(program, 'aPosition');                  
        var aNormal = gl.getAttribLocation(program, 'aNormal'); // for lighting
        var aLocations = [aPosition,aNormal];

        // Get the location/address of the uniform variable inside the shader program.
        var mmLoc = gl.getUniformLocation(program,"modelT");
        var vmLoc = gl.getUniformLocation(program,"viewT");
        var pmLoc = gl.getUniformLocation(program,"projT");
        // Needed for lighting
		var nmLoc = gl.getUniformLocation(program,"normalMatrix");
        var uLightTypeLoc = gl.getUniformLocation(program,"uLightType");
		var uLookAtLoc = gl.getUniformLocation(program,"uLookAt");
        var uLightColorLoc = gl.getUniformLocation(program,"uLightColor");
        var uEyePositionLoc = gl.getUniformLocation(program,"uEyePosition");
        var uSceneAmbientLoc = gl.getUniformLocation(program,"uSceneAmbient");

        var drawables=[];
        var modelTransformations=[];
        var nDrawables=0;
        var nNodes = (model.nodes)? model.nodes.length:1;
        var drawMode=(model.drawMode)?gl[model.drawMode]:gl.TRIANGLES;

        for (var i= 0; i<nNodes; i++){
                var nMeshes = (model.nodes)?(model.nodes[i].meshIndices.length):(model.meshes.length);
                for (var j=0; j<nMeshes;j++){
                        var index = (model.nodes)?model.nodes[i].meshIndices[j]:j;
                        var mesh = model.meshes[index];
                        drawables[nDrawables] = new Drawable(
                                aLocations,[mesh.vertexPositions, mesh.vertexNormals, mesh.vertexTexCoordinates],
                                mesh.vertexPositions.length/3,
                                mesh.indices, drawMode
                        );
                        
                        var m = new Matrix4();
                        if (model.nodes)
                                m.elements=new Float32Array(model.nodes[i].modelMatrix);
                        modelTransformations[nDrawables] = m;
                        
                        nDrawables++;
                }
        }
        // Get the location/address of the vertex attribute inside the shader program.
        this.draw = function(lightType,cameraPosition,lookAt,pMatrix,vMatrix,mMatrix)
        {
                gl.useProgram(program);
                gl.uniformMatrix4fv(pmLoc, false, pMatrix.elements);
                gl.uniformMatrix4fv(vmLoc, false, vMatrix.elements);

				gl.uniform1i(uLightTypeLoc, lightType);
                gl.uniform3f(uLightColorLoc, 1.0, 1.0, 1.0); // white
                gl.uniform3f(uEyePositionLoc, cameraPosition[0], cameraPosition[1], cameraPosition[2]);
				gl.uniform3f(uLookAtLoc, lookAt[0], lookAt[1], lookAt[2]); // white
                gl.uniform3f(uSceneAmbientLoc, 0.1, 0.1, 0.1); // scene ambience

                // pass variables determined at runtime
                for (var i= 0; i<nDrawables; i++){
                        // pass model matrix
                        var mMatrix=modelTransformations[i];
                        gl.uniformMatrix4fv(mmLoc, false, mMatrix.elements);
                        var normalMatrix = new Matrix4();  // Model matrix
                        // Calculate the matrix to transform the normal based on the model matrix
                          normalMatrix.setInverseOf(mMatrix);
                          normalMatrix.transpose();
                        // Pass the transformation matrix for normals to u_NormalMatrix
                          gl.uniformMatrix4fv(nmLoc, false, normalMatrix.elements);                                        
                        //gl.uniformMatrix4fv(mmLoc, false, 
                                //(mMatrix)?(new Matrix4(mMatrix).multiply(modelTransformations[i])).elements
                                        //        :modelTransformations[i].elements);
                                                
                        drawables[i].draw();
                }
                gl.useProgram(null);
        }
        this.getBounds=function() // Computes Model bounding box
        {                
                var xmin, xmax, ymin, ymax, zmin, zmax;
                var firstvertex = true;
                var nNodes = (model.nodes)?model.nodes.length:1;
                for (var k=0; k<nNodes; k++){
                        var m = new Matrix4();
                        if (model.nodes)m.elements=new Float32Array(model.nodes[k].modelMatrix);
                        //console.log(model.nodes[k].modelMatrix);
                        var nMeshes = (model.nodes)?model.nodes[k].meshIndices.length:model.meshes.length;
                        for (var n = 0; n < nMeshes; n++){
                                var index = (model.nodes)?model.nodes[k].meshIndices[n]:n;
                                var mesh = model.meshes[index];
                                for(var i=0;i<mesh.vertexPositions.length; i+=3){
                                        var vertex = m.multiplyVector4(new Vector4([mesh.vertexPositions[i],mesh.vertexPositions[i+1],mesh.vertexPositions[i+2],1])).elements;
                                        //if (i==0){
                                        //        console.log([mesh.vertexPositions[i],mesh.vertexPositions[i+1],mesh.vertexPositions[i+2]]);
                                        //        console.log([vertex[0], vertex[1], vertex[2]]);
                                        //}
                                        if (firstvertex){
                                                xmin = xmax = vertex[0];
                                                ymin = ymax = vertex[1];
                                                zmin = zmax = vertex[2];
                                                firstvertex = false;
                                        }
                                        else{
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
        
        // Load texture image and create/return texture object
        function createTexture(imageFileName)
        {
                  var tex = gl.createTexture();
                  var img = new Image();
                  img.onload = function(){
                          gl.bindTexture(gl.TEXTURE_2D, tex);
                          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
                          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                          gl.bindTexture(gl.TEXTURE_2D, null);
                  }
                  img.src = imageFileName;
                  return tex;
        }
}
function RenderableWireBoxModel(gl,d){
        var wireModel = new RenderableModel(gl,cubeLineObject);
        var factor = [(d.max[0]-d.min[0])/2,(d.max[1]-d.min[1])/2,(d.max[2]-d.min[2])/2];
        var center = [(d.min[0]+d.max[0])/2,(d.min[1]+d.max[1])/2,(d.min[2]+d.max[2])/2];
        var transformation = new Matrix4().
                translate(center[0], center[1],center[2]).
                scale(factor[0],factor[1],factor[2]);
        this.draw = function(mP,mV,mM){
                wireModel.draw(mP,mV,new Matrix4(mM).multiply(transformation));
        }
}
