# Ord Defence 

General concept is to store the whole games as a grid of boxes; an array 

Based on the video the lanes total  [36][x] where x is easily over 100, but
I have not counted. The top and bottom of the actual game reserved for 
making the border; so the ~ playable game is really only 34 in length. 
So removing top and bottom border lets mock this below.



Grid is                          36 X 

G 2 RE of Top Box                36  x  25

                                        29 - 35        
                                
To edge of (Orb) Base block out   36 X 55 



Grid to FB                       36 X 

Orb Bases are                     5 X 4






this is rought
```
[
    0: [,,,,,,,,,,,,,,,,,,|,,,,,|,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],
    1: [,,,,,,,,,,,,,,,,,,|,,,,,|,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],
    2: [,,,,,,,,,,,,,,,_,,|_____,, ,___________________________],
    3: [,,,,,,,,,_______,,,,,,,,,,,|,,,,,,,,,,,,,,,,,,,,,,,,,,],
    4: [,,,,,,,,,,,,,,,|,,,,,,,,,,,|,,,,,,,,,,,,,,,,,,,,,,,,,,],
    5: [,,,,,,,,,,,,,,,|,,,,,,,,,,,---------------------*****,],
    6: [,,,,,,,,,,,,,,,|,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,*****,],
    7: [,,,,,,,,,,,----|,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,*****,],
    8: [,,,,,,,,,,,,,,,,,,,,,,,,,,,---------------------*****,],
    9: [,,,,,,,,,,,,,,,,,,,,,,,,,,|,,,,,,,,,,,,,,,,,,,,,,,,,,,],
   10: [,,,,,,_________|,,,,,,,,,,,---------------------------],
   11: [,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],
   12: [,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],
   13: [,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],
   14: [,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],
]
```

## Terminology 

https://funorb.fandom.com/wiki/Orb_Defence

*Monsters -* enemies which target the Orb Bases

*Turrets -* upgradeable weapons which deal damage to enemy monsters

*(Orb) Bases -* the hovering circles which the monsters try to attack 

# Motive 

I want to re-create this game in react. It has been lost to old technology (flash). 
Unfortunately, the website it was once hosted on has been shut down. We can only use video gameplay to re-create.

[video 1](https://www.youtube.com/watch?v=Jlh_QO3F7FQ)

[video 2](https://www.youtube.com/watch?v=w9h1r4rKfsk)


# I didn't know 

Other variations I have not played.

https://funorb.fandom.com/wiki/Orb_Defence/Dominion

https://www.youtube.com/watch?v=YpezSSFQEeg


# Future 
With more advanced games; depending on how this full React build (no GL),
I assume we will need a more powerful way of managing assets than event listeners..
but I don't know this for sure; WebGL would be my guess