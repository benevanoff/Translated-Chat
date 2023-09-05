# Use the official Python image as the base
FROM python:3.9

# Set the working directory
WORKDIR /app

# Set Environment variables
ENV HOST_IP=146.190.141.184

# Install supervisord
RUN apt-get update && apt-get install -y supervisor

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY . .

# Copy supervisord config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the port that the servers will run on
EXPOSE 8000
EXPOSE 8080

# Start http and websocker servers via supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
