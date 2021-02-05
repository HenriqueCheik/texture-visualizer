var colorTextureChanged = false;
var normalTextureChanged = false;
var displacementTextureChanged = false;

$('document').ready(function(){

    var inputElement = $('#colorTextureUpload');
    // inputElement.addEventListener("change", handleFiles, false);
    inputElement.on("change", handleFiles);

    inputElement = $('#normalTextureUpload');
    inputElement.on("change", handleFiles);

    inputElement = $('#displacementTextureUpload');
    inputElement.on("change", handleFiles);

    function handleFiles() {
        var fileList = this.files; /* now you can work with the file list */
        var file = fileList[0];
        console.log("Selected file: " + file.name);

        if (file.type.startsWith('image/'))
        {
            console.log("Received image file!");
            
            console.log("Id from element clicked: " + this.id);

            if(this.id == "colorTextureUpload")
            {
                var textureElement = $('#colorTexture');
                colorTextureChanged = true;
            }
            else if(this.id == "normalTextureUpload")
            {
                var textureElement = $('#normalTexture');
                normalTextureChanged = true;
            }
            else if(this.id == "displacementTextureUpload")
            {
                var textureElement = $('#displacementTexture');
                displacementTextureChanged = true;
            }
            var imageURL = window.URL.createObjectURL(file);
            textureElement.attr('src', imageURL);

        }
        else
        {
            alert("Invalid file!");
        }
    }
});

