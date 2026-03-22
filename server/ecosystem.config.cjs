/**
 * PM2 ecosystem config for production.
 * Run: pm2 start ecosystem.config.cjs
 * Uses all CPU cores in cluster mode for scalability.
 */
module.exports = {
    apps: [
        {
            name: "youtube-backend",
            script: "api/index.js",
            instances: "max",
            exec_mode: "cluster",
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            },
            max_memory_restart: "500M",
            error_file: "./logs/err.log",
            out_file: "./logs/out.log",
            merge_logs: true,
        },
    ],
};
