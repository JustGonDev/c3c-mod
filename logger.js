var util = require("util");
var fs = require("fs");
var path = require("path");
const readline = require('readline');

!global.logLast ? global.logLast = {
  year: 1970,
  month: 1,
  days: 1,
  loadTimes: 0
} : "";

/**
 * Log to console and also write to logs file, print to every ssh console session
 *
 * @param   {any}  message     Anything
 *
 * @return  {undefined}        Function will not return anything
 */
function log(...message) {
  var date = new Date();
  readline.cursorTo(process.stdout, 0);
  var x = ["\x1b[K" + "\x1b[1;32m" + "\x1b[1;92m" + "\x1b[38;2;0;255;0m" + "[" +
    (date.getUTCFullYear()
      .pad(4) + "-" + (date.getUTCMonth() + 1)
        .pad(2) + "-" + date.getUTCDate()
          .pad(2) + "T" + date.getUTCHours()
            .pad(2) + "-" + date.getUTCMinutes()
              .pad(2) + "-" + date.getUTCSeconds()
                .pad(2) + "." + date.getUTCMilliseconds()
                  .pad(3) + "Z") + "]"];
  console.log.apply(console, x.concat(message)
    .concat(["\x1b[1;32m"]));
  global.crl.prompt(true);
  var tolog = "[" + (date.getUTCFullYear()
    .pad(4) + "-" + (date.getUTCMonth() + 1)
      .pad(2) + "-" + date.getUTCDate()
        .pad(2) + "T" + date.getUTCHours()
          .pad(2) + "-" + date.getUTCMinutes()
            .pad(2) + "-" + date.getUTCSeconds()
              .pad(2) + "." + date.getUTCMilliseconds()
                .pad(3) + "Z") + "]";
  for (let n in message) {
    if (typeof message[n] == "object") {
      tolog += " " + util.format("%O", message[n]);
    } else {
      tolog += " " + util.format("%s", message[n]);
    }
  }
  var currentLogDate = date.getUTCFullYear()
    .pad(4) + '-' + (date.getUTCMonth() + 1)
      .pad(2) + '-' + date.getUTCDate()
        .pad(2);
  var lastLogDate = global.logLast.year.pad(4) + "-" + global.logLast.month.pad(2) + "-" + global.logLast.days.pad(2);
  if (currentLogDate != lastLogDate) {
    var times = 0;
    for (; ;) {
      if (!fs.existsSync(path.join(__dirname, "logs", `log-${currentLogDate}-${times}.tar.gz`)) && !fs.existsSync(path
        .join(__dirname, "logs", `log-${currentLogDate}-${times}.log`))) {
        break;
      }
      times++;
    }
    global.logLast = {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      days: date.getUTCDate(),
      loadTimes: times
    };
  }
  fs.appendFile(
    path.join(__dirname, "logs", `log-${currentLogDate}-${global.logLast.loadTimes}.log`), tolog + "\r\n",
    function (err) {
      if (err) {
        console.log("[CRITICAL] [NOT LOGGED] ERROR WHILE WRITING LOGS: ", err);
      }
    }
  );
  var tssh = "\x1b[K" + "\x1b[1;32m" + "\x1b[1;92m" + "\x1b[38;2;0;255;0m[" + (date.getUTCFullYear()
    .pad(4) + "-" + (date.getUTCMonth() + 1)
      .pad(2) + "-" + date.getUTCDate()
        .pad(2) + "T" + date.getUTCHours()
          .pad(2) + "-" + date.getUTCMinutes()
            .pad(2) + "-" + date.getUTCSeconds()
              .pad(2) + "." + date.getUTCMilliseconds()
                .pad(3) + "Z") + "]";
  for (let n in message) {
    if (typeof message[n] == "object") {
      tssh += " " + util.formatWithOptions({
        colors: true
      }, "%O", message[n]);
    } else {
      tssh += " " + util.formatWithOptions({
        colors: true
      }, "%s", message[n]);
    }
  }
  // eslint-disable-next-line no-extra-boolean-cast
  if (!!global.sshcurrsession) {
    if (typeof global.sshcurrsession == "object") {
      for (var session in global.sshstream) {
        try {
          global.sshstream[session].stdout.write("\r");
          global.sshstream[session].stdout.write(tssh.replace(/\r\n/g, "\uFFFF")
            .replace(/\n/g, "\r\n")
            .replace(/\uFFFF/g, "\r\n") + "\r\n" + "\x1b[1;32m");
          global.sshcurrsession[session].prompt(true);
          //global.sshstream[session].stdout.write(global.sshcurrsession[session].line);
        } catch (ex) { }
      }
    }
  }
}

module.exports = log;
