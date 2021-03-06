$('document').ready(function(){
    main()
});



function main()
{ 
    var canvas = document.getElementById('reliefMappingCanvas')
    var gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL not loaded correctly!");
        return;
    }

    // global variables
    var fovValue = 45;
    var fieldOfView = fovValue * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const modelMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();

    var depth = 0.1;
    var pause = false;

    //------------------------------------------------------------//
    var modelCube = new Cube();
    var modelSphere = new Sphere();
    //console.log("Number of vertices on sphere: " + modelSphere.vertexCount);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);   

    document.addEventListener('keypress', processInput, false);

    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // var reliefMappingShader = new Shader("Shaders/rtm.vert", "Shaders/rtm.frag", gl);
    //var textureMappingShader = new Shader(textureMappingVertexShader, textureMappingFragmentShader, gl);
    var reliefMappingShader = new Shader(reliefMappingVertexShader, reliefMappingFragmentShader, gl);
    
    // texture retrieving from html
    var colorImage = document.getElementById('colorTexture');
    var normalImage = document.getElementById('normalTexture');
    var displacementImage = document.getElementById('displacementTexture');

    // texture creation from html image data
    var colorTexture = loadTexture(colorImage.src);
    var normalTexture = loadTexture(normalImage.src);
    var displacementTexture = loadTexture(displacementImage.src);

    reliefMappingShader.use(gl);
    reliefMappingShader.setInt(gl, "u_colorTexture", 0);
    reliefMappingShader.setInt(gl, "u_normalTexture", 1);
    reliefMappingShader.setInt(gl, "u_depthTexture", 2);

    // Shader data location
    var positionAttributeLocation = gl.getAttribLocation(reliefMappingShader.id, "a_position");
    var textureCoordsAttributeLocation = gl.getAttribLocation(reliefMappingShader.id, "a_textureCoords");
    var normalAttributeLocation = gl.getAttribLocation(reliefMappingShader.id, "a_normal");
    var tangentAttributeLocation = gl.getAttribLocation(reliefMappingShader.id, "a_tangent");
    var bitangentAttributeLocation = gl.getAttribLocation(reliefMappingShader.id, "a_bitangent");
    
    // setting up cube VAO
    var cubeVao = gl.createVertexArray();
    var cubeDataBuffer = gl.createBuffer();
    
    // Bind VAO to buffer data
    gl.bindVertexArray(cubeVao);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeDataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelCube.data), gl.STATIC_DRAW);

    var normalize = false;    // don't normalize the data
    var stride = modelCube.stride;       // A gl.FLOAT is 4 bytes and our vertexData has 14 floats per line. Stride is the same across this data

    // Position attributes
    var posSize = 3;          // number of components per line
    var posType = gl.FLOAT;
    var posOffset = 0;        // start at the beginning of the buffer

    // Texture coordinates attributes
    var texSize = 2;          // number of components per line
    var texType = gl.FLOAT;
    var texOffset = 3 * 4;    // start after position data

    // Normal attributes
    var normalSize = 3;
    var normalType = gl.FLOAT;
    var normalOffset = 5 * 4;

    // Tangent attributes
    var tangentSize = 3;
    var tangentType = gl.FLOAT;
    var tangentOffset = 8 * 4;

    // Bitangent attributes
    var bitangentSize = 3;
    var bitangentType = gl.FLOAT;
    var bitangentOffset = 11 * 4;
    
    // Turn on cube attributes
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, posSize, posType, normalize, stride, posOffset);

    gl.enableVertexAttribArray(textureCoordsAttributeLocation);
    gl.vertexAttribPointer(textureCoordsAttributeLocation, texSize, texType, normalize, stride, texOffset);

    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, normalSize, normalType, normalize, stride, normalOffset);

    gl.enableVertexAttribArray(tangentAttributeLocation);
    gl.vertexAttribPointer(tangentAttributeLocation, tangentSize, tangentType, normalize, stride, tangentOffset);

    gl.enableVertexAttribArray(bitangentAttributeLocation);
    gl.vertexAttribPointer(bitangentAttributeLocation, bitangentSize, bitangentType, normalize, stride, bitangentOffset);

    // setting up sphere VAO
    var sphereVAO = gl.createVertexArray();
    var sphereDataBuffer = gl.createBuffer();

    stride = modelSphere.stride;

    gl.bindVertexArray(sphereVAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereDataBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelSphere.data), gl.STATIC_DRAW);

    // Turn on sphere attributes
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, posSize, posType, normalize, stride, posOffset);

    gl.enableVertexAttribArray(textureCoordsAttributeLocation);
    gl.vertexAttribPointer(textureCoordsAttributeLocation, texSize, texType, normalize, stride, texOffset);

    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, normalSize, normalType, normalize, stride, normalOffset);

    gl.enableVertexAttribArray(tangentAttributeLocation);
    gl.vertexAttribPointer(tangentAttributeLocation, tangentSize, tangentType, normalize, stride, tangentOffset);

    gl.enableVertexAttribArray(bitangentAttributeLocation);
    gl.vertexAttribPointer(bitangentAttributeLocation, bitangentSize, bitangentType, normalize, stride, bitangentOffset);

    // renderLoop
    var lastFrameTime = 0;
    var rotation = 0;

    var frameCounter = 0;
    var secondsCounter = 0;

    requestAnimationFrame(renderLoop);

    function renderLoop(time)
    {
        var currentFrameTime = time;
        deltaTime = currentFrameTime - lastFrameTime;
        lastFrameTime = currentFrameTime;

        frameCounter++;
        secondsCounter += deltaTime / 1000;
        if(secondsCounter > 1.0)
        {
            secondsCounter-= 1.0;
            document.getElementById('FPS').innerHTML = "FPS: " + frameCounter;
            frameCounter = 0;
        }

        if(colorTextureChanged)
        {
            colorTexture = loadTexture(colorImage.src);
            colorTextureChanged = false;
        }
        if(normalTextureChanged)
        {
            normalTexture = loadTexture(normalImage.src);
            normalTextureChanged = false;
        }
        if(displacementTextureChanged)
        {
            displacementTexture = loadTexture(displacementImage.src);
            displacementTextureChanged = false;
        }

        // Render acording to chosen shape
        var model = parseInt(document.getElementById('modelDropdown').value);

        // Clear the canvas
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // activate texture(s)
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, normalTexture);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, displacementTexture);

        reliefMappingShader.use(gl);

        // setting depth for relief mapping
        reliefMappingShader.setFloat(gl, 'u_depth', depth);

        // camera and light positions

        var cameraPos = [0.0, 0.0, 0.0];
        var lightPos = [parseFloat(document.getElementById('lightPosX').value),
                        parseFloat(document.getElementById('lightPosY').value),
                        parseFloat(document.getElementById('lightPosZ').value)];

        reliefMappingShader.setVec3(gl, 'u_viewPos', cameraPos);
        reliefMappingShader.setVec3(gl, 'u_lightPos', lightPos);

        // model matrix
        // reset to identity
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -3.0]);

        // scale down if its a sphere
        if(model == 2)
        {
            mat4.scale(modelMatrix, modelMatrix, [0.8, 0.8, 0.8]);
        }
        mat4.rotate(modelMatrix, modelMatrix, rotation, [0, 0, 1]);
        mat4.rotate(modelMatrix, modelMatrix, rotation * 0.7, [0, 1, 0]);

        reliefMappingShader.setMat4(gl, 'u_model', modelMatrix);
        
        // view matrix
        mat4.identity(viewMatrix);
        reliefMappingShader.setMat4(gl, 'u_view', viewMatrix);
        
        // projection matrix
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        reliefMappingShader.setMat4(gl, 'u_projection', projectionMatrix);

        // get which technique is being used to render

        var technique = parseInt(document.getElementById('mappingTechniquesDropdown').value);
        reliefMappingShader.setInt(gl, 'u_technique', technique);

        

        // sphere
        if(model == 2)
        {
            gl.bindVertexArray(sphereVAO);
    
            // draw
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var vertexCount = modelSphere.vertexCount;
            gl.drawArrays(primitiveType, offset, vertexCount);
        }

        // cube
        else{
            // Bind the attribute/buffer set we want.
            gl.bindVertexArray(cubeVao);
    
            // draw
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var vertexCount = modelCube.vertexCount;
            gl.drawArrays(primitiveType, offset, vertexCount);
        }

        if(!pause)
        {
            rotation += deltaTime * 0.0006;
        }

        requestAnimationFrame(renderLoop);
    }

    function processInput(event)
    {
        if(event.key == 'q')
        {
            depth -= 0.01;
            if(depth < 0.0)
            {
                depth = 0.0;
            }
        }
        else if(event.key == 'e')
        {
            depth += 0.01;
            if(depth > 0.5)
            {
                depth = 0.5;
            }
        }
        else if (event.key == 'p')
        {
            pause = !pause;
        }
        else if(event.key == '+')
        {
            fovValue -= 1.0;
            if(fovValue < 1.0)
            {
                fovValue = 1.0;
            }
            fieldOfView = fovValue * Math.PI / 180;
        }
        else if(event.key == '-')
        {
            fovValue += 1.0;
            if(fovValue > 45.0)
            {
                fovValue = 45.0;
            }
            fieldOfView = fovValue * Math.PI / 180;
        }
    }

    function loadTexture(url)
    {
        console.log("Received loadTexture with url:" + url);

        var texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        var mipLevel = 0;
        var internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        var srcFormat = gl.RGBA; 
        var srcType = gl.UNSIGNED_BYTE;
        var pixel = new Uint8Array([0, 0, 255, 255]);

        // assign temporary color until texture image is loaded
        gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, width, height, border, srcFormat, srcType, pixel);

        const textureImage = new Image();

        // after image is loaded, assign the correct texture
        textureImage.onload = function()
        {
            console.log("Texture image loaded! Updating texture");
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, textureImage);

            gl.generateMipmap(gl.TEXTURE_2D);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        }
        textureImage.src = url;

        return texture;
    }
}

