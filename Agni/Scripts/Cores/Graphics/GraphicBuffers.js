var GBuffer = function(){
	this.frameBuffer;
	this.renderBuffer;
	this.positionTexture;  
	this.normalTexture; 
	this.texCoordsTexture;
	this.colorTexture;
	this.depthTexture;

	var gl = EngineCores.Instance().Graphics.gl;
	var drawBufferExt = EngineCores.Instance().Graphics.drawBufferExt;

	var width = gl.viewportWidth;
	var height = gl.viewportHeight;

	this.Initialize = function()
	{
		//create colorTexture
		this.colorTexture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, this.colorTexture );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null );

		//create positionTexture
		this.positionTexture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, this.positionTexture );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null );

		//create normalTexture
		this.normalTexture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, this.normalTexture );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null );

		//create texCoordsTexture
		this.texCoordsTexture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, this.texCoordsTexture );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null );

		//create depthTexture
		this.depthTexture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, this.depthTexture  );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null );

		this.frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer( gl.FRAMEBUFFER, this.frameBuffer );

		var buffers = [];
		buffers[0] = drawBufferExt.COLOR_ATTACHMENT0_WEBGL;
		buffers[1] = drawBufferExt.COLOR_ATTACHMENT1_WEBGL;
		buffers[2] = drawBufferExt.COLOR_ATTACHMENT2_WEBGL;
		buffers[3] = drawBufferExt.COLOR_ATTACHMENT3_WEBGL;

		drawBufferExt.drawBuffersWEBGL( buffers );

		gl.framebufferTexture2D( gl.FRAMEBUFFER, buffers[0], gl.TEXTURE_2D, this.positionTexture, 0 );
		gl.framebufferTexture2D( gl.FRAMEBUFFER, buffers[1], gl.TEXTURE_2D, this.normalTexture, 0 );
		gl.framebufferTexture2D( gl.FRAMEBUFFER, buffers[2], gl.TEXTURE_2D, this.colorTexture, 0 );
		gl.framebufferTexture2D( gl.FRAMEBUFFER, buffers[3], gl.TEXTURE_2D, this.texCoordsTexture, 0 );
		gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0 );
		
		var fboStatus = gl.checkFramebufferStatus( gl.FRAMEBUFFER );
		if( fboStatus != gl.FRAMEBUFFER_COMPLETE )
			console.log( "GL_FRAMEBUFFER_COMPLETE failed.");

		gl.bindTexture( gl.TEXTURE_2D, null );
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	}.bind(this);

	this.BindBuffer = function()
	{
		gl.bindTexture( gl.TEXTURE_2D, null );
		gl.bindFramebuffer( gl.FRAMEBUFFER, this.frameBuffer );
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		gl.enable( gl.DEPTH_TEST );
	}.bind(this);

	this.UnbindBuffer = function()
	{
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	}.bind(this);

	this.Initialize();
}

var PBuffer = function() {

	this.frameBuffer;
	this.renderBuffer;
	this.renderTargetTextures = [];

	var gl = EngineCores.Instance().Graphics.gl;
	var drawBufferExt = EngineCores.Instance().Graphics.drawBufferExt;

	var width = gl.viewportWidth;
	var height = gl.viewportHeight;

	this.Initialize = function()
	{
		var i = 0;
		for( i = 0; i < 4; i++ )
		{
			var targetTexture = gl.createTexture();
			gl.bindTexture( gl.TEXTURE_2D, targetTexture );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null );

			this.renderTargetTextures.push( targetTexture );
		}

		this.frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer( gl.FRAMEBUFFER, this.frameBuffer );

		var buffers = [];
		buffers[0] = drawBufferExt.COLOR_ATTACHMENT0_WEBGL;
		buffers[1] = drawBufferExt.COLOR_ATTACHMENT1_WEBGL;
		buffers[2] = drawBufferExt.COLOR_ATTACHMENT2_WEBGL;
		buffers[3] = drawBufferExt.COLOR_ATTACHMENT3_WEBGL;

		drawBufferExt.drawBuffersWEBGL( buffers );

		for( i = 0; i < 4; i++ )
		{
			gl.framebufferTexture2D( gl.FRAMEBUFFER, buffers[i], gl.TEXTURE_2D, this.renderTargetTextures[i], 0 );
		}

		var fboStatus = gl.checkFramebufferStatus( gl.FRAMEBUFFER );
		if( fboStatus != gl.FRAMEBUFFER_COMPLETE )
			console.log( "GL_FRAMEBUFFER_COMPLETE failed.");

		gl.bindTexture( gl.TEXTURE_2D, null );
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	}.bind(this);

	this.BindBuffer = function()
	{
		gl.bindFramebuffer( gl.FRAMEBUFFER, this.frameBuffer );
	}.bind(this);

	this.UnbindBuffer = function()
	{
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	}.bind(this);

	this.Initialize();
}