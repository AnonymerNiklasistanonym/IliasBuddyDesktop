# Get/Download test passed images

## Setup

Install or have installed:

- wget

### Windows

1. Download the binary [windows-binaries](https://eternallybored.org/misc/wget/)
2. Copy the `wget.exe` to a new directory called `wget program`
3. Adding this directory to your Windows PATH
4. Then either enter (when using Windows Powershell) `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")` or simply refresh/restart your current terminal

## Run the download script

```sh
./downloadTestPassed.sh
```

## Clean unnecessary files

```sh
./clean.sh
```

## Sources

- Original source: https://www.reddit.com/r/ProgrammerHumor/comments/a381ur/the_correct_reaction_to_unit_tests_passing/
