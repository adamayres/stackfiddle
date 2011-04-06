(function() {
	
var container = $("#timer-container");

var moves = $("#moves");

var timer = $(".timer");
var minutes = timer.find(".minutes");
var seconds = timer.find(".seconds");
var tenths = timer.find(".tenths");

var times = $("#times");
var summary = $("#summary");
var avgRuns = summary.find(".average-runs");
var avrTime = summary.find(".average-time");
var trimRuns = summary.find(".trimmed-runs");
var trimTime = summary.find(".trimmed-time");

var started = false;
var interval;

var ten = 0;
var sec = 0;
var min = 0;
var runs = 0;
var ms = 0;

var populateMoves = function() {
	moves.children().remove();
	
	var moveTypes = ["R", "U", "B", "L", "D", "F"];
	var moveAug = ["", "2", "'"];
	
	for (i = 0; i < 25; i++) {
		var ranMoveTypePos = Math.floor(Math.random() * (moveTypes.length));
		var ranMoveAugPos = Math.floor(Math.random() * (moveAug.length));
		
		var ranMoveType = moveTypes[ranMoveTypePos];
		var ranMoveAug = moveAug[ranMoveAugPos];
		$("<li>", {
			text: ranMoveType + ranMoveAug
		}).appendTo(moves);
	}
}

var normalize = function(value) {
	if (value < 10) {
		return "0" + value;
	}
	return value;
}

var convertMsToTime = function(timeMs) {
	var timeHun = timeMs / 100;
	var timeHunStr = timeHun.toString();
	timeHunStr = timeHunStr[timeHunStr.length-1];
	
	var timeSec = timeHun / 10;
	timeSec = Math.floor(timeSec);
	timeSec = timeSec.toFixed(0);
	timeSecStr = normalize(timeSec);
	
	var timeMin = timeSec / 60;
	timeMin = Math.floor(timeMin);
	timeMin = timeMin.toFixed(0);

	var timeMinStr = timeMin - (timeMin * 60);
	
	return {
		hun: timeHunStr,
		sec: timeSecStr,
		min: timeMinStr.toString()
	} 
}

var toggleTimer = function() {
	container.removeClass("timer-before-start");
	if (!started) {
		container.addClass("timer-running");
		interval = setInterval(function() {
			ms += 100;
			ten++;
			if (ten >= 10) {
				ten = 0;
				sec++;
			}
			if (sec >= 60) {
				sec = 0;
				min++;
			}
			
			tenths.text(ten);
			seconds.text(normalize(sec));
			minutes.text(min);
		}, 100);
	} else {
		runs++;
		container.removeClass("timer-running");
		clearInterval(interval);
		
		$("<li>", {
			html: timer.html()
		}).data("time", ms).appendTo(times);
		
		summary.show();
		
		var totalTime = 0;
		var fastest = null;
		var slowest = null;
		var timeItems = times.find("li");
		
		timeItems.each(function() {
			var li = $(this);
			var curTime = li.data("time");
			if (fastest === null) {
				fastest = li;
			} else if (curTime > fastest.data("time")) {
				fastest.removeClass("fastest-time");
				fastest = li;
			}
			fastest.addClass("fastest-time")
			
			if (slowest === null) {
				slowest = li;
			} else if (curTime < slowest.data("time")) {
				slowest.removeClass("slowest-time");
				slowest = li;
			}
			slowest.addClass("slowest-time");
			
			totalTime += curTime;
		});
		
		var timesElement = times.get(0);
		timesElement.scrollTop = timesElement.scrollHeight;
		
		var totalTrimTime = 0;
		var trimRunCount = runs;
		if (timeItems.size() > 2) {
			trimRunCount = timeItems.not(".slowest-time").not(".fastest-time").each(function() {
				totalTrimTime += $(this).data("time");
			}).size();
		} else {
			totalTrimTime = totalTime;
		}
		
		var totalTimeObj = convertMsToTime(totalTime / runs);
		var totalTrimTimeObj = convertMsToTime(totalTrimTime / trimRunCount)
		
		avgRuns.text(runs);
		avrTime.text(totalTimeObj.min + ":" + totalTimeObj.sec + "." + totalTimeObj.hun);
		trimRuns.text(trimRunCount);
		trimTime.text(totalTrimTimeObj.min + ":" + totalTrimTimeObj.sec + "." + totalTrimTimeObj.hun);
		
		populateMoves();
	}	
	started = !started;
}

$(document).keyup(function(e) {
	if (e.which === 32) {
		toggleTimer();
	}
});

$(document).keydown(function(e) {
	if (e.which === 32 && !started) {
		tenths.text("0");
		seconds.text("00");
		minutes.text("0");
		ten = 0;
		sec = 0;
		min = 0;
		ms = 0;
		container.addClass("timer-before-start");
	}
});

populateMoves();

})();