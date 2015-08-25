#extension GL_EXT_draw_buffers : require
precision highp float;

varying vec4 v_position;
varying vec3 v_normal;
varying vec2 v_texCoords;
varying float v_depth;
varying vec4 v_viewSpacePosition;
varying vec4 v_viewSpaceNormal;

uniform sampler2D u_diffuseTexture;
uniform vec4 u_color;

void main()
{
	gl_FragData[0] = vec4( v_position.xyz, v_viewSpaceNormal.y );
	gl_FragData[1] = vec4( normalize( v_normal ).xyz, v_viewSpaceNormal.z );
	gl_FragData[2] = vec4( u_color.xyz * texture2D( u_diffuseTexture, v_texCoords ).xyz, 1.0 );
	//gl_FragData[3] = vec4( v_viewSpacePosition.xyz, v_viewSpaceNormal.x );
	gl_FragData[3] = vec4( v_viewSpaceNormal.xyz, 1.0 );

}