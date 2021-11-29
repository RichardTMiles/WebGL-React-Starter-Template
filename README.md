# Special Thanks
* [Robert Renka](https://computerscience.engineering.unt.edu/people/faculty/robert-renka)
* 

# Overview
* Compiling an open source react sample to illustrate and teach FUNDAMENTAL graphics and game programming. 
* Samples should be self-contained 
* Libraries maybe used; however a focus on Matrix (Cartesian or Polar Graph Based) ops is priority.
  * For n00ds this just means we use [ x, y, z ] -> and other matricies (arrays).
  * For bigger n00bs generally arrays are used to denote everything (element/models/people/cubes/spears/rain/trains/plains/you name it)
  * Much like the text your reading now is stored fundamentally as 1's and 0's (binary); Generally, all graphics are made up of only points, lines, and triangles.
  * If you have found the last two bullets inciteful, please read as well as these
    * This is dense with information [computer-graphics](https://github.com/RichardTMiles/Books/blob/master/computer-graphics/Fundamentals%20of%20Computer%20Graphics%203rd%20ed.%20-%20P.%20Shirley%2C%20S.%20Marschner%20(CRC%2C%202009)%20WW.pdf) jumping to why is page ~134. 
    * Though the foundations you will need start on page one. The author Matsuda, K. and Lea, R.  seems to appear in my texts and codes involving WebGL using the foundations we will take to practice. Thanks to those who pave roads before us.
    * Another book [which has heavy focus on math](https://github.com/RichardTMiles/Books/blob/master/computer-graphics/fundamentalsOfGraphics.pdf) which might be more preferred for those not well versed in Mathematics.
* Generally these [examples follow this resource](https://sites.google.com/site/webglbook/home/chapter-1)
  * if you are using this as a learning tool please open this link to see a general guideline to moving through the files. 
  * This repository aims to improve these samples in react + more real world applications.

## This game template is designed to run fully on the client's browser. 
* Axios is pre-configured to support server side apps. 
* Be sure you have the latest version of [node](https://nodejs.org/en/) installed. 
* `brew` and `choco`  can be used to install node on [mac](https://brew.sh/) and [windows](https://chocolatey.org/install) respectively
* Legacy systems which do not support the new ssl standard may use `npm run start:legacy`. Please do not use this unless necessary.

# Installation and First Run
Clone this repository!

    git clone https://github.com/Drop-In-Gaming/WebGL-React-Starter-Template.git ~/WebGL-React-Starter-Template
    

Change directory into the root of this repository.
    
    cd ~/WebGL-React-Starter-Template

Install the 3rd party packages using npm (node).

    npm install 

Run the samples! This will automatically open your browser to [http://127.0.0.1:3000/](http://127.0.0.1:3000/) 

    npm run start

# Resources 
* [https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)](https://www.khronos.org/opengl/wiki/Data_Type_(GLSL))
* [https://www.opengl.org//archives/resources/code/samples/redbook/](https://www.opengl.org//archives/resources/code/samples/redbook/)
* [are functions in javascript tail call optimized?](https://stackoverflow.com/questions/37224520/are-functions-in-javascript-tail-call-optimized)

# Deployment

https://create-react-app.dev/docs/deployment/#github-pages-https-pagesgithubcom
https://github.com/gitname/react-gh-pages

# Orb Defence (future project in this starter template repo)

General concept is to store the whole games as a grid of boxes; an array 

Based on the video the lanes total  [36][x] where x is easily over 100, but
I have not counted. The top and bottom of the actual game reserved for 
making the border; so the ~ playable game is really only 34 in length. 


## WebGL Tower Defence

[sample one](http://www.webtowerdefense.com/)

### Other Cool Demos not ported

[quantom computing](https://algassert.com/quirk#)

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




#General notes about graph 
https://sites.google.com/site/webglbook/home/chapter-3
https://sites.google.com/site/csc8820/educational/read-webgl-programs
https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
https://staff.fnwi.uva.nl/r.vandenboomgaard/IPCV20172018/LectureNotes/MATH/homogenous.html
