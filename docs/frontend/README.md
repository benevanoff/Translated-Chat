# Translated-Chat Frontend

The frontend for this application is built with ReactJS.

## Deployment

To run the frontend alone locally for development, run `npm start`

To build the docker container for production, first specify your backend host addresses in the .env file and then run `docker build -t translated-chat-frontend .`. To start the container, execute `docker run translated-chat-frontend`.