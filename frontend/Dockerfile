# Use the official Node.js image as the base
FROM node:14

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code into the container
COPY . .

# Build the React app
RUN npm run build

# Expose the port that the React app will run on
EXPOSE 3000

# Serve the built React app using a simple web server
CMD ["npm", "start"]