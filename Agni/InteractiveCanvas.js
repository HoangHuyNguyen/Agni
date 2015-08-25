var VERTEX_SHADER_SOURCE;
var FRAGMENT_SHADER_SOURCE;
//

var texture;
var object;
var object2;
var object3;
var activeObject;
var box;
var testShader;
var postProcessShader;
var camera;
var draw1 = false;
var draw2 = false;
//var light;
var FBO;
var GBuffer;
var last = Date.now();
var gl;
var isFinishingLoading = false;
var resCount = 0;
var animateLight = false;

function main(){

    //tools();

    EngineCores.Instance().LoadGraphic();

    gl = EngineCores.Instance().Graphics.gl;

    FBO = new FBO();

    EngineCores.Instance().Graphics.AddShaderProgram( "Forward Shader", "./Shader/ForwardShader.vert", "./Shader/ForwardShader.frag" );
    EngineCores.Instance().Graphics.AddShaderProgram( "Post Process Shader", "./Shader/PostProcessShader.vert", "./Shader/PostProcessShader.frag" );

    camera = new CCamera3D( "Main Camera", vec3.fromValues( 200.0, 100.0, 800.0 ) );
    EngineCores.Instance().Graphics.AddCamera( camera );

/*    for( var i = 0; i < 100; i++ )
    {
        var x = Math.random( -5.0, 5.0 );
        var z = Math.random( -5.0, 5.0 );
        var r = Math.random( 0.1, 0.5 );
        var g = Math.random( 0.1, 0.5 );
        var b = Math.random( 0.1, 0.5 );
        var light = new CPointLight( vec3.fromValues( x,  i * 2, z ), vec4.fromValues( r,g,b, 1.0 ), 1.0, 1.0, vec3.fromValues( 0.0, 0.0, 1.0 ) );
        //var light = new CPointLight( vec3.fromValues( 0, i * 20 ,0 ), vec4.fromValues( 1.0, 1.0, 1.0, 1.0 ), 1.0, 1.0, vec3.fromValues( 0.0, 0.0, 0.0001 ) );


        EngineCores.Instance().Graphics.AddLight( light );
    }*/

    for( var i = 0; i < 12; i++ )
    {
        for( var j = 0; j < 12; j++ )
        {
            var r = Math.random( 0.1, 0.5 );
            var g = Math.random( 0.1, 0.5 );
            var b = Math.random( 0.1, 0.5 );
            var light = new CPointLight( vec3.fromValues( -40 + i * 40, 100, 40 + j * 40 ), vec4.fromValues( r,g,b, 0.1 ), 1.0, 1.0, vec3.fromValues( 0.0, 0.0, 0.01 ) );
            EngineCores.Instance().Graphics.AddPointLight( light );
        }
    }

    var directionalLight = new CDirLight( vec3.fromValues( 0, 10, 0 ), vec4.fromValues( 1.0,1.0, 1.0, 1.0 ), 1.0, 1.0, vec3.fromValues( -1.0, -1.0, 0.0 ) );
    EngineCores.Instance().Graphics.AddDirectionalLight( directionalLight );

    //var light = new CPointLight( vec3.fromValues( 0, 10, 0 ), vec4.fromValues( 1.0,1.0,1.0, 1.0 ), 1.0, 1.0, vec3.fromValues( 0.0, 0.0, 0.0001 ) );
    //EngineCores.Instance().Graphics.AddPointLight( light );

    object2 = new CObject( 'sphere' );
    object2.AddModel( './Data/Model/Sphere.json' );
    var vec = vec3.create();
    object = new CObject( 'Monster', vec3.fromValues( 0.0, 0.0, 0.0 ), vec, vec3.fromValues( 1, 1, 1 ), vec4.create() );
    object.AddModel( './Data/Model/PrimalBeast.JSON' );

/*    var table = new CObject( 'table', vec3.fromValues( 0.0, -50.0, 100.0 ), vec, vec3.fromValues( 50.0, 50.0, 50.0 ), vec4.create()  );
    table.AddModel( './Data/Model/Table.json' );*/

    for( var i = 0; i < 5; i++ )
    {
       for( var j = 0; j < 5; j++ )
        {
            var ball = new CObject( 'ball',  vec3.fromValues( -40 + j * 80, 5, -40 + i * 80 ), vec, vec3.fromValues( 1.0, 1.0, 1.0 ), vec4.create()  );
            //var ball2 = new CObject( 'ball',  vec3.fromValues( -40 + j * 80, -80, -40 + i * 80 ), vec, vec3.fromValues( 1.0, 1.0, 1.0 ), vec4.create()  );
            //var ball = new CObject( 'ball',  vec3.fromValues( 0, 0, 0 ) );

            ball.AddModel( './Data/Model/apple.json' );
            //ball2.AddModel( './Data/Model/apple.json' );

            EngineCores.Instance().Graphics.AddObject( ball );
            //EngineCores.Instance().Graphics.AddObject( ball2 );

        }
    }
    //EngineCores.Instance().Graphics.AddObject( object );
    //EngineCores.Instance().Graphics.AddObject( object2 );
    //EngineCores.Instance().Graphics.AddObject( apple );
    //EngineCores.Instance().Graphics.AddObject( table );



    MainLoop();
}

/*var tools = function(){
    var gui = require('nw.gui');
    var win = gui.Window.get();
    win.showDevTools();
}*/

var delta = 0;

function MainLoop(){

    if( !isFinishingLoading )
        LoadAssets();
    else
    {
        var now = Date.now();
        delta = ( now - last ) * 0.001;
        UpdateScene( delta );

        RenderScene();
    }

    window.requestAnimationFrame( MainLoop );
}

function LoadAssets(){

    if( testShader === undefined || !testShader.compiled )
         testShader = EngineCores.Instance().Graphics.GetShaderProgram( "Forward Shader" );
     else
         resCount++;

    if( postProcessShader === undefined )
    {
        postProcessShader = EngineCores.Instance().Graphics.GetShaderProgram( "Post Process Shader" );
        FBO.AddShaderProgram( "Post Process Shader" );
    }
    else
        resCount++;

    if( resCount == 2 )
        isFinishingLoading = true;
}

function RenderScene(){

//  EngineCores.Instance().Graphics.ApplyLightsToShader( testShader );

    EngineCores.Instance().Graphics.RenderScene();
/*  FBO.BindFBO();
    DrawGraphicObjects();
    FBO.UnbindFBO(); */

/*    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.enable( gl.DEPTH_TEST );*/
 //   FBO.RenderFBOToScreen();

    //light.Visualize( 0.2 );
//    DrawGraphicObjects();
}

var time = 0;
function UpdateScene( deltaTime ){
    time += deltaTime ;
    time *= 0.5;
    //console.log(time);


    if( animateLight )
    {
        for( var i = 0; i < EngineCores.Instance().Graphics.lights.length; i++ )
        {
            var light = EngineCores.Instance().Graphics.lights[i];

            //light.position[0] = 5 * Math.cos( time );
            light.position[1] = 100 + 50 * Math.cos( time );
            //light.position[2] = 5 * Math.sin( time );
            //var translation = mat4.translation(); 
             
        }
    }

    
    //light.position[1] = 10 * Math.sin( time );
}

function DrawGraphicObjects(){
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    if( object.IsLoaded() && draw1 )
    {
        object.Render( testShader );
        //EngineCores.Instance().Graphics.primitives.Sphere.Render( testShader );
    }
    if( object2.IsLoaded() && draw2 )
    {
        object2.Render( testShader );
    }
}

var Input = {
    Mouse: {
        lastX: 0,
        lastY: 0,
        pressed: false
    }
}

var onMouseMove = function(e) {
    
    var deltaX = Input.Mouse.lastX - e.clientX;
    var deltaY = Input.Mouse.lastY - e.clientY;
    
    Input.Mouse.lastX = e.clientX;
    Input.Mouse.lastY = e.clientY;

    //camera.yawDeg += deltaX * 0.01;

    camera.Update();
}

var speed = 2;

var onKeyDown = function(e)
{
    var movementVector = vec3.create();
    var temp = vec3.create();

    if( String.fromCharCode(e.keyCode) === 'W' )
    {
        vec3.scale( temp, camera.fowardDirection, speed );
        vec3.add( movementVector, movementVector, temp );
    }
    if( String.fromCharCode(e.keyCode) === 'S' )
    {
        vec3.scale( temp, camera.fowardDirection, -speed );
        vec3.add( movementVector, movementVector, temp );
    }
    if( String.fromCharCode(e.keyCode) === 'A' )
    {
        var left = vec3.fromValues( camera.fowardDirection[2], 0, camera.fowardDirection[0] );
        vec3.scale( temp, left, speed );
        vec3.add( movementVector, movementVector, temp );
    }
    if( String.fromCharCode(e.keyCode) === 'D' )
    {
        var right = vec3.fromValues( -camera.fowardDirection[2], 0, camera.fowardDirection[0] );
        vec3.scale( temp, right, speed );
        vec3.add( movementVector, movementVector, temp );
    }
    if( String.fromCharCode(e.keyCode) === 'E' )
    {
        var up = vec3.fromValues( 0.0, speed * 0.1, 0.0 );
        vec3.add( movementVector, movementVector, up );
    }
    if( String.fromCharCode(e.keyCode) === 'C' )
    {
        var down = vec3.fromValues( 0.0, -speed * 0.1, 0.0 );
        vec3.add( movementVector, movementVector, down );
    }
/*    if( e.keyCode === 49 )
    {
        draw1 = true;
        draw2 = false;
    }
    if( e.keyCode === 50 )
    {
        draw1 = false;
        draw2 = true;
    }*/
    if( e.keyCode === 39 )
    {
        object.RotateY( 10 );
        object2.RotateY( 10 );
    }
    if( e.keyCode === 37 )
    {
        object.RotateY( -10 );
        object2.RotateY( 10 );
    }
    if( e.keyCode === 49 )
    {
        EngineCores.Instance().Graphics.renderOption = ( EngineCores.Instance().Graphics.renderOption ? 0 : 1 )
    }
    if( e.keyCode === 50 )
    {
        EngineCores.Instance().Graphics.enableDirLight = ( EngineCores.Instance().Graphics.enableDirLight ? false : true )
    }
    if( e.keyCode === 57 )
    {
        animateLight = ( animateLight ? false : true );
    }
    //vec3.normalize( movementVector, movementVector );
    vec3.scale( movementVector, movementVector, delta );
    vec3.add( camera.position, camera.position, movementVector );
    camera.Update();
}

window.addEventListener( 'keydown', onKeyDown, false );
window.addEventListener( "mousemove", onMouseMove, false );