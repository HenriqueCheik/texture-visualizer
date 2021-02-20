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
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const modelMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();

    //------------------------------------------------------------//
    var testCube = new Cube(gl);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);   

    document.addEventListener('keypress', processInput, false);

    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // var reliefMappingShader = new Shader("Shaders/rtm.vert", "Shaders/rtm.frag", gl);
    var testShader = new Shader(vertexShader, fragmentShader, gl);
    var reliefMappingShader = new Shader(reliefMappingVertexShader, reliefMappingFragmentShader, gl);
    
    // texture retrieving from html
    var colorImage = document.getElementById('colorTexture');
    var normalImage = document.getElementById('normalTexture');
    var displacementImage = document.getElementById('displacementTexture');

    // texture creation from html image data
    var colorTexture = loadTexture(colorImage.src);
    // var normalTexture = loadTexture(normalImage.src);
    // var displacementTexture = loadTexture(displacementImage.src);

    testShader.use(gl);
    testShader.setInt(gl, "u_colorTexture", 0);
    // reliefMappingShader.setInt(gl, "u_normalTexture", 1);
    // reliefMappingShader.setInt(gl, "u_depthTexture", 2);

    // Shader data location
    var positionAttributeLocation = gl.getAttribLocation(testShader.id, "a_position");
    var textureCoordsAttributeLocation = gl.getAttribLocation(testShader.id, "a_textureCoords");
    // var modelUniformLocation = gl.getUniformLocation(testShader.id, "u_model");
    // var viewUniformLocation = gl.getUniformLocation(testShader.id, "u_view");
    // var projectionUniformLocation = gl.getUniformLocation(testShader.id, "u_projection");
    
    var vao = gl.createVertexArray();
    var positionBuffer = gl.createBuffer();
    
    // Bind VAO to buffer data
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.vertexData), gl.STATIC_DRAW);

    var normalize = false;    // don't normalize the data
    var stride = 8 * 4;       // A gl.FLOAT is 4 bytes and our vertexData has 5 floats per line. Stride is the same across this data

    // Position atributes
    var posSize = 3;          // number of components per line
    var posType = gl.FLOAT;
    var posOffset = 0;        // start at the beginning of the buffer

    // Texture coordinates atributes
    var texSize = 2;          // number of components per line
    var texType = gl.FLOAT;
    var texOffset = 3 * 4;    // start after position data
    
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, posSize, posType, normalize, stride, posOffset);

    gl.enableVertexAttribArray(textureCoordsAttributeLocation);
    gl.vertexAttribPointer(textureCoordsAttributeLocation, texSize, texType, normalize, stride, texOffset);

    // renderLoop
    var lastFrameTime = 0;
    var cubeRotation = 0;

    var cameraPos = [0.0, 0.0, 0.0];
    var lightPos = [1.0, 0.5, -1.0];

    requestAnimationFrame(renderLoop);

    function renderLoop(time)
    {
        var currentFrameTime = time;
        deltaTime = currentFrameTime - lastFrameTime;
        lastFrameTime = currentFrameTime;

        if(colorTextureChanged)
        {
            colorTexture = loadTexture(colorImage.src);
            colorTextureChanged = false;
        }
        if(normalTextureChanged)
        {
            // normalTexture = loadTexture(normalImage.src);
            normalTextureChanged = false;
        }
        if(displacementTextureChanged)
        {
            // displacementTexture = loadTexture(displacementImage.src);
            displacementTextureChanged = false;
        }

        // Clear the canvas
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // activate texture(s)
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);
        // glActiveTexture(GL_TEXTURE1);
        // glBindTexture(GL_TEXTURE_2D, normalTexture);
        // glActiveTexture(GL_TEXTURE2);
        // glBindTexture(GL_TEXTURE_2D, displacementTexture);

        testShader.use(gl);

        // camera and light positions
        // testShader.setVec3(gl, 'u_viewPos', cameraPos);
        // testShader.setVec3(gl, 'u_lightPos', lightPos);

        // model matrix
        // reset to identity
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -3.0]);
        // mat4.scale(modelMatrix, modelMatrix, [0.2, 0.2, 0.2]);
        mat4.rotate(modelMatrix, modelMatrix, cubeRotation, [0, 0, 1]);
        mat4.rotate(modelMatrix, modelMatrix, cubeRotation * 0.7, [0, 1, 0]);

        testShader.setMat4(gl, 'u_model', modelMatrix);
        
        // view matrix
        mat4.identity(viewMatrix);
        testShader.setMat4(gl, 'u_view', viewMatrix);
        
        // projection matrix
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        testShader.setMat4(gl, 'u_projection', projectionMatrix);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(vao);

        // draw
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var vertexCount = 36;
        gl.drawArrays(primitiveType, offset, vertexCount);

        cubeRotation += deltaTime * 0.001;

        requestAnimationFrame(renderLoop);
    }

    function processInput(event)
    {
        if(event.key == 'r')
        {
            // alert("red pressed");
            // red = 1.0;
            // green = 0.0;
            // blue = 0.0;
        }
        else if (event.key == 'g')
        {
            // alert("green pressed");
            // red = 0.0;
            // green = 1.0;
            // blue = 0.0;
        }
        else if (event.key == 'b')
        {
            // alert("blue pressed");
            // red = 0.0;
            // green = 0.0;
            // blue = 1.0;
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

