precision highp float;

attribute vec3 a_vertexPosition;
attribute vec2 a_vertexTexCoords;
attribute vec3 a_vertexNormal;

const int MAX_LIGHT_NUM = 256;

uniform vec3 u_lightPositions[ MAX_LIGHT_NUM ];
uniform vec3 u_lightDirections[ MAX_LIGHT_NUM ];
uniform vec4 u_lightColorsAndBrightness[ MAX_LIGHT_NUM ];

uniform mat4 u_modelMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_normalMatrix;

varying vec2 v_texCoords;
varying vec3 v_normals;
varying vec3 v_position;
varying mat4 v_viewMat;

void main()
{
	mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;
	mat4 mv = u_viewMatrix * u_modelMatrix;
	vec4 vertexScreenPosition =  mvp * vec4( a_vertexPosition, 1.0 );
	vec4 vertexPosition = mv * vec4( a_vertexPosition, 1.0 );
	vec4 normalPosition = u_normalMatrix * vec4( a_vertexNormal, 0.0 );

	v_texCoords = a_vertexTexCoords;
	v_normals = normalize( normalPosition.xyz );
	v_position = vertexPosition.xyz;
    v_viewMat = u_viewMatrix;

	gl_Position = vertexScreenPosition;
}