// require('dotenv').config({ path: './env' })
// aur

import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})


import connectDB from "./db/index.js"
import { app } from './app.js'

app.get("/", (req, res) => {
    res.send("Hello from Express on Vercel!");
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`⚙️  Service is running at : ${PORT}`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Closing gracefully...`);
            server.close(async () => {
                try {
                    await import("mongoose").then((m) => m.default.connection.close());
                    console.log("MongoDB connection closed.");
                    process.exit(0);
                } catch (err) {
                    console.error("Error during shutdown:", err);
                    process.exit(1);
                }
            });

            // Force close after 10s
            setTimeout(() => {
                console.error("Forced shutdown after timeout");
                process.exit(1);
            }, 10000);
        };

        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    } catch (err) {
        console.error("MONGODB connection failed !!", err);
        process.exit(1);
    }
};

startServer();