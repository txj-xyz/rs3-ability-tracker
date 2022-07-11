<p align="center">
  <a href="https://github.com/txj-xyz/rs3-ability-tracker">
    <img src="https://cdn.discordapp.com/attachments/706221433407275029/985653200331870228/image0.png" alt="Logo" width="100" height="100">
  </a>

  <h3 align="center">RS3 Ability Tracker</h3>

 <h1 align="center">Follow progress on the <a href="https://github.com/txj-xyz/rs3-ability-tracker/projects/1">Projects Page</a></h1>
 
  <p align="center">
  
  This Ability tracker is based off <a href="https://www.electronjs.org/">Electron</a> and is supported via keyevents from the Node Addon API <a href="https://github.com/SnosMe/uiohook-napi">uiohook-napi</a>, the Electron backend passes matched keys to an HTML frontend window called "Ability Window" and displays the matched keys, this project is my first Electron idea that has some use for the <a href="https://runescape.com/">Runescape</a> community, It's a good learning experience and I've had a lot of fun using it.
  </p>
</p>

[![Hits](https://hits.sh/github.com/txj-xyz/rs3-ability-tracker.svg)](https://hits.sh/github.com/txj-xyz/rs3-ability-tracker/)

## Downloading / Installation
 - You can read the [Wiki Page for instructions on how to use / install the program](https://github.com/txj-xyz/rs3-ability-tracker/issues)
 - If you need help, head over to the Discord support server: https://discord.gg/HRqNJeQfz7

## Building from Source

- You can build the project by reading the `package.json` file to get an idea of what needs to be done
 
 Install:
 ```
 npm i
 ```
 
 Start:
 ```
 npm electron-forge start
 ```
 
Releases will be built and posted under the [Releases Page](https://github.com/txj-xyz/rs3-ability-tracker/releases/latest) using GitHub Actions.

We use [Electron Forge](https://www.electronforge.io/) for building into Installers and Zip files with a pre-compiled `asar` given to compress the data for maximum deployability, you can disable this inside of the `packagerConfig: {}` object inside of `package.json`

# Support Server

https://discord.gg/HRqNJeQfz7

# Screenshots

![](https://l.txj-dev.xyz/MPz2F)
![](https://l.txj-dev.xyz/PTE1i)
