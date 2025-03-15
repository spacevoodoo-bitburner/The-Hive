import { scanall } from "/dev/scanner.js";

//dumb hive doesn't have a queen and just blasts servers.  Keep's home from
//biasing the swarm's numbers while taking advantage of it's extra cores.
export async function main(ns) {
  const servers = await scanall(ns);
  const targets = [];
  for (let i = 0; i < servers.length; ++i){
    let serv = servers[i]["name"];
    if (!serv.includes("pserv")){
      targets.push(servers[i]);
    }
  }
  let freeram = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
  let baseusedram = ns.getServerUsedRam("home");
  let scriptram = ns.getScriptRam("/dev/worker.js", "home");
  let usedram = 0;
  let port = 1;
  //we still want the workers to write to ports so we know when they
  //are done, but we don't care about their waggles so don't sort them
  let ports = [];
  //dumb hives don't hack or prioritize, they just switch back and
  //forth between hack and grow and hit everything they can
  let flipflop = true;
  while (true){
    //swap back and forth between weaken and grow, sending workers to all targets
    if (usedram < freeram - scriptram * 2){
      if (flipflop){
        for (let i = 0; i < targets.length; ++i){
          ports.push(port);
          ns.exec("/dev/worker.js", "home", 1, "weaken", targets[i]["name"], port);
          port += 1;
          usedram += scriptram;
        }
      } else {
        for (let i = 0; i < targets.length; ++i){
          ports.push(port);
          ns.exec("/dev/worker.js", "home", 1, "grow", targets[i]["name"], port);
          port += 1;
          usedram += scriptram;
        }
      }
      await ns.sleep(200);
      //check ports to see if workers are done and report that there is free ram when they are
      if (ports.length > 10){
        for (let i = 0; i < ports.length; ++i){
          let callback = ns.readPort(ports[i]);
          if (callback != "NULL PORT DATA"){
            usedram -= scriptram;
            ports.splice(i, 1);
            await ns.sleep(200);
          }
        }
      }
    }
  }
}
