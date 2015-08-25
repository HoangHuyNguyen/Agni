var Quad = function()
{
	this.buffers = { Vertex : null,
					TexCoords : null,
					Indices : null };

	this.vertices = [ -1.0, -1.0,
					  1.0, -1.0,
					 -1.0,  1.0,
					 -1.0,  1.0,
					  1.0, -1.0,
					  1.0,  1.0 ];

	this.texCoords = [ 0.0, 0.0, 
					  1.0, 0.0,
					  0.0, 1.0,
					  0.0, 1.0,
					  1.0, 0.0,
					  1.0, 1.0 ];

	this.indices = [ 0, 1, 2, 3, 4, 5 ];

	var InitBuffers = function()
	{
		this.buffers.Vertex = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.Vertex );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), gl.STATIC_DRAW );

		this.buffers.TexCoords = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.TexCoords );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.texCoords ), gl.STATIC_DRAW );

		this.buffers.Indices = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffers.Indices );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), gl.STATIC_DRAW );
	}.bind(this);
	
	this.Render = function()
	{
		gl.enableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_POSITIONS );
		gl.enableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_TEXCOORDS );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.Vertex );
		gl.vertexAttribPointer( AttributeLocation.VERTEX_ATTRIB_POSITIONS, 2, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.TexCoords );
		gl.vertexAttribPointer( AttributeLocation.VERTEX_ATTRIB_TEXCOORDS, 2, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffers.Indices );
		gl.drawElements( gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0 );
	}
	InitBuffers();
}


var CGraphicManager = ( function()
{
	var instance;
	var self = this;

	var constructor = function()
	{

		return { gl : null,
				 isLoaded : false,

				 //render option
				 renderOption : 0,

				 //registries
				 shaders : new CMap(),
				 shaderPrograms : new CMap(),
				 textures : new CMap(),
				 geometries : new CMap(),
				 graphicObjects : [],
				 cameras : new CMap(),
				 lights : [],
				 directionalLight : null,
				 enableDirLight : false,
				 FBO : new CMap(),

				 activeCamera : null,
				 canvas : null,
				 basicProgram : null,

				 //deffered rendering
				 drawBufferExt : null,
				 geoPassProgram : null,
				 lightPassProgram : null,
				 dirLightPassProgram : null,
				 ssaoProgram : null,
				 debugProgram : null,
				 blurProgram : null,
				 gBuffer : null,
				 pBuffer : null,
				 frameBuffer : null,

				 //primitives
				 Primitives : {
				 	Sphere : null,
				 },

				 //SSAO
				 SSAOBuffer : null,
				 SSAO_SampleSize : 128,
				 SSAO_Samples : [],
				 SSAO_SampleRadius : 0.05,
				 noiseTexture : null,

				 Initialize : function(){
					 				this.canvas = document.getElementById('Main');

									if( this.canvas == null )
									{
										this.canvas = document.createElement( 'canvas' );
										this.canvas.id = 'Main';
										this.canvas.className = 'Main';
										this.canvas.width = '1600';
										this.canvas.height = '900';
										document.body.appendChild( this.canvas );
									}

									this.gl = CWebGLUtils.GetWebGLContext( this.canvas );

									if( !this.gl )
									{
							    	    console.log('Failed to get the rendering context for WebGL');
							    	}

									this.gl.viewportWidth = this.canvas.width;
									this.gl.viewportHeight = this.canvas.height;

									//get webgl extension
							    	var depthTextureExt = this.gl.getExtension( "WEBKIT_WEBGL_depth_texture" ) ||
							    						  this.gl.getExtension( "WEBGL_depth_texture" );

									if( !depthTextureExt )
									{
										console.log( "Cannot get WEBKIT_WEBGL_depth_texture extension" );
									}

									var drawBuffersExt = this.gl.getExtension( "WEBGL_draw_buffers" ) ||
													     this.gl.getExtension( "GL_EXT_draw_buffers" ) ||
													     this.gl.getExtension( "EXT_draw_buffers" );

									this.drawBufferExt = drawBuffersExt;

									if (!drawBuffersExt)
  									{
    									console.log( "Cannot get WEBGL_draw_buffers extension" );
  									}

									var floatTextureExt = this.gl.getExtension( "OES_texture_float_linear" ) ||
														  this.gl.getExtension( "OES_texture_half_float_linear" ) ||
														  this.gl.getExtension( "WEBGL_color_buffer_float" ) ||
														  this.gl.getExtension( "EXT_color_buffer_half_float" );

									if (!floatTextureExt)
  									{
    									console.log( "Cannot get WEBGL_color_buffer_float extension" );
  									}

									var floatExt = this.gl.getExtension("OES_texture_float");

									if (!floatExt )
  									{
    									console.log( "Cannot get WES_texture_float extension" );
  									}


							    	this.Primitives.Sphere = new CObject( 'Sphere' );
							    	this.Primitives.Sphere.AddModel( './Data/Model/sphere.json' );

							    	this.basicProgram = new CShaderProgram( "Basic", "./Shader/BasicShader.vert", "./Shader/BasicShader.frag" );

							    	gBuffer = new GBuffer();
							    	pBuffer = new PBuffer();
							    	this.frameBuffer = new PBuffer();
							    	SSAOBuffer = new PBuffer();

							    	dirLightPassProgram = new CShaderProgram( "Direction Light Pass", "./Shader/DirLightPassShader.vert", "./Shader/DirLightPassShader.frag" );
							    	geoPassProgram = new CShaderProgram( "Geometry Pass", "./Shader/GeometryPassShader.vert", "./Shader/GeometryPassShader.frag" );
							    	lightPassProgram = new CShaderProgram( "Light Pass", "./Shader/LightPassShader.vert", "./Shader/LightPassShader.frag" );
							    	debugProgram = new CShaderProgram( "Debug", "./Shader/DebugShader.vert", "./Shader/DebugShader.frag" );
							    	ssaoProgram = new CShaderProgram( "SSAO", "./Shader/SSAOShader.vert", "./Shader/SSAOShader.frag" );
							    	blurProgram = new CShaderProgram( "Blur", "./Shader/BlurShader.vert", "./Shader/BlurShader.frag" );
					
							    	noiseTexture = new CTexture( "./Data/Texture/ssaoNoise.jpg" );

							    	//generate sample points for SSAO
							    	for( var i = 0; i < this.SSAO_SampleSize; i++ )
							    	{
							    		var pos = vec3.fromValues( rand( -1.0, 1.0 ), rand( -1.0, 1.0 ), rand( 0.0, 1.0 ) );
							    		vec3.normalize( pos, pos );

							    		var scale = i / this.SSAO_SampleSize;
							    		scale = lerp( 0.1, 1.0, scale * scale );
							    		//vec3.scale( pos, pos, 0.1 + 0.9 * scale * scale );
							    		this.SSAO_Samples.push( pos[0] );
							    		this.SSAO_Samples.push( pos[1] );
							    		this.SSAO_Samples.push( pos[2] );
							    	}

				 },

				 AddCamera : function( camera ){
				 		this.cameras.put( camera.name, camera );
				 		this.activeCamera = camera;
				 },

				 AddObject : function( object ){
				 		this.graphicObjects.push( object );
				 },

				 AddPointLight : function( light ){
				 		this.lights.push( light );
				 },

				 AddDirectionalLight : function( light ){
				 		this.directionalLight = light;
				 },

				 AddShaderProgram : function( name, vs, fs ){
					 	if( this.shaderPrograms.get( name ) === undefined )
					 	{
					 		program = new CShaderProgram( name, vs, fs );
					 	}
				 },

				 GetFBO : function( name )
				 {
				 	return this.FBO.get( name );
				 },

				 GetShaderProgram : function( name )
				 {
				 	return this.shaderPrograms.get( name );
				 },

				 AddTextures : function(){

				 },

				 ApplyLightsToShader : function( shader ){
 						var lightPositions = [];
 						var lightColorAndBrightness = [];

 						for( var i = 0; i < this.lights.length * 3; i++ )
 						{
 							lightPositions.push( this.lights[i].position[0] );
 							lightPositions.push( this.lights[i].position[1] );
 							lightPositions.push( this.lights[i].position[2] );
 						}

 						for( var j = 0; j < this.lights.length * 4; i++ )
 						{
 							lightColorAndBrightness.push( this.lights[i].colorAndBrightness[0] );
 							lightColorAndBrightness.push( this.lights[i].colorAndBrightness[1] );
 							lightColorAndBrightness.push( this.lights[i].colorAndBrightness[2] );
 							lightColorAndBrightness.push( this.lights[i].colorAndBrightness[3] );
 						}
 						
						shader.UseProgram();

						var lightPositionUniformLoc = this.gl.getUniformLocation( shader.shaderProgram, "u_lightPositions" );
						var lightColorAndBrightnessLoc = this.gl.getUniformLocation( shader.shaderProgram, "u_lightColorsAndBrightness" );

						this.gl.uniform3fv( lightPositionUniformLoc, lightPositions );
						this.gl.uniform4fv( lightColorAndBrightnessLoc, lightColorAndBrightness );
				 },

				 RenderScene : function()
				 {
				 	//Geometry Pass
				 	gBuffer.BindBuffer();
				 	gl.enable( gl.DEPTH_TEST );
				 	gl.depthMask( true );
				 	gl.clearDepth( 1.0 );
				 	gl.clearColor( 0.0, 0.0, 0.0, 1.0);
				 	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
				 	gl.enable( gl.BLEND );
				 	gl.blendEquation( gl.FUNC_ADD );
				 	gl.blendFunc( gl.ONE, gl.ZERO );

				 	for( var i = 0; i < this.graphicObjects.length; i++ )
				 	{
				 		this.graphicObjects[i].Render( geoPassProgram );
				 	}
				 	gBuffer.UnbindBuffer();

				 	gl.bindTexture( gl.TEXTURE_2D, null );

				 	//SSAO pass
				 	var quad = new Quad();
				 	SSAOBuffer.BindBuffer();
				 	//gl.enable( gl.DEPTH_TEST );
				 	ssaoProgram.UseProgram();

					ssaoProgram.SetUniformValueByName( "u_projectionMatrix",    this.activeCamera.projectionMatrix );
					ssaoProgram.SetUniformValueByName( "u_viewMatrix",    		this.activeCamera.viewMatrix );
					ssaoProgram.SetUniformValueByName( "u_sampleRadius",        this.SSAO_SampleRadius );

					var sampleArrayUniformLoc = this.gl.getUniformLocation( ssaoProgram.shaderProgram, "u_samplePosition" );
					this.gl.uniform3fv( sampleArrayUniformLoc, this.SSAO_Samples );

					ssaoProgram.SetUniformValueByName( "u_nearFarPlane", vec2.fromValues( this.activeCamera.near, this.activeCamera.far ) );
					ssaoProgram.SetUniformValueByName( "u_noiseScale", vec2.fromValues( this.gl.viewportWidth / 64, this.gl.viewportHeight / 64 ) );

					ssaoProgram.SetUniformValueByName( "u_positionTexture", 	0 );
    				ssaoProgram.SetUniformValueByName( "u_normalTexture",   	1 );
    				ssaoProgram.SetUniformValueByName( "u_viewPositionTexture",	2 );
    				ssaoProgram.SetUniformValueByName( "u_noiseTexture",   		3 );
    				ssaoProgram.SetUniformValueByName( "u_depthTexture",    	4 );

    				ssaoProgram.SendUniformValuesToShader();

					gl.activeTexture( gl.TEXTURE0 );
					gl.bindTexture( gl.TEXTURE_2D, gBuffer.positionTexture );

					gl.activeTexture( gl.TEXTURE0 + 1 );
					gl.bindTexture( gl.TEXTURE_2D, gBuffer.normalTexture );

					gl.activeTexture( gl.TEXTURE0 + 2 );
					gl.bindTexture( gl.TEXTURE_2D, gBuffer.texCoordsTexture );

					gl.activeTexture( gl.TEXTURE0 + 3 );
					gl.bindTexture( gl.TEXTURE_2D, noiseTexture.texture );

					gl.activeTexture( gl.TEXTURE0 + 4 );
					gl.bindTexture( gl.TEXTURE_2D, gBuffer.depthTexture );

					quad.Render();

				 	SSAOBuffer.UnbindBuffer();

				 	//blur ssao pass
				 	this.frameBuffer.BindBuffer();
				 	gl.clearColor( 0.0, 0.0, 0.0, 1.0);
				 	gl.clear( gl.COLOR_BUFFER_BIT );
				 	blurProgram.UseProgram();

				 	blurProgram.SetUniformValueByName( "u_blurTexture", 0 );
				 	blurProgram.SetUniformValueByName( "u_textureSize", vec2.fromValues( this.gl.viewportWidth, this.gl.viewportHeight ) );

				 	blurProgram.SendUniformValuesToShader();

				 	gl.activeTexture( gl.TEXTURE0 );
					gl.bindTexture( gl.TEXTURE_2D, SSAOBuffer.renderTargetTextures[0] );

					quad.Render();

				 	this.frameBuffer.UnbindBuffer();

				 	//Light pass
				 	//point light pass
				 	pBuffer.BindBuffer();
				 	gl.disable( gl.DEPTH_TEST );
				 	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
				 	gl.clear( gl.COLOR_BUFFER_BIT );
				 	gl.depthMask( false );

				 	gl.enable( gl.BLEND );
				 	gl.blendEquation( gl.FUNC_ADD );
				 	gl.blendFunc( gl.ONE, gl.ONE );
	
					gl.enable( gl.CULL_FACE );
					gl.cullFace( gl.FRONT );

				 	var i = 0;

				 	lightPassProgram.UseProgram();
				 	lightPassProgram.SetUniformValueByName( "u_positionTexture", 0 );
    				lightPassProgram.SetUniformValueByName( "u_normalTexture",   1 );
    				lightPassProgram.SetUniformValueByName( "u_colorTexture",    2 );
    				lightPassProgram.SetUniformValueByName( "u_ssaoTexture",     3 );

    				lightPassProgram.SetUniformValueByName( "u_viewMatrix", 		      this.activeCamera.viewMatrix );
					lightPassProgram.SetUniformValueByName( "u_projectionMatrix", 		  this.activeCamera.projectionMatrix );

					var screenSize = vec2.fromValues( this.gl.viewportWidth, this.gl.viewportHeight );
					lightPassProgram.SetUniformValueByName( "u_screenSize",  			  screenSize );
					lightPassProgram.SetUniformValueByName( "u_cameraPosition",		  	  this.activeCamera.position );
					lightPassProgram.SetUniformValueByName( "u_renderingOption",		  this.renderOption );

				 	for( i = 0; i < this.lights.length; i++ )
				 	{
				 		var light = this.lights[i];
				 		lightPassProgram.SetUniformValueByName( "u_lightPosition", 			  light.position );
				 		var toWorld = mat4.create();
				 		var scale = vec3.fromValues( light.boundingSphereRadius, light.boundingSphereRadius, light.boundingSphereRadius );
				 		mat4.translate( toWorld, toWorld, light.position );
				 		mat4.scale( toWorld, toWorld, scale );

	
				 		lightPassProgram.SetUniformValueByName( "u_modelMatrix",  			  toWorld );
				 		lightPassProgram.SetUniformValueByName( "u_lightColorsAndBrightness", light.colorAndBrightness );
				 		var attenuation = vec3.fromValues( light.Attenuation.Constant, light.Attenuation.Linear, light.Attenuation.Exp );
				 		lightPassProgram.SetUniformValueByName( "u_lightAttenuation", 		  attenuation );
				 		lightPassProgram.SetUniformValueByName( "u_lightAmbientness", 		  light.ambientness );
				 		lightPassProgram.SetUniformValueByName( "u_lightSpecularity",		  light.specularity );

				 		lightPassProgram.SendUniformValuesToShader();

	    				gl.activeTexture( gl.TEXTURE0 );
						gl.bindTexture( gl.TEXTURE_2D, gBuffer.positionTexture );

						gl.activeTexture( gl.TEXTURE0 + 1 );
						gl.bindTexture( gl.TEXTURE_2D, gBuffer.normalTexture );

						gl.activeTexture( gl.TEXTURE0 + 2 );
						gl.bindTexture( gl.TEXTURE_2D, gBuffer.colorTexture );

						gl.activeTexture( gl.TEXTURE0 + 3 );
						gl.bindTexture( gl.TEXTURE_2D, this.frameBuffer.renderTargetTextures[0] );

						this.Primitives.Sphere.Render( lightPassProgram, true, true );
				 	}

				 	pBuffer.UnbindBuffer();

				 	if( this.directionalLight && this.enableDirLight )
				 	{
				 		// directional light pass
					 	pBuffer.BindBuffer();
					 	gl.cullFace( gl.BACK );
					 	gl.disable( gl.DEPTH_TEST );
					 	gl.enable( gl.BLEND );
					 	gl.blendEquation( gl.FUNC_ADD );
					 	gl.blendFunc( gl.ONE, gl.ONE );

					 	dirLightPassProgram.UseProgram();

					 	dirLightPassProgram.SetUniformValueByName( "u_positionTexture", 0 );
	    				dirLightPassProgram.SetUniformValueByName( "u_normalTexture",   1 );
	    				dirLightPassProgram.SetUniformValueByName( "u_colorTexture",    2 );
	    				dirLightPassProgram.SetUniformValueByName( "u_ssaoTexture",     3 );

	    				dirLightPassProgram.SetUniformValueByName( "u_viewMatrix", 		      mat4.create() );
						dirLightPassProgram.SetUniformValueByName( "u_projectionMatrix", 	  mat4.create() );
						dirLightPassProgram.SetUniformValueByName( "u_modelMatrix", 		  mat4.create() );

						dirLightPassProgram.SetUniformValueByName( "u_screenSize",  		  screenSize );
						dirLightPassProgram.SetUniformValueByName( "u_cameraPosition",		  this.activeCamera.position );
						dirLightPassProgram.SetUniformValueByName( "u_renderingOption",		  this.renderOption );

						dirLightPassProgram.SetUniformValueByName( "u_lightColorsAndBrightness", this.directionalLight.colorAndBrightness );
					 	dirLightPassProgram.SetUniformValueByName( "u_lightAmbientness", 		 this.directionalLight.ambientness );
					 	dirLightPassProgram.SetUniformValueByName( "u_lightSpecularity",		 this.directionalLight.specularity );

					 	dirLightPassProgram.SendUniformValuesToShader();

		    			gl.activeTexture( gl.TEXTURE0 );
						gl.bindTexture( gl.TEXTURE_2D, gBuffer.positionTexture );

						gl.activeTexture( gl.TEXTURE0 + 1 );
						gl.bindTexture( gl.TEXTURE_2D, gBuffer.normalTexture );

						gl.activeTexture( gl.TEXTURE0 + 2 );
						gl.bindTexture( gl.TEXTURE_2D, gBuffer.colorTexture );

						gl.activeTexture( gl.TEXTURE0 + 3 );
						gl.bindTexture( gl.TEXTURE_2D, this.frameBuffer.renderTargetTextures[0] );

						quad.Render();

						pBuffer.UnbindBuffer();
				 	}


				 	//final pass
					gl.cullFace( gl.BACK );
					gl.depthMask( true );
					gl.enable( gl.DEPTH_TEST );
					gl.disable( gl.BLEND );
					gl.bindTexture( gl.TEXTURE_2D, null );

					debugProgram.UseProgram();
					gl.clearColor( 1.0, 1.0, 1.0, 1.0);
    				gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

					debugProgram.SetUniformValueByName( "u_positionTexture", 0 );
    				debugProgram.SetUniformValueByName( "u_normalTexture",   1 );
    				debugProgram.SetUniformValueByName( "u_colorTexture",    2 );
    				debugProgram.SetUniformValueByName( "u_depthTexture",    3 );

    				debugProgram.SendUniformValuesToShader();

    				gl.activeTexture( gl.TEXTURE0 );
					gl.bindTexture( gl.TEXTURE_2D, pBuffer.renderTargetTextures[0] );

					gl.activeTexture( gl.TEXTURE0 + 1 );
					gl.bindTexture( gl.TEXTURE_2D, SSAOBuffer.renderTargetTextures[0] );

					gl.activeTexture( gl.TEXTURE0 + 2 );
					gl.bindTexture( gl.TEXTURE_2D, gBuffer.texCoordsTexture );

					gl.activeTexture( gl.TEXTURE0 + 3 );
					gl.bindTexture( gl.TEXTURE_2D, this.frameBuffer.renderTargetTextures[0] );

					quad.Render();
				 }
			 	};
	}
	return {
		Instance : function()
		{
			if( !instance )
			{
				instance = constructor();
			}
			return instance;
		}
	};

})();

