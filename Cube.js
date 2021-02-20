class Cube
{
    constructor(gl)
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

            var tempTangetBitangent = this.calculateTangentBitangent(vertex1, vertex2, vertex3, texCoord1, texCoord2, texCoord3, normal);
            console.log(tempTangetBitangent);
        }

        // this.calculateTangentBitangent([-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5,  0.5, -0.5], [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0, 0, 1]);
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



    // static vertexData =
    // [
    //     // Front face     // Texture coordinates
    //     -1.0, -1.0,  1.0, 0.0, 0.0,
    //      1.0, -1.0,  1.0, 1.0, 0.0,
    //      1.0,  1.0,  1.0, 1.0, 1.0,
    //     -1.0,  1.0,  1.0, 0.0, 1.0,

    //     // Back face
    //     -1.0, -1.0, -1.0, 0.0, 0.0,
    //     -1.0,  1.0, -1.0, 1.0, 0.0,
    //      1.0,  1.0, -1.0, 1.0, 1.0,
    //      1.0, -1.0, -1.0, 0.0, 1.0,

    //     // Top face
    //     -1.0,  1.0, -1.0, 0.0, 0.0,
    //     -1.0,  1.0,  1.0, 1.0, 0.0,
    //      1.0,  1.0,  1.0, 1.0, 1.0,
    //      1.0,  1.0, -1.0, 0.0, 1.0,

    //     // Bottom face
    //     -1.0, -1.0, -1.0, 0.0, 0.0,
    //      1.0, -1.0, -1.0, 1.0, 0.0,
    //      1.0, -1.0,  1.0, 1.0, 1.0,
    //     -1.0, -1.0,  1.0, 0.0, 1.0,

    //     // Right face
    //      1.0, -1.0, -1.0, 0.0, 0.0,
    //      1.0,  1.0, -1.0, 1.0, 0.0,
    //      1.0,  1.0,  1.0, 1.0, 1.0,
    //      1.0, -1.0,  1.0, 0.0, 1.0,

    //     // Left face
    //     -1.0, -1.0, -1.0, 0.0, 0.0,
    //     -1.0, -1.0,  1.0, 1.0, 0.0,
    //     -1.0,  1.0,  1.0, 1.0, 1.0,
    //     -1.0,  1.0, -1.0, 0.0, 1.0
    // ];

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

    // static initCubeProperties(gl)
    // {
    //     {
    //         const numComponents = 3;
    //         const type = gl.FLOAT;
    //         const normalize = false;
    //         const stride = 0;
    //         const offset = 0;
    //         gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    //         gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
    //         gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    //     }

    //     {
    //         const numComponents = 2;
    //         const type = gl.FLOAT;
    //         const normalize = false;
    //         const stride = 0;
    //         const offset = 0;
    //         gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    //         gl.vertexAttribPointer(
    //             programInfo.attribLocations.textureCoord,
    //             numComponents,
    //             type,
    //             normalize,
    //             stride,
    //             offset);
    //         gl.enableVertexAttribArray(
    //             programInfo.attribLocations.textureCoord);
    //     }
    // }

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

    // unsigned int quadVAO = 0;
    // unsigned int quadVBO;
    // void renderQuad()
    // {
    //     if (quadVAO == 0)
    //     {
    //         // positions
    //         glm::vec3 pos1(-1.0f, 1.0f, 0.0f);
    //         glm::vec3 pos2(-1.0f, -1.0f, 0.0f);
    //         glm::vec3 pos3(1.0f, -1.0f, 0.0f);
    //         glm::vec3 pos4(1.0f, 1.0f, 0.0f);
    //         // texture coordinates
    //         glm::vec2 uv1(0.0f, 1.0f);
    //         glm::vec2 uv2(0.0f, 0.0f);
    //         glm::vec2 uv3(1.0f, 0.0f);
    //         glm::vec2 uv4(1.0f, 1.0f);
    //         // normal vector
    //         glm::vec3 nm(0.0f, 0.0f, 1.0f);
    
    //         // calculate tangent/bitangent vectors of both triangles
    //         glm::vec3 tangent1, bitangent1;
    //         glm::vec3 tangent2, bitangent2;
    //         // triangle 1
    //         // ----------
    //         glm::vec3 edge1 = pos2 - pos1;
    //         glm::vec3 edge2 = pos3 - pos1;
    //         glm::vec2 deltaUV1 = uv2 - uv1;
    //         glm::vec2 deltaUV2 = uv3 - uv1;
    
    //         float f = 1.0f / (deltaUV1.x * deltaUV2.y - deltaUV2.x * deltaUV1.y);
    
    //         tangent1.x = f * (deltaUV2.y * edge1.x - deltaUV1.y * edge2.x);
    //         tangent1.y = f * (deltaUV2.y * edge1.y - deltaUV1.y * edge2.y);
    //         tangent1.z = f * (deltaUV2.y * edge1.z - deltaUV1.y * edge2.z);
    //         tangent1 = glm::normalize(tangent1);
    
    //         bitangent1.x = f * (-deltaUV2.x * edge1.x + deltaUV1.x * edge2.x);
    //         bitangent1.y = f * (-deltaUV2.x * edge1.y + deltaUV1.x * edge2.y);
    //         bitangent1.z = f * (-deltaUV2.x * edge1.z + deltaUV1.x * edge2.z);
    //         bitangent1 = glm::normalize(bitangent1);
    
    //         // triangle 2
    //         // ----------
    //         edge1 = pos3 - pos1;
    //         edge2 = pos4 - pos1;
    //         deltaUV1 = uv3 - uv1;
    //         deltaUV2 = uv4 - uv1;
    
    //         f = 1.0f / (deltaUV1.x * deltaUV2.y - deltaUV2.x * deltaUV1.y);
    
    //         tangent2.x = f * (deltaUV2.y * edge1.x - deltaUV1.y * edge2.x);
    //         tangent2.y = f * (deltaUV2.y * edge1.y - deltaUV1.y * edge2.y);
    //         tangent2.z = f * (deltaUV2.y * edge1.z - deltaUV1.y * edge2.z);
    //         tangent2 = glm::normalize(tangent2);
    
    
    //         bitangent2.x = f * (-deltaUV2.x * edge1.x + deltaUV1.x * edge2.x);
    //         bitangent2.y = f * (-deltaUV2.x * edge1.y + deltaUV1.x * edge2.y);
    //         bitangent2.z = f * (-deltaUV2.x * edge1.z + deltaUV1.x * edge2.z);
    //         bitangent2 = glm::normalize(bitangent2);
    
    
    //         float quadVertices[] = {
    //             // positions            // normal         // texcoords  // tangent                          // bitangent
    //             pos1.x, pos1.y, pos1.z, nm.x, nm.y, nm.z, uv1.x, uv1.y, tangent1.x, tangent1.y, tangent1.z, bitangent1.x, bitangent1.y, bitangent1.z,
    //             pos2.x, pos2.y, pos2.z, nm.x, nm.y, nm.z, uv2.x, uv2.y, tangent1.x, tangent1.y, tangent1.z, bitangent1.x, bitangent1.y, bitangent1.z,
    //             pos3.x, pos3.y, pos3.z, nm.x, nm.y, nm.z, uv3.x, uv3.y, tangent1.x, tangent1.y, tangent1.z, bitangent1.x, bitangent1.y, bitangent1.z,
    
    //             pos1.x, pos1.y, pos1.z, nm.x, nm.y, nm.z, uv1.x, uv1.y, tangent2.x, tangent2.y, tangent2.z, bitangent2.x, bitangent2.y, bitangent2.z,
    //             pos3.x, pos3.y, pos3.z, nm.x, nm.y, nm.z, uv3.x, uv3.y, tangent2.x, tangent2.y, tangent2.z, bitangent2.x, bitangent2.y, bitangent2.z,
    //             pos4.x, pos4.y, pos4.z, nm.x, nm.y, nm.z, uv4.x, uv4.y, tangent2.x, tangent2.y, tangent2.z, bitangent2.x, bitangent2.y, bitangent2.z
    //         };
    //         // configure plane VAO
    //         glGenVertexArrays(1, &quadVAO);
    //         glGenBuffers(1, &quadVBO);
    //         glBindVertexArray(quadVAO);
    //         glBindBuffer(GL_ARRAY_BUFFER, quadVBO);
    //         glBufferData(GL_ARRAY_BUFFER, sizeof(quadVertices), &quadVertices, GL_STATIC_DRAW);
    //         glEnableVertexAttribArray(0);
    //         glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 14 * sizeof(float), (void*)0);
    //         glEnableVertexAttribArray(1);
    //         glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 14 * sizeof(float), (void*)(3 * sizeof(float)));
    //         glEnableVertexAttribArray(2);
    //         glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 14 * sizeof(float), (void*)(6 * sizeof(float)));
    //         glEnableVertexAttribArray(3);
    //         glVertexAttribPointer(3, 3, GL_FLOAT, GL_FALSE, 14 * sizeof(float), (void*)(8 * sizeof(float)));
    //         glEnableVertexAttribArray(4);
    //         glVertexAttribPointer(4, 3, GL_FLOAT, GL_FALSE, 14 * sizeof(float), (void*)(11 * sizeof(float)));
    //     }
    //     glBindVertexArray(quadVAO);
    //     glDrawArrays(GL_TRIANGLES, 0, 6);
    //     glBindVertexArray(0);
    // }
}