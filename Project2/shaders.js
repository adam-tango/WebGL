var VSHADER_SOURCE = 
	'attribute vec3 aPosition;\n' +
	'attribute vec3 aNormal;\n' +
	
	'uniform int uLightType;\n' +
	'uniform vec3 uLightColor;\n' +
	'uniform vec3 uEyePosition;\n' +
	'uniform vec3 uSceneAmbient;\n' +
	'uniform vec3 uLookAt;\n' +
	
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
		// materials.ambientReflectance = [0,0,0,1] /*/ materials all have 0 ambienceReflectance, don't multiply
	'	vec3 ambience = uSceneAmbient;\n' + // vec3 ambience = vec3(0,0,0) * uSceneAmbience;\n' +

		// ----------
		// DIFFUSE
		// ----------
	'	vec3 L = normalize(uEyePosition-position);\n' + 
	
	'   float diffuseLight = max(dot(normal,L), 0.0);\n' +
	'	if(uLightType == 0) {\n' +
	'		diffuseLight = max(dot(normal,-L), 0.0);\n' + // spotlight requires -L
	'	}\n' +
	
		// kd = materials.diffuseReflectance = [0.6,0.6,0.6,1]
	'	vec3 Kd = vec3(0.6,0.6,0.6);\n' +
	'	vec3 diffuse = Kd*uLightColor*diffuseLight;\n' +

		// ----------
		// SPECULAR
		// ----------
	'	vec3 V = L;\n' +
	'	vec3 H = normalize(L + V);\n' +
		// materials.shininess = 10
	'	float specularPower = 10.0;\n' +
		// calculate
	'	float specularLight = pow(dot(normal,H),specularPower);\n' + 
		// is it possible to have specular lighting
	'	if(diffuseLight<=0.0) specularLight=0.0;\n' +
		// materials.specularReflectance = [0.4,0.4,0.4,1]
	'	vec3 Ks = vec3(0.4,0.4,0.4);\n' +
		// calculate
	'	vec3 specular = Ks*uLightColor*specularLight;\n' +	   

		// LIGHT
	'	vec3 light = emission + ambience + diffuse + specular;\n' + // point light
	'	if(uLightType == 0) {\n' +
			// spot light
	'		vec3 spotDirection = normalize( uEyePosition - uLookAt);\n' +
	'		float angle = max(dot(normal, -L),0.0); \n' +
	'		if(acos(angle) < radians(30.0))\n' +
	'			light = emission + ambience + diffuse + specular;\n' +
	'		else {\n' +
	'			light = emission + ambience;\n' +
	'		}\n' +
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
