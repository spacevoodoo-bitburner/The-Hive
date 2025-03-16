import { scanall } from "/dev/scanner.js";

export async function main(ns) {
  //when a hive is initialized, read port 1000 for the queen data
  //swarm will always initialize queen before hive for this reason
  let probstring = ns.readPort(1000);
  let probs = JSON.parse(probstring);
  //get hives and targets
  const servers = await scanall(ns);
  const purchasedservers = [];
  const targets = [];
  const host = ns.getHostname();
  for (let i = 0; i < servers.length; ++i){
    let serv = servers[i]["name"];
    if (serv.includes("pserv")){
      purchasedservers.push(servers[i]);
    } else if (serv == "home"){} else {
      targets.push(servers[i]);
    }
  }
  //figure out how much room you have for workers and initialize starting values
  let freeram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
  let baseusedram = ns.getServerUsedRam(host);
  let scriptram = ns.getScriptRam("/dev/worker.js", host);
  let usedram = 0;
  let port = 1;

  let hackports = [];
  let growports = [];
  let weakenports = [];
  let maxhack = 1;
  let maxgrow = 1;
  let maxweaken = 0.1;
  while (true){
    //every loop check port 1000 for a new queen.  If one is found update probs.
    probstring = ns.readPort(1000);
    freeram = ns.getServerMaxRam(host) - baseusedram;
    if (probstring != "NULL PORT DATA"){
      probs = JSON.parse(probstring);
    }
    if (typeof probs[0] !== 'undefined'){
      //if there is enough room for more workers, the hive is allowed to make more workers.  Otherwise wait.
      if (usedram < freeram - scriptram * 2){
      //generate a random number and check against probs to see which hack function will be performed
        let rand = Math.random();
        let prob1 = probs[0]["probability"];
        let prob2 = probs[0]["probability"] + probs[1]["probability"];
        if (rand <= prob1){
          //if it's hack, generate a random number, loop through all servers and
          //execute hack if it's hackwaggle is greater than that number.
          //it will be the same if probs tells us to grow or weaken, but for their waggles
          let servercheck = Math.random() * maxhack;
          for (let i = 0; i < targets.length; ++i){
            if (targets[i]["hackwaggle"] >= servercheck){
              let obj = {};
              obj["server"] = targets[i]["name"];
              obj["port"] = port;
              hackports.push(obj);
              ns.exec("/dev/worker.js", host, 1, "hack", targets[i]["name"], port);
              port += 1;
              usedram += scriptram;
            }
          }
        } else if (rand > prob1 && rand <= prob2){
          let servercheck = Math.random() * maxgrow;
          for (let i = 0; i < targets.length; ++i){
            if (targets[i]["growwaggle"] >= servercheck){
              let obj = {};
              obj["server"] = targets[i]["name"];
              obj["port"] = port;
              growports.push(obj);
              ns.exec("/dev/worker.js", host, 1, "grow", targets[i]["name"], port);
              port += 1;
              usedram += scriptram;
            }
          }
        } else {
          let servercheck = Math.random() * maxweaken;
          for (let i = 0; i < targets.length; ++i){
            if (targets[i]["weakenwaggle"] >= servercheck){
              let obj = {};
              obj["server"] = targets[i]["name"];
              obj["port"] = port;
              weakenports.push(obj);
              ns.exec("/dev/worker.js", host, 1, "weaken", targets[i]["name"], port);
              port += 1;
              usedram += scriptram;
            }
          }
        }
      }
      //wait 0.2 seconds, check updated ports, update waggles, update used ram, and repeat loop
      await ns.sleep(200);
      if (hackports.length > 4){
        let finished = [];
        for (let i = 0; i < hackports.length; ++i){
          let thiswaggle = ns.readPort(hackports[i]["port"]);
          if (thiswaggle != "NULL PORT DATA"){
            for (let j = 0; j < targets.length; ++j){
              if (targets[j]["name"] == hackports[i]["server"]){
                let lastwaggle = targets[j]["hackwaggle"];
                targets[j]["hackwaggle"] = (thiswaggle + lastwaggle) / 2;
                usedram -= scriptram;
                finished.push(i);
              }
            }
          }
        }
        //remove used ports from array after loop to avoid index errors
        for (let i = 0; i < finished.length; ++i){
          hackports.splice(finished[i], 1);
        }
        finished = [];
        for (let i = 0; i < growports.length; ++i){
          let thiswaggle = ns.readPort(growports[i]["port"]);
          if (thiswaggle != "NULL PORT DATA"){
            for (let j = 0; j < targets.length; ++j){
              if (targets[j]["name"] == growports[i]["server"]){
                let lastwaggle = targets[j]["hackwaggle"];
                targets[j]["growwaggle"] = (thiswaggle + lastwaggle) / 2;
                usedram -= scriptram;
                finished.push(i)
                await ns.sleep(200);
              }
            }
          }
        }
        for (let i = 0; i < finished.length; ++i){
          growports.splice(finished[i], 1);
        }
        finished = [];
        for (let i = 0; i < weakenports.length; ++i){
          let thiswaggle = ns.readPort(weakenports[i]["port"]);
          if (thiswaggle != "NULL PORT DATA"){
            for (let j = 0; j < targets.length; ++j){
              if (targets[j]["name"] == weakenports[i]["server"]){
                let lastwaggle = targets[j]["hackwaggle"];
                targets[j]["weakenwaggle"] = (thiswaggle + lastwaggle) / 2;
                usedram -= scriptram;
                finished.push(i);
              }
            }
          }
        }
        for (let i = 0; i < finished.length; ++i){
          weakenports.splice(finished[i], 1);
        }
      }
    }
    await ns.sleep(200);
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
