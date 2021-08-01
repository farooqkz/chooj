# Matrix client for KaiOS

This is a free(open source) software Matrix client for KaiOS which is going to support VoIP calls. Perhaps voice call is already working, in this case please send a Pull Request to update this README.

Part of this project is done through crowdfunding. About 100 dollars was donated so that I could buy a Nokia 800 Tough and start the project.

Check related BananaHackers blog posts for more information.
### Nightly builds

You can download and sideload ZIP for each time I push stuff from [here](https://farooqkz.de1.hashbang.sh/matrix-client-builds/). Thanks to hashbang which let's me host stuff there. Old ZIPs will be deleted after a short time. Please allow a few minutes after each commit so that the files show up there.

### How to build?

 - Install Node v12.x if you haven't
 - `npm install` in project's directory
 - `INLINE_RUNTIME_CHUNK=false npm build` to build for KaiOS
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
