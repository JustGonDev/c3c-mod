var os = require("os");
var childProcess = require("child_process");
var semver = require("semver");
var osName = "";
switch (os.platform()) {
  case "win32":
    osName = childProcess
      .execSync("wmic os get caption", {
        shell: true
      })
      .toString()
      .split("\r\n")[1]
      .replace((/”/g), "\"")
      .replace((/“/g), "\"")
      .split(/((?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^/\\]*(?:\\[\S\s][^/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S))+)(?=\s|$)/)
      .filter(function(el) {
        return !(el == null || el == "" || el == " " || !el.replace(/\s/g, '')
          .length);
      })
      .map(function(z) {
        return z.replace(/"/g, "");
      })
      .join(" ");
    break;
  case "linux":
    try {
      osName = childProcess
        .execSync("lsb_release -d", {
          shell: true
        })
        .toString()
        .split("\n")[0]
        .replace((/”/g), "\"")
        .replace((/“/g), "\"")
        .split(/((?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^/\\]*(?:\\[\S\s][^/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S))+)(?=\s|$)/)
        .filter(function(el) {
          return !(el == null || el == "" || el == " " || !el.replace(/\s/g, '')
            .length);
        })
        .map(function(z) {
          return z.replace(/"/g, "");
        })
        .slice(1)
        .join(" ");
      if (os.release().endsWith("+")) osName += " (Android/TermUX)";
    } catch (ex) {
      osName = childProcess
        .execSync("cat /etc/*-release", {
          shell: true
        })
        .toString()
        .split("\n")[0]
        .replace((/”/g), "\"")
        .replace((/“/g), "\"")
        .split(/((?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^/\\]*(?:\\[\S\s][^/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S))+)(?=\s|$)/)
        .filter(function(el) {
          return !(el == null || el == "" || el == " " || !el.replace(/\s/g, '')
            .length);
        })
        .map(function(z) {
          return z.replace(/"/g, "");
        })
        .slice(1)
        .join(" ");
    }
    break;
  case "cygwin":
    osName = childProcess
      .execSync("systeminfo | sed -n 's/^OS Name:[[:blank:]]*//p'", {
        shell: true
      })
      .toString()
      .split("\n")[0]
      .replace((/”/g), "\"")
      .replace((/“/g), "\"")
      .split(/((?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^/\\]*(?:\\[\S\s][^/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S))+)(?=\s|$)/)
      .filter(function(el) {
        return !(el == null || el == "" || el == " " || !el.replace(/\s/g, '')
          .length);
      })
      .map(function(z) {
        return z.replace(/"/g, "");
      })
      .join(" ");
    break;
  case "freebsd":
    osName = `FreeBSD ${semver.coerce(os.release()).major}.${semver.coerce(os.release()).minor}`;
    break;
  case "netbsd":
    osName = `NetBSD ${os.release()}`;
    break;
  case "openbsd":
    osName = `OpenBSD ${os.release()}`;
    break;
  case "darwin":
    osName = childProcess
      .execSync(`sw_vers -productVersion`, {
        shell: true
      })
      .toString()
      .split("\n")[0]
      .replace((/”/g), "\"")
      .replace((/“/g), "\"")
      .split(/((?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^/\\]*(?:\\[\S\s][^/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S))+)(?=\s|$)/)
      .filter(function(el) {
        return !(el == null || el == "" || el == " " || !el.replace(/\s/g, '')
          .length);
      })
      .map(function(z) {
        return z.replace(/"/g, "");
      })
      .join(" ");
    break;
  case "android":
    osName = `Android version parsing not implented`;
    break;
  case "aix":
    var version = childProcess
      .execSync("oslevel", {
        shell: true
      })
      .toString()
      .split("\r\n")[0]
      .replace((/”/g), "\"")
      .replace((/“/g), "\"")
      .split(/((?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^/\\]*(?:\\[\S\s][^/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S))+)(?=\s|$)/)
      .filter(function(el) {
        return !(el == null || el == "" || el == " " || !el.replace(/\s/g, '')
          .length);
      })
      .map(function(z) {
        return z.replace(/"/g, "");
      })
      .join(" ");
    osName = `IBM AIX ${version}`;
    break;
  case "sunos":
    osName = `Solaris version parsing not implented`;
    break;
}
module.exports = {
  osName
}
