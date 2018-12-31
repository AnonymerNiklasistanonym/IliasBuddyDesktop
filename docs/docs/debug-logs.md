# Logs

!!! hint "Use a special log file reader"
    To easily read logs a log file reader like [**glogg**](https://glogg.bonnefon.org/download.html) is heavily recommended.

## `electron-log`

The used library in this project is [`electron-log`](https://www.npmjs.com/package/electron-log).

By default `electron-log` writes logs to the following locations:

Platform | Path
-------- | ----
Linux    | `~/.config/ilias-buddy-desktop/log.log`
OS X     | `~/Library/Logs/ilias-buddy-desktop/log.log`
Windows  | `%USERPROFILE%/AppData/Roaming/ilias-buddy-desktop/log.log` or `%AppData%/ilias-buddy-desktop/log.log`

You can then search this file for peculiarities.
