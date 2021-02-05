class Shader
{
    constructor(vertexShaderPath, fragmentShaderPath, gl)
    {
        var vertexShaderSource = vertexShaderPath;//this.readFile(vertexShaderPath);
        // console.log(vertexShaderSource);
        // console.log('\n');

        var fragmentShaderSource = fragmentShaderPath;
        // console.log(fragmentShaderSource);
        // console.log('\n');

        // VERTEX SHADER COMPILATION
        const vertex = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertex, vertexShaderSource);
        gl.compileShader(vertex);
        var success = gl.getShaderParameter(vertex, gl.COMPILE_STATUS);
        if (!success)
        {
            console.log('ERROR::SHADER::VERTEX::COMPILATION_FAILED');
            console.log(gl.getShaderInfoLog(vertex));
        }

        // FRAGMENT SHADER COMPILATION
        const fragment = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragment, fragmentShaderSource);
        gl.compileShader(fragment);
        success = gl.getShaderParameter(fragment, gl.COMPILE_STATUS);
        if(!success)
        {
            console.log('ERROR::SHADER::FRAGMENT::COMPILATION_FAILED');
            console.log(gl.getShaderInfoLog(fragment));
        }

        // PROGRAM LINKING
        this.id = gl.createProgram();
        gl.attachShader(this.id, vertex);
        gl.attachShader(this.id, fragment);
        gl.linkProgram(this.id);
        success = gl.getProgramParameter(this.id, gl.LINK_STATUS);
        if (!success) {
            console.log('ERROR::SHADER::PROGRAM::LINKING_FAILED');
            console.log(gl.getProgramInfoLog(this.id));
        }

        // CLEAN-UP
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
    }

    use(gl)
    {
        gl.useProgram(this.id);
    }

    setInt(gl, uniformName, value)
    {
        gl.uniform1i(gl.getUniformLocation(this.id, uniformName), value);
    }

    setVec3(gl, uniformName, value)
    {
        gl.uniform3f(gl.getUniformLocation(this.id, uniformName), value[0], value[1], value[2]);
    }

    // readFile(file)
    // {
    //     var fr = new FileReader();
    //     fr.onload=function()
    //     {
    //         return fr.result;
    //     }
    //     fr.readAsText(file);


    //     var xhr = new XMLHttpRequest();
    //     xhr.addEventListener("load", function(data) {
    //         return data.target.response;
    //     });
    //     xhr.open("GET", file);
    //     xhr.send();
    // }


}

//TODO: Carregar os shaders de arquivos locais (problemas com cross-domain requests -> teria que usar um servidor com back-end)

var vertexShader = `#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec3 a_position;
in vec2 a_textureCoords;

out vec2 texCoords;
 
// all shaders have a main function
void main() {
 
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = vec4(a_position, 1.0);
  texCoords = a_textureCoords;
}
`;

var fragmentShader = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec2 texCoords;
 
uniform sampler2D u_colorTexture;

// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // Just set the output to a constant reddish-purple
  outColor = texture(u_colorTexture, texCoords);
}
`;