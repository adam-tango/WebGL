var shaders = 
{
	'fragmentShader' : 
	'varying lowp vec3 fcolor;\n' +
	'void main(void)\n' +
	'{\n' +
	'	gl_FragColor = vec4(fcolor,1.0);\n' +
	'}\n',

	'vertexShader' :
	'attribute vec3 position;\n' +
	'attribute vec3 color;\n' +
	'varying vec3 fcolor;\n' +
	'uniform mat4 modelT;\n' +
	'uniform mat4 viewT;\n' +
	'uniform mat4 projT;\n' +
	'void main(void)\n' +
	'{\n' +
	'	gl_Position = projT*viewT*modelT*vec4(position, 1.0);\n' +
	'	fcolor = color;\n' +
	'}\n'
}