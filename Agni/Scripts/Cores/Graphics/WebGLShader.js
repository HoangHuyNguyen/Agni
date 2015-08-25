var CWebGLShader = function( fileName, shaderType, callback, callbackScope )
{      
   this.shader;
   this.url;

   var str = fileName.split( "/" );
   this.name = str[ str.length - 1 ];
   this.source = "";
   this.onLoad = callback || null;
   this.compiled = false;
   this.loaded = false;
   if( shaderType == 'v')
      this.type = 'vertex shader';
   else if( shaderType == 'f')
      this.type = 'fragment shader';


   var gl = EngineCores.Instance().Graphics.gl;

   this.LoadSource = function( fileName )
   {
        var request = new XMLHttpRequest();
        
        request.open( 'GET', fileName, false );
                
        request.onreadystatechange = function()
        {
            if ( request.readyState === 4 && request.status !== 404 )
            {
                if ( request.status === 200 || request.status === 0 )
                {
                    this.source = request.responseText;
                    this.loaded = true;
                    console.log( 'Load shader ' + fileName + ' successfully');

                    Compile();

                    if ( this.onLoad )
                    {
                        if( callbackScope )
                          this.onLoad.apply( callbackScope, [] );
                        else
                          this.onLoad();
                    }
                }
            }
            else
            {
                console.log( 'Fail to load shader ' + fileName );
            }
        }.bind(this);

        request.send();
   }.bind(this);
      
   var Compile = function()
   {
        if ( shaderType === 'v' )
        {
            this.shader = gl.createShader( gl.VERTEX_SHADER );
        }
        else if ( shaderType === 'f' )
        {
            this.shader = gl.createShader( gl.FRAGMENT_SHADER );
        }
        
        gl.shaderSource( this.shader, this.source );
        
        gl.compileShader( this.shader );
        
        this.compiled = gl.getShaderParameter( this.shader, gl.COMPILE_STATUS );
        if ( !this.compiled )
        {
            var error = gl.getShaderInfoLog( this.shader );
            console.log( 'Failed to compile ' + this.type + ' shader: ' + error );
            gl.deleteShader( this.shader );
        }
        else
        {
          console.log( 'Compile ' + fileName + ' successfully' );
        }
   }.bind(this);
};