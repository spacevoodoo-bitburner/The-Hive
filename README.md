This is early game hacking code for the coding game Bitburner.  It will get updated as I play more of the game, clean it up, add new tasks, etc.  It uses a beehive algorithm to prioritize
hacking targets and uses differential evolution (sort of) to manage the probabilities that particular hacking tasks will be performed.  Swarm.js manages all the hives.  Hive.js manages queens
and workers in a particular hive.  Queen.js controls what ratios of workers are created for particular tasks.  Worker.js does things to targets and then tells the hive how juicy the target was.
