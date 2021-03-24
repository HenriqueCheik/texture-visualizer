// this class was adapted from http://www.songho.ca/opengl/gl_sphere.html according to my needs
// credits goes to Song Ho Ahn (song.ahn@gmail.com)

class Sphere
{
    constructor()
    {
        this.radius = 1;
        this.sectorCount = 30;
        this.stackCount = 20;
        this.vertexCount = 0;
        this.data = [];

        this.buildData();

        this.stride = (this.data.length / this.vertexCount) * 4;
        //console.log("Sphere stride: " + this.stride);
    }
    
    buildData()
    {
        let i, j, z, n, tb, xy, v1, v2, v3, v4, vi1, vi2;
        let sectorStep = 2 * Math.PI / this.sectorCount;
        let stackStep = Math.PI / this.stackCount;
        let sectorAngle, stackAngle;
        let tmpVertices = [];
        let vertex = {};    // to store (x,y,z,s,t)

        // compute all vertices first, each vertex contains (x,y,z,s,t) except normal
        for(i = 0; i <= this.stackCount; ++i)
        {
            stackAngle = Math.PI / 2 - i * stackStep;       // starting from pi/2 to -pi/2
            xy = this.radius * Math.cos(stackAngle);        // r * cos(u)
            z = this.radius * Math.sin(stackAngle);         // r * sin(u)

            // add (sectorCount+1) vertices per stack
            // the first and last vertices have same position and normal, but different tex coords
            for(j = 0; j <= this.sectorCount; ++j)
            {
                sectorAngle = j * sectorStep;               // starting from 0 to 2pi
                vertex = {x: xy * Math.cos(sectorAngle),    // x = r * cos(u) * cos(v)
                          y: xy * Math.sin(sectorAngle),    // y = r * cos(u) * sin(v)
                          z: z,                             // z = r * sin(u)
                          s: j / this.sectorCount * (this.sectorCount/2),
                          t: i / this.stackCount * (this.stackCount/2)};
                tmpVertices.push(vertex);
            }
        }

        for(i = 0; i < this.stackCount; ++i)
        {
            vi1 = i * (this.sectorCount + 1);               // index of tmpVertices
            vi2 = (i+1) * (this.sectorCount + 1);

            for(j = 0; j < this.sectorCount; ++j, ++vi1, ++vi2)
            {
                // get 4 vertices per sector
                //  v1-v3
                //  |  |
                //  v2-v4
                v1 = tmpVertices[vi1];
                v2 = tmpVertices[vi2];
                v3 = tmpVertices[vi1+1];
                v4 = tmpVertices[vi2+1];

                // if 1st stack and last stack, store only 1 triangle per sector
                // otherwise, store 2 triangles (quad) per sector
                if(i == 0) // a triangle for first stack ======================
                {
                    n = this.calculateNormal(v1.x,v1.y,v1.z, v2.x,v2.y,v2.z, v4.x,v4.y,v4.z);

                    tb = this.calculateTangentBitangent([v1.x,v1.y,v1.z],
                                                        [v2.x,v2.y,v2.z],
                                                        [v4.x,v4.y,v4.z],
                                                        [v1.s, v1.t],
                                                        [v2.s, v2.t],
                                                        [v4.s, v4.t],
                                                        n);

                    this.data = this.data.concat(v1.x,v1.y,v1.z, v1.s, v1.t, n[0], n[1], n[2], tb);
                    this.data = this.data.concat(v2.x,v2.y,v2.z, v2.s, v2.t, n[0], n[1], n[2], tb);
                    this.data = this.data.concat(v4.x,v4.y,v4.z, v4.s, v4.t, n[0], n[1], n[2], tb);

                    this.vertexCount +=3;

                }
                else if(i == (this.stackCount-1)) // a triangle for last stack =====
                {
                    n = this.calculateNormal(v1.x,v1.y,v1.z, v2.x,v2.y,v2.z, v3.x,v3.y,v3.z);

                    tb = this.calculateTangentBitangent([v1.x,v1.y,v1.z],
                                                        [v2.x,v2.y,v2.z],
                                                        [v3.x,v3.y,v3.z],
                                                        [v1.s, v1.t],
                                                        [v2.s, v2.t],
                                                        [v3.s, v3.t],
                                                        n);

                    this.data = this.data.concat(v1.x,v1.y,v1.z, v1.s, v1.t, n[0], n[1], n[2], tb);
                    this.data = this.data.concat(v2.x,v2.y,v2.z, v2.s, v2.t, n[0], n[1], n[2], tb);
                    this.data = this.data.concat(v3.x,v3.y,v3.z, v3.s, v3.t, n[0], n[1], n[2], tb);

                    this.vertexCount +=3;
                }
                else // 2 triangles for others ================================
                {
                    n = this.calculateNormal(v1.x,v1.y,v1.z, v2.x,v2.y,v2.z, v3.x,v3.y,v3.z);

                    tb = this.calculateTangentBitangent([v1.x,v1.y,v1.z],
                                                        [v2.x,v2.y,v2.z],
                                                        [v3.x,v3.y,v3.z],
                                                        [v1.s, v1.t],
                                                        [v2.s, v2.t],
                                                        [v3.s, v3.t],
                                                        n);

                    this.data = this.data.concat(v1.x,v1.y,v1.z, v1.s, v1.t, n[0], n[1], n[2], tb);
                    this.data = this.data.concat(v2.x,v2.y,v2.z, v2.s, v2.t, n[0], n[1], n[2], tb);
                    this.data = this.data.concat(v3.x,v3.y,v3.z, v3.s, v3.t, n[0], n[1], n[2], tb);


                    tb = this.calculateTangentBitangent([v3.x,v3.y,v3.z],
                                                        [v2.x,v2.y,v2.z],
                                                        [v4.x,v4.y,v4.z],
                                                        [v3.s, v3.t],
                                                        [v2.s, v2.t],
                                                        [v4.s, v4.t],
                                                        n);


                    this.data = this.data.concat(v3.x,v3.y,v3.z, v3.s, v3.t, n[0], n[1], n[2], tb);
                    this.data = this.data.concat(v2.x,v2.y,v2.z, v2.s, v2.t, n[0], n[1], n[2], tb);
                    this.data = this.data.concat(v4.x,v4.y,v4.z, v4.s, v4.t, n[0], n[1], n[2], tb);

                    this.vertexCount +=6;
                }
            }
        }
    }

    calculateNormal(x1,y1,z1, x2,y2,z2, x3,y3,z3)
    {
        let normal = new Float32Array(3);
        let ex1 = x2 - x1;
        let ey1 = y2 - y1;
        let ez1 = z2 - z1;
        let ex2 = x3 - x1;
        let ey2 = y3 - y1;
        let ez2 = z3 - z1;

        // cross product: e1 x e2;
        let nx = ey1 * ez2 - ez1 * ey2;
        let ny = ez1 * ex2 - ex1 * ez2;
        let nz = ex1 * ey2 - ey1 * ex2;

        //  normalize vector
        let length = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if(length > 0.000001)
        {
            normal[0] = nx / length;
            normal[1] = ny / length;
            normal[2] = nz / length;
        }
        return normal;
    }

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