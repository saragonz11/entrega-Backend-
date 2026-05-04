const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});
const http = require("http");
const { Server } = require("socket.io");
const { connectDb } = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error("Falta la variable de entorno JWT_SECRET");
  }
  await connectDb();
  const server = http.createServer(app);
  const io = new Server(server);
  app.set("io", io);
  server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
