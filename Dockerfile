# Use the official Node.js 20 image as the base image
FROM node:20

RUN apt-get update && apt-get install -y bash curl && curl -1sLf \
'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | bash \
&& apt-get update && apt-get install -y infisical
 
# Set the working directory in the container
WORKDIR /usr/src/app
 
# Copy the package.json and yarn.lock files to the container
COPY package.json yarn.lock ./
 
# Install dependencies
RUN yarn install --frozen-lockfile
 
# Copy the rest of the application code to the container
COPY . .
 
# Build the application
RUN yarn build
 
# Expose the port the app runs on
EXPOSE 5001
 
# Define the command to run the application
CMD ["infisical", "run","--domain", "https://safe.ifour.io/api", "--projectId", "174e787c-f598-4961-a514-ffbdc3a096a4", "--env", "staging", "--", "yarn", "start:api"]