precision highp float;

uniform sampler2D u_positionTexture; //view space
uniform sampler2D u_normalTexture; //view space
uniform sampler2D u_texCoordsTexture;
uniform sampler2D u_colorTexture;
uniform sampler2D u_depthTexture;

varying vec2 v_texCoords;

float near = 0.1;
float far = 3000.0;

float linearizeDepth(float depth) 
{
    return  ( 2.0 * near ) / ( far + near -  depth * (far - near) ); 
}   

void main()
{
	vec4 position = texture2D( u_positionTexture, v_texCoords );
	vec4 viewPosition = texture2D( u_texCoordsTexture, v_texCoords );
	vec4 normal = texture2D( u_normalTexture, v_texCoords );
	float texCoords = texture2D( u_texCoordsTexture, v_texCoords ).r;
	vec4 color = texture2D( u_colorTexture, v_texCoords );
	float depth = texture2D( u_depthTexture, v_texCoords ).r;
	depth = linearizeDepth( depth );

	gl_FragColor = vec4( position.xyz, 1.0 );
	//gl_FragColor = texture2D( u_depthTexture, v_texCoords );
	//gl_FragColor = vec4( normal.xyz, 1.0 );
	//gl_FragColor = vec4( color.xyz, 1.0 );
	//gl_FragColor = vec4( vec3(depth), 1.0 );


}