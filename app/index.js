import { locale } from "user-settings";
import { preferences } from "user-settings";
import { charger, battery } from "power";
import { today } from "user-activity";
import { HeartRateSensor } from "heart-rate";
import clock from "clock";
import document from "document";
import * as util from "../common/utils";

const dateData = document.getElementById("dateData");
const clockData = document.getElementById("clockData");
const heartbeatsData = document.getElementById("heartbeatsData");
const stepsData = document.getElementById("stepsData");
const distanceData = document.getElementById("distanceData");
const batteryGreenIcon = document.getElementById("batteryGreen");
const batteryYellowIcon = document.getElementById("batteryYellow");
const batteryRedIcon = document.getElementById("batteryRed");
const batteryPercentage = document.getElementById("batteryPercentage");

if(preferences.clockDisplay == "12h")
  {
    let hours12 = true;
  }
else
  {
    let hours12 = false;
  }

let languageCode = locale.language;
if(languageCode.length > 2)
  {
    languageCode = languageCode.slice(0, 2);
  }
if(languageCode == "de")
  {
    let dayNames = ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"];
    let weekWord = "woche";
  }
else if(languageCode == "es")
  {
    let dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    let weekWord = "semana";
  }
else if(languageCode == "fr")
  {
    let dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    let weekWord = "semaine";
  }
else if(languageCode == "it")
  {
    let dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    let weekWord = "settimana";
  }
else if(languageCode == "nl")
  {
    let dayNames = ["Zon", "Maa", "Din", "Woe", "Don", "Vri", "Zat"];
    let weekWord = "week";
  }
else if(languageCode == "sv")
  {
    let dayNames = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];
    let weekWord = "vecka";
  }
else
  {
    let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let weekWord = "week";
  }

clock.granularity = "seconds";

let hrm = new HeartRateSensor();
hrm.start();

// Begin analog stuff

const minuteWidth = 2;
const hourWidth = 8;

const minuteLength = 12;
const hourLength = 20;

const showMinutes = true;
const showHours = true;

const minuteColour = "white";
const hourColour = "dodgerblue";

const tickrect = document.getElementById("tickrect");
const tickmarks = document.getElementsByClassName("minutes");

function getPointOnRect(x, y, w, h, angle)
{
  let sin = Math.sin(angle),
      cos = Math.cos(angle); // Calculate once and store, to make quicker and cleaner
  let dy = sin>0 ? (h/2) : (0-h)/2; // Distance to top or bottom edge (from center)
  let dx = cos>0 ? (w/2) : (0-w)/2; // Distance to left or right edge (from center)

  if(Math.abs(dx*sin) < Math.abs(dy*cos))
  {
    // if (distance to vertical line) < (distance to horizontal line)
    dy = (dx * sin) / cos; // calculate distance to vertical line
  }
  else
  {
    // else: (distance to top or bottom edge) < (distance to left or right edge)
    dx = (dy * cos) / sin; // move to top or bottom line
  }
  return { x: dx+x+(w/2), y: dy+y+(h/2) }; // Return point on rectangle
}

function drawTicks()
{
  for (var index=0; index<60; index++)
  {
    // Calculate the INNER point
    if (index%5)
    {
      // Minutes
      let point1 = getPointOnRect(tickrect.x+minuteLength,
                                  tickrect.y+minuteLength,
                                  tickrect.width-(minuteLength*2),
                                  tickrect.height-(minuteLength*2),
                                  ((index-15)/60) * 2 * Math.PI);
      tickmarks[index].style.display = showMinutes ? "inline" : "none";
      tickmarks[index].style.fill = minuteColour;
    }
    else
    {
      // Hours
      let point1 = getPointOnRect(tickrect.x+hourLength,
                                  tickrect.y+hourLength,
                                  tickrect.width-(hourLength*2),
                                  tickrect.height-(hourLength*2),
                                  ((index-15)/60) * 2 * Math.PI);
      tickmarks[index].style.display = showHours ? "inline" : "none";
      tickmarks[index].style.fill = hourColour;
    }

    // Calculate the outer point
    let point2 = getPointOnRect(tickrect.x,
                                tickrect.y,
                                tickrect.width,
                                tickrect.height,
                                ((index-15)/60) * 2 * Math.PI);

    // Update the inner line point
    tickmarks[index].x1 = point1.x;
    tickmarks[index].y1 = point1.y;

    // Update the outer line point
    tickmarks[index].x2 = point2.x;
    tickmarks[index].y2 = point2.y;
  }
}

drawTicks();

// End analog stuff

clock.ontick = (evt) => {
  let currentTime = evt.date;
  if(hours12)
    {
      let hrs = currentTime.getHours();
      if(hrs == 0)
        {
          hrs = 12;
        }
      else if(hrs > 12)
        {
          hrs = hrs - 12;
        }
      let hours = util.zeroPad(hrs);
    }
  else
    {
      let hours = util.zeroPad(currentTime.getHours());
    }
  let minutes = util.zeroPad(currentTime.getMinutes());
  let weekdayNo = currentTime.getDay();
  let weekdayName = dayNames[weekdayNo];
  let year = currentTime.getFullYear();
  let month = util.zeroPad(1 + currentTime.getMonth());
  let date = util.zeroPad(currentTime.getDate());
  let weekNumber = util.getWeek(currentTime);
  let batteryPst = Math.floor(battery.chargeLevel);
  let beats = hrm.heartRate;
  let steps = today.adjusted.steps;
  let distance = today.adjusted.distance;
  
  dateData.text = `${weekdayName} ${date}.${month}.${year} ${weekWord} ${weekNumber}`;
  clockData.text = `${hours}:${minutes}`;
  batteryPercentage.text = batteryPst+"%";
  heartbeatsData.text = beats;
  stepsData.text = steps;
  distanceData.text = Number(distance*0.001).toFixed(2);
  
  if(batteryPst<26)
    {
      batteryGreenIcon.style.display = "none";
      batteryYellowIcon.style.display = "none";
      batteryRedIcon.style.display = "inline";
    }
  else if(batteryPst<51)
    {
      batteryGreenIcon.style.display = "none";
      batteryRedIcon.style.display = "none";
      batteryYellowIcon.style.display = "inline";
    }
  else
    {
      batteryYellowIcon.style.display = "none";
      batteryRedIcon.style.display = "none";
      batteryGreenIcon.style.display = "inline";
    }
}
