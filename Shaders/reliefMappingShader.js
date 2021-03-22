var reliefMappingVertexShader = `#version 300 es

precision highp float;

in vec3 a_position;
in vec3 a_normal;
in vec2 a_textureCoords;
in vec3 a_tangent;
in vec3 a_bitangent;

out vec3 TangentFragPos;
out vec3 TangentLightPos;
out vec3 TangentViewPos;
out vec2 texCoords;
out vec3 tangent;
out vec3 biTangent;
out vec3 normal;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;

uniform vec3 u_lightPos;
uniform vec3 u_viewPos;

void main()
{
    vec3 fragPos = vec3(u_model * vec4(a_position, 1.0));
    texCoords = a_textureCoords;   
    
    vec3 T = normalize(mat3(u_model) * a_tangent);
    vec3 B = normalize(mat3(u_model) * a_bitangent);
    vec3 N = - normalize(mat3(u_model) * a_normal);
    // TBN inverse transforms world space to tangent space
    mat3 TBN_inverse = transpose(mat3(T, B, N));

    tangent = T;
    biTangent = B;
    normal = N;

    TangentLightPos = TBN_inverse * u_lightPos;
    TangentViewPos  = TBN_inverse * u_viewPos;
    TangentFragPos  = TBN_inverse * fragPos;
    
    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
}
`;

var reliefMappingFragmentShader = `#version 300 es

precision highp float;
precision lowp int;

in vec3 TangentFragPos;
in vec3 TangentLightPos;
in vec3 TangentViewPos;
in vec2 texCoords;
in vec3 tangent;
in vec3 biTangent;
in vec3 normal;

out vec4 finalColor;

uniform sampler2D u_colorTexture;
uniform sampler2D u_normalTexture;
uniform sampler2D u_depthTexture;

// uniform float tile = 1.0;
uniform float u_depth;

uniform int u_technique;

float tile = 1.0;
float depth = 0.1;

void reliefMappingTechnique();
float rayIntersectRm(sampler2D depthTexture, vec2 dp, vec2 ds);
void textureMappingWithIllumination();

void main()
{
    // texture mapping with illumination
    if(u_technique == 2)
    {
        textureMappingWithIllumination();
    }
    // normal mapping
    else if(u_technique == 3)
    {
        depth = 0.0;
        reliefMappingTechnique();
    }
    // relief mapping
    else if(u_technique == 4)
    {
        depth = u_depth;
        reliefMappingTechnique();
    }
    // texture mapping
    else
    {
        finalColor = texture(u_colorTexture, texCoords);
    }
}

void reliefMappingTechnique()
{
    // TBN transforms tangent space to world space
    mat3 TBN = mat3(tangent, biTangent, normal);

    //Relief mapping
    vec4 t,c;
    vec3 s;
    vec2 dp,ds,uv;
    float d;

    // view vector in tangent space
    s = normalize(TangentFragPos - TangentViewPos); 

    // size and start position of search in texture space
    ds = s.xy / s.z * depth;
    //ds = s.xy / s.z * u_depth;
    dp = texCoords * tile;

    // get intersection distance
    d = rayIntersectRm(u_depthTexture,dp,ds);

    // get normal and color at intersection point
    uv=dp+ds*d;
    t=texture(u_normalTexture, uv);
    c=texture(u_colorTexture, uv);
    t.xyz=t.xyz*2.0-1.0; // expand normal to eye space
    t.xyz=normalize(TBN * t.xyz);
    vec3 normal_vec = t.xyz;

    //ambient
    vec3 ambient = 0.1 * c.xyz;

    //diffuse
    vec3 lightDir = normalize(TangentLightPos - TangentFragPos);
    float diff = max(dot(lightDir, normal_vec), 0.0);
    vec3 diffuse = diff * c.xyz;

    // specular
    vec3 viewDir = normalize(TangentViewPos - TangentFragPos);
    vec3 reflectDir = reflect(-lightDir, normal_vec);
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    float spec = pow(max(dot(normal_vec, halfwayDir), 0.0), 32.0);
    vec3 specular = vec3(0.2) * spec;

    finalColor = vec4(ambient + diffuse + specular, 1.0);
}

float rayIntersectRm(sampler2D depthTexture, vec2 dp, vec2 ds)
{
    const int linearSearchSteps = 10;
    const int binarySearchSteps = 5;

    // current size of search window
    float depthStep = 1.0 / float(linearSearchSteps);

    // current depth position
    float currentDepth = 0.0; 

    // best match found (starts with last position 1.0)
    float bestDepth = 1.0;

    // search from front to back for first point inside the object
    for ( int i = 0; i < linearSearchSteps-1; i++)
    {
        currentDepth += depthStep;
        vec4 t = texture(depthTexture, dp+ds*currentDepth);
        if (bestDepth > 0.996)
        {// if no depth found yet
            if (currentDepth >= dot(t.xyz, vec3(0.2126, 0.7152, 0.0722)))
            {
                bestDepth = currentDepth; // store best depth
            }
        }
    }
    currentDepth = bestDepth;
    // search around first point (depth) for closest match
    for ( int i=0; i<binarySearchSteps;i++)
    {
        depthStep *= 0.5;
        vec4 t = texture(depthTexture, dp+ds*currentDepth);
        if (currentDepth >= dot(t.xyz, vec3(0.2126, 0.7152, 0.0722)))
        {
            bestDepth = currentDepth;
            currentDepth -= 2.0 * depthStep;
        }
        currentDepth += depthStep;
    }
    return bestDepth;
}

void textureMappingWithIllumination()
{
    // TBN transforms tangent space to world space
    mat3 TBN = mat3(tangent, biTangent, normal);
    // TBN inverse transforms world space to tangent space
    mat3 TBN_inverse = transpose(TBN);
    vec3 lightPosViewSpace = TBN * TangentLightPos;
    vec3 fragPosViewSpace = TBN * TangentFragPos;
    vec3 viewPosViewSpace = TBN * TangentViewPos;


    vec3 lightColor = vec3(1.0);
    vec4 fragmentColor = texture(u_colorTexture, texCoords);

    // ambient component
    vec3 ambient = 0.1 * lightColor;

    // diffuse component
    vec3 lightDir = normalize(lightPosViewSpace - fragPosViewSpace);
    float diff = max(dot(-normal, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    // specular component
    float specularStrength = 0.5;
    vec3 viewDir = normalize(viewPosViewSpace - fragPosViewSpace);
    vec3 reflectDir = reflect(-lightDir, -normal);  
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = specularStrength * spec * lightColor;  


    vec3 result = (ambient + diffuse + specular) * fragmentColor.xyz;
    finalColor = vec4(result, 1.0);
}

`;