var os = require("os");
var wait = require('wait-for-stuff');

function cpuAverage() {
    var totalIdle = 0,
        totalTick = 0;
    var cpus = os.cpus();
    for (var i = 0, len = cpus.length; i < len; i++) {
        var cpu = cpus[i];
        for (var type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    }
    return {
        idle: totalIdle / cpus.length,
        total: totalTick / cpus.length
    };
}

/**
 * Get CPU percentage in avgTime ms.
 *
 * @param   {number}   avgTime  Time in milliseconds.
 *
 * @return  {Promise}           A promise that will resolve with percentage of CPU load.
 */
class CPULoad {
    constructor(avgTime) {
        return new Promise((resolve) => {
            this.samples = [];
            this.samples[1] = cpuAverage();
            this.refresh = setTimeout(() => {
                this.samples[0] = this.samples[1];
                this.samples[1] = cpuAverage();
                var totalDiff = this.samples[1].total - this.samples[0].total;
                var idleDiff = this.samples[1].idle - this.samples[0].idle;
                resolve(1 - idleDiff / totalDiff);
            }, avgTime);
        });
    }
}

/**
 * Get load percentage of CPU (sync)
 *
 * @param   {number}  avgTime  Time between samples in milliseconds
 *
 * @return  {number}           Percentage of CPU load.
 */
CPULoad.getPercentage = function getPercentage(avgTime) {
    return wait.for.promise(new Promise((resolve) => {
        this.samples = [];
        this.samples[1] = cpuAverage();
        this.refresh = setTimeout(() => {
            this.samples[0] = this.samples[1];
            this.samples[1] = cpuAverage();
            var totalDiff = this.samples[1].total - this.samples[0].total;
            var idleDiff = this.samples[1].idle - this.samples[0].idle;
            resolve(1 - idleDiff / totalDiff);
        }, avgTime);
    }));
};

module.exports = CPULoad;
