var inside = {}
$(function(){
    var dropBox = $('#dropbox'),
        wait = $('.progress img'),
        canvas = document.getElementById('image'),
        schnogeFace = document.getElementById('schnoge_face'),
        image = new Image();

    var haarCascades = { "Frontalface alt": haarcascade_frontalface_alt,
        "Frontalface alt2": haarcascade_frontalface_alt2 /*,
         "Frontalface default": haarcascade_frontalface_default,
         "Frontalface alt tree": haarcascade_frontalface_alt_tree,
         "Profile face": haarcascade_profileface,
         "Eyes small": haarcascade_mcs_eyepair_small,
         "Eyes big": haarcascade_mcs_eyepair_big */
    };

    var detectBaseScale = 1,
        detectScaleInc = 1.25,
        detectIncrement = 0.15,
        detectMinNeighbours = 1,
        detectCannyPruning = true,
        detectCascade = haarcascade_frontalface_alt,
        face_size = 0.3;


    var $settings = $('#settings'),
        $settingDetectScale =  $('#detectScale'),
        $settingDetectScaleInc = $('#detectScaleInc'),
        $settingDetectIncrement = $('#detectIncrement'),
        $settingDetectMinNeighbours = $('#detectMinNeighbours'),
        $settingDetectCannyPruning = $('#detectCannyPruning'),
        $settingCascade = $('#selectCascade');

    $settingDetectScale.val(detectBaseScale);
    $settingDetectScaleInc.val(detectScaleInc);
    $settingDetectIncrement.val(detectIncrement);
    $settingDetectMinNeighbours.val(detectMinNeighbours);
    $settingDetectCannyPruning.val(detectCannyPruning);

    init(getURLParameter("url"));

    function init(url) {
        if (url) {
            wait.show();
            var target = "/get?url=" + url;
            console.log("URL: " + target);
            image.src = target;
        }
    }

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    $('#settingsButton').on('click', function() {
        $('#settings').toggle();
    });

    $('#reloadButton').on('click', function() {
        if (image) {
            drawAndDetectImage(image);
            wait.show();
        }
    });

    $.each( haarCascades, function( key, value ) {
        $settingCascade.append('<option value="'+ key + '">' + key + '</option>');
    });

    // Set the droppable box area. Currently also sends data to url '', which could be improved later
    dropBox.filedrop({
        maxfiles: 1,
        maxfilesize: 2,
        url: '',
        drop: function(e) {
            var files = e.dataTransfer.files;
            if (files === null || files === undefined || files.length === 0) {
                var url = e.dataTransfer.getData('URL');
                init(url);
                return false;
            }
            return true;
        },
        error: function(err, file) {
            switch(err) {
                case 'BrowserNotSupported':
                    alert("Sorry! Your browser is ancient and doesn't support the new cool ways to upload files. Try again with something modern.. Or in case you tried to drag an image from other window... sorry, that won't work. You need to first save the image to your computer.");
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
        beforeSend: function(file, index, done ) {
            uploadFileToMemory(file);
            // Don't do anything else to prevent unnecessary sending to server
        }
    });

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

    image.onload = function () {
        wait.show();
        // Resize the canvas and containers to match the image
        canvas.width = image.width;
        canvas.height = image.height;
        resizeContainers(image.width, image.height);
        // Draw image and scnogels
        drawAndDetectImage(image);
    };

    function drawAndDetectImage(img) {
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // Detect faces
        new HAAR.Detector(getDetectedCascade()).image(img).complete(function () {
            for (i = 0; i < this.objects.length; i++) {
                // Get the area of the detected face and draw schnogel on top of it
                schnogel(this.objects[i], schnogeFace, ctx);
            }
            // When ready recreate the download button

            $('#downloadButton').attr('download', getNewFilename());
            $('#downloadButton').attr('href', document.getElementById('image').toDataURL("image/jpeg"));
            wait.hide();

        }).detect($settingDetectScale.val(), $settingDetectScaleInc.val(), $settingDetectIncrement.val(), $settingDetectMinNeighbours.val(), $settingDetectCannyPruning.val() === 'true');
    }

    function getDetectedCascade() {
        return haarCascades[$settingCascade.val()];
    }

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

    // Draw schnogel-faces to the canvas
    function schnogel(rect, img, ctx) {
        // A minor optimization: Pre-calculate the size of png. Will bite your leg, if/when changing
        // the base image
        var baseW = 166;
        var baseH = 202;
        // Let's create the base image slightly larger than the calculated face area
        var addition = rect.width * face_size;

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