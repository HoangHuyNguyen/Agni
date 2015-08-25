precision highp float;

uniform sampler2D u_colorTexture;
uniform sampler2D u_depthTexture;

varying vec2 v_texCoords;

void main()
{
	float near = 0.1;
	float far = 10000.0;
	float z = texture2D( u_depthTexture, v_texCoords ).x;
	float grey = ( 2.0 * near ) / ( far + near - z * ( far - near ) );

	vec4 frameColor = texture2D( u_colorTexture, v_texCoords );
	vec4 depthColor = texture2D( u_depthTexture, v_texCoords );

	gl_FragColor = vec4( frameColor.rgb, 1.0 );
	//gl_FragColor = depthColor;
	//gl_FragColor = vec4( grey, grey, grey, 1.0 );w
}