var FBO = function( name ){
	this.framebuffer;
	this.frameColorTexture;
	this.frameDepthTexture;
	this.renderBuffer;
	this.name = name;

	var shaderProgram;

	var gl = EngineCores.Instance().Graphics.gl;
	var width = gl.viewportWidth;
	var height = gl.viewportHeight;

	var buffers = { Vertex : null,
					TexCoords : null,
					Indices : null };

	var vertices = [ -1.0, -1.0,
					  1.0, -1.0,
					 -1.0,  1.0,
					 -1.0,  1.0,
					  1.0, -1.0,
					  1.0,  1.0 ];

	var texCoords = [ 0.0, 0.0, 
					  1.0, 0.0,
					  0.0, 1.0,
					  0.0, 1.0,
					  1.0, 0.0,
					  1.0, 1.0 ];

	var indices = [ 0, 1, 2, 3, 4, 5 ];

	this.RenderFBOToScreen = function()
	{
		shaderProgram.UseProgram();

		InitBuffers();

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
    	gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

		gl.enable( gl.DEPTH_TEST );
		//gl.clear( gl.DEPTH_BUFFER_BIT );
    	//var orthoMatrix = mat4.create();

    	//set uniform
    	//mat4.ortho( orthoMatrix, 0.0, 1600.0, 0.0, 900.0, 0.0, 1.0 );
    	//shaderProgram.SetUniformValueByName( "u_orthoMatrix", orthoMatrix );
    	shaderProgram.SetUniformValueByName( "u_colorTexture", 0 );
    	shaderProgram.SetUniformValueByName( "u_depthTexture", 1 );
    	shaderProgram.SendUniformValuesToShader();

    	gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, this.frameColorTexture );

		gl.activeTexture( gl.TEXTURE0 + 1 );
		gl.bindTexture( gl.TEXTURE_2D, this.frameDepthTexture );

		gl.enableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_POSITIONS );
		gl.enableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_TEXCOORDS );

		gl.bindBuffer( gl.ARRAY_BUFFER, buffers.Vertex );
		gl.vertexAttribPointer( AttributeLocation.VERTEX_ATTRIB_POSITIONS, 2, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ARRAY_BUFFER, buffers.TexCoords );
		gl.vertexAttribPointer( AttributeLocation.VERTEX_ATTRIB_TEXCOORDS, 2, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffers.Indices );
		gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0 );
	}

	this.AddShaderProgram = function( shaderProgramName )
	{
		shaderProgram = EngineCores.Instance().Graphics.shaderPrograms.get( shaderProgramName );
		if( shaderProgram === undefined )
		{
			console.log( 'Shader program with name ' + shaderProgramName + ' does not exist.' );
		} 
	}.bind(this);

	this.BindFBO = function()
	{
		gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer );
		//gl.colorMask(false, false, false, false);
    	//gl.clear( gl.DEPTH_BUFFER_BIT );
	}.bind(this);

	this.UnbindFBO = function()
	{
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	}.bind(this);

	var InitBuffers = function()
	{
		buffers.Vertex = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, buffers.Vertex );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

		buffers.TexCoords = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, buffers.TexCoords );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( texCoords ), gl.STATIC_DRAW );

		buffers.Indices = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffers.Indices );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( indices ), gl.STATIC_DRAW );
	}.bind(this);

	this.Initialize = function()
	{
		EngineCores.Instance().Graphics.FBO.put( this.name, this );

		//create color texture
		this.frameColorTexture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, this.frameColorTexture );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null );

		//create depth texture
		this.frameDepthTexture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, this.frameDepthTexture );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null );

		this.renderBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer( gl.RENDERBUFFER, this.renderBuffer );
		gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height );

		this.framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer );
		gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.frameColorTexture, 0 );
		gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer );
		//gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.frameDepthTexture, 0 );

		gl.bindTexture( gl.TEXTURE_2D, null );
		//gl.bindRenderbuffer( gl.RENDERBUFFER, null );
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	}.bind(this);

	this.Initialize();
}