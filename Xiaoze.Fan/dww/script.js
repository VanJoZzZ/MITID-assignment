// ==================================================
// PART 1：球队选择与页面切换
// ==================================================
//球队espn代码 用于方便截取图片
let clubs = {
    "Liverpool": 364,
    "Arsenal": 359,
    "Tottenham": 367,
    "Manchester United": 360,
    "Manchester City": 382,
    "Chelsea": 363,
    "Newcastle United": 361,
    "Real Madrid": 86,
    "Barcelona": 83,
    "Bayern Munich": 132,
    "PSG": 160,
    "Inter Milan": 110,
    "AC Milan": 103,
    "Juventus": 111,
    "Borussia Dortmund": 124
};

let teamA = "Liverpool";
let teamB = "Arsenal";

for (let team in clubs) {
    document.querySelector("#teamA").innerHTML += "<option>" + team + "</option>";
    document.querySelector("#teamB").innerHTML += "<option>" + team + "</option>";
}

document.querySelector("#teamA").value = teamA;
document.querySelector("#teamB").value = teamB;

function updateTeams() {
    let firstTeam = document.querySelector("#teamA").value;
    let secondTeam = document.querySelector("#teamB").value;

    document.querySelector("#crestA").src =
        "https://a.espncdn.com/i/teamlogos/soccer/500/" + clubs[firstTeam] + ".png";

    document.querySelector("#crestB").src =
        "https://a.espncdn.com/i/teamlogos/soccer/500/" + clubs[secondTeam] + ".png";
}

function showPage(page) {
    document.querySelector("#homePage").style.display = "none";
    document.querySelector("#gamePage").style.display = "none";
    document.querySelector("#leaguePage").style.display = "none";

    document.querySelector("#" + page).style.display = "block";
}

function startMatch() {
    teamA = document.querySelector("#teamA").value;
    teamB = document.querySelector("#teamB").value;

    if (teamA === teamB) {
        document.querySelector("#teamMessage").textContent = "Choose two different teams.";
        return;
    }

    document.querySelector("#teamMessage").textContent = "";
    document.querySelector("#nameA").textContent = teamA;
    document.querySelector("#nameB").textContent = teamB;

    document.querySelector("#matchCrestA").src = document.querySelector("#crestA").src;
    document.querySelector("#matchCrestB").src = document.querySelector("#crestB").src;

    resetGame();
    showPage("gamePage");
}

document.querySelector("#teamA").addEventListener("change", updateTeams);
document.querySelector("#teamB").addEventListener("change", updateTeams);
document.querySelector("#startButton").addEventListener("click", startMatch);
document.querySelector("#restartButton").addEventListener("click", startMatch);

document.querySelector("#backButton").addEventListener("click", function () {
    showPage("homePage");
});

document.querySelector("#standingsButton").addEventListener("click", function () {
    showLeague();
    showPage("leaguePage");
});

document.querySelector("#leagueBackButton").addEventListener("click", function () {
    showPage("gamePage");
});

updateTeams();


// ==================================================
// PART 2：游戏主界面
// ==================================================

let aim = 90;
let power = 60;
let move = 50;
let jumpHeight = 50;

let scoreA = 0;
let scoreB = 0;
let shotCount = 0;
let shooting = false;
let shotFrame = 0;
let targetX = 375;
let targetY = 150;
let shotSpeed = 40;
let jumpTime = -2000;

function setup() {
    let canvas = createCanvas(750, 430);
    canvas.parent("pitch");
}

function resetGame() {
    scoreA = 0;
    scoreB = 0;
    shotCount = 0;
    shooting = false;
    jumpTime = -2000;

    document.querySelector("#score").textContent = "0 - 0";
    document.querySelector("#shotNumber").textContent = "Penalty 1 / 10";
    document.querySelector("#resultText").textContent = "Ready to shoot";
    document.querySelector("#restartButton").style.display = "none";
}

// 两个旋钮接口
function getShotTarget() {
    let x = 145 + aim * 460 / 180;
    let y = 260 - power * 215 / 100;
    return { x: x, y: y };
}

function drawPitch() {
    background("#155a37");

    stroke("white");
    strokeWeight(4);
    noFill();
    rect(175, 65, 400, 160);

    strokeWeight(1);
    for (let x = 200; x < 575; x += 25) {
        line(x, 65, x, 225);
    }
    for (let y = 90; y < 225; y += 25) {
        line(175, y, 575, y);
    }
}

function drawGuide() {
    let target = getShotTarget();

    stroke("yellow");
    strokeWeight(2);

    // 瞄准线
    for (let i = 0; i < 10; i++) {
        let start = i / 10;
        let end = start + 0.05;

        line(
            375 + (target.x - 375) * start,
            350 + (target.y - 350) * start,
            375 + (target.x - 375) * end,
            350 + (target.y - 350) * end
        );
    }

    // 落点
    line(target.x - 9, target.y, target.x + 9, target.y);
    line(target.x, target.y - 9, target.x, target.y + 9);
}

// 守门员左右位置和跳跃高。
function keeperPosition() {
    let x = 175 + move * 4;
    let y = 190;
    let time = millis() - jumpTime;
    let height = 25 + jumpHeight * 1.35;

    if (time < 300) {
        y = y - height * time / 300;
    } else if (time < 850) {
        y = y - height;
    } else if (time < 1150) {
        y = y - height * (1150 - time) / 300;
    }

    return { x: x, y: y };
}

function drawKeeper(x, y) {
    // 手臂
    stroke("#f2aa27");
    strokeWeight(10);
    line(x - 14, y - 16, x - 34, y + 2);
    line(x + 14, y - 16, x + 34, y + 2);

    // 腿
    stroke("#162d20");
    line(x - 9, y + 20, x - 15, y + 42);
    line(x + 9, y + 20, x + 15, y + 42);

    // 身体和头部
    noStroke();
    fill("#f2aa27");
    rect(x - 18, y - 25, 36, 47);
    fill("#e7bb8c");
    circle(x, y - 40, 23);

    // 手套
    fill("#162d20");
    circle(x - 34, y + 2, 12);
    circle(x + 34, y + 2, 12);
}

// 判断足球是否碰到门将全身
function touchesKeeper(ballX, ballY, x, y) {
    if (dist(ballX, ballY, x, y - 40) < 25) {
        return true;
    }

    if (ballX > x - 31 && ballX < x + 31 &&
        ballY > y - 38 && ballY < y + 35) {
        return true;
    }

    if (dist(ballX, ballY, x - 27, y - 4) < 19 ||
        dist(ballX, ballY, x + 27, y - 4) < 19) {
        return true;
    }

    if (dist(ballX, ballY, x - 14, y + 32) < 19 ||
        dist(ballX, ballY, x + 14, y + 32) < 19) {
        return true;
    }

    return false;
}

function jump() {
    if (shotCount < 10) {
        jumpTime = millis();
    }
}

function shoot() {
    if (shooting === true || shotCount === 10) {
        return;
    }

    if (document.querySelector("#gamePage").style.display !== "block") {
        return;
    }

    let target = getShotTarget();
    targetX = target.x;
    targetY = target.y;

    // Power 越大，飞行需要的帧数越少
    shotSpeed = 50 - power * 0.4;
    shotFrame = 0;
    shooting = true;
    document.querySelector("#resultText").textContent = "Shooting...";
}

function finishShot(result) {
    shooting = false;

    if (result === "GOAL!") {
        if (shotCount % 2 === 0) {
            scoreA++;
        } else {
            scoreB++;
        }

        document.querySelector("#goalSound").currentTime = 0;
        document.querySelector("#goalSound").play();
    }

    shotCount++;
    document.querySelector("#score").textContent = scoreA + " - " + scoreB;
    document.querySelector("#resultText").textContent = result;

    if (shotCount === 10) {
        document.querySelector("#shotNumber").textContent = "FULL TIME";
        document.querySelector("#restartButton").style.display = "inline-block";
        saveMatch();
    } else {
        document.querySelector("#shotNumber").textContent = "Penalty " + (shotCount + 1) + " / 10";
    }
}

function draw() {
    drawPitch();

    let keeper = keeperPosition();
    let ballX = 375;
    let ballY = 350;

    if (shooting === true) {
        shotFrame++;
        let progress = shotFrame / shotSpeed;

        if (progress > 1) {
            progress = 1;
        }

        ballX = 375 + (targetX - 375) * progress;
        ballY = 350 + (targetY - 350) * progress;

        if (touchesKeeper(ballX, ballY, keeper.x, keeper.y)) {
            finishShot("SAVED!");
        } else if (progress === 1) {
            if (targetX < 175 || targetX > 575 ||
                targetY < 65 || targetY > 225) {
                finishShot("MISS!");
            } else {
                finishShot("GOAL!");
            }
        }
    } else if (shotCount < 10) {
        drawGuide();
    }

    drawKeeper(keeper.x, keeper.y);
    noStroke();
    fill("white");
    circle(ballX, ballY, 27);
}


// ==================================================
// PART 3：积分榜
// ==================================================

let league = [];

// 找到球队在积分榜中的位置 没有就新增一行。
function findTeam(name) {
    for (let i = 0; i < league.length; i++) {
        if (league[i].name === name) {
            return i;
        }
    }

    league.push({
        name: name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gd: 0,
        points: 0
    });

    return league.length - 1;
}

function saveMatch() {
    let a = league[findTeam(teamA)];
    let b = league[findTeam(teamB)];

    a.played++;
    b.played++;
    a.gd += scoreA - scoreB;
    b.gd += scoreB - scoreA;

    if (scoreA > scoreB) {
        a.won++;
        b.lost++;
        a.points += 3;
    } else if (scoreB > scoreA) {
        b.won++;
        a.lost++;
        b.points += 3;
    } else {
        a.drawn++;
        b.drawn++;
        a.points++;
        b.points++;
    }
}

function showLeague() {
    for (let i = 0; i < league.length; i++) {
        for (let j = i + 1; j < league.length; j++) {
            if (league[j].points > league[i].points) {
                let temporary = league[i];
                league[i] = league[j];
                league[j] = temporary;
            }
        }
    }

    let table = document.querySelector("#leagueBody");
    table.innerHTML = "";

    for (let i = 0; i < league.length; i++) {
        let team = league[i];

        table.innerHTML += "<tr>" +
            "<td>" + team.name + "</td>" +
            "<td>" + team.played + "</td>" +
            "<td>" + team.won + "</td>" +
            "<td>" + team.drawn + "</td>" +
            "<td>" + team.lost + "</td>" +
            "<td>" + team.gd + "</td>" +
            "<td>" + team.points + "</td>" +
            "</tr>";
    }
}


// ==================================================
// PART 4：接入web serial
// ==================================================

let lastShoot = 0;
let lastJump = 0;

function updateData() {
    document.querySelector("#aimData").textContent = Math.round(aim) + "°";
    document.querySelector("#powerData").textContent = Math.round(power) + "%";
    document.querySelector("#moveData").textContent = Math.round(move) + "%";
    document.querySelector("#heightData").textContent = Math.round(jumpHeight) + "%";

    document.querySelector("#aimBar").value = aim;
    document.querySelector("#powerBar").value = power;
    document.querySelector("#moveBar").value = move;
    document.querySelector("#heightBar").value = jumpHeight;

    let target = getShotTarget();

    if (target.x < 175 || target.x > 575 ||
        target.y < 65 || target.y > 225) {
        document.querySelector("#targetData").textContent = "MISS";
    } else {
        document.querySelector("#targetData").textContent = "ON TARGET";
    }
}

function readValues(line) {
    let values = line.trim().split(",");

    if (values.length !== 6) {
        return;
    }

    aim = 180 - Number(values[0]);
    power = 100 - Number(values[1]);
    move = 100 - Number(values[3]);
    jumpHeight = (90 - Number(values[4])) * 100 / 180;

    let shootButton = Number(values[2]);
    let jumpButton = Number(values[5]);

    document.querySelector("#shootData").textContent = shootButton;
    document.querySelector("#jumpData").textContent = jumpButton;
    updateData();

    if (shootButton === 1 && lastShoot === 0) {
        shoot();
    }

    if (jumpButton === 1 && lastJump === 0) {
        jump();
    }

    lastShoot = shootButton;
    lastJump = jumpButton;
}

// Web Serial
document.querySelector("#connectButton").addEventListener("click", async function () {
    let port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    document.querySelector("#serialStatus").textContent = "Connected";
    document.querySelector("#connectButton").disabled = true;

    let reader = port.readable.getReader();
    let decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        let result = await reader.read();

        if (result.done) {
            break;
        }

        buffer += decoder.decode(result.value);
        let lines = buffer.split("\n");
        buffer = lines.pop();

        for (let i = 0; i < lines.length; i++) {
            readValues(lines[i]);
        }
    }
});

updateData();