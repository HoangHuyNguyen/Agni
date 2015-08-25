var CLight = function( position, colorAndBrightness, ambientness, specularity )
{
	this.position = position || vec3.create();
	this.colorAndBrightness = colorAndBrightness || vec4.create();
	this.ambientness = ambientness || 1;
	this.specularity = specularity || 1;
	this.originPosition = position;
	
	this.vertices = [ -1.0, 1.0,-1.0,
					   1.0,-1.0, 1.0,
					   1.0, 1.0, 1.0,
					  -1.0,-1.0,-1.0,
					  -1.0, 1.0, 1.0,
					   1.0,-1.0,-1.0,
					   1.0, 1.0,-1.0,
					  -1.0,-1.0, 1.0 ];

	this.indices = [ 0, 1, 2, 3, 4, 5, 6, 7 ];

	this.buffers =  {
		Vertices: null,
		Indices: null,
	}
}

CLight.prototype.Visualize = function( scale ){

	var gl = EngineCores.Instance().Graphics.gl;
	var shaderProgram = EngineCores.Instance().Graphics.basicProgram;

	if( !shaderProgram )
		return 0;

	this.buffers.Vertices = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.Vertices );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.vertices ), gl.STATIC_DRAW );

	this.buffers.Indices = gl.createBuffer();
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffers.Indices );
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.indices ), gl.STATIC_DRAW );

	shaderProgram.UseProgram();

	var modelMatrix = mat4.create();

	if( scale )
	{
		var scaleVec3 = vec3.fromValues( scale, scale, scale );
		mat4.scale( modelMatrix, modelMatrix, scaleVec3 );
	}

	mat4.translate( modelMatrix, modelMatrix, this.position );

	shaderProgram.SetUniformValueByName( "u_modelMatrix", modelMatrix );
	shaderProgram.SetUniformValueByName( "u_viewMatrix", EngineCores.Instance().Graphics.activeCamera.viewMatrix );
	shaderProgram.SetUniformValueByName( "u_projectionMatrix", EngineCores.Instance().Graphics.activeCamera.projectionMatrix );
	shaderProgram.SetUniformValueByName( "u_color", this.colorAndBrightness );
	shaderProgram.SendUniformValuesToShader();

	gl.enableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_POSITIONS );

	gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.Vertices );
    gl.vertexAttribPointer( AttributeLocation.VERTEX_ATTRIB_POSITIONS , 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffers.Indices );
    gl.drawElements( gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0 );

    gl.disableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_POSITIONS );

	shaderProgram.DisableProgram();
}

var CPointLight = function( position, colorAndBrightness, ambientness, specularity, attenuation )
{
	CLight.call( this, position, colorAndBrightness, ambientness, specularity );
	this.Attenuation = {
		Constant : attenuation ? attenuation[0] : 0,
		Linear : attenuation ? attenuation[1] : 0,
		Exp : attenuation ? attenuation[2] : 1,
	};

	var C = Math.max( this.colorAndBrightness[0], this.colorAndBrightness[1], this.colorAndBrightness[2] );
	this.boundingSphereRadius =  -this.Attenuation.Linear +
								 Math.sqrt( this.Attenuation.Linear * this.Attenuation.Linear - 4 * this.Attenuation.Exp * ( this.Attenuation.Constant - 256 * C * this.colorAndBrightness[3]) );
	this.boundingSphereRadius /= 2 * this.Attenuation.Exp;
	//this.boundingSphere *= 100;
	//this.boundingSphereRadius = 300;
}

CPointLight.prototype = new CLight();
CPointLight.constructor = CPointLight;

var CDirLight = function( position, colorAndBrightness, ambientness, specularity, direction )
{
	CLight.call( this, position, colorAndBrightness, ambientness, specularity );
	this.direction = direction || vec3.fromValues( 0.0, -1.0, 0.0 );
}

CDirLight.prototype = new CLight();
CDirLight.constructor = CDirLight;