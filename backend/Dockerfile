# Use the official Python image as the base
FROM python:3.9

# Set the working directory
WORKDIR /app

# Set Environment variables
ENV HOST_IP=146.190.141.184

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY . .

# Expose the port that the FastAPI server will run on
EXPOSE 8000

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]