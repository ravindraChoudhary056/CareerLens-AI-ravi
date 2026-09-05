const mongoose = require("mongoose")



async function connectToDB() {

    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to Database")
    }
    catch (err) {
        console.log("❌ DATABASE CONNECTION FAILED:")
        console.log(err)
        process.exit(1)
    }
}

module.exports = connectToDB