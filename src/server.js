const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");

const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server);

app.set("io", io);

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
