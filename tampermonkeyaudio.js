// ==UserScript==
// @name         Autodarts Local Sound Events Logger
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Logs darts + plays custom local sounds for triples, busts, and misses
// @author       you
// @match        https://play.autodarts.io/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const baseURL = "https://192.168.69.25:8080/random/tampermonkey";
    let lastLog = "";

    function playSound(path) {
        const url = `${baseURL}${path}`;
        const audio = new Audio(url);
        audio.play().catch(err => console.warn("Failed to play sound:", err));
    }

    function isHighTriple(dart) {
        const match = dart.match(/^T(\d{1,2})$/);
        return match && parseInt(match[1]) >= 15;
    }

    function isLowTriple(dart) {
        const match = dart.match(/^T(\d{1,2})$/);
        return match && parseInt(match[1]) < 15;
    }

    function isClassic26(d1, d2, d3) {
        const expected = ["1", "5", "20"];
        const darts = [d1, d2, d3].map(d => d.replace(/[SDT]/, "")); // remove S/T/D prefixes
        return darts.sort().join() === expected.sort().join();
    }

    function isClassic29(d1, d2, d3) {
        const expected = ["3", "7", "19"];
        const darts = [d1, d2, d3].map(d => d.replace(/[SDT]/, "")); // remove S/T/D prefixes
        return darts.sort().join() === expected.sort().join();
    }

    function buttonContains(text) {
        return Array.from(document.querySelectorAll("button"))
            .some(btn => btn.textContent.includes(text));
    }


    function checkForSounds(d1, d2, d3, scoreText, isWin) {
        const numericScore = parseInt(scoreText, 10);
        if (isWin) {
            console.log("🏆 Game won!");
            playSound("/win");
            return;
        } else if (scoreText === "BUST") {
            console.log("💥 Bust!");
            playSound("/bust");
            return;
        } else if (scoreText === "180" || scoreText === "171") {
            console.log("🔥 180!");
            playSound("/180");
            return;
        } else if (isClassic26(d1, d2, d3, scoreText)) {
            console.log("🔥 Classic 26!");
            playSound("/scheibenwischer");
            return;
        } else if (isClassic29(d1, d2, d3, scoreText)) {
            console.log("🔥 Classic 29!");
            playSound("/heckscheibenwischer");
            return;
        } else if (!isNaN(numericScore) && numericScore > 80) {
            console.log("💥 Big score! >", numericScore);
            playSound("/highscore");
            return;
        }

        let lastDart = d3 || d2 || d1;

        if (isHighTriple(lastDart)) {
            console.log("🔥 High Triple!");
            playSound("/hightriple");
        } else if (isLowTriple(lastDart)) {
            console.log("🔥 Low Triple!");
            playSound("/triple");
        } else if (lastDart.startsWith("M")) {
            console.log("❌ Miss!");
            playSound("/miss");
        } else if (lastDart === "BULL" || lastDart === "25") {
            console.log("🔥 Bullseye!");
            playSound("/bull");
        }
    }

    setInterval(() => {
        const gameType = document.querySelector("#ad-ext-game-variant");
        if (!gameType || gameType.textContent !== "X01") return;

        const dart1 = document.querySelector(".ad-ext-turn-throw:nth-of-type(2)")?.textContent || "";
        const dart2 = document.querySelector(".ad-ext-turn-throw:nth-of-type(3)")?.textContent || "";
        const dart3 = document.querySelector(".ad-ext-turn-throw:nth-of-type(4)")?.textContent || "";
        const score = document.querySelector(".ad-ext-turn-points")?.textContent || "";

        const playerScoresEls = document.querySelectorAll(".ad-ext-player-score");
        const playerScores = Array.from(playerScoresEls).map(el => el.textContent.trim());
        const isWin = playerScores.includes("0") && (buttonContains("Finish") || buttonContains("Next Leg"));


        const currentLog = dart1 + dart2 + dart3 + score;
        if (currentLog === lastLog) return;
        lastLog = currentLog;

        console.log("🎯 Dart 1:", dart1 || "—");
        console.log("🎯 Dart 2:", dart2 || "—");
        console.log("🎯 Dart 3:", dart3 || "—");
        console.log("💯 Total Turn Score:", score || "—");
        console.log("———————————————");

        checkForSounds(dart1, dart2, dart3, score, isWin);

    }, 300);
})();
