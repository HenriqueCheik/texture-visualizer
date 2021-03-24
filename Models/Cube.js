class Cube
{
    constructor()
    {
        this.vertexCount = 36;
        this.stride = Cube.vertexData.length / this.vertexCount;
        this.data = [];

        for(var i = 0; i < this.vertexCount; i+=3)
        {
            const vertex1 = [Cube.vertexData[i * this.stride + 0], Cube.vertexData[i * this.stride + 1], Cube.vertexData[i * this.stride + 2]];
            const texCoord1 = [Cube.vertexData[i * this.stride + 3], Cube.vertexData[i * this.stride + 4]];
            const normal = [Cube.vertexData[i * this.stride + 5], Cube.vertexData[i * this.stride + 6], Cube.vertexData[i * this.stride + 7]];

            const vertex2 = [Cube.vertexData[i * this.stride + 8], Cube.vertexData[i * this.stride + 9], Cube.vertexData[i * this.stride + 10]];
            const texCoord2 = [Cube.vertexData[i * this.stride + 11], Cube.vertexData[i * this.stride + 12]];

            const vertex3 = [Cube.vertexData[i * this.stride + 16], Cube.vertexData[i * this.stride + 17], Cube.vertexData[i * this.stride + 18]];
            const texCoord3 = [Cube.vertexData[i * this.stride + 19], Cube.vertexData[i * this.stride + 20]];

            var tempTangentBitangent = this.calculateTangentBitangent(vertex1, vertex2, vertex3, texCoord1, texCoord2, texCoord3, normal);
            

            this.data = this.data.concat(vertex1, texCoord1, normal, tempTangentBitangent, vertex2, texCoord2, normal, tempTangentBitangent, vertex3, texCoord3, normal, tempTangentBitangent,)
        }
        this.stride = (this.data.length / this.vertexCount) * 4;

        //console.log("Cube stride: " + this.stride);
    }
    static vertexData =
        // vextex pos        // tex coords    // vertex normal
    [   // back face
        -0.5, -0.5, -0.5,    0.0, 0.0,        0.0, 0.0, -1.0,
         0.5, -0.5, -0.5,    1.0, 0.0,        0.0, 0.0, -1.0,
         0.5,  0.5, -0.5,    1.0, 1.0,        0.0, 0.0, -1.0,
         0.5,  0.5, -0.5,    1.0, 1.0,        0.0, 0.0, -1.0,
        -0.5,  0.5, -0.5,    0.0, 1.0,        0.0, 0.0, -1.0,
        -0.5, -0.5, -0.5,    0.0, 0.0,        0.0, 0.0, -1.0,

        // front face
        -0.5, -0.5,  0.5,    0.0, 0.0,        0.0, 0.0, 1.0,
         0.5, -0.5,  0.5,    1.0, 0.0,        0.0, 0.0, 1.0,
         0.5,  0.5,  0.5,    1.0, 1.0,        0.0, 0.0, 1.0,
         0.5,  0.5,  0.5,    1.0, 1.0,        0.0, 0.0, 1.0,
        -0.5,  0.5,  0.5,    0.0, 1.0,        0.0, 0.0, 1.0,
        -0.5, -0.5,  0.5,    0.0, 0.0,        0.0, 0.0, 1.0,

        // left face
        -0.5,  0.5,  0.5,    1.0, 0.0,       -1.0, 0.0, 0.0,
        -0.5,  0.5, -0.5,    1.0, 1.0,       -1.0, 0.0, 0.0,
        -0.5, -0.5, -0.5,    0.0, 1.0,       -1.0, 0.0, 0.0,
        -0.5, -0.5, -0.5,    0.0, 1.0,       -1.0, 0.0, 0.0,
        -0.5, -0.5,  0.5,    0.0, 0.0,       -1.0, 0.0, 0.0,
        -0.5,  0.5,  0.5,    1.0, 0.0,       -1.0, 0.0, 0.0,

        // right face
         0.5,  0.5,  0.5,    1.0, 0.0,        1.0, 0.0, 0.0,
         0.5,  0.5, -0.5,    1.0, 1.0,        1.0, 0.0, 0.0,
         0.5, -0.5, -0.5,    0.0, 1.0,        1.0, 0.0, 0.0,
         0.5, -0.5, -0.5,    0.0, 1.0,        1.0, 0.0, 0.0,
         0.5, -0.5,  0.5,    0.0, 0.0,        1.0, 0.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 0.0,        1.0, 0.0, 0.0,

        // bottom face
        -0.5, -0.5, -0.5,    0.0, 1.0,        0.0, -1.0, 0.0,
         0.5, -0.5, -0.5,    1.0, 1.0,        0.0, -1.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 0.0,        0.0, -1.0, 0.0,
         0.5, -0.5,  0.5,    1.0, 0.0,        0.0, -1.0, 0.0,
        -0.5, -0.5,  0.5,    0.0, 0.0,        0.0, -1.0, 0.0,
        -0.5, -0.5, -0.5,    0.0, 1.0,        0.0, -1.0, 0.0,

        // top face
        -0.5,  0.5, -0.5,    0.0, 1.0,        0.0, 1.0, 0.0,
         0.5,  0.5, -0.5,    1.0, 1.0,        0.0, 1.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 0.0,        0.0, 1.0, 0.0,
         0.5,  0.5,  0.5,    1.0, 0.0,        0.0, 1.0, 0.0,
        -0.5,  0.5,  0.5,    0.0, 0.0,        0.0, 1.0, 0.0,
        -0.5,  0.5, -0.5,    0.0, 1.0,        0.0, 1.0, 0.0
    ]

    static positions = 
    [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];

    static textureCoordinates =
    [
        // Front
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Back
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Top
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Bottom
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Right
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0,
        // Left
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        0.0,  1.0
    ];

    static indices =
    [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23    // left
    ];

    calculateTangentBitangent(vertex1, vertex2, vertex3, texCoords1, texCoords2, texCoords3, surfaceNormal)
    {
        // positions
        var pos1 = vec3.fromValues(vertex1[0], vertex1[1], vertex1[2]);
        var pos2 = vec3.fromValues(vertex2[0], vertex2[1], vertex2[2]);
        var pos3 = vec3.fromValues(vertex3[0], vertex3[1], vertex3[2]);

        // texture coordinates
        var uv1 = vec2.fromValues(texCoords1[0], texCoords1[1]);
        var uv2 = vec2.fromValues(texCoords2[0], texCoords2[1]);
        var uv3 = vec2.fromValues(texCoords3[0], texCoords3[1]);

        // normal vector
        var nm = vec3.fromValues(surfaceNormal[0], surfaceNormal[1], surfaceNormal[2]);

        // calculate tangent and bitangent vectors
        var edge1 = vec3.create();
        var edge2 = vec3.create();
        
        var deltaUV1 = vec2.create();
        var deltaUV2 = vec2.create();
        
        vec3.sub(edge1, pos2, pos1);
        vec3.sub(edge2, pos3, pos1);
        
        vec2.sub(deltaUV1, uv2, uv1);
        vec2.sub(deltaUV2, uv3, uv1);
        
        var f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);

        var tangent = vec3.create();
        var bitangent = vec3.create();

        tangent[0] = f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]);
        tangent[1] = f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]);
        tangent[2] = f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2]);
        vec3.normalize(tangent, tangent);

        bitangent[0] = f * (-deltaUV2[0] * edge1[0] + deltaUV1[0] * edge2[0]);
        bitangent[1] = f * (-deltaUV2[0] * edge1[1] + deltaUV1[0] * edge2[1]);
        bitangent[2] = f * (-deltaUV2[0] * edge1[2] + deltaUV1[0] * edge2[2]);
        vec3.normalize(bitangent, bitangent);

        return [tangent[0],  tangent[1],  tangent[2],  bitangent[0],  bitangent[1],  bitangent[2]];
    }
}