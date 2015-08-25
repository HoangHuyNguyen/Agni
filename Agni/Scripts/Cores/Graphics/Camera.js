var CCamera3D = function( name, pos )
{
	this.name = name;
	this.projectionMatrix = mat4.create();
	this.viewMatrix = mat4.create();

	this.position = pos || vec3.create();
	this.yawDeg = 0;
	this.pitchDeg = 0;
	this.rollDeg = 0;
	this.fowardDirection = vec3.create();

	var gl = EngineCores.Instance().Graphics.gl;
	var canvas = EngineCores.Instance().Graphics.canvas;
	var aspectRatio = gl.viewportWidth / gl.viewportHeight;
	var fov = DegToRad( 45 );
	this.near = 0.1;
	this.far = 3000;

	var SetupPerspectiveProjection = function()
	{
		mat4.perspective( this.projectionMatrix, fov, aspectRatio, this.near, this.far );
		mat4.rotateY( this.viewMatrix, this.viewMatrix, DegToRad( -this.yawDeg ) );
		mat4.rotateX( this.viewMatrix, this.viewMatrix, DegToRad( -this.pitchDeg ) );
		mat4.rotateZ( this.viewMatrix, this.viewMatrix, DegToRad( -this.rollDeg ) );
		var temp = vec3.fromValues( -this.position[0], -this.position[1], -this.position[2] );
		mat4.translate( this.viewMatrix, this.viewMatrix, temp );

		this.fowardDirection = vec3.fromValues( Math.sin( DegToRad( this.yawDeg ) ), 0.0, -Math.cos( DegToRad( this.yawDeg ) ) );
	}.bind(this);

	SetupPerspectiveProjection();

	this.Update = function()
	{
		mat4.identity( this.viewMatrix );
		mat4.identity( this.projectionMatrix );
		mat4.perspective( this.projectionMatrix, fov, aspectRatio, this.near, this.far );
		mat4.rotateY( this.viewMatrix, this.viewMatrix, DegToRad( -this.yawDeg ) );
		mat4.rotateX( this.viewMatrix, this.viewMatrix, DegToRad( -this.pitchDeg ) );
		mat4.rotateZ( this.viewMatrix, this.viewMatrix, DegToRad( -this.rollDeg ) );
		var temp = vec3.fromValues( -this.position[0], -this.position[1], -this.position[2] );
		mat4.translate( this.viewMatrix, this.viewMatrix, temp );

		this.fowardDirection = vec3.fromValues( Math.sin( DegToRad( this.yawDeg ) ), 0.0, -Math.cos( DegToRad( this.yawDeg ) ) );

	}.bind(this)
}

