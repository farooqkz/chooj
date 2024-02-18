# chooj
## Matrix client for KaiOS with VoIP call support


### The repository is has moved to [codeberg](https://codeberg.org/chooj/chooj).
### 🇵🇸  🇺🇦  Invaders could be from the East or the West. The developer of chooj stands with people of Ukraine and Palestine.
### Looking for sponsors! Contact me!

<div style="text-align: center">

[![Chat on Matrix](https://img.shields.io/matrix/chooj:mozilla.org.svg?server_fqdn=mozilla.modular.im)](https://matrix.to/#/#chooj:mozilla.org?via=mozilla.org)
[![CodeFactor](https://www.codefactor.io/repository/github/farooqkz/chooj/badge)](https://www.codefactor.io/repository/github/farooqkz/chooj)
[![DeepScan grade](https://deepscan.io/api/teams/15094/projects/18237/branches/443145/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=15094&pid=18237&bid=443145)
![GitHub repo size](https://img.shields.io/github/repo-size/farooqkz/chooj)
![Licence badge](https://img.shields.io/badge/licence-GPLv3-yellow)
![KaiOS badge](https://img.shields.io/badge/KaiOS-2.5%2B-%236f02b5)

</div>

This is a free(open source) software Matrix client for KaiOS which is going to support VoIP calls. Perhaps voice call is already working, in this case please send a Pull Request to update this README.


### What does work so far?

 - Login process with password works(manually or by scanning a QR code)
 - Chatting works in all rooms. Sending text and voice is supported. You can view incoming text and photos and listen to voice messages.
 - Voice call might work.
 - Very experimental and unreliable push notification support which you can enable it in Settings
 - You can join public rooms or leave joined rooms.
 - The Cow says "Please wait" to you kindly :))

### How to help?

 - Create an issue and report a bug
 - Open a Pull Request and implement some wanted feature or fix some bug
 - Donate to me (see below)
 - Tell others about chooj
 - Idle in chooj's Matrix room and help others when necessary
 - Solve one of the [issues](https://github.com/farooqkz/chooj/issues).
 - ...

### Matrix chatroom for chooj

This project has got a Matrix room. See badges.

### Nightly builds

 - You can download and sideload ZIP for each time I push stuff from [here](https://farooqkz.de1.hashbang.sh/matrix-client-builds/).
 - OmniSD builds are available there, too!
 - Thanks to hashbang which let's me host stuff there.
 - Old ZIPs will be deleted after a some time.
 - Please allow a few minutes(1-2) after each commit and the file will show up there.

*NOTE: While I try to test stuff before pushing but you might find some broken builds there. There is no automated test yet.*

### Device compatiblity

This app should work on all KaiOS versions. However it has been also tested on these devices:

 - Nokia 8110 4G(aka The BananaPhone)
 - Nokia 800 Tough
 - Alcatel Go Flip 3 4052W ([related issue](https://github.com/farooqkz/chooj/issues/37))
 - `[Add your own device here]`

### How to build?

 - Install Node v18.x if you haven't
 - Install yarn if you haven't
 - `yarn install` in the project's directory
 - `yarn devbuild` to create a development build(faster build at the cost of heavier bundle) or `yarn build` for production builds
 - Now you can sideload the application in `build/` to your device.

You can check guides on how to prepare your device for sideloading stuff
and development at the BananaHackers wiki and website linked below:
 - http://bananahackers.net
 - https://wiki.bananahackers.net

### Why Github?

See [this post](https://blog.bananahackers.net/farooqkz/the-development-of-the-matrix-client-has-started) to learn why
I initially chose Github. For future, I might switch to a reliable Gitlab instance(other than gitlab.com)
or even have both Github repository and a Gitlab repo and have them in sync. A Gitlab instance exclusively for chooj is also possible if
someone funds it but very improbable.

### Why InfernoJS?

See [this post](https://blog.bananahackers.net/farooqkz/the-development-of-the-matrix-client-has-started)

### Why Matrix?

*Matrix fans fill stuff here :D*

### Related BananaHackers blog posts

 - https://blog.bananahackers.net/farooqkz/the-development-of-the-matrix-client-has-started
 - https://blog.bananahackers.net/farooqkz/developing-a-call-only-matrix-client-with-crowdfunding-2
 - https://blog.bananahackers.net/farooqkz/developing-a-call-only-matrix-client-with-crowdfunding

### Donations

Donations are very welcome in the form of cryptocurrency(Bitcoin Cash is preferred). These people have donated to help fund the project:

 - wreck
 - A few from BananaHackers community donated a phone

Because depth of pockets of different people varies, I haven't specified how much each donated.

#### Donating money

You can make donations by sending an amount to my Bitcoin Cash address(check total donated [here](https://explorer.bitcoinunlimited.info/address/bitcoincash:qpxy55al8k3mux7j58taxt88jukmqur5ruv6tz7mkc)):

```
bitcoincash:qpxy55al8k3mux7j58taxt88jukmqur5ruv6tz7mkc
```

If you want me to mention your name in the list, please send me the source address before sending donation:

```
fkz atsine riseup dot net
```

You can also send me private key of a Bitcoin Cash wallet.

In the case you don't have crypto already, you can buy Bitcoin Cash from [stealthex.io](https://stealthex.io/?amount=30.4&from=usd&to=bch) and enter 
my address as the recipient address.


#### Donating hardware

You can also donate KaiOS phones or other hardwares. KaiOS phones with one of more of these properties which are debug enabled will help with the development of project:

 - KaiOS 3.x
 - Less than 256MB of RAM/Memory
 - A processor weaker than SD205 which is used in my Nokia phone
 - Selfie/front camera
 - Volume buttons

You can also donate me some other hardware which could be useful for my personal life. But in either case, especially donating KaiOS phone, contact me beforehand.

### License

This project is free software under GNU GPLv3 and comes without any warranty from author(s) of the project.

These files however are under different license(s):
 - `waiting.ogg`: Downloaded from [here](https://freesound.org/people/vollkornbrot/sounds/394328/) under CC0
 - `fetch.js`: From [here](https://github.com/github/fetch/blob/master/fetch.js) with a little bit modification.
 - `server_icon.svg`: From [here](https://thenounproject.com/icon/server-5853379/)
