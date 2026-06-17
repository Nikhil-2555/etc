/**
 * Node.js Cluster Entry Point
 * 
 * Forks worker processes across all available CPU cores to handle
 * high-concurrency user loading and management operations.
 * 
 * Usage: node cluster.js
 * 
 * Each worker runs the full Express server independently.
 * The primary process monitors worker health, restarts crashed workers,
 * and exposes an IPC channel for cluster-wide metrics.
 */

const cluster = require('cluster');
const os = require('os');

const NUM_CPUS = os.cpus().length;
const RESTART_DELAY_MS = 2000;
const MAX_RESTARTS = 10;
const RESTART_WINDOW_MS = 60000; // 1 minute

if (cluster.isPrimary) {
    console.log(`\n╔══════════════════════════════════════════════════════╗`);
    console.log(`║  🚀  ShopFlow Cluster Manager                     ║`);
    console.log(`║  Primary PID: ${String(process.pid).padEnd(39)}║`);
    console.log(`║  CPU Cores: ${String(NUM_CPUS).padEnd(41)}║`);
    console.log(`║  Workers: ${String(NUM_CPUS).padEnd(43)}║`);
    console.log(`╚══════════════════════════════════════════════════════╝\n`);

    // Track worker metadata
    const workerMeta = new Map();
    let restartCount = 0;
    let restartWindowStart = Date.now();

    // Fork workers
    for (let i = 0; i < NUM_CPUS; i++) {
        forkWorker(i);
    }

    function forkWorker(index) {
        const worker = cluster.fork({ WORKER_INDEX: index });
        workerMeta.set(worker.id, {
            index,
            pid: worker.process.pid,
            startedAt: Date.now(),
            requestsHandled: 0,
            status: 'starting',
            memoryUsage: 0,
        });

        worker.on('message', (msg) => {
            if (msg.type === 'worker:ready') {
                const meta = workerMeta.get(worker.id);
                if (meta) meta.status = 'online';
                console.log(`  ✅ Worker #${index} (PID: ${worker.process.pid}) is online`);
            }
            if (msg.type === 'worker:metrics') {
                const meta = workerMeta.get(worker.id);
                if (meta) {
                    meta.requestsHandled = msg.requestsHandled || 0;
                    meta.memoryUsage = msg.memoryUsage || 0;
                }
            }
            if (msg.type === 'cluster:status') {
                // Respond to status requests from workers
                const workers = [];
                for (const [id, meta] of workerMeta) {
                    workers.push({
                        id,
                        ...meta,
                        uptime: Date.now() - meta.startedAt,
                    });
                }
                worker.send({
                    type: 'cluster:status:response',
                    data: {
                        primaryPid: process.pid,
                        totalWorkers: workerMeta.size,
                        cpuCores: NUM_CPUS,
                        platform: os.platform(),
                        arch: os.arch(),
                        totalMemory: os.totalmem(),
                        freeMemory: os.freemem(),
                        loadAverage: os.loadavg(),
                        uptime: process.uptime(),
                        workers,
                    }
                });
            }
        });

        return worker;
    }

    // Handle worker exits
    cluster.on('exit', (worker, code, signal) => {
        const meta = workerMeta.get(worker.id);
        const workerIndex = meta?.index ?? '?';
        workerMeta.delete(worker.id);

        console.log(`\n  ⚠️  Worker #${workerIndex} (PID: ${worker.process.pid}) died [code: ${code}, signal: ${signal}]`);

        // Rate-limit restarts to avoid crash loops
        const now = Date.now();
        if (now - restartWindowStart > RESTART_WINDOW_MS) {
            restartCount = 0;
            restartWindowStart = now;
        }

        restartCount++;
        if (restartCount > MAX_RESTARTS) {
            console.error(`  🛑 Too many restarts in ${RESTART_WINDOW_MS / 1000}s. Stopping automatic restarts.`);
            return;
        }

        console.log(`  🔄 Restarting worker #${workerIndex} in ${RESTART_DELAY_MS}ms...`);
        setTimeout(() => forkWorker(workerIndex), RESTART_DELAY_MS);
    });

    // Handle graceful shutdown
    const shutdown = (signal) => {
        console.log(`\n  🛑 Received ${signal}. Shutting down cluster gracefully...`);
        for (const id in cluster.workers) {
            cluster.workers[id].send({ type: 'shutdown' });
            cluster.workers[id].disconnect();
        }
        setTimeout(() => {
            console.log('  Force killing remaining workers...');
            for (const id in cluster.workers) {
                cluster.workers[id].kill();
            }
            process.exit(0);
        }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

} else {
    // Worker process — load the full Express server
    require('./server');
}
