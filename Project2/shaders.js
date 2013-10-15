var VSHADER_SOURCE = 
	'attribute vec3 aPosition;\n' +
	'attribute vec3 aNormal;\n' +
	'uniform vec3 uEyePosition; \n' +
	'uniform vec3 uSceneCenter;\n' +
	'uniform float uLightType;\n' +
	
	'uniform mat4 modelT, viewT, projT;\n'+
	'uniform mat4 normalMatrix;\n' +
	
	'varying vec3 vColor;\n' +
	
	'void main() {\n' +
		
	'   gl_Position = projT*viewT*modelT*vec4(aPosition,1.0);\n' +
	'   vec3 position = vec3(normalMatrix * vec4(aPosition, 1.0));\n' +
    '   vec3 normal = normalize(vec3(normalMatrix * vec4(aNormal, 1.0)));\n' +

		// ----------
		// Emissive and ambient light
		// ----------
		// materials.emissionColor = [0,0,0,1]
	'	vec3 emission = vec3(0,0,0);\n' +
		// scence ambience
	'	vec3 globalAmbience = vec3(0.1,0.1,0.1);\n' + 	
		// materials.ambientReflectance = [0,0,0,1] /*/ materials all have 0 ambienceReflectance, don't multiply
	'	vec3 ambience = globalAmbience;\n' + // vec3 ambience = vec3(0,0,0) * globalAmbience;\n' +

		// ----------
		// DIFFUSE
		// ----------
	'	vec3 L;\n' +
	'	if(uLightType == 1.0) {\n' +
			// point light
	'		L = normalize(uEyePosition-position);\n' + 
    '	} else {\n' +
			// spot light
			// vector same for all light rays - not sure this is correct
    '		L = normalize(uEyePosition-uSceneCenter);\n' +
	'	}\n' +
		
	'	float diffuseLight = max(dot(normal,L), 0.0);\n' +
		// kd = materials.diffuseReflectance = [0.6,0.6,0.6,1]
	'	vec3 Kd = vec3(0.6,0.6,0.6);\n' +
		// lightColor = white
	'	vec3 lightColor = vec3(1,1,1);\n' +
	'	vec3 diffuse = Kd*lightColor*diffuseLight;\n' +

		// ----------
		// SPECULAR
		// ----------
		// differs per vertex whether point or omni source
	'	vec3 V = normalize(uEyePosition - position);\n' +
	'	vec3 H = normalize(L + V);\n' +
		// materials.shininess = 10
	'	float specularPower = 100.0;\n' +
		// calculate
	'	float specularLight = pow(dot(normal,H),specularPower);\n' + 
		// is it possible to have specular lighting
	'	if(diffuseLight<=0.0) specularLight=0.0;\n' +
		// materials.specularReflectance = [0.4,0.4,0.4,1]
	'	vec3 Ks = vec3(0.4,0.4,0.4);\n' +
		// calculate
	'	vec3 specular = Ks*lightColor*specularLight;\n' +	   

		// LIGHT
	'	vec3 light;\n' +
	'	if(uLightType == 1.0) {\n' +
			// point light
	'		light = emission + ambience + diffuse + specular;\n' + 
	'	} else {\n' +
			// spot light
	'		vec3 lightDirection = normalize(uEyePosition - position);\n' +
	'		float spotPower = 10.0;\n' + // <-- not sure what this is
	'		float spotScale = pow(max(dot(L,-lightDirection),0.0),spotPower);\n' +
	'		light = emission + ambience + (diffuse + specular)*spotScale;\n' +
	'	}\n' +
		
		// original mesh color (set to red for now) ; change to texture
	'	vec3 color = vec3(1,0,0);\n' +
		// modify color by the cumulative light hitting it
	'	color.rgb *= light;\n' +
		// pass to fragment shader
	'   vColor = color;\n' +
	'}\n';
	
	
var FSHADER_SOURCE = 
	'#ifdef GL_ES\n' +
  	'	precision highp float;\n' +
    '#endif\n' +
	'	varying vec3 vColor;\n' + 
    '	void main() {\n' +
	'     gl_FragColor = vec4(vColor, 1.0);\n' +	  
	'  }\n';