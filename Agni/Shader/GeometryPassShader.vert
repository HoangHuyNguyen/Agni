precision highp float;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_normalMatrix;

attribute vec3 a_vertexPosition;
attribute vec3 a_vertexNormal;
attribute vec2 a_vertexTexCoords;

varying vec4 v_position;
varying vec3 v_normal;
varying vec2 v_texCoords;
varying vec4 v_viewSpacePosition;
varying vec4 v_viewSpaceNormal;

void main(void)
{
	mat4 normalMatrix = u_normalMatrix;
	vec4 worldPosition = u_modelMatrix * vec4( a_vertexPosition, 1.0 );
	vec4 viewPosition = u_viewMatrix * worldPosition;
	vec4 screenPosition = u_projectionMatrix * viewPosition;

	//v_position = viewPosition;
	v_normal = vec4( u_modelMatrix * vec4( a_vertexNormal.xyz, 0.0 ) ).xyz;
	v_position = worldPosition;
	v_texCoords = a_vertexTexCoords;
	v_viewSpaceNormal = u_normalMatrix * vec4( a_vertexNormal.xyz, 0.0 );
	v_viewSpacePosition = u_viewMatrix * worldPosition;
	
	gl_Position = screenPosition;
}
