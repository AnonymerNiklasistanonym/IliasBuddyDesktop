# IliasBuddyDesktop

Your private Ilias RSS feed in one app with notifications when a file gets uploaded or a post posted.

---

**Currently not all features are supported. App is in production.**

---

## Build

Build executable files of this program for specified OSes.

### Build > Windows

```sh
cd scripts
./win_build.sh
```

## Install

Install scripts that build and install this program on specified OSes.

### Install > Windows

```sh
cd scripts
./win_install.sh
```

## Clean

Clean scripts that remove all files that eventually get created by debugging or using this program on specified OSes.

### Clean > Not necessary files for archiving

Remove always created files that are not necessary for archives on every operating system.

```sh
./clean.sh
```

### Clean > Windows

```sh
cd scripts
./win_clean_appData.ps1
```

## Debug

### Debug > Logs

To easily read logs a log file reader like [`glogg`](https://glogg.bonnefon.org/download.html) is heavily recommended.

#### Debug > Logs > `electron-log`

The used library in this project is [`electron-log`](https://www.npmjs.com/package/electron-log).

By default `electron-log` writes logs to the following locations:

Platform | Path
-------- | ----
Linux    | `~/.config/ilias-buddy-desktop/log.log`
OS X     | `~/Library/Logs/ilias-buddy-desktop/log.log`
Windows  | `%USERPROFILE%/AppData/Roaming/ilias-buddy-desktop/log.log` or `%AppData%/ilias-buddy-desktop/log.log`

### Debug > Code

To easily debug the code you can use an IDE like [Visual Studio Code (Insiders)](https://code.visualstudio.com/insiders/).

#### Debug > Code > Visual Studio

1. Select at the left side the Debug Icon (Ctrl + Shift + D)
2. At the top of the window at the side should now be an entry called *Debug IliasBuddy Desktop*
3. Select this and click run (Click F5)
4. You can now also set breakpoints like in any other debugger and debug code without 1000 `console.log` commands

## Docs

### Docs > MkDocs

To maintain an informative, good looking, easy to edit and easy to serve documentation this repository uses [MkDocs](https://www.mkdocs.org/) in connection with the third party theme [Material](https://squidfunk.github.io/mkdocs-material/).

#### Docs > MkDocs > Setup

1. Install MkDocs via Python: `python -m pip install mkdocs`
2. Install Material theme for MkDocs via Python: `pip install mkdocs-material`
3. Create project directory: `mkdocs new docs`
4. Follow the [instructions](https://www.mkdocs.org/#getting-started)

#### Docs > MkDocs > Serve

Serve the documentation with: `mkdocs serve`

#### Docs > MkDocs > Build

Build all files with: `mkdocs build`

### Docs > TypeDoc

To maintain an informative, good looking and easy to serve documentation of the source code this repository uses [TypeDoc](https://typedoc.org/).

#### Docs > TypeDoc > Build

To get the source code documentation as a website hierarchy use the command: `typedoc --options docs/.typedoc.json --ignoreCompilerErrors ./`

---

TODO - Create `.typedoc.json` file that not only contains all types but also the `.js` modules

---

## Other

### What is this source code

#### `cloc`

1. Install it via `npm install cloc` or via [GitHub releases](https://github.com/AlDanial/cloc/releases)
2. Run `cloc --vcs=git` to see all the files and lines of code that are tracked via this `git` repository
3. Or check especially for a programming language with `cloc --vcs=git --include-lang=JavaScript` (For other languages replace *JavaScript* or if you want to view more than one add them with a comma like `cloc --vcs=git --include-lang=JavaScript,TypeScript`)

(*Example preview from 20.12.2018*)

```sh
$ cloc --vcs=git

-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
JavaScript                      16            147            564           1297
CSS                              6             67             52            357
JSON                             2              0              0            286
TypeScript                      10             21              0            279
HTML                             1              4              5             78
Handlebars                      14              4              0             71
Bourne Shell                     8             17             14             53
Markdown                         3             27              0             48
-------------------------------------------------------------------------------
SUM:                            60            287            635           2469
-------------------------------------------------------------------------------
```

#### Get the most used lines

If you want to see what the most used constructs/calls are use the following command:

(*Example preview from 20.12.2018*)

```sh
$ find -iname '*.js' -not -path "./node_modules/*" -not -path "./dist/*" | xargs cat | sort | uniq -c | sort -nr | head -n 5

146
 80   }
 56   /**
 56    */
 41     }
```

Because the first some lines are always not that necessary (Whitespaces, parentheses, brackets, ...) just play around and probably add a tail to start off from the nth line:

(*Example preview from 20.12.2018*)

```sh
$ find -iname '*.js' -not -path "./node_modules/*" -not -path "./dist/*" | xargs cat | sort | uniq -c | sort -nr | head -n 21 |tail -n +14

     10 const path = require('path')
     10    * @returns {string}
      8      */
      7       })
      7       break
      7         })
      6 })
      6 const fs = require('fs')
```

### Set environmental variables

#### Powershell (Windows)

##### Set variables

###### Temporary

```powershell
$env:TEMPORARY_VAR = "A temporary test variable"
echo $env:TEMPORARY_VAR
```

###### Forever (run terminal with admin rights)

```powershell
# Set environmental variables
[Environment]::SetEnvironmentVariable("FOREVER_VAR_MACHINE", "A machine test variable", "Machine")
[Environment]::SetEnvironmentVariable("FOREVER_VAR_USER", "A user test variable", "User")
# Update them in the current terminal
$env:FOREVER_VAR_MACHINE = [System.Environment]::GetEnvironmentVariable("FOREVER_VAR_MACHINE","Machine")
$env:FOREVER_VAR_USER = [System.Environment]::GetEnvironmentVariable("FOREVER_VAR_USER","User")
# Echo them to the console
echo $env:FOREVER_VAR_MACHINE
echo $env:FOREVER_VAR_USER
```

#### Remove variables

```powershell
# Set environmental variables
[Environment]::SetEnvironmentVariable("TEST_VAR_MACHINE", "A machine test variable", "Machine")
# Update it in the current terminal
$env:TEST_VAR_MACHINE = [System.Environment]::GetEnvironmentVariable("TEST_VAR_MACHINE","Machine")
# Echo them to the console
echo $env:TEST_VAR_MACHINE

# Remove variable
[Environment]::SetEnvironmentVariable("TEST_VAR_MACHINE", $null, "Machine")
# Update it in the current terminal
$env:TEST_VAR_MACHINE = [System.Environment]::GetEnvironmentVariable("TEST_VAR_MACHINE","Machine")
# Echo them to the console (Should be empty because the variable doesn't exist any more)
echo $env:TEST_VAR_MACHINE
```

##### Update variables without restarting the terminal

Update path variable:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

Update another variable you set in machine variables named `MACHINE_VARIABLE`:

```powershell
$env:MACHINE_VARIABLE = [System.Environment]::GetEnvironmentVariable("MACHINE_VARIABLE","Machine")
```

Update another variable you set in user variables named `USER_VARIABLE`:

```powershell
$env:USER_VARIABLE = [System.Environment]::GetEnvironmentVariable("USER_VARIABLE","User")
```
