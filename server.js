import express from 'express';
import { Server } from 'socket.io';

const app = express();
app.use(express.static('public'));
const server = app.listen(3000);
const io = new Server(server);

const players = [];
io.on("connection", async socket => {
    if(players.length < 2) {
        players.push(socket);

        if(players.length === 2) {
            const start = () => {
                Promise.all([requestRPS(players[0]), requestRPS(players[1])]).then(values => {
                    players[0].emit("rps-result", values);
                    players[1].emit("rps-result", values.reverse());

                    setTimeout(() => start(), 3000)
                }).catch(err => {
                    players.forEach(player => player.emit("instruction", err));
                    setTimeout(() => start(), 10000)
                })
            }
            start();
        } else {
            players.forEach(player => player.emit("instruction", "Awaiting Opponent..."))
        }
    } else {
        socket.disconnect();
    }

    socket.on("disconnect", () => {
        let index = players.indexOf(socket);
        if(index !== -1) {
            players.splice(index, 1);
            players.forEach(player => player.emit("instruction", "Awaiting Opponent..."))
        }
    });
});

const requestRPS = (socket) => {
    return new Promise((resolve, reject) => {
        socket.emit("rps-request");
        socket.once("rps-response", rps => {
            if(["rock", "paper", "scissor"].includes(rps)) resolve(rps);
            else reject("Unknown Error Occured");
        });
    })
}