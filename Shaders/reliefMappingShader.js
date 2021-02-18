var reliefMappingVertexShader = `#version 300 es

precision highp float;

in vec3 aPos;
in vec3 aNormal;
in vec2 aTexCoords;
in vec3 aTangent;
in vec3 aBitangent;

out vec3 TangentFragPos;
out vec3 TangentLightPos;
out vec3 TangentViewPos;
out vec2 texCoords;
out vec3 tangent;
out vec3 biTangent;
out vec3 normal;

// out VS_OUT {
//     vec3 TangentFragPos;
//     vec3 TangentLightPos;
//     vec3 TangentViewPos;
//     vec2 texCoords;
//     vec3 tangent;
//     vec3 biTangent;
//     vec3 normal;
// } vs_out;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

uniform vec3 lightPos;
uniform vec3 viewPos;

void main()
{
    vec3 fragPos = vec3(model * vec4(aPos, 1.0));
    texCoords = aTexCoords;   
    
    vec3 T = normalize(mat3(model) * aTangent);
    vec3 B = normalize(mat3(model) * aBitangent);
    vec3 N = - normalize(mat3(model) * aNormal);
    // TBN inverse transforms world space to tangent space
    mat3 TBN_inverse = transpose(mat3(T, B, N));

    tangent = T;
    biTangent = B;
    normal = N;

    TangentLightPos = TBN_inverse * lightPos;
    TangentViewPos  = TBN_inverse * viewPos;
    TangentFragPos  = TBN_inverse * fragPos;
    
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}
`;

var reliefMappingFragmentShader = `#version 300 es

precision highp float;

in vec3 TangentFragPos;
in vec3 TangentLightPos;
in vec3 TangentViewPos;
in vec2 texCoords;
in vec3 tangent;
in vec3 biTangent;
in vec3 normal;

out vec4 finalColor;

// in VS_OUT {
//     vec3 TangentFragPos;
//     vec3 TangentLightPos;
//     vec3 TangentViewPos;
//     vec2 texCoords;
//     vec3 tangent;
//     vec3 biTangent;
//     vec3 normal;
// } fs_in;

uniform sampler2D colorTexture;
uniform sampler2D normalTexture;
uniform sampler2D depthTexture;

// uniform float tile = 1.0;
// uniform float depth = 0.3;

float tile = 1.0;
float depth = 0.3;

float rayIntersectRm(sampler2D depthTexture, vec2 dp, vec2 ds);


void main()
{
    // TBN transforms tangent space to world space
    mat3 TBN = mat3(tangent, biTangent, normal);
    // TBN inverse transforms world space to tangent space
    mat3 TBN_inverse = transpose(TBN);
    vec3 lightPosViewSpace = TBN * TangentLightPos;
    vec3 fragPosViewSpace = TBN * TangentFragPos;
    vec3 viewPosViewSpace = TBN * TangentViewPos;




    //Relief mapping
    vec4 t,c; vec3 p,v,l,s; vec2 dp,ds,uv; float d;
    // ray intersect in view direction
    p = fragPosViewSpace; // pixel position in eye space
    v = normalize(viewPosViewSpace - p); // view vector in eye space
    // view vector in tangent space
//    s = normalize(vec3(dot(v,tangent.xyz), dot(v,biTangent.xyz), dot(normal,-v)));
    s = normalize(TangentFragPos - TangentViewPos); 
    // size and start position of search in texture space
    ds = s.xy / s.z * depth;
    dp = texCoords * tile;

    // get intersection distance
    d = rayIntersectRm(depthTexture,dp,ds);
    // get normal and color at intersection point
    uv=dp+ds*d;
    t=texture(normalTexture, uv);
    c=texture(colorTexture, uv);
    t.xyz=t.xyz*2.0-1.0; // expand normal to eye space
    t.xyz=normalize(TBN * t.xyz);
    vec3 normal = t.xyz;
    // compute light direction
//    p += v*d*s.z;
//    l = normalize(p - lightPosViewSpace);

    //ambient
    vec3 ambient = 0.1 * c.xyz;
    //diffuse
    vec3 lightDir = normalize(TangentLightPos - TangentFragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * c.xyz;
    // specular
    vec3 viewDir = normalize(TangentViewPos - TangentFragPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);

    vec3 specular = vec3(0.2) * spec;
    finalColor = vec4(ambient + diffuse + specular, 1.0);

    

    // compute diffuse and specular terms
//    float att = clamp(dot(-l,normal), 0.0, 1.0);
//    float diff = clamp(dot(-l,t.xyz), 0.0, 1.0);
//    float spec = clamp(dot(normalize(-l-v),t.xyz), 0.0, 1.0);

//    finalColor = c;
//    finalColor = ambient * c;
//    finalColor.xyz += att * (c.xyz * diffuse.xyz * diff + specular.xyz * pow(spec,specular.w));
//    finalColor.w = 1.0;
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



`;