#extension GL_EXT_draw_buffers : require
precision highp float;

varying vec2 v_texCoords;

uniform sampler2D u_blurTexture;
uniform vec2 u_textureSize;

void main()
{
	float offsets[4];
	offsets[0] = -1.5;
	offsets[1] = -0.5;
	offsets[2] =  0.5;
	offsets[3] =  1.5;

	vec3 color = vec3( 0.0, 0.0, 0.0 );

	for( int i = 0; i < 4; i++ )
	{
		for( int j = 0; j < 4; j++ )
		{
			vec2 texCoord = v_texCoords;
			texCoord.x = v_texCoords.x + offsets[j] / u_textureSize.x;
			texCoord.y = v_texCoords.y + offsets[i] / u_textureSize.y;
			color += texture2D( u_blurTexture, texCoord ).xyz;
		}
	}

	color /= 16.0;

	gl_FragData[0] = vec4( color, 1.0 );
}