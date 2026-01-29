require('dotenv').config();
const mongoose = require('mongoose');

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('users');

        // List current indexes
        const indexes = await collection.listIndexes().toArray();
        console.log('Current indexes:', indexes.map(idx => idx.name));

        // Drop problematic index if it exists
        try {
            await collection.dropIndex('regNo_1');
            console.log('Dropped index: regNo_1');
        } catch (e) {
            console.log('Index regNo_1 not found or already dropped');
        }

        // Drop other old search indexes if they exist
        const indexesToDrop = ['phone_1', 'password_1'];
        for (const name of indexesToDrop) {
            try {
                await collection.dropIndex(name);
                console.log(`Dropped index: ${name}`);
            } catch (e) { }
        }

        console.log('Index cleanup complete');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
};

fixIndexes();
