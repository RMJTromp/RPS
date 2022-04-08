import $ from "./selector.js";
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const url = new URL(window.location.href);
url.protocol = "ws:";

const socket = io(url);
socket.on("rps-request", () => {
    getRPS().then(rps => {
        socket.emit("rps-response", rps);
    }).catch(err => {
        showMessage("Unknown Error Occured")
    });
});

socket.on("rps-result", res => {
    startAnimation(...res);
})

socket.on("instruction", (instruction) => {
    showMessage(instruction);
});

const scoreboard = {
    element: $("<div>", {class: "scoreboard"}),
    player: {
        score: 0,
        element: $("<p>",{text: `You: 0`})
    },
    computer: {
        score: 0,
        element: $("<p>", {text: `Opponent: 0`})
    }
}

scoreboard.player.score = parseInt(localStorage.getItem("wins")) || 0;
scoreboard.player.element.innerText = `You: ${scoreboard.player.score}`;
scoreboard.computer.score = parseInt(localStorage.getItem("losses")) || 0;
scoreboard.computer.element.innerText = `Opponent: ${scoreboard.computer.score}`;

scoreboard.element.append(scoreboard.player.element, scoreboard.computer.element);
document.body.prepend(scoreboard.element);

const container = $("<div>", {class: "container"});
const wrapper = $("<div>", {class: "wrapper"});
container.append(wrapper);
document.body.append(container);
showMessage("Awaiting Instructions");

function getRPS() {
    return new Promise((resolve, reject) => {
        container.querySelectorAll(":not(div.wrapper)").forEach(element => element.remove());
        wrapper.innerHTML = "";
        wrapper.classList.remove("result");
        wrapper.classList.add("select");

        const title = $("<h1>", {text: "Choose an Option", style:"margin-bottom: 20px"});
        container.prepend(title)

        const optionsElements = [$("<div>", {type: "rock"}), $("<div>", {type: "paper"}), $("<div>", {type: "scissor"})];
        let resolved = false;
        optionsElements.forEach(element => {
            element.addEventListener("click", () => {
                if(resolved) return;
                resolved = true;
                title.innerText = "Awaiting Opponent";
                optionsElements.filter(el => el !== element).forEach(el => {
                    el.style.filter = "opacity(0.2)"
                });
                resolve(element.getAttribute("type"));
            });
        });

        wrapper.append(...optionsElements);
    });
}

function showMessage(msg) {
    container.querySelectorAll(":not(div.wrapper)").forEach(element => element.remove());
    wrapper.innerHTML = "";
    wrapper.classList.remove("result");
    wrapper.classList.add("select");

    container.prepend($("<h1>", {text: msg, style:"margin-bottom: 20px"}))
}

function startAnimation(option, opponentOption) {
    container.querySelectorAll(":not(div.wrapper)").forEach(element => element.remove());

    wrapper.innerHTML = "";
    wrapper.classList.remove("select");
    wrapper.classList.add("result");

    const computerOptionElement = $("<div>", {type: "rock", computer: ""});
    const playerOptionElement = $("<div>", {type: "rock"});
    wrapper.append(computerOptionElement, playerOptionElement);

    setTimeout(() => {
        computerOptionElement.setAttribute("type", opponentOption);
        playerOptionElement.setAttribute("type", option);

        const result = getResult(option, opponentOption);

        let msg = "Draw";
        if(result === 1) msg = "You Won";
        else if(result === -1) msg = "You Lost";

        const title = $("<h1>", {text: msg, class: "result", style:"font-size: 40px"});
        wrapper.append(title);
        setTimeout(() => {
            title.style.transform = "translateY(calc(250px / -2 - 50px))";
        }, 2);

        setTimeout(() => {
            reset();
        }, 2500);

        if(result === 1) scoreboard.player.score++;
        else if(result === -1) scoreboard.computer.score++;

        scoreboard.player.element.innerText = `You: ${scoreboard.player.score}`;
        scoreboard.computer.element.innerText = `Opponent: ${scoreboard.computer.score}`;

        localStorage.setItem("wins", scoreboard.player.score);
        localStorage.setItem("losses", scoreboard.computer.score);
    }, 500 * 3);
}

function getResult(playerOption, botOption) {
    if (playerOption === botOption) return 0;

    if (playerOption === "rock") {
        if (botOption === "paper") return -1;
        else return 1;
    }

    if (playerOption === "paper") {
        if (botOption === "scissor") return -1;
        else return 1;
    }

    if (playerOption === "scissor") {
        if (botOption === "rock") return -1;
        else return 1;
    }

    return 0;
}

