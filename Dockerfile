# Use an official Node.js image as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the React app's source code into the container
COPY . .

# Build the React app for production
RUN npm run build

# Expose the port on which the React app runs
EXPOSE 3000

# Command to run the React app in development mode
CMD ["npm", "start"]
