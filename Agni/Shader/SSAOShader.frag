#extension GL_EXT_draw_buffers : require
precision highp float;

const int MAX_SAMPLE_SIZE = 128;


uniform sampler2D u_positionTexture; 
uniform sampler2D u_normalTexture;
uniform sampler2D u_viewPositionTexture;
uniform sampler2D u_noiseTexture;
uniform sampler2D u_depthTexture;

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;

uniform float u_sampleRadius;
uniform vec3 u_samplePosition[MAX_SAMPLE_SIZE];

uniform vec2 u_nearFarPlane;

uniform vec2 u_noiseScale;
varying vec2 v_texCoords;

float linearizeDepth( float expDepth )
{
	float near = u_nearFarPlane.x;
	float far = u_nearFarPlane.y;

	float linearDepth = ( 2.0 * near ) / ( far + near - expDepth * ( far - near ) );

	return linearDepth;
}

/* void main()
{
	float z = texture2D( u_normalTexture, v_texCoords ).w;
	float d = texture2D( u_noiseTexture, v_texCoords ).r;
	float k = texture2D( u_depthTexture, v_texCoords ).r;
	vec2 noiseScale = u_noiseScale;
	mat4 proj = u_projectionMatrix;
	mat4 view = u_viewMatrix;
	vec3 normal = normalize( texture2D( u_viewPositionTexture, v_texCoords ).xyz );



	vec3 world = texture2D( u_positionTexture, v_texCoords ).xyz;
	vec3 origin = vec3( u_viewMatrix * vec4( world, 1.0 ) ).xyz;

	float occlusion = 0.0;

	for( int i = 0; i < MAX_SAMPLE_SIZE; i++ )
	{
		vec3 pos = u_samplePosition[i] + origin;
		vec4 offset = vec4( pos, 1.0 );
		offset = u_projectionMatrix * offset;
		offset.xy /= offset.w;
		offset.xy = offset.xy * 0.5 + vec2( 0.5 );

		vec3 sample = texture2D( u_positionTexture, offset.xy ).xyz;
		sample = vec3( u_viewMatrix * vec4( sample, 1.0 ) ).xyz;
		float sampleDepth = sample.z; 

		if ( abs( origin.z - sampleDepth ) < u_sampleRadius) 
		{
            occlusion += step( pos.z, sampleDepth );
        }
	}
	occlusion = 1.0 - ( occlusion / float(MAX_SAMPLE_SIZE) );
    occlusion = pow( occlusion, 8.0 );

    gl_FragData[0] = vec4( vec3(occlusion), 1.0 );
} */
void main()
{
	mat4 proj = u_projectionMatrix;
	mat4 view = u_viewMatrix;
	vec3 world = texture2D( u_positionTexture, v_texCoords ).xyz;
	vec3 origin = vec3( u_viewMatrix * vec4( world, 1.0 ) ).xyz;
	//vec3 origin = texture2D( u_viewPositionTexture, v_texCoords ).xyz;
	float x = texture2D( u_viewPositionTexture, v_texCoords ).w;
	float y = texture2D( u_positionTexture, v_texCoords ).w;
	float z = texture2D( u_normalTexture, v_texCoords ).w;
	vec3 normal = normalize( vec3( x, y, z ) );
	normal = normalize( texture2D( u_viewPositionTexture, v_texCoords ).xyz ); 
	//normal = normalize( texture2D( u_normalTexture, v_texCoords ).sxyz );

	vec3 rightVec = normalize( texture2D( u_noiseTexture, v_texCoords * u_noiseScale ).xyz )  * 2.0 - 1.0;
	vec3 tangent = normalize( rightVec - normal * dot( rightVec, normal ) );
	vec3 bitangent = normalize( cross( normal, tangent ) );
	mat3 tbn = mat3( tangent, bitangent, normal );

	float occlusion = 0.0;
	float sampleDepth;
	float test = u_sampleRadius;

	for( int i = 0; i < MAX_SAMPLE_SIZE; i++ )
	{
		vec3 pos = tbn * u_samplePosition[i];
		pos = pos * u_sampleRadius + origin;
		vec4 offset = vec4( pos, 1.0 );
		offset = u_projectionMatrix * offset;
		offset.xy /= offset.w;
		offset.xy = offset.xy * 0.5 + vec2( 0.5 );

 		sampleDepth = texture2D( u_depthTexture, offset.xy ).r;
//		sampleDepth = linearizeDepth( sampleDepth );
//		sampleDepth = texture2D( u_viewPositionTexture, offset.xy ).z;  

	  	vec3 sample = texture2D( u_positionTexture, offset.xy ).xyz;
		sample = vec3( u_viewMatrix * vec4( sample, 1.0 ) ).xyz;
		sampleDepth = sample.z; 

 		float rangeCheck = abs( origin.z - sampleDepth );
		if( rangeCheck < u_sampleRadius )
		{
			rangeCheck = 1.0;
		}
		else
		{
			rangeCheck = 0.0;
		}

		float factor = 0.0;
		if( sampleDepth >= pos.z )
		{
			factor = 1.0;
		}
		occlusion += factor * rangeCheck;
	}

	occlusion = 1.0 - ( occlusion / float(MAX_SAMPLE_SIZE) );
    occlusion = pow( occlusion, 2.0 );

	gl_FragData[0] = vec4( vec3(occlusion), 1.0 );
	//gl_FragData[0] = texture2D( u_viewPositionTexture, v_texCoords );
	//gl_FragData[0] = vec4( texture2D(  u_normalTexture, v_texCoords ).xyz, 1.0 );

	//gl_FragData[0] = vec4( normal, 1.0 );
	//gl_FragData[0] = vec4( origin, 1.0 );
	//gl_FragData[0] = vec4( worldPos, 1.0 );
	//gl_FragData[0] = vec4( occlusion, 0.0, 0.0, 1.0 );
	//gl_FragData[0] = vec4( vec3( sampleDepth ), 1.0 );

	//gl_FragData[0] = vec4( 1.0, 0.0, 0.0, 1.0 );

}