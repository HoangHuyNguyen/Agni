var CMatrixStack = function()
{
	this.matrixStack = [];

	var Initialize = function()
	{
		var identity = mat4.create();
		mat4.identity(identity);
		this.matrixStack.push( identity );
	}

	this.GetStackTop = function()
	{
		var ret = mat4.clone( this.matrixStack[ this.matrixStack.length() - 1 ] );
		return ret;
	}

	this.ApplyMatrix = function( matrix )
	{
		var top = this.GetStackTop();
		mat4.multiply( top, top, matrix );
	}

	this.PushMatrix = function()
	{
		var top = this.GetStackTop();
		this.matrixStack.push( top );
	}

	this.PopMatrix = function()
	{
		var nearLastIndex = this.matrixStack.length - 2;
		this.matrixStack.slice( nearLastIndex, 1 );
	}

	this.ClearMatrixStack = function()
	{
		this.matrixStack = [];
	}

	Initialize();
}