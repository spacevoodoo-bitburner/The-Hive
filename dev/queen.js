/** @param {NS} ns */
export function main(ns) {
  let probs = queenbee(ns);
  ns.writePort(ns.args[0], probs);
}

//The queen holds the probabilities that workers will be created for a given task.
//if executed with only the port argument, it is initialized with random values
//otherwise, it is initialized with the values in arguments 1, 2, and 3.
export function queenbee(ns){
  let x = 0;
  let y = 0;
  let z = 0;
  if (typeof ns.args[1] !== 'undefined'){
    x = ns.args[1];
    y = ns.args[2];
    z = ns.args[3];
  } else {
    x = Math.random();
    y = Math.random();
    z = Math.random();
  }
  let s = x + y + z;
  let constant = 1/s;
  
  //our probabilities need to add up to 1, but we also want to be able to randomize
  //them and perform operations on them willy nilly without worrying about that
  //so we feed raw values to the diff evo stuff and use normalized values for the actual
  //work.  It will all come out in the wash since all we really care about is "do these
  //numbers make the money go up or not"
  let taskarray = 
  [
    {
      "name": "hack",
      "variable": x,
      "coefficient": 1/s,
      "probability": x * constant
    },
    {
      "name": "grow",
      "variable": y,
      "coefficient": 1/s,
      "probability": y * constant
    },
    {
      "name": "weaken",
      "variable": z,
      "coefficient": 1/s,
      "probability": z * constant
    },
    {
      "server": ns.getHostname()
    }
  ];
  let stringarray = JSON.stringify(taskarray);

  return stringarray;
}
