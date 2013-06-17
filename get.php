<?php
$url = $_GET['url'];
if (!$url) {
    die("URL missing");
} 

$response = http_get($url, array(), $info);
header('Content-Type: ' . $info['content_type']);
print(http_parse_message($response)->body);

?>