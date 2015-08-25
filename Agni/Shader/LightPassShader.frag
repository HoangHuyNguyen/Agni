#extension GL_EXT_draw_buffers : require
precision highp float;

#define ENABLE_SSAO    1

uniform sampler2D u_positionTexture; 
uniform sampler2D u_normalTexture;
uniform sampler2D u_colorTexture;
uniform sampler2D u_ssaoTexture;

uniform vec3 u_lightPosition;
uniform vec4 u_lightColorsAndBrightness;
uniform vec3 u_lightAttenuation;
uniform float u_lightAmbientness;
uniform float u_lightSpecularity;

uniform vec2 u_screenSize;

uniform vec3 u_cameraPosition;

uniform int  u_renderingOption;

varying mat4 v_modelMatrix;
varying mat4 v_mvMatrix;

vec3 CalcPointLight( vec3 pixelPosition, vec3 pixelNormal )
{
	vec2 texCoords = gl_FragCoord.xy / u_screenSize;

	vec3 diffuseColor = vec3( 0.0, 0.0, 0.0 );
	vec3 specularColor = vec3( 0.0, 0.0, 0.0 );
	vec3 ambientColor = vec3( 0.0, 0.0, 0.0 );

	vec3 lightColor = u_lightColorsAndBrightness.rgb;
	float lightBrightness = u_lightColorsAndBrightness.w;
	float ambientFactor = 1.0; 
	
	if( u_renderingOption == ENABLE_SSAO )
		ambientFactor = texture2D( u_ssaoTexture, texCoords ).r;

	ambientColor = clamp( lightColor * u_lightAmbientness * ambientFactor, vec3(0.0), vec3(1.0) );
	//ambientColor = lightColor * u_lightAmbientness * ambientFactor;

	vec3 lightWorldPosition = u_lightPosition;
	vec3 displacementToLight = lightWorldPosition - pixelPosition;
	float distanceToLight = length( displacementToLight );
	vec3 directionToLight = normalize( lightWorldPosition - pixelPosition );
	vec3 lightDirection = -directionToLight;

	float diffuseIntensity = dot( directionToLight, pixelNormal );

	diffuseColor = clamp( lightColor * lightBrightness * diffuseIntensity, vec3(0.0), vec3(1.0) );
	//diffuseColor = lightColor * lightBrightness * diffuseIntensity;

	vec3 pixelToCamera = normalize( u_cameraPosition - pixelPosition );
	vec3 lightReflect = normalize( reflect( lightDirection, pixelNormal ) );
	float specularFactor = dot( pixelToCamera, lightReflect );
	specularFactor = pow( specularFactor, 32.0 );
	specularColor = clamp( lightColor * u_lightSpecularity * specularFactor, vec3(0.0), vec3(1.0) ); 
	//specularColor = lightColor * u_lightSpecularity * specularFactor; 

	vec3 totalColor = diffuseColor + specularColor + ambientColor;

	float attenuation = u_lightAttenuation.x +
					    u_lightAttenuation.y * distanceToLight +
					    u_lightAttenuation.z * distanceToLight * distanceToLight;

	//attenuation = max( attenuation, 1.0 );

	return totalColor / attenuation;
	//return vec3( ambientFactor );
}

void main()
{
	vec2 texCoords = gl_FragCoord.xy / u_screenSize;
	vec3 pixelViewPos = texture2D( u_positionTexture, texCoords ).xyz;
	vec3 pixelViewNormal = normalize( texture2D( u_normalTexture, texCoords ).xyz );
	vec3 pixelColor = texture2D( u_colorTexture, texCoords ).xyz;

	gl_FragData[0] = vec4( pixelColor * CalcPointLight( pixelViewPos, pixelViewNormal ), 1.0 ) ;
	//gl_FragData[0] = vec4( CalcPointLight( pixelViewPos, pixelViewNormal ), 1.0 );
	//gl_FragData[0] = vec4( texture2D( u_ssaoTexture, texCoords ) );
}