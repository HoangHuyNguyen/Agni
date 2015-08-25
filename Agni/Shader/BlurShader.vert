precision highp float;

attribute vec2 a_vertexPosition;
attribute vec2 a_vertexTexCoords;

varying vec2 v_texCoords;

void main()
{
	v_texCoords = a_vertexTexCoords;
	gl_Position = vec4( a_vertexPosition, 0.0, 1.0 );
}