import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/database.js";
import User from "./models/User.js";

connectDB();

const deleteAllUsers = async () => {
  try {
    await User.deleteMany({});
    console.log("✅ Tous les utilisateurs ont été supprimés !");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

deleteAllUsers();
