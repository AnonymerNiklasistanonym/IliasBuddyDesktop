# Build App

## Setup

First you need to install all the node modules/dependencies:

```sh
npm install
```

### Setup > Advanced

With executing

```sh
sh setup.sh
```

an extensive setup will be run that builds icons, downloads fonts, etc. from source.

**This is not necessary because all these files are already in the repository.**

## Windows

Build executable files of this program for Windows:

### Windows > Build

```sh
cd scripts
./win_build.sh
```

The created files can be found in the directory `dist`.

### Windows > Install

Either run:

```sh
cd scripts
./win_install.sh
```

Or got to the directory `dist` and double click the created `*.exe` file to open the installer.
