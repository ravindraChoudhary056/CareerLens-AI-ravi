const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    console.log("Testing connection with URI:", process.env.MONGO_URI.replace(/:([^:@]{3,})@/, ':***@')); // Hide password in logs
    
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // fail quickly
        });
        console.log("✅ SUCCESS: Connected to MongoDB!");
        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR: Connection failed.");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
        
        if (err.message.includes('bad auth')) {
            console.error("\n💡 DIAGNOSIS: The database reached the server, but the username or password was rejected.");
            console.error("Please double check that:");
            console.error("1. The user 'ravindrajakhadh017_db_user' exists in Atlas under Database Access.");
            console.error("2. The password for that specific user is exactly 'ravi123'.");
        }
        process.exit(1);
    }
}

testConnection();
