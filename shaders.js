var VSHADER_SOURCE = 
	'attribute vec3 aPosition;\n' +
	'attribute vec3 aNormal;\n' +
	'attribute vec2 texCoordinates;\n' +
	
	'uniform mat4 modelT, viewT, projT;\n'+
	'uniform mat4 normalMatrix;\n' +
	'uniform vec3 EyePosition;\n' +
	'uniform mat4 inverseTransposeModelMatrix;\n' +

	'varying vec3 vPosition;\n' +
	'varying vec3 vNormal;\n' +
	'varying vec2 textCoord;\n' +
	'varying vec3 fragNormal;\n' +
	'varying vec3 fragViewDirection;\n' +	
	
	'void main() {\n' +
		
	'   gl_Position = projT*viewT*modelT*vec4(aPosition,1.0);\n' +
	//'	fragNormal = normalize(aNormal);\n' +
	'	fragNormal = normalize((inverseTransposeModelMatrix*vec4(aNormal,0.0)).xyz);\n' +
	'	fragViewDirection = (modelT*vec4(aPosition,1.0)).xyz - EyePosition;\n' +
	'	textCoord = texCoordinates;\n' +
	'	vPosition = vec3(viewT*modelT*vec4(aPosition,1.0));\n' +
   	'	vNormal = normalize(vec3(viewT*normalMatrix*vec4(aNormal,0.0)));\n' +
	
	'}\n';
	
	
var FSHADER_SOURCE = 
	//'#ifdef GL_ES\n' +
	'precision mediump float;\n' +
	//'#endif\n' +

	'varying vec3 vPosition;\n' +
	'varying vec3 vNormal;\n' +
	'varying vec2 textCoord;\n' +
	'varying vec3 fragNormal;\n' +
	'varying vec3 fragViewDirection;\n' +
	'uniform vec3 uEyePosition;\n' +

	'uniform int uLightType;\n' +
	'uniform int uHasTexture;\n' +
	//'uniform vec3 uEyePosition;\n' +
	'uniform vec3 uLightColor;\n' +
	'uniform vec3 uSceneAmbient;\n' +
	'uniform sampler2D texSampler;\n' +
	'uniform samplerCube texUnit;\n' +

	'uniform vec3 uEmissionColor;\n' +
	'uniform vec3 uDiffuseReflectance;\n' +
	'uniform vec3 uAmbientReflectance;\n' +
	'uniform vec3 uSpecularReflectance;\n' +
	'uniform float uShininess;\n' +
	'uniform float uSpotlightAngle;\n' +
	'uniform float uAlpha;\n' +
	
    'void main() {\n' +
			
	//'		vec3 color = vec3(0.8,0,0);\n' +			// make models red - texturize in the future
	'	vec3 normal = normalize(vNormal);\n' +	
	// EMISSIVE REFLECTANCE:
	'	vec3 emission = uEmissionColor;\n' +
	// AMBIENT REFLECTANCE 
	//'	vec3 ambience = uAmbientReflectance * uSceneAmbient;\n' +
	'	vec3 ambience = uSceneAmbient;\n' + 
	// DIFFUSE REFLECTANCE:
			// direction from eye (camera location) to fragment
	'	vec3 lightDirection = normalize(uEyePosition-vPosition);\n' +	
			// The dot product of the light direction and the normal
	'	float nDotL = max(dot(lightDirection,normal), 0.0);\n' +	
			// calculate diffuse reflectance
	'	vec3 diffuse = uLightColor * uDiffuseReflectance * nDotL;\n' +	
	// SPECULAR REFLECTANCE:
   			// make spotlight always hit center of the screen (vec3(0,0,0))
	'	vec3 viewDirection = normalize(-vPosition);\n' +	
			// get reflection vector
	'	vec3 reflectDirection = reflect(-lightDirection,normal);\n' +	
	  		// angle between view and reflection 
	'	float vDotR = max(dot(viewDirection, reflectDirection),0.0);\n' +	
			// calculate specular reflectance (10.0 => material.shininess; pow() restricts angle)
	'	vec3 specular = uLightColor * uSpecularReflectance * pow(vDotR, uShininess);\n' +	
			// direction from camera space; since light comes from camera
	'	vec3 spotlightDirection = vec3(0.0,0.0,-1.0);\n' +	
   			// Calculate angle between spot-light look direction and from light to
	'	float sDotF = dot(spotlightDirection,-viewDirection);\n' +	
	'	vec4 textColor = texture2D(texSampler, vec2(textCoord.s, textCoord.t));\n' +
	
	// DETERMINE LIGHT COLOR BASED ON COMPONENTS:
			// assumes omni light
	//'	vec3 tColor = vec3(emission + ambience + diffuse + specular);\n' +
	'	vec3 tColor = emission + ambience + diffuse + specular;\n' +
			// alter color if source is spotlight
	'	if(uLightType == 0) {\n' +
   				// calculate cone of spotlight
	'		float spotDifference = 0.0;\n' +
				// allow 10 degree spotlight angle
	//'			if(acos(sDotF) < radians(10.0)) {\n' +
	'		if(acos(sDotF) < radians(uSpotlightAngle)) {\n' +
					// 60.0 restricts angle; determines how spotlight fades out (domain: 0.0 - 120.0)
	'			spotDifference = pow(sDotF, 60.0);\n' +	 
	'		}\n' +
				// emmission & ambience are not restricted by spotlight
	'		tColor = vec3(emission + ambience + spotDifference * (diffuse + specular));\n' +		
	//'		tColor = vec3(emission + ambience + spotDifference * (diffuse));\n' +
	'	}\n' + 
	'	vec3 viewDir = normalize(fragViewDirection);\n' +
	'	vec3 SummataNormal = normalize(fragNormal);\n' +
	//'	vec3 reflectedViewDirection = reflect(viewDirection, normal);\n' +
	'	vec3 reflectedViewDirection = reflect(viewDir, SummataNormal);\n' +
	'	vec3 environmentColor = textureCube(texUnit, reflectedViewDirection).rgb;\n' +
	'	if(uHasTexture == 1) {\n' +
	'		gl_FragColor = vec4(textColor.rgb*tColor, uAlpha);\n' +
	'	}\n' +
	'	else if(uHasTexture == 0 && uAlpha < 0.0) {\n' +
	'		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n' +
	'	}\n' + 
	'	else\n' + 
	'	{	\n' +	  
	'		gl_FragColor = vec4(environmentColor*tColor, uAlpha);\n' +
	'	}\n' +
	//'	gl_FragColor = vec4(tColor, 1.0);\n' +
	' }\n';
