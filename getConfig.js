var fs = require("fs");
var path = require("path");
var stripBom = require("strip-bom");
var log = require("./logger.js");

var defaultconfig = {
  testmode: false,
  botname: "C3CBot",
  enablefb: false,
  usefbappstate: true,
  fbemail: "",
  fbpassword: "",
  fb2fasecret: "BASE32OFSECRETKEY",
  fbuseragent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063",
  fblistenwhitelist: false,
  fblisten: [
    "0" //Replace 0 with FB Thread ID
  ],
  facebookAutoRestartLoggedOut: true,
  facebookProxy: null,
  facebookProxyUseSOCKS: false,
  facebookAllowOptionalResponseNoDelay: true,
  facebookResponseDelayPerChar: 30,
  portSOCK2HTTP: 0,
  addressSOCK2HTTP: "127.0.0.1",
  enablediscord: false,
  discordtoken: "",
  discordlistenwhitelist: false,
  discordlisten: [
    "0" //Replace 0 with Discord channel ID
  ],
  admins: [
    "FB-0", //Replace 0 with FBID
    "DC-0" //Replace 0 with Discord ID
  ],
  blacklistedUsers: [
    "FB-0", //Replace 0 with FBID
    "DC-0" //Replace 0 with Discord ID
  ],
  allowAdminUseRestartCommand: true,
  allowAdminUseShutdownCommand: false,
  allowUserUsePluginsCommand: true,
  allowUserUseReloadCommand: false,
  language: "en_US",
  allowEveryoneTagEvenBlacklisted: true,
  DEBUG_FCA_LOGLEVEL: "error",
  enableSSHRemoteConsole: false,
  sshRemoteConsoleIP: "0.0.0.0",
  sshRemoteConsolePort: 2004,
  sshUsername: "admin",
  sshPassword: "c3cbot@ADMIN",
  commandPrefix: "/",
  autoUpdate: true,
  autoUpdateTimer: 60,
  configVersion: 1,
  hideUnknownCommandMessage: false,
  enableMetric: true,
  sendInterfaceInfoToMetric: false
};

module.exports = function getConfig() {
  return fs.existsSync(path.join(__dirname, "config.json")) ? (function () {
    try {
      var readedConfig = JSON.parse(stripBom(fs.readFileSync(path.join(__dirname, "config.json"), {
        encoding: "utf8"
      })));
    } catch (_) {
      log("[INTERNAL]", "Invalid config file. (Broken JSON?)");
      log("[INTERNAL]", "Attempting to write default config...");
      try {
        fs.writeFileSync(path.join(__dirname, "config.json"), JSON.stringify(defaultconfig, null, 4), {
          mode: 0o666
        });
      } catch (ex) {
        log("[INTERNAL]", "Cannot write default config, returned an error: ", ex);
      }
      return defaultconfig;
    }
    for (let configName in defaultconfig) {
      if (!Object.prototype.hasOwnProperty.call(readedConfig, configName)) {
        readedConfig[configName] = defaultconfig[configName];
        log("[INTERNAL]", "Missing", configName, "in config file. Adding with default value (", defaultconfig[
          configName], ")...");
      }
    }
    for (let configName in readedConfig) {
      if (!Object.prototype.hasOwnProperty.call(defaultconfig, configName)) {
        delete readedConfig[configName];
        log("[INTERNAL]", "Deleted ", configName, "in config file. (unused)");
      }
    }
    fs.writeFileSync(path.join(__dirname, "config.json"), JSON.stringify(readedConfig, null, 4), {
      mode: 0o666
    });
    return readedConfig;
  })() : (function () {
    log("[INTERNAL]", "Config file not found. Creating a default one...");
    try {
      fs.writeFileSync(path.join(__dirname, "config.json"), JSON.stringify(defaultconfig, null, 4), {
        mode: 0o666
      });
    } catch (ex) {
      log("[INTERNAL]", "Cannot write default config, returned an error: ", ex);
    }
    return defaultconfig;
  })();
};
