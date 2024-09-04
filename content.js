/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const browser = chrome;

const TIMER_SIZES = ["12px", "16px", "24px", "30px"];

const TIMER_LOCATIONS = [
	["0px", "auto", "0px", "auto"],
	["0px", "auto", "auto", "0px"],
	["auto", "0px", "auto", "0px"],
	["auto", "0px", "0px", "auto"]
];

var gTimer;
var gAlert;
var gDiscard;
let message;
var pos;
var posTop;
var posLeft;
var TimerPos;
var DiscardFontSize;
var DiscardHeight;

// Notify background script that page has loaded
//
function notifyLoaded() {
	// Register that this script has now loaded
	browser.runtime.sendMessage({ type: "loaded", url: document.URL });

	// Send URL of referring page to background script
	browser.runtime.sendMessage({ type: "referrer", referrer: document.referrer });
}

function discardTime() {message = {type: "discard-time",};browser.runtime.sendMessage(message);location.reload()};

// Update timer
//
function updateTimer(text, size, location) {
	if (!text) {
		if (gTimer) {
			// Hide timer
			gTimer.hidden = true;
		}
	} else {
		if (!gTimer) {
			// Create timer

			gTimer = document.createElement("div");
			gTimer.setAttribute("class", "leechblock-timer");
			gTimer.setAttribute("id", "leechblock-timer");
			gTimer.addEventListener("dblclick", function (e) { this.style.display = "none"; });
			
			gDiscard = document.createElement("button");
			gDiscard.setAttribute("class", "discard-button");
			gDiscard.setAttribute("id", "discard-button");
			gDiscard.addEventListener("click", discardTime);
	gDiscard.hidden = false;

		}

		if (!document.body.contains(gTimer)) {
			// Insert timer at end of document body
			document.body.appendChild(gTimer);
			document.body.appendChild(gDiscard);
		}

		// Set text
		gTimer.innerText = text;

		// Set size
		if (size >= 0 && size < TIMER_SIZES.length) {
			gTimer.style.fontSize = TIMER_SIZES[size];


			DiscardFontSize = TIMER_SIZES[size];
			DiscardFontSize = parseInt(DiscardFontSize);

			if (DiscardFontSize == 12){	DiscardFontSize = "10px"; DiscardHeight = "22px";}
			if (DiscardFontSize == 16){	DiscardFontSize = "12px"; DiscardHeight = "26px";}
			if (DiscardFontSize == 24){	DiscardFontSize = "14px"; DiscardHeight = "34px";}
			if (DiscardFontSize == 30){	DiscardFontSize = "16px"; DiscardHeight = "40px";}


		}

		// Set location
		if (location >= 0 && location < TIMER_LOCATIONS.length) {
			gTimer.style.top = TIMER_LOCATIONS[location][0];
			gTimer.style.bottom = TIMER_LOCATIONS[location][1];
			gTimer.style.left = TIMER_LOCATIONS[location][2];
			gTimer.style.right = TIMER_LOCATIONS[location][3];

		}

		// Show timer
		gTimer.hidden = false;
		gDiscard.hidden = false;

		//Now for gDiscard

			gDiscard.innerText = "Discard Remaining Time";
			gDiscard.style.position = 'fixed';
			gDiscard.style.textAlign = 'center';
			gDiscard.style.verticalAlign = 'middle';
			gDiscard.style.width = 'auto';


			gDiscard.style.top = DiscardHeight;
			gDiscard.style.bottom = TIMER_LOCATIONS[location][1];
			gDiscard.style.left = TIMER_LOCATIONS[location][2];
			gDiscard.style.right = TIMER_LOCATIONS[location][3];




			/*
			TimerPos = document.getElementById("leechblock-timer");
			pos = TimerPos.innerText;
			gDiscard.innerText = TimerPos.style.width;
			*/
	
	}
}

// Show alert message
//
function showAlert(text) {
	let alertBox, alertIcon, alertText;

	if (!gAlert) {
		// Create container
		gAlert = document.createElement("div");
		gAlert.setAttribute("class", "leechblock-alert-container");
		document.body.appendChild(gAlert);

		// Create message box
		alertBox = document.createElement("div");
		alertBox.setAttribute("class", "leechblock-alert-box");
		alertBox.addEventListener("click", hideAlert);
		alertIcon = document.createElement("div");
		alertIcon.setAttribute("class", "leechblock-alert-icon");
		alertBox.appendChild(alertIcon);
		alertText = document.createElement("div");
		alertText.setAttribute("class", "leechblock-alert-text");
		alertBox.appendChild(alertText);
		gAlert.appendChild(alertBox);
	}

	// Set text
	alertText.innerText = text;

	// Show timer
	gAlert.style.display = "flex";
}

// Hide alert message
//
function hideAlert() {
	if (gAlert) {
		gAlert.style.display = "none";
	}
}

// Check page for keyword(s)
//
function checkKeyword(keywordRE) {
	if (!keywordRE) {
		return null; // nothing to find!
	}

	// Get all text from document (including title)
	let text = document.title + "\n" + document.body.innerText;

	// Search text for keywords
	let matches = keywordRE.exec(text);
	if (!matches) {
		return null; // keyword(s) not found
	}
	return matches[0]; // keyword(s) found
}

// Apply filter
//
function applyFilter(name) {
	let filters = {
		"blur (1px)": "blur(1px)",
		"blur (2px)": "blur(2px)",
		"blur (4px)": "blur(4px)",
		"blur (8px)": "blur(8px)",
		"blur (16px)": "blur(16px)",
		"blur (32px)": "blur(32px)",
		"fade (80%)": "opacity(20%)",
		"fade (90%)": "opacity(10%)",
		"fade (100%)": "opacity(0%)",
		"grayscale": "grayscale(100%)",
		"invert": "invert(100%)",
		"sepia": "sepia(100%)"
	};
	if (name && filters[name]) {
		document.body.style.filter = filters[name];
	} else {
		document.body.style.filter = "none";
	}
}

/*** EVENT HANDLERS BEGIN HERE ***/

function handleMessage(message, sender, sendResponse) {

	switch (message.type) {

		case "alert":
			showAlert(message.text);
			break;

		case "filter":
			applyFilter(message.name);
			break;

		case "keyword":
			let keyword = checkKeyword(new RegExp(message.keywordRE, "iu")); // Chrome workaround
			sendResponse(keyword);
			break;

		case "ping":
			notifyLoaded();
			break;

		case "timer":
			updateTimer(message.text, message.size, message.location);
			break;

	}

}

browser.runtime.onMessage.addListener(handleMessage);

notifyLoaded();