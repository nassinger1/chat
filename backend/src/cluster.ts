import cluster from "node:cluster";
import { availableParallelism } from "node:os";

const workerCount =
  Number(process.env.WEB_CONCURRENCY) || availableParallelism();

if (cluster.isPrimary) {
  for (let index = 0; index < workerCount; index++) cluster.fork();

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} stopped, starting a new one`);
    cluster.fork();
  });
} else {
  await import("./main.js");
}
