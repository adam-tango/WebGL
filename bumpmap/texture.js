// same old, same old load texture functions

function Texture(img){
	var self = this;
	this.complete = false;
	this.tex = gl.createTexture();
	this.image = new Image();
	this.image.onload = function(){
		self.handleLoadedTexture();
	}
    if (img != null){
        this.setImage(img);
    }

};

Texture.prototype.setImage = function(file){
	this.image.src = file;
};

Texture.prototype.handleLoadedTexture = function(){
	console.info('loading image '+this.image.src);
	
	if (!isPowerOfTwo(this.image.width) || !isPowerOfTwo(this.image.height)) 
	{
		//Scaling texture to the next highest power of two...
		var canvas = document.createElement("canvas");
		canvas.width = nextHighestPowerOfTwo(this.image.width);
		canvas.height = nextHighestPowerOfTwo(this.image.height);
		var context = canvas.getContext("2d");
		context.drawImage(this.image, 0, 0, canvas.width, canvas.height);
		this.image = canvas;
	}
	
	
	gl.bindTexture(gl.TEXTURE_2D, this.tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
	this.complete = true;
};



