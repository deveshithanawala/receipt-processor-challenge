# Use the official Node.js image as the base image.
FROM node:latest

# Create a directory for the app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Expose the port that the application will run on
EXPOSE 3001

# Command to run the application
CMD [ "node", "app.js" ]

