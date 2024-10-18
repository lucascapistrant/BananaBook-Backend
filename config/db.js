import { MongoClient, ServerApiVersion } from "mongodb";
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
console.log(uri)

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
        return client.db(process.env.DATABASE_NAME);
    } catch(err) {
        console.error('Failed to connect to MongoDB', err)
        process.exit(1);
    }
}

export default connectDB;