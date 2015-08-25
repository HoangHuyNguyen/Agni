var CTexture = function( path )
{
	var gl = EngineCores.Instance().Graphics.gl;

	var string = path.split( "/" );
	var namePart = string[ string.length - 1 ];
	
	this.name = namePart;
	this.type = gl.TEXTURE_2D;
	this.initialized = false;
	this.texture = gl.createTexture();

	this.image = new Image();
	this.image.src = path;
	this.onLoad = null;
	this.image.onload = function()
	{
		this.Initialize();
		if( this.onLoad )
			this.onLoad();
	}.bind(this);

	this.Initialize = function()
	{   
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.bindTexture( gl.TEXTURE_2D, this.texture );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, this.image );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        //gl.generateMipmap( gl.TEXTURE_2D );
                
        gl.bindTexture( gl.TEXTURE_2D, null );
                
        this.initialized = true;
     };
}