CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    native_language VARCHAR(50) NOT NULL
);

CREATE TABLE chats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender VARCHAR(255) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    original_message TEXT NOT NULL,
    translated_message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, native_language) VALUES ('benevanoff', 'secret', 'english');
INSERT INTO users (username, password, native_language) VALUES ('lily', 'secret', 'spanish');