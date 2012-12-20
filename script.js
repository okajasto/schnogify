$(function(){
	var dropBox = $('#dropbox'),
        wait = $('.progress img'),
        canvas = document.getElementById('image'),
        schnogeFace = document.getElementById('schnoge_face'),
        image = new Image();

    image.onload = function () {
        wait.show();
		// Resize the canvas and containers to match the image
        canvas.width = image.width;
        canvas.height = image.height;
		resizeContainers(image.width, image.height);
		// Draw image
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        // Detect faces
        new HAAR.Detector(haarcascade_frontalface_alt).image(image).complete(function () {
            for (i = 0; i < this.objects.length; i++) {
                // Get the area of the detected face and draw schnogel on top of it
                schnogel(this.objects[i], schnogeFace, ctx);
            }
            // When ready recreate the download button
            $('#downloadButton').attr('download', getNewFilename());
            $('#downloadButton').attr('href', document.getElementById('image').toDataURL("image/jpeg"));
            wait.hide();
        }).detect(1, 1.25, 0.16, 1, true);
    };

	// Set the droppable box area. Currently also sends data to url '', which could be improved later
	dropBox.filedrop({
		maxfiles: 1,
    	maxfilesize: 2,
        url: '',
    	error: function(err, file) {
			switch(err) {
				case 'BrowserNotSupported':
					alert("Sorry! Your browser is ancient and doesn't support the new cool ways to upload files. Try again with something modern");
					break;
				case 'FileTooLarge':
					alert(file.name+' is too big! Maximum file size is 2MB.');
					break;
				default:
					break;
			}
		},
		beforeEach: function(file){
			if(!file.type.match(/^image\//)){
				alert('Only images are allowed!');
				return false;
			}
		},
		uploadStarted:function(i, file, len){
            uploadFileToMemory(file);
		}
    });
	
	// Resizes the container divs
	function resizeContainers(width, height) {
	    // Change the size of elements to match the image-size
        $('#container').css('width', width);
        $('#container').css('height', height);
        if (width > 800) {
            $('#dropbox, .outer').css('width', width);
        } else {
            $('#dropbox, .outer').css('width', 800);
        }
        if (height > 600) {
            $('#dropbox, .outer').css('height', height);
        } else {
            $('#dropbox, .outer').css('height', 600);
        }
	}

    // Uploads the file to dataURL
	function uploadFileToMemory(file){
		var reader = new FileReader();
		reader.onload = function(e){
            // After we have downloaded the file, let's set it to our Image object
            // The onload method of the canvas will be triggered
			image.src = e.target.result;
		};
        // Reads the file in memory. When loaded, will call reader.onload.
		reader.readAsDataURL(file);
	}

    // Draw schnogel-faces to the canvas
    function schnogel(rect, img, ctx) {
        // A minor optimization: Pre-calculate the size of png. Will bite your leg, if/when changing
        // the base image
        var baseW = 166;
        var baseH = 202;
        // Let's create the base image slightly larger than the calculated face area
        var addition = rect.width * 0.4;

        // Starting values. The size of base image with some additional width
        var x = rect.x - addition / 2;
        var y = rect.y - addition / 4;
        var w = rect.width + addition;
        var h = rect.height;
        // Calculate the targetValues
        var targetH = (baseH * w) / baseW;
        var targetX = x + (w - w) / 2;
        var targetY = y + (h - targetH) / 2;
        // Draw and scale the base image to the main canvas
        ctx.drawImage(schnogeFace, targetX, targetY, w, targetH);
    }
    // Randomize new fileName
    function getNewFilename() {
        return "schnoegel_" + Math.ceil((Math.random() * 10000)) + ".jpeg";
    }
});