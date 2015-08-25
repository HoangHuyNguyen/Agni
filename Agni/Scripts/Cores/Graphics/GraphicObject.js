var CObject = function( name, position, rotation, scale, color )
{
	var self = this;
	this.name = name;
	this.position = position || vec3.create();
	this.rotation = rotation || vec3.create();
	this.scale = scale || vec3.fromValues( 1.0, 1.0, 1.0 );
	this.Graphics = {};
	this.AI;
	this.Physics;
//	EngineCores.Instance().Graphics.graphicObjects.push( self );

	this.AddModel = function( url )
	{
		self.Graphics.Model = new CModel( name, url, this.position, this.rotation, this.scale );
	};

	this.Render = function( shaderProgram, disableTexture, isBoundingSphere )
	{
		if( self.Graphics.Model.loaded )
			self.Graphics.Model.Render( shaderProgram, disableTexture, isBoundingSphere );
		else
			console.log( "Model does not finish loading yet.");
	};

    this.RotateY = function( deg )
    {
		self.Graphics.Model.RotateYDegree( deg );
	};
			 
	this.IsLoaded = function()
	{
		return self.Graphics.Model.loaded;
	};
}

var CFace = function()
{
	// index of vertices]
	this.numVertex;
	this.vertexIndex1;
	this.vertexIndex2;
	this.vertexIndex3;
	this.vertexIndex4;
	this.normal;
	this.colorIndex;
	this.vertexNormals = [];
	this.vertexColors = [];
	this.vertexTangent = [];
	this.materialIndex = 0;
}

var CMaterial = function( name )
{
	this.name = name;
	this.diffuseTexture;
	this.normalTexture;
	this.specularTexture;
	this.emissiveTexture;
}

var CGeometry = function( name )
{
	this.name = name;
	this.vertices = [];
	this.normals = [];
	this.colors = [];
	this.indices = [];
	this.faces = [];
	this.texCoords = [[]];
	this.faceTexCoords = [[]];
	this.faceVertexTexCoords = [[]];
	this.materials = [];
}

CGeometry.prototype.indicesFromFace = function(){
	for( var i = 0; i < this.faces.length; i++ )
	{
		this.indices.push( this.faces[i].vertexIndex1 );
		this.indices.push( this.faces[i].vertexIndex2 );
		this.indices.push( this.faces[i].vertexIndex3 );
	}
}

CGeometry.prototype.verticesFromFaceTexCoords = function( vertices, texCoords, materialIndex ){
	var vertexPos = [];
	var repeatVertexVectors = [];

	for( var i = 0; i < vertices.length; i = i + 3 )
	{
		var pos = vec3.fromValues( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] );
		vertexPos.push(pos); 
	}

	for( var i = 0; i < this.faceVertexTexCoords[ materialIndex ].length; i++ )
	{
		var face = this.faces[i];
		var textureIndices = this.faceVertexTexCoords[ materialIndex ][ i ];
		var aVertexIndices = [ "vertexIndex1","vertexIndex2","vertexIndex3" ];
		for( var j = 0; j < 3; j++ )
		{
			var vertexIndex = aVertexIndices[j];
			if( repeatVertexVectors[textureIndices[ j ]] == face[ vertexIndex ] || 
				repeatVertexVectors[textureIndices[ j ]] === undefined )
			{
				repeatVertexVectors[textureIndices[ j ]] = face[ vertexIndex ];
				face[ vertexIndex ] = textureIndices[ j ];
			}
			else
			{
				texCoords[materialIndex].push( texCoords[ materialIndex ][ textureIndices[ j ] * 2 ] );
				texCoords[materialIndex].push( texCoords[ materialIndex ][ textureIndices[ j ] * 2 + 1 ] );
				var newIndex = Math.floor( texCoords[ materialIndex ].length / 2 ) - 1;
				repeatVertexVectors[ newIndex ] = face[ vertexIndex ];
				face[ vertexIndex ] = newIndex;
				textureIndices[ j ] = newIndex;
			}
		}
	}

	for( var i = 0; i < repeatVertexVectors.length; i++ )
	{
		var temp = vertexPos[ repeatVertexVectors[i] ];
		this.vertices.push( temp[0] );
		this.vertices.push( temp[1] );
		this.vertices.push( temp[2] );
	}
	this.texCoords = texCoords;
}

CGeometry.prototype.CalculateVertexNormals = function()
{
	var vertexVectors = [];
	var normalVectors = [];
	var i = 0;

	for( i = 0; i < this.vertices.length; i += 3 )
	{
		var vertex = vec3.fromValues( this.vertices[i], this.vertices[ i + 1 ], this.vertices[ i + 2 ] );
		vertexVectors.push( vertex );
		normalVectors.push( vec3.create() );
	}

	for( i = 0; i < this.indices.length; i += 3 )
	{
		var v1 = vec3.create();
		vec3.subtract( v1, vertexVectors[ this.indices[ i + 1 ] ], vertexVectors[ this.indices[ i ] ] );

		var v2 = vec3.create();

		vec3.subtract( v2, vertexVectors[ this.indices[ i + 2 ] ], vertexVectors[ this.indices[ i + 1 ] ] );

		var normal = vec3.create();

		vec3.cross( normal, v1, v2 );

		vec3.add( normalVectors[ this.indices[ i ] ], normalVectors[ this.indices[ i ] ], normal ); 
		vec3.add( normalVectors[ this.indices[ i + 1 ] ], normalVectors[ this.indices[ i + 1 ] ], normal ); 
		vec3.add( normalVectors[ this.indices[ i + 2 ] ], normalVectors[ this.indices[ i + 2 ] ], normal ); 
	}
	
	for( i = 0; i < normalVectors.length; i++ )
	{
		vec3.normalize( normalVectors[i], normalVectors[i] );
		this.normals.push( normalVectors[i][ 0 ] );
		this.normals.push( normalVectors[i][ 1 ] );
		this.normals.push( normalVectors[i][ 2 ] );
	}
}

CGeometry.prototype.MorphVertexNormals = function()
{
	var i = 0;
	var j = 0;
	var normalVectors = [];

	for( i = 0; i < this.faces.length; i++ )
	{
		// if face normal is defined and normal for each vertex is not defined
		var face = this.faces[ i ];
		if( face.normal !== undefined && face.vertexNormals.length == 0 )
		{
			for( var j = 0; j < face.numVertex; j++ )
			{
				face.vertexNormals[j] = vec3.clone( face.normal );
			}
		}

		//if each vertex normal is defined
		var properties = [ "vertexIndex1", "vertexIndex2", "vertexIndex3", "vertexIndex4" ];

		for( j = 0; j < face.numVertex; j++ )
		{
			var vertexProperty = properties[j];

			if( normalVectors[ face[ vertexProperty ] ]  === undefined )
			{
				normalVectors[ face[ vertexProperty ] ] = vec3.clone( face.vertexNormals[j] );
			}
			else
			{
				vec3.add( normalVectors[ face[ vertexProperty ] ], normalVectors[ face[ vertexProperty ] ], face.vertexNormals[j] );
			}
		}

	}
	
	for( i = 0; i < normalVectors.length; i++ )
	{
		vec3.normalize( normalVectors[i], normalVectors[i] );
		this.normals.push( normalVectors[i][0] );
		this.normals.push( normalVectors[i][1] );
		this.normals.push( normalVectors[i][2] );
	}
}

var CModel = function( modelName, url, position, rotation, scale, color )
{
	this.name = modelName;
	this.position = position || vec3.create();
	this.color = color || vec4.fromValues( 1, 1, 1, 1 );
	this.url = url;
	this.diffuseMap = null;
	this.geometry = null;

	this.yawDeg = ( rotation !== undefined ) ? rotation[2] : 0;
	this.scale = scale || vec3.fromValues( 1, 1, 1 ) ;

	this.Matrix = {
		ToWorld : mat4.create(),
		Translate : mat4.create(),
		Scale : mat4.create(),
		Rotation : mat4.create(),
		RotateX : mat4.create(),
		RotateY : mat4.create(),
		RotateZ : mat4.create()
	};

	this.shaders = new CMap();
	this.activeShader = null;
	this.onLoad = null;
	this.loaded = false;

	this.buffers = {
		Vertex : null,
		TexCoords : null,
		Normals : null,
		Indices : null
	};

	this.LoadModel = function()
	{
		var xhr = new XMLHttpRequest();

		xhr.open('GET', url, true);
	
		xhr.onreadystatechange = function()
		{
			if( xhr.readyState === 4 && xhr.status !== 404 )
			{
				if( xhr.status === 200 || xhr.status === 0 )
				{					
					if( this.onLoad )
					{
						this.onLoad();
					}

					var modelData = JSON.parse( xhr.responseText );
					this.geometry = CreateOrLoadGeometryFromEngineCore( modelData );
					this.InitTexture();
					this.loaded = true;
					console.log( "Finsing loading " + this.name );
					//this.Render( testShader );
				}
			}
		}.bind(this);
		xhr.send();
	}.bind(this);

	this.LoadModel();
}

CModel.prototype.RotateYDegree = function( deg )
{
	//mat4'
	this.yawDeg += deg;
	mat4.identity( this.Matrix.RotateY );
	mat4.rotateY( this.Matrix.RotateY , this.Matrix.RotateY, DegToRad( this.yawDeg ) );
}

CModel.prototype.BuildTransformationMatrix = function()
{
	mat4.identity( this.Matrix.ToWorld );
	mat4.translate( this.Matrix.ToWorld, this.Matrix.ToWorld, this.position );
	mat4.rotateY( this.Matrix.ToWorld, this.Matrix.ToWorld, DegToRad( this.yawDeg ) );
	mat4.scale( this.Matrix.ToWorld, this.Matrix.ToWorld, this.scale );
}

CModel.prototype.Render = function( shaderProgram, disableTexture, isBoundingSphere )
{
	var disableTex = false || disableTexture;
	var boundingSphere = false || isBoundingSphere;

	if( this.name === 'table' )
		var  k = 0;

	var gl = EngineCores.Instance().Graphics.gl;
	this.InitBuffers();
	this.BuildTransformationMatrix();

/*	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ); */
    if( !isBoundingSphere )
    	gl.enable( gl.DEPTH_TEST );
    else
    	gl.disable( gl.DEPTH_TEST );

	shaderProgram.UseProgram();

	if( !isBoundingSphere )
	{
		var mvMatrix = mat4.create();
		mat4.multiply( mvMatrix, EngineCores.Instance().Graphics.activeCamera.viewMatrix, this.Matrix.ToWorld );
		var invertMatrix = mat4.create();
		mat4.invert( invertMatrix, mvMatrix );
		var normalMatrix = mat4.create();
		mat4.transpose( normalMatrix, invertMatrix );

		shaderProgram.SetUniformValueByName( "u_normalMatrix", normalMatrix );
		shaderProgram.SetUniformValueByName( "u_color",  this.color );
		shaderProgram.SetUniformValueByName( "u_viewMatrix", EngineCores.Instance().Graphics.activeCamera.viewMatrix );
		shaderProgram.SetUniformValueByName( "u_projectionMatrix", EngineCores.Instance().Graphics.activeCamera.projectionMatrix );
		shaderProgram.SetUniformValueByName( "u_modelMatrix",  this.Matrix.ToWorld );
	}

	if( this.diffuseMap.texture && !isBoundingSphere )
		shaderProgram.SetUniformValueByName( "u_diffuseTexture", 5 );

	if( !isBoundingSphere )
		shaderProgram.SendUniformValuesToShader();

	if( this.diffuseMap.texture && !disableTex )
	{
		gl.activeTexture( gl.TEXTURE0 + 5 );
		gl.bindTexture( gl.TEXTURE_2D, this.diffuseMap.texture );
	}

	gl.enableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_POSITIONS );
	if( !disableTexture )
		gl.enableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_TEXCOORDS );

	gl.enableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_NORMALS );

	gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.Vertex );
    gl.vertexAttribPointer( AttributeLocation.VERTEX_ATTRIB_POSITIONS , this.buffers.Vertex.itemSize, gl.FLOAT, false, 0, 0 );

	if( !disableTexture )
	{
		gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.TexCoords );
    	gl.vertexAttribPointer( AttributeLocation.VERTEX_ATTRIB_TEXCOORDS , this.buffers.TexCoords.itemSize, gl.FLOAT, false, 0, 0 );
	}

    gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.Normals );
    gl.vertexAttribPointer( AttributeLocation.VERTEX_ATTRIB_NORMALS, this.buffers.Normals.itemSize, gl.FLOAT, false, 0, 0 );
    
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffers.Indices );
    gl.drawElements( gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0 );

    gl.disableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_POSITIONS );
    gl.disableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_TEXCOORDS );
    gl.disableVertexAttribArray( AttributeLocation.VERTEX_ATTRIB_NORMALS );

    shaderProgram.DisableProgram();

    gl.bindTexture( gl.TEXTURE_2D, null );
}

CModel.prototype.InitTexture = function(){
	//this.diffuseMap = new CTexture( "./Data/Texture/boxDiffuse.jpg" )

	if( this.geometry.materials )
	{
		if( this.geometry.materials[0].mapDiffuse )
		{
			var filepath = './Data/Texture/' + this.geometry.materials[0].mapDiffuse;
			this.diffuseMap = new CTexture( filepath );
		}
		else
		{
			var filepath = './Data/Texture/default.png';
			this.diffuseMap = new CTexture( filepath );
		}
	}
}

CModel.prototype.InitBuffers = function(){
	var gl = EngineCores.Instance().Graphics.gl;

	this.buffers.Vertex = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.Vertex );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.geometry.vertices ), gl.STATIC_DRAW );
	this.buffers.Vertex.itemSize = 3;
	this.buffers.Vertex.numItems = this.geometry.vertices.length / 3;

	this.buffers.TexCoords = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.TexCoords );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.geometry.texCoords[0] ), gl.STATIC_DRAW );
	this.buffers.TexCoords.itemSize = 2;
	this.buffers.TexCoords.numItems = this.geometry.texCoords[0].length / 2;

	this.buffers.Normals = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, this.buffers.Normals );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( this.geometry.normals ), gl.STATIC_DRAW );
	this.buffers.Normals.itemSize = 3;
	this.buffers.Normals.numItems = this.geometry.normals.length / 3;

	this.buffers.Indices = gl.createBuffer();
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffers.Indices );
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.geometry.indices ), gl.STATIC_DRAW );
	this.buffers.Indices.itemSize = 1;
	this.buffers.Indices.numItems = this.geometry.indices.length;

}

function CreateOrLoadGeometryFromEngineCore( data )
{
	var geometry;

	var string = data.metadata.sourceFile.split(".");
	name = string[0];

	var geometry = EngineCores.Instance().Graphics.geometries.get( name );

	if( geometry !== undefined )
	  return geometry;

 	geometry = new CGeometry();

	var vertices;
	var faces;
	var colors;
	var normals;
	var materials;
	var texCoords;
	var name;

	// $.getJSON( url, function( data ){
	//geometry.vertices = data.vertices;
	vertices = data.vertices;
	colors = data.colors;
	normals = data.normals;
	materials = data.materials;
	faces = data.faces;
	texCoords = data.uvs;

	var offset = 0;
	var isQuad, hasMaterial, hasFaceUV, hasFaceVertexUV, hasFaceNormal, 
		hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor,
		colorIndex, normalIndex, texCoordsIndex;

	var numVertices = 0;
	var numUVLayers = 0;
	var i,j = 0;

	for( i = 0; i < texCoords.length; i++ )
	{
		if( texCoords[i].length )
			numUVLayers++;
	}

	for( i = 0; i < numUVLayers; i++ )
	{
		geometry.faceTexCoords[ i ] = [];
		geometry.faceVertexTexCoords[ i ] = [];
	}

	while( offset < faces.length )
	{
		var type = faces[ offset++ ];
		isQuad 				= isBitSet( type, 0 );
		hasMaterial 		= isBitSet( type, 1 );
		hasFaceUV 			= isBitSet( type, 2 );
		hasFaceVertexUV		= isBitSet( type, 3 );
		hasFaceNormal		= isBitSet( type, 4 );
		hasFaceVertexNormal = isBitSet( type, 5 );
		hasFaceColor 		= isBitSet( type, 6 );
		hasFaceVertexColor  = isBitSet( type, 7 );

		var face = new CFace();

		if( isQuad )
		{
			face.vertexIndex1 = faces[ offset++ ];
			face.vertexIndex2 = faces[ offset++ ];
			face.vertexIndex3 = faces[ offset++ ];
			face.vertexIndex4 = faces[ offset++ ];
			numVertices = 4;
			face.numVertex = 4;
		}
		else
		{
			face.vertexIndex1 = faces[ offset++ ];
			face.vertexIndex2 = faces[ offset++ ];
			face.vertexIndex3 = faces[ offset++ ];
			numVertices = 3;
			face.numVertex = 3;
		}

		if( hasMaterial )
		{
			face.materialIndex = faces[ offset++ ];
		}

		var currentFaceIndex = geometry.faces.length;
		var uvLayerNum;
		var layer;

		if( hasFaceUV )
		{
			for( layer = 0; layer < numUVLayers; layer++ )
			{
				texCoordsIndex = faces[ offset++ ];
				geometry.faceTexCoords[ layer ][ currentFaceIndex ] = texCoordsIndex;
			}
		}

		if( hasFaceVertexUV )
		{
			for( layer = 0; layer < numUVLayers; layer++ )
			{
				var uvs = [];
				for( j = 0; j < numVertices; j++ )
				{
					texCoordsIndex = faces[ offset++ ];
					uvs[j] = texCoordsIndex; 
				}
				geometry.faceVertexTexCoords[ layer ][ currentFaceIndex ] = uvs;
			}
		}

		var normal;
		if( hasFaceNormal )
		{
			normalIndex = faces[ offset++ ] * 3;
			//face.normalIndex = normalIndex;
			normal = vec3.fromValues( normals[ normalIndex ], normals[ normalIndex + 1 ], normals[ normalIndex + 2 ] );
			face.normal = normal;
		}

		if( hasFaceVertexNormal )
		{
			for( i = 0; i < numVertices; i++ )
			{
				normalIndex = faces[ offset++ ] * 3;
				normal = vec3.fromValues( normals[ normalIndex ], normals[ normalIndex + 1 ], normals[ normalIndex + 2 ] );
				face.vertexNormals.push( normal );
			}
		}

		if( hasFaceColor )
		{
			face.colorIndex = faces[offset++];
		}

		if( hasFaceVertexColor )
		{
			for( i = 0; i < numVertices; i++ )
			{
				face.vertexColors.push( faces[ offset++ ] );
			}
		}

		geometry.faces.push(face);
	}

	geometry.materials = data.materials;
	geometry.verticesFromFaceTexCoords( data.vertices, data.uvs, 0 );
	geometry.indicesFromFace();

	if( data.normals.length > 0 )
		geometry.MorphVertexNormals();
	else
		geometry.CalculateVertexNormals();

	EngineCores.Instance().Graphics.geometries.put( name, geometry );

	return geometry;
}




