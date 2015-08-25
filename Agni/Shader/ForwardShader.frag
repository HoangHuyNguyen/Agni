precision highp float;
const int MAX_LIGHT_NUM = 256;

uniform sampler2D u_diffuseTexture;
uniform vec3 u_lightPositions[ MAX_LIGHT_NUM ];
uniform vec3 u_lightDirections[ MAX_LIGHT_NUM ];
uniform vec4 u_lightColorsAndBrightness[ MAX_LIGHT_NUM ];

uniform vec4 u_color;

varying vec2 v_texCoords;
varying vec3 v_normals;
varying vec3 v_position;
varying mat4 v_viewMat;

float SmoothStep( float value )
{
	return ( 3.0 * value * value - 2.0 * value * value * value );
}

void main()
{
  	vec4 diffuseColor = texture2D( u_diffuseTexture, v_texCoords );
  	vec3 finalLightColor;

  	for( int i = 0; i < MAX_LIGHT_NUM; i++ )
  	{
      vec3 lightPosition = ( v_viewMat * vec4( u_lightPositions[i], 1.0 ) ).xyz;
  		vec3 displacementToLight = lightPosition - v_position;
  		vec3 directionToLight = normalize( displacementToLight );
  		float lightIntensity = clamp( dot( directionToLight, v_normals ), 0.0, 1.0 );
  		lightIntensity *= u_lightColorsAndBrightness[i].a;
  		vec3 lightColor = u_lightColorsAndBrightness[i].rgb * lightIntensity;
  		finalLightColor += lightColor;
  	}

  	vec3 pixelColor = diffuseColor.rgb * finalLightColor;

  	gl_FragColor = vec4( pixelColor.rgb, 1.0 ) * u_color;
  	//gl_FragColor = vec4( diffuseColor.rgb, 1.0 ); 	
}