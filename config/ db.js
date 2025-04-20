const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Atlas connection string (from environment variables)
const mongoURI = process.env.MONGODB_URI;

// Options for Mongoose connection
const options = {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10 // Maximum number of connections in the pool
};

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, options);
    console.log('MongoDB Atlas connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err}`);
      console.log("Mongo URI:", mongoURI);

    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error(`Error connecting to MongoDB Atlas: ${error.message}`);
    console.log("Mongo URI:", mongoURI);

    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;