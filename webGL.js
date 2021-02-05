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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    document.addEventListener('keypress', processInput, false);

    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);

    // var reliefMappingShader = new Shader("Shaders/rtm.vert", "Shaders/rtm.frag", gl);
    var reliefMappingShader = new Shader(vertexShader, fragmentShader, gl);

    var colorImage = document.getElementById('colorTexture');
    var normalImage = document.getElementById('normalTexture');
    var displacementImage = document.getElementById('displacementTexture');

    var colorTexture = loadTexture(colorImage.src);

    reliefMappingShader.use(gl);
    reliefMappingShader.setInt(gl, "u_colorTexture", 0);

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(reliefMappingShader.id, "a_position");
    var textureCoordsAttributeLocation = gl.getAttribLocation(reliefMappingShader.id, "a_textureCoords");

    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var vertexData = [
        // positions       // texture coords
        -0.5,  0.5, 0.0,   0.0, 1.0,   // top left 
        -0.5, -0.5, 0.0,   0.0, 0.0,   // bottom left
         0.5, -0.5, 0.0,   1.0, 0.0,   // bottom right

        -0.5,  0.5, 0.0,   0.0, 1.0,   // top left
         0.5, -0.5, 0.0,   1.0, 0.0,   // bottom right
         0.5,  0.5, 0.0,   1.0, 1.0    // top right
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

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

    // Create a vertex array object (attribute state)
    var vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, posSize, posType, normalize, stride, posOffset);

    gl.enableVertexAttribArray(textureCoordsAttributeLocation);
    gl.vertexAttribPointer(textureCoordsAttributeLocation, texSize, texType, normalize, stride, texOffset);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // renderLoop
    requestAnimationFrame(renderLoop);

    function renderLoop(time)
    {
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

        reliefMappingShader.use(gl);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(vao);

        // draw
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);

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

