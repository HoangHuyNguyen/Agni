precision highp float;

attribute vec3 a_vertexPosition;

uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_projectionMatrix;

uniform mat4 u_normalMatrix;
uniform vec4 u_color;
uniform sampler2D u_diffuseTexture;

varying mat4 v_modelMatrix;
varying mat4 v_mvMatrix;

void main()
{
	mat4 placeHolder = u_normalMatrix;
	vec4 color = u_color;
	vec4 diffuse = texture2D( u_diffuseTexture, vec2(0.0,0.0) );

	mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;
	v_mvMatrix = u_viewMatrix * u_modelMatrix;
	v_modelMatrix = u_modelMatrix;
	vec4 screenPosition = mvp * vec4( a_vertexPosition, 1.0 );
	gl_Position = screenPosition;
}