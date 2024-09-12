# blockbench-diamondfire
A BlockBench plugin to export models and animations to DiamondFire

Since progress has slowed down and I've kinda stopped working on it I have decided to just make it public since it could still be useful to others.  
I might try to add it to the official plugin list or whatever it's called but I feel like the plugin needs to be a bit more organized before I do that.
 
Basic usage instructions:  
Rename cubes to the block_id of what you want it to be:  
stone  
redstone_lamp

optionally you can also add blockstates like this:  
redstone_lamp\[lit=true]  
oak_stairs\[facing=west,half=top]

Animations:  
To avoid issues with animations I recommend using the Bakery plugin by JannisX11, it is available in the plugin list in BlockBench.  
For each transform that changes the amount and location of keyframes needs to be the same. For example:

works:  
```
Rotation   x      x      x  
Position   
Scale
```
```
Rotation   x      x      x  
Position   x      x      x  
Scale      x      x      x
```

doesn't work:  
```
Rotation   x      x      x  
Position   x             x  
Scale      
```
```
Rotation   x      x      x  
Position   x  x          x  
Scale      
```
If there are any issues you can report them and I might fix them at some point but it will likely take a while. If you have a fix for something you're welcome to make a pull request.  
If you need to contact me you can do so on discord, my username is robolizard and I am also in the DiamondFire discord.
