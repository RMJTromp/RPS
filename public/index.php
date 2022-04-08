<?php

    $servername = "localhost";
    $username = "root";
    $password = "";
    $database = "garage";

    // Create connection
    $conn = new mysqli($servername, $username, $password, $database);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // create tables
    $conn->query("CREATE TABLE IF NOT EXISTS `scoreboard` ( `id` INT NOT NULL AUTO_INCREMENT, `naam` VARCHAR(255) NOT NULL, `adres` VARCHAR(255) NOT NULL, `postcode` VARCHAR(6) NOT NULL, `plaats` VARCHAR(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8;");
