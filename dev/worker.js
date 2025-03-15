/** @param {NS} ns */
export async function main(ns) {
  //worker will do a thing and report it's waggle on the assigned port
  let waggle = await workerbee(ns, ns.args[0], ns.args[1]);
  ns.writePort(ns.args[2], waggle);
}

export async function workerbee(ns, hackfunction, target){
  //crack the server if applicable.  Most servers are hives but those with
  //0GB RAM will need to be cracked by the workers.
  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(target);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(target);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(target);
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    ns.httpworm(target);
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
    ns.sqlinject(target);
  }
  ns.nuke(target);

  //if the worker is told to hack, execute a hack function and report
  //cash/second as the waggle
  if (hackfunction === "hack"){
    const start = Date.now();
    let cash = await ns.hack(target);
    let endcycle = Date.now();
    let totaltime = endcycle - start;
    let ttseconds = totaltime / 1000;
    let hackwaggle = cash/ttseconds;

    return hackwaggle;
  //if told to grow, execute grow and report cash/second as the waggle
  } else if (hackfunction === "grow"){
    const start = Date.now();
    let cash = await ns.grow(target);
    let endcycle = Date.now();
    let totaltime = endcycle - start;
    let ttseconds = totaltime / 1000;
    let growwaggle = cash/ttseconds;

    return growwaggle;
  //if told to weaken, execute weaken and report securitydrop/minute as the waggle
  } else if (hackfunction === "weaken"){
    const start = Date.now();
    let sec = await ns.weaken(target);
    let endcycle = Date.now();
    let totaltime = endcycle - start;
    let ttminutes = totaltime / 60000;
    let weakenwaggle = sec/ttminutes;

    return weakenwaggle;
  }
}
