precision highp float;

attribute vec3 a_vertexPosition;

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;

varying vec3 v_position;

void main()
{
	mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;
	gl_Position = mvp * vec4( a_vertexPosition, 1.0 );
}