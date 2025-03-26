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

    const baseURL = "https://192.168.69.144:8080/random/tampermonkey";
    const callerBaseURL = "https://192.168.69.144:8080/tampermonkey/callers/schwitzerdutsch";
    const fadeDuration = 1000;
    let lastLog = "";
    let currentlyPlayingAudio = null;
    let pausedAudios = [];

    function isAudioNearEnd(audio, threshold = fadeDuration) {
        return audio.duration - audio.currentTime < threshold / 1000;
    }

    function isAudioNearStart(audio, threshold = fadeDuration) {
        return audio.currentTime < threshold / 1000;
    }

    function fadeOut(audio, duration = fadeDuration) {
        const step = 0.05;
        const interval = duration / (1 / step);
        const fadeInterval = setInterval(() => {
            if (audio.volume > step) {
                audio.volume -= step;
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeInterval);
            }
        }, interval);
    }

    function fadeIn(audio, duration = fadeDuration) {
        const step = 0.05;
        const interval = duration / (1 / step);
        audio.volume = 0;
        audio.play().catch(err => console.warn("Failed to play sound:", err));
        const fadeInterval = setInterval(() => {
            if (audio.volume < 1 - step) {
                audio.volume += step;
            } else {
                audio.volume = 1;
                clearInterval(fadeInterval);
            }
        }, interval);
    }

    function playSound(url) {
        if (currentlyPlayingAudio) {
            fadeOut(currentlyPlayingAudio);
        }
        if (currentlyPlayingAudio && !currentlyPlayingAudio.ended && !isAudioNearEnd(currentlyPlayingAudio)) {
            pausedAudios.push(currentlyPlayingAudio);
        }

        currentlyPlayingAudio = new Audio(url);
        currentlyPlayingAudio.play().catch(err => console.warn("Failed to play sound:", err));
        return currentlyPlayingAudio;
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


    function callScore(d1, d2, d3, scoreText, isWin) {
        const numericScore = parseInt(scoreText, 10);

        if (d3 && !(scoreText == "BUST")) {
            console.log("🎯 Call Score ");
            var callerSound = playSound(`${callerBaseURL}/${scoreText}.mp3`);

            callerSound.onended = () => {
                detectAudios(d1, d2, d3, scoreText, isWin, numericScore);
            };
        } else {
            detectAudios(d1, d2, d3, scoreText, isWin, numericScore);
        }
    }

    function detectAudios(d1, d2, d3, scoreText, isWin, numericScore) {
        if (isWin) {
            console.log("🏆 Game won!");
            playSound(`${baseURL}/win`);
            pausedAudios = [];
            return;
        } else if (scoreText === "BUST") {
            console.log("💥 Bust!");
            playSound(`${baseURL}/bust`);
            return;
        } else if (scoreText === "180" || scoreText === "171") {
            console.log("🔥 180!");
            playSound(`${baseURL}/180`);
            return;
        } else if (isClassic26(d1, d2, d3, scoreText)) {
            console.log("🔥 Classic 26!");
            playSound(`${baseURL}/scheibenwischer`);
            return;
        } else if (isClassic29(d1, d2, d3, scoreText)) {
            console.log("🔥 Classic 29!");
            playSound(`${baseURL}/scheibenwischer`);
            return;
        } else if (!isNaN(numericScore) && numericScore >= 80) {
            console.log("💥 Big score! >", numericScore);
            playSound(`${baseURL}/highscore`);
            return;
        }

        let lastDart = d3 || d2 || d1;

        if (isHighTriple(lastDart)) {
            console.log("🔥 High Triple!");
            playSound(`${baseURL}/hightriple`);
        } else if (isLowTriple(lastDart)) {
            console.log("🔥 Low Triple!");
            playSound(`${baseURL}/triple`);
        } else if (lastDart.startsWith("M")) {
            console.log("❌ Miss!");
            playSound(`${baseURL}/miss`);
        } else if (lastDart === "BULL" || lastDart === "25") {
            console.log("🔥 Bullseye!");
            playSound(`${baseURL}/bull`);
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

        callScore(dart1, dart2, dart3, score, isWin);

    }, 300);

    setInterval(() => {
        if (pausedAudios.length && currentlyPlayingAudio.ended) {
            currentlyPlayingAudio = pausedAudios.pop();
            if (!currentlyPlayingAudio.ended && !isAudioNearEnd(currentlyPlayingAudio) && !isAudioNearStart(currentlyPlayingAudio)) {
                fadeIn(currentlyPlayingAudio);
            }
        }
    }, 300);
})();
