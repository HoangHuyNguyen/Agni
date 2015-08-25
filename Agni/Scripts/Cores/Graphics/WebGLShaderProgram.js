var UniformType = {
    0x8B50: 'FLOAT_VEC2',
    0x8B51: 'FLOAT_VEC3',
    0x8B52: 'FLOAT_VEC4',
    0x8B53: 'INT_VEC2',
    0x8B54: 'INT_VEC3',
    0x8B55: 'INT_VEC4',
    0x8B56: 'BOOL',
    0x8B57: 'BOOL_VEC2',
    0x8B58: 'BOOL_VEC3',
    0x8B59: 'BOOL_VEC4',
    0x8B5A: 'FLOAT_MAT2',
    0x8B5B: 'FLOAT_MAT3',
    0x8B5C: 'FLOAT_MAT4',
    0x8B5E: 'SAMPLER_2D',
    0x8B60: 'SAMPLER_CUBE',
    0x1400: 'BYTE',
    0x1401: 'UNSIGNED_BYTE',
    0x1402: 'SHORT',
    0x1403: 'UNSIGNED_SHORT',
    0x1404: 'INT',
    0x1405: 'UNSIGNED_INT',
    0x1406: 'FLOAT'
};

var AttributeLocation = {
    VERTEX_ATTRIB_POSITIONS : 0,
    VERTEX_ATTRIB_TEXCOORDS : 1,
    VERTEX_ATTRIB_COLORS : 2,
    VERTEX_ATTRIB_NORMALS : 3,
    VERTEX_ATTRIB_TANGENTS : 4,
    VERTEX_ATTRIB_BITANGENTS : 5,
    VERTEX_ATTRIB_BONE_INDICES : 6,
    VERTEX_ATTRIB_BONE_WEIGHTS : 7,
    VERTEX_ATTRIB_BONE_IS_STATIC : 8
};

var CShaderProgram = function( name, vs, fs )
{
    this.shaderProgram;
    this.name = name;
    this.shaderUniforms = new CMap();
    this.compiled = false;

    var vShader = null;
    var fShader = null;

    var strV = vs.split("/");
    var strF = fs.split("/");

    var vsName = strV[ strV.length - 1 ];
    var fsName = strF[ strF.length - 1 ];

    var gl = EngineCores.Instance().Graphics.gl;
    var graphicManager = EngineCores.Instance().Graphics;

    var _shaderCount = 0;

    var Callback = function(){
        _shaderCount++;
        if( _shaderCount === 2 )
        {
            CreateShaderProgram();
        }        
    }.bind(this);

    var shaderUniform = function( type, location ) 
    {
        this.typeName = type;
        this.location = location;
        this.value;
    }

    var Initialize = function()
    {
        if( graphicManager.shaders.get( vsName ) === undefined )
        {
            vShader = new CWebGLShader( vs, 'v', Callback );
            vShader.LoadSource( vs );
            graphicManager.shaders.put( vsName, vShader );
        }
        else
        {
            vShader = graphicManager.shaders.get( vsName );
        }

        if( graphicManager.shaders.get( fsName ) === undefined )
        {
            fShader = new CWebGLShader( fs, 'f', Callback );
            fShader.LoadSource( fs );
            graphicManager.shaders.put( fsName, fShader  );
        }
        else
        {
            fShader = graphicManager.shaders.get( fsName );
        }
    }.bind(this);

    var CreateShaderProgram = function()
    {     
        this.shaderProgram = gl.createProgram();
        
        if ( !this.shaderProgram )
        {
            return null;
        }
                
        gl.attachShader( this.shaderProgram, vShader.shader );
        gl.attachShader( this.shaderProgram, fShader.shader );

        gl.bindAttribLocation( this.shaderProgram,  AttributeLocation.VERTEX_ATTRIB_POSITIONS,      "a_vertexPosition" );
        gl.bindAttribLocation( this.shaderProgram,  AttributeLocation.VERTEX_ATTRIB_COLORS,         "a_vertexColor" );
        gl.bindAttribLocation( this.shaderProgram,  AttributeLocation.VERTEX_ATTRIB_TEXCOORDS,      "a_vertexTexCoords" );
        gl.bindAttribLocation( this.shaderProgram,  AttributeLocation.VERTEX_ATTRIB_NORMALS,        "a_vertexNormal" );
        gl.bindAttribLocation( this.shaderProgram,  AttributeLocation.VERTEX_ATTRIB_TANGENTS,       "a_vertexTangent" );
        gl.bindAttribLocation( this.shaderProgram,  AttributeLocation.VERTEX_ATTRIB_BITANGENTS,     "a_vertexBitangent" );
        gl.bindAttribLocation( this.shaderProgram,  AttributeLocation.VERTEX_ATTRIB_BONE_INDICES,   "a_vertexBoneIndex" );
        gl.bindAttribLocation( this.shaderProgram,  AttributeLocation.VERTEX_ATTRIB_BONE_WEIGHTS,   "a_vertexBoneWeight" );
        gl.bindAttribLocation( this.shaderProgram,  AttributeLocation.VERTEX_ATTRIB_BONE_IS_STATIC, "a_vertexBoneIsStatic" );
                
        gl.linkProgram( this.shaderProgram );
        
        var linked = gl.getProgramParameter( this.shaderProgram, gl.LINK_STATUS );
        if (!linked)
        {
            var error = gl.getProgramInfoLog( this.shaderProgram );
            console.log( 'Failed to link program: ' + error );
            gl.deleteProgram( this.shaderProgram );
            gl.deleteShader( fShader.shader );
            gl.deleteShader( vShader.shader );
            return null;
        }
        else
        {
            console.log( 'Shader Program link successfully' );
        }
        
        GetUniformInformation();
        this.compiled = true;
        EngineCores.Instance().Graphics.shaderPrograms.put( this.name, this );

    }.bind(this);

    var GetUniformInformation = function()
    {
        var uniformCount = gl.getProgramParameter( this.shaderProgram, gl.ACTIVE_UNIFORMS );

        for( var i = 0; i < uniformCount; i++ )
        {
            var uniform = gl.getActiveUniform( this.shaderProgram, i );
            var location = gl.getUniformLocation( this.shaderProgram, uniform.name );
            var typeName = UniformType[uniform.type];
            var shaderUniformTemp = new shaderUniform( typeName, location );
            this.shaderUniforms.put( uniform.name, shaderUniformTemp );
        }

    }.bind(this);

//   CreateShaderProgram();

   this.SetUniformValueByName = function( name, value )
   {
        var uniform = this.shaderUniforms.get( name );

        if( uniform === 'undefined' )
        {
            console.log( 'Cannot find uniform with name ' + name );
        }
        else
        {
            if( uniform === undefined )
                var i = 0;
            uniform.value = value;
        }
    }.bind(this);

    this.SendUniformValuesToShader = function()
    {
        for( var i = 0; i < this.shaderUniforms.size; i++ )
        {
            var key = this.shaderUniforms.key();
            var uniform = this.shaderUniforms.value();
            var uniformLocation = uniform.location;
            var value = uniform.value;

            if( value === undefined )
            {
                this.shaderUniforms.next();
                continue;
            }

            switch( uniform.typeName )
            {
                case 'SAMPLER_2D':
                case 'INT':
                {
                    gl.uniform1i( uniformLocation, value );
                    break;
                }
                case 'FLOAT':
                {
                    gl.uniform1f( uniformLocation, value );
                    break;
                }
                case 'FLOAT_VEC2': 
                {
                    gl.uniform2f( uniformLocation, value[0] , value[1] );
                    break;
                }
                case 'FLOAT_VEC3': 
                {
                    gl.uniform3f( uniformLocation, value[0] , value[1], value[2] );
                    break;
                }
                case 'FLOAT_VEC4':
                {
                    gl.uniform4f( uniformLocation, value[0] , value[1], value[2], value[3] );
                    break;
                }
                case 'FLOAT_MAT4':
                {
                    gl.uniformMatrix4fv( uniformLocation, false, value );
                    break;
                }
            }
            this.shaderUniforms.next();
        }
   }.bind(this);

   Initialize();
}

CShaderProgram.prototype.UseProgram = function()
{
    var gl = EngineCores.Instance().Graphics.gl;
    gl.useProgram( this.shaderProgram );
};

CShaderProgram.prototype.DisableProgram = function()
{
   //var gl = EngineCores.Instance().Graphics.gl;
   //gl.useProgram( 0 );
};




