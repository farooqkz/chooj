# Chooj
## Matrix client for KaiOS with VoIP call support

<div style="text-align: center">

![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/farooqkz/chooj/Build/master)
![Chat on Matrix](https://img.shields.io/matrix/chooj:mozilla.org.svg?server_fqdn=mozilla.modular.im)
[![CodeFactor](https://www.codefactor.io/repository/github/farooqkz/chooj/badge)](https://www.codefactor.io/repository/github/farooqkz/chooj)
[![DeepScan grade](https://deepscan.io/api/teams/15094/projects/18237/branches/443145/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=15094&pid=18237&bid=443145)
![Lines of code](https://img.shields.io/tokei/lines/github/farooqkz/chooj)
![GitHub repo size](https://img.shields.io/github/repo-size/farooqkz/chooj)
![GitHub all releases](https://img.shields.io/github/downloads/farooqkz/chooj/total)
![GitHub Repo stars](https://img.shields.io/github/stars/farooqkz/chooj?style=social)
![Licence badge](https://img.shields.io/badge/licence-GPLv3-yellow)
![KaiOS badge](https://img.shields.io/badge/KaiOS-2.5%2B-%236f02b5)

</div>

This is a free(open source) software Matrix client for KaiOS which is going to support VoIP calls. Perhaps voice call is already working, in this case please send a Pull Request to update this README.

Part of this project is done through crowdfunding. About 100 dollars was donated so that I could buy a Nokia 800 Tough and start the project.

Check related BananaHackers blog posts for more information.

### What does work so far?

 - Login process with password works **more or less*.
 - Chat in all room types(group rooms and DMs) works but you will see only a last handful of events.
 - The Cow says "Please wait" to you kindly :))

### How to help?

 - Create an issue and report a bug
 - Open a Pull Request and implement some wanted feature or fix some bug
 - Donate to me with cryptocurrency or hardware(Contact me for any of those)
 - Tell others about Chooj
 - Idle in Chooj's Matrix room and help others if they need help
 - ...

### Matrix room

This project has got a Matrix room. See badges.

### Nightly builds

You can download and sideload ZIP for each time I push stuff from [here](https://farooqkz.de1.hashbang.sh/matrix-client-builds/). Thanks to hashbang which let's me host stuff there. Old ZIPs will be deleted after a short time. Please allow a few minutes after each commit and the file will show up there.

**NOTE: While I try to test stuff before pushing but you might find some broken builds there. There is no automated test yet.**

### Device compatiblity

This app should work on all KaiOS versions. However it has been also tested on these devices:

 - Nokia 8110 4G(aka The BananaPhone)
 - Nokia 800 Tough

### How to build?

 - Install Node v12.x if you haven't
 - `npm install` in project's directory
 - `npm run build` to build for KaiOS(production)
 - or run `npm run devbuild` to create a development build(faster build at the cost of heavier bundle)
 - Now you can sideload the application in `build/` to your device.

You can check guides on how to prepare your device for sideloading stuff
and development at the BananaHackers wiki and website linked below:
 - http://bananahackers.net
 - https://wiki.bananahackers.net

### Why Github?

See [this post](https://blog.bananahackers.net/farooqkz/the-development-of-the-matrix-client-has-started)

### Why InfernoJS?

See [this post](https://blog.bananahackers.net/farooqkz/the-development-of-the-matrix-client-has-started)

### Why Matrix?

*Matrix fans fill stuff here :D*

### Related BananaHackers blog posts

 - https://blog.bananahackers.net/farooqkz/the-development-of-the-matrix-client-has-started
 - https://blog.bananahackers.net/farooqkz/developing-a-call-only-matrix-client-with-crowdfunding-2
 - https://blog.bananahackers.net/farooqkz/developing-a-call-only-matrix-client-with-crowdfunding

### License

This project is free software under GNU GPLv3 and comes without any warranty from author(s) of the project.
