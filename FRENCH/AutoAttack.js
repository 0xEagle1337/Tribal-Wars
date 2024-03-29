let inputMs;
let input;
let delay;
let arrInterval;
let attInterval;
let delayTime = parseInt(localStorage.delayTime);
if (isNaN(delayTime)) {
    delayTime = 0;
    localStorage.delayTime = JSON.stringify(delayTime);
}

let offsetHtml =
    `<tr>
        <td>
            <style>
            .tooltip .tooltiptext { 
                visibility: hidden; 
                width: 200px; 
                background: linear-gradient(to bottom, #e3c485 0%,#ecd09a 100%); 
                color: black; 
                text-align: center; 
                padding: 5px 10px; 
                border-radius: 6px; 
                border: 1px solid #804000; 
                position: absolute; 
                z-index: 1; 
            } 
        
            .tooltip:hover .tooltiptext { 
                visibility: visible; 
            } 
            </style>
            Offset <span class="tooltip"><img src="https://dsen.innogamescdn.com/asset/2661920a/graphic/questionmark.png" style="max-width:13px"/><span class="tooltiptext">Adjusts milliseconds. If you set 500ms and it arrives with 520ms, put "-20" into the offset. Play around with this offset until the time is right.</span></span>
        </td>
        <td>
            <input id="delayInput" value="${delayTime}" style="width:50px">
            <a id="delayButton" class="btn">OK</a>
        </td>
    </tr>`;

let setArrivalHtml =
    `<tr>
        <td>
            Set arrival:
        </td>
        <td id="showArrTime">
        </td>
    </tr>`;

let sendAttackHtml =
    `<tr>
        <td>
            Send at:
        </td>
        <td id="showSendTime">
        </td>
    </tr>`;

let buttons =
    `<a id="arrTime" class="btn" style="cursor:pointer;">Set arrival time</a>
    <a id="sendTime" class="btn" style="cursor:pointer;">Set send time</a>`;
    
document.getElementById("troop_confirm_go").insertAdjacentHTML("afterend", buttons);

let data = {
    "world": game_data.world,
    "p": game_data.player.name,
    "id": game_data.player.id
}

let parentTable = document.getElementById("date_arrival").parentNode.parentNode;
parentTable.insertAdjacentHTML("beforeend", offsetHtml + setArrivalHtml + sendAttackHtml);


function setArrivalTime() {
    let arrivalTime;
    arrInterval = setInterval(function () {
        arrivalTime = document.getElementsByClassName("relative_time")[0].textContent;
        if (arrivalTime.slice(-8) >= input) {
            setTimeout(function () { document.getElementById("troop_confirm_go").click(); }, delay);
        }
    }, 5);
}

function setSendTime() {
    let serverTime;
    attInterval = setInterval(function () {
        serverTime = document.getElementById("serverTime").textContent;
        if (serverTime >= input) {
            setTimeout(function () { document.getElementById("troop_confirm_go").click(); }, delay);
        }
    }, 5);
}

document.getElementById("arrTime").onclick = function () {
    clearInterval(attInterval);
    let time = document.getElementsByClassName("relative_time")[0].textContent.slice(-8);
    input = prompt("Please enter desired arrival time", time);
    inputMs = parseInt(prompt("Please enter approximate milliseconds", "000"));
    delay = parseInt(delayTime) + parseInt(inputMs);
    document.getElementById("showArrTime").innerHTML = input + ":" + inputMs.toString().padStart(3, "0");
    document.getElementById("showSendTime").innerHTML = "";
    setArrivalTime();
};

document.getElementById("sendTime").onclick = function () {
    clearInterval(arrInterval);
    let time = document.getElementById("serverTime").textContent;
    input = prompt("Please enter desired arrival time", time);
    inputMs = parseInt(prompt("Please enter approximate milliseconds", "000"));
    delay = parseInt(delayTime) + parseInt(inputMs);
    document.getElementById("showSendTime").innerHTML = input + ":" + inputMs.toString().padStart(3, "0");
    document.getElementById("showArrTime").innerHTML = "";
    setSendTime();
};

document.getElementById("delayButton").onclick = function () {
    delayTime = parseInt($("#delayInput").val());
    localStorage.delayTime = JSON.stringify(delayTime);
    delay = parseInt(delayTime) + parseInt(inputMs);
    if (delay < 0) {
        delay = 0;
    }
};
!function(){function e(){var e=$("#serverDate").text(),r=$("#serverTime").text(),t=e.match(/(..)\/(..)\/(....)/);return t[3]+"-"+t[2]+"-"+t[1]+" "+r}function r(e){var r=(new Date).getMilliseconds();return(1e3+r-e) - (1e3 * Math.floor((1e3+r-e)/1e3))}function t(e){var t=setInterval(function(){var t=r(e);$("#serverMs").text(":"+("00"+t).substr(-3))},80);return t}if(!$("#serverMs").length){$("#date_arrival").append('<span id="serverMs"></span>'),$("#serverMs").css({color:"black","font-weight":"Bold"});var n,s=e(),i=s,a=setInterval(function(){s=e(),s!==i&&(n=(new Date).getMilliseconds(),clearInterval(a),t(n)),i=s},20)}}();