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


    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);   

    document.addEventListener('keypress', processInput, false);

    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // var reliefMappingShader = new Shader("Shaders/rtm.vert", "Shaders/rtm.frag", gl);
    var testShader = new Shader(vertexShader, fragmentShader, gl);
    var reliefMappingShader = new Shader(reliefMappingVertexShader, reliefMappingFragmentShader, gl);
    

    var colorImage = document.getElementById('colorTexture');
    var normalImage = document.getElementById('normalTexture');
    var displacementImage = document.getElementById('displacementTexture');

    var colorTexture = loadTexture(colorImage.src);

    testShader.use(gl);
    testShader.setInt(gl, "u_colorTexture", 0);

    // Shader data location
    var positionAttributeLocation = gl.getAttribLocation(testShader.id, "a_position");
    var textureCoordsAttributeLocation = gl.getAttribLocation(testShader.id, "a_textureCoords");
    // var modelUniformLocation = gl.getUniformLocation(testShader.id, "u_model");
    // var viewUniformLocation = gl.getUniformLocation(testShader.id, "u_view");
    // var projectionUniformLocation = gl.getUniformLocation(testShader.id, "u_projection");
    
    // Create a vertex array object (attribute state)
    var vao = gl.createVertexArray();
    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();
    // Texture buffer
    // var textureBuffer = gl.createBuffer();
    // Buffer the element array data
    // var indexBuffer = gl.createBuffer();
    
    // Bind VAO to buffer data
    gl.bindVertexArray(vao);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CubeProperties.vertexData), gl.STATIC_DRAW);
    
    // var vertexData = [
        //     // positions       // texture coords
        //     -0.5,  0.5, 0.0,   0.0, 1.0,   // top left 
        //     -0.5, -0.5, 0.0,   0.0, 0.0,   // bottom left
        //      0.5, -0.5, 0.0,   1.0, 0.0,   // bottom right
        
        //     -0.5,  0.5, 0.0,   0.0, 1.0,   // top left
        //      0.5, -0.5, 0.0,   1.0, 0.0,   // bottom right
        //      0.5,  0.5, 0.0,   1.0, 1.0    // top right
        // ];
    
    // gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CubeProperties.textureCoordinates), gl.STATIC_DRAW);
    
        
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(CubeProperties.indices), gl.STATIC_DRAW);

    var normalize = false;    // don't normalize the data
    var stride = 5 * 4;       // A gl.FLOAT is 4 bytes and our vertexData has 5 floats per line. Stride is the same across this data

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

    // {
    //     const numComponents = 3;
    //     const type = gl.FLOAT;
    //     const normalize = false;
    //     const stride = 0;
    //     const offset = 0;
    //     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    //     gl.vertexAttribPointer(positionAttributeLocation, numComponents, type, normalize, stride, offset);
    //     gl.enableVertexAttribArray(positionAttributeLocation);
    // }

    // {
    //     const numComponents = 2;
    //     const type = gl.FLOAT;
    //     const normalize = false;
    //     const stride = 0;
    //     const offset = 0;
    //     gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    //     gl.vertexAttribPointer(textureCoordsAttributeLocation, numComponents, type, normalize, stride, offset);
    //     gl.enableVertexAttribArray(textureCoordsAttributeLocation);
    // }


    // renderLoop
    requestAnimationFrame(renderLoop);

    var lastFrameTime = 0;
    var cubeRotation = 0;

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

        // Clear the canvas
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // activate texture(s)
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);
        // glActiveTexture(GL_TEXTURE1);
        // glBindTexture(GL_TEXTURE_2D, reliefTexture);

        testShader.use(gl);

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
        // const primitiveType = gl.TRIANGLES;
        // const vertexCount = 36;
        // const type = gl.UNSIGNED_SHORT;
        // const offset = 0;
        // gl.drawArrays(primitiveType, vertexCount, type, offset);

        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 36;
        gl.drawArrays(primitiveType, offset, count);

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

