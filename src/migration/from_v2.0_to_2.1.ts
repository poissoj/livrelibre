import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error("Please provide MONGODB_URI env var");
  process.exit(1);
}

type User = { name: string; password: string; role: "admin" | "guest" };

const SALT_ROUNDS = 12;

const main = async () => {
  const client = new MongoClient(MONGODB_URI);
  try {
    const mongoClient = await client.connect();
    const db = mongoClient.db();
    const users = await db
      .collection<User>("users")
      .find({ password: { $exists: true } })
      .toArray();
    if (users.length === 0) {
      console.log("No user to migrate, nothing to do.");
      return;
    }
    const plural = users.length > 1 ? "s" : "";
    console.log(`Found ${users.length} user${plural}, updating…`);
    const updateUsers = users.map(async (user) => {
      const { password, ...rest } = user;
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      const updatedUser = { ...rest, hash };
      await db.collection("users").replaceOne({ _id: user._id }, updatedUser);
    });
    await Promise.all(updateUsers);
    console.log(`${users.length} user${plural} updated.`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    void client.close();
  }
};

void main();
