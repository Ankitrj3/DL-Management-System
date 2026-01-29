require('dotenv').config();
const mongoose = require('mongoose');

const fixQRIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('qrcodes');

        // List indexes
        const indexes = await collection.listIndexes().toArray();
        console.log('Current QR indexes:', indexes.map(idx => idx.name));

        // We need to drop the index with name 'type_1_date_1'
        try {
            await collection.dropIndex('type_1_date_1');
            console.log('Dropped unique index: type_1_date_1');
        } catch (e) {
            console.log('Index type_1_date_1 not found or already dropped');
        }

        // Also check for 'date_1' based on the error message I saw earlier
        try {
            await collection.dropIndex('date_1');
            console.log('Dropped index: date_1');
        } catch (e) {
            console.log('Index date_1 not found');
        }

        console.log('QR Index cleanup complete');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing QR indexes:', error);
        process.exit(1);
    }
};

fixQRIndexes();
