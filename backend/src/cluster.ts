import cluster from "node:cluster";
import { availableParallelism } from "node:os";

const RESTART_DELAY_IN_MS = 5_000;

const workerCount =
  Number(process.env.WEB_CONCURRENCY) || availableParallelism();

if (cluster.isPrimary) {
  for (let index = 0; index < workerCount; index++) cluster.fork();

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} stopped, starting a new one`);
    setTimeout(() => cluster.fork(), RESTART_DELAY_IN_MS);
  });
} else {
  await import("./main.js");
}
