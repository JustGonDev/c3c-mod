/*
C3CBot - Install build tools for Windows. (NodeJS version)
    Copyright (C) 2020  UIRI

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
(async () => {
  var https = require("https");
  var childProcess = require("child_process");
  var isChocolateyInstalled = (function() {
    try {
      childProcess.spawnSync("choco", {
        shell: true
      });
      return true;
    } catch (_) {
      return false;
    }
  })();
  if (!isChocolateyInstalled) {
    let downloaded = false;
    let script = null;
    while (!downloaded) {
      try {
        // eslint-disable-next-line no-await-in-loop
        script = await new Promise((resolve, reject) => {
          let data = [];
          https.get('https://chocolatey.org/install.ps1', function(res) {
            let {
              statusCode
            } = res;
            if (statusCode !== 200) {
              console.log();
              console.log("Cannot get chocolatey install script: HTTP/1.1", statusCode);
              process.exit(1);
            }
            process.stdout.write("Downloading chocolatey install script...");
            res.on("data", buf => {
              data = [...data, ...buf];
              process.stdout.write(`\rDownloading chocolatey install script... ${data.length}B`);
            });
            res.on("end", () => {
              console.log();
              resolve(Buffer.from(data));
            });
          }).on("error", function(err) {
            console.log();
            console.log("Error while trying to download chocolatey install script:", err);
            console.log("Retrying...");
            reject(new Error());
          });
        });
        downloaded = true;
      } catch (_) {}
    }
    let cInstall = childProcess.spawnSync('powershell -ExecutionPolicy Bypass -Command "-"', {
      input: script,
      shell: true
    });
    if (cInstall.status != 0) {
      console.log(cInstall.stdout.toString(), cInstall.stderr.toString());
      process.exit(cInstall.status);
    }
    console.log("Installed chocolatey.");
  }
  let vsInstall = childProcess.spawnSync('choco upgrade -y python visualstudio2017-workload-vctools', {
    shell: true
  });
  if (vsInstall.status != 0) {
    console.log(`An error was occurred: BuildTools installation returned code ${vsInstall.status}.`);
  } else {
    console.log("Done!");
  }
  process.exit(vsInstall.status);
})();
