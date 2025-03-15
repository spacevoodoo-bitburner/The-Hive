import { scanall } from "/dev/scanner.js";
import { queenbee } from "/dev/queen.js";

export async function main(ns) {
  //get all target servers. These will be hives too but mostly function as flowers.
  const servers = await scanall(ns);
  //get purchased servers.  These will be our workhorse hives with the biggest populations.
  const purchasedservers = ns.getPurchasedServers();

  //create an array to hold copies of the queen in every hive
  const queenmatrix = [];

  let longesttime = 0;
  for (let i = 0; i < servers.length; ++i){
    //figure out how long you need to wait before updating queens for the first time
    let growtime = ns.getGrowTime(servers[i]["name"]);
    let weakentime = ns.getWeakenTime(servers[i]["name"]);
    if (growtime > longesttime){
      longesttime = growtime;
    }
    if (weakentime > longesttime){
      longesttime = weakentime;
    }
    //randomly initialize a queen and extract it's json
    let queen = queenbee(ns);
    queen = JSON.parse(queen);
    let x = queen[0]["variable"];
    let y = queen[1]["variable"];
    let z = queen[2]["variable"];
    //push the queen to the queen matrix and generate a hive and a queen with these parameters on the server
    queenmatrix.push(queen);
    ns.scp("/dev/hive.js", servers[i]["name"]);
    ns.scp("/dev/worker.js", servers[i]["name"]);
    ns.scp("/dev/scanner.js", servers[i]["name"]);
    ns.scp("/dev/queen.js", servers[i]["name"]);
    ns.exec("/dev/queen.js", servers[i]["name"], 1, 1000, x, y, z);
    ns.exec("/dev/hive.js", servers[i]["name"]);
  }
  //same as for servers
  for (let i = 0; i < purchasedservers.length; ++i){
    let queen = queenbee(ns);
    queen = JSON.parse(queen);
    let x = queen[0]["variable"];
    let y = queen[1]["variable"];
    let z = queen[2]["variable"];
    queenmatrix.push(queen);
    ns.scp("/dev/hive.js", purchasedservers[i]);
    ns.scp("/dev/worker.js", purchasedservers[i]);
    ns.scp("/dev/scanner.js", purchasedservers[i]);
    ns.scp("/dev/queen.js", purchasedservers[i]);
    ns.exec("/dev/queen.js", purchasedservers[i], 1, 1000, x, y, z);
    ns.exec("/dev/hive.js", purchasedservers[i]);
  }
  if (purchasedservers.length < 25){
    //after a fresh reset use main server as a normal hive since you don't have better options
    let queen = queenbee(ns);
    queen = JSON.parse(queen);
    let x = queen[0]["variable"];
    let y = queen[1]["variable"];
    let z = queen[2]["variable"];
    queenmatrix.push(queen);
    ns.exec("/dev/queen.js", "home", 1, 1000, x, y, z);
    ns.exec("/dev/hive.js", "home");
  } else {
    //execute dumbhive on home so it doesn't bias queen parameters if other hives are up
    ns.exec("/dev/dumbhive.js", "home");
  }
  
  //sleep until enough workers have had a chance to execute to get a 
  //starting assessement of hive health
  await ns.sleep(longesttime);
  while (true){
    //perform differential evolution loop every 60 seconds
    await ns.sleep(60000);
    let successarray = [];
    let serverarray = [];
    //for every hive, grab it's script income and save it to an array
    for (let i = 0; i < servers.length; ++i){
      let success = ns.getScriptIncome("/dev/hive.js", servers[i]["name"]);
      successarray.push(success);
      serverarray.push(servers[i]["name"])
    }
    for (let i = 0; i < purchasedservers.length; ++i){
      let success = ns.getScriptIncome("/dev/hive.js", purchasedservers[i]["name"]);
      successarray.push(success);
      serverarray.push(purchasedservers[i]);
    }

    //eliminate all but the 10 most successful queens
    while (successarray.length > 10){
      let minelement = Math.min(...successarray);
      let minindex = successarray.indexOf(minelement);
      successarray.splice(minindex, 1);
      serverarray.splice(minindex, 1);
    }
    let bestqueens = []
    for (let i = 0; i < queenmatrix.length; ++i){
      if (serverarray.includes(queenmatrix[i][3]["server"])){
        bestqueens.push(queenmatrix[i]);
      }
    }
    //mutation rate = 0.1, crossover rate = 0.2
    let mr = 0.1;
    let cr = 0.2;
    for (let i = 0; i < queenmatrix.length; ++i){
      //for every hive, if it isn't one of our best queens, replace the queen
      if (!serverarray.includes(queenmatrix[i][3]["server"])){
        //get two random successful queens
        let idx1 = getRandomInt(0, 9);
        let idx2 = getRandomInt(0, 9);
        let parent1 = bestqueens[idx1];
        let parent2 = bestqueens[idx2];
        //give them a chance to cross over
        crossover(parent1, parent2, cr);
        //give them a chance to mutate
        mutate(parent1, mr);
        mutate(parent2, mr);
        //pick one of the (maybe) altered parent copies and replace the unsuccessful queen with it
        let chance = Math.random();
        if (chance > 0.5){
          queenmatrix[i] = parent1;
        } else {
          queenmatrix[i] = parent2;
        }
      }
    }
    //loop through every hive and replace their queen's parameters with the new ones
    for (let i = 0; i < queenmatrix.length; ++i){
      ns.scriptKill("/dev/queen.js", queenmatrix[i][3]["server"]);
      ns.exec("/dev/queen.js", queenmatrix[i][3]["server"], 1, 1000, queenmatrix[i][0]["probability"], queenmatrix[i][1]["probability"], queenmatrix[i][2]["probability"]);
    }
  }
}

//randomly swap parent parameters 20% of the time
function crossover(parent1, parent2, cr){
  for (let i = 0; i < 3; ++i){
    let rand = Math.random();
    if (rand < cr){
      let gene1 = parent1[i]["variable"];
      let gene2 = parent2[i]["variable"];
      parent1[i]["variable"] = gene2;
      parent2[i]["variable"] = gene1;
    }
  }
}

//randomly mutate 10% of the time
function mutate(queen, mr){
  for (let i = 0; i < 3; ++i){
    let rand = Math.random();
    if (rand < mr){
      let mutation = getRandomInt(1, 3);
      if (mutation === 1){
        let mf = Math.random();
        let gene = queen[i]["variable"];
        let mutatedgene = gene * mf;
        queen[i]["variable"] = mutatedgene;
      } else if (mutation === 2){
        let mf = Math.random()/10;
        let gene = queen[i]["variable"];
        let mutatedgene = gene + mf;
        queen[i]["variable"] = mutatedgene;
      } else if (mutation === 3){
        let mf = Math.random()/10;
        let gene = queen[i]["variable"];
        let mutatedgene = gene - mf;
        queen[i]["variable"] = mutatedgene;
      }
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
