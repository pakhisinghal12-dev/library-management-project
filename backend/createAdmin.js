
const readline = require("readline");
const bcrypt = require("bcryptjs");
const db = require("./config/db");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createAdmin() {
    try {
        rl.question("Enter admin name: ", async (name) => {
            rl.question("Enter admin email: ", async (email) => {
                rl.question("Create admin password: ", async (password) => {
                    try {
                        if (!name.trim() || !email.trim() || !password) {
                            console.log("All fields are required.");
                            return;
                        }

                        const [existing] = await db.query(
                            "SELECT user_id FROM users WHERE email = ?",
                            [email.trim()]
                        );

                        if (existing.length > 0) {
                            console.log("This email already exists. Choose another email.");
                            return;
                        }

                        const hashedPassword = await bcrypt.hash(password, 10);

                        await db.query(
                            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')",
                            [name.trim(), email.trim(), hashedPassword]
                        );

                        console.log("Admin account created successfully!");

                    } catch (error) {
                        console.error("Error:", error.message);
                    } finally {
                        rl.close();
                        await db.end();
                    }
                });
            });
        });
    } catch (error) {
        console.error(error);
        rl.close();
        await db.end();
    }
}

createAdmin();
