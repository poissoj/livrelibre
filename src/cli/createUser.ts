/* Usage: bun src/cli/createUser.ts */
import * as readline from "node:readline/promises";
import bcrypt from "bcrypt";
import { stdin as input, stdout as output } from "node:process";

import { db } from "@/db/database";
import { users } from "@/db/schema";

const rl = readline.createInterface({ input, output });

const main = async () => {
  try {
    console.log("Création d'un nouvel utilisateur");
    const name = await rl.question("Nom : ");
    const password = await rl.question("Mot de passe : ");
    const hash = await bcrypt.hash(password, 12);
    await db.insert(users).values({ name, hash, role: "admin" });
    console.log(`L'utilisateur ${name} a été créé`);
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

void main();
