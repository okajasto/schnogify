schnogify
=========

Schnogify-me is a simple tool that allows images to be schnogified. In other words it recognizes faces in a given image and places an image of Schnoegel on top of those.

Face-recognition is done by using https://github.com/foo123/HAAR.js plugin. Drag & Drop box is done with https://github.com/weixiyen/jquery-filedrop

Requirements & Usage
=========

The Schnogify-me only works in modern browsers as it relies heavily on some HTML5-features. Just go to the page, drag and drop image from your computer to the drop-area and you are good to go.

Note! Running the index.html from file-system doesn't work properly on Chrome/Webkit browsers (Canvas doesn't recognize that other files in filesystem are actually in same domain as the html file). If you want to run it locally you need to have a webserver running. On Firefox it works fine.