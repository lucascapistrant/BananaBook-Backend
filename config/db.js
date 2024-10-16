import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

async function connectDB() {
    try {
        await client.connect();
        return client.db;
    } catch(err) {
        console.error('Failed to connect to MongoDB', err)
        process.exit(1);
    }
}

export default connectDB;