# Python virtualenv

To not install python packages in the global namespace of you cmputer you can use something called `virtualenv`.

This makes it possible to install packages and use python as if the packages are system wide installed but they are just installed in a local directory. Ready to be used or deleted at any time without destroying other projects that use the same program but different version, etc.

## Set up an virtual environment

```sh
# Install/Upgrade virtualenv on your computer (globally!)
pip install virtualenv -U

# Create a new virtual environment in the current directory
virtualenv env
```

Now a new directory was created (`env`) that contains everything.

!!! hint
    Don't forget to ignore the directory when you work with `git` or something similar, because it contains nothing custom! Just by repeating the setup and `pip install -r requirements.txt` the user creates the same environment as you.

## Activate the virtual environment

To activate the created virtual environment run:

```sh
# Windows:
./env/Scripts/activate
# MacOS/Linux
source env/bin/activate
```

Now the terminal is in the virtual environment

## Installing packages in the virtual environment

You can do anything as before but if the virtual environment was activated the packages will now be installed only in this directory, not globally.

```sh
# Install a package to the activated virtual environment
pip install packageName -U
```

## Save all installed packages for a quick setup

To set up a new virtual environment on another computer you can save all locally installed packages with version in a file:

```sh
pip freeze > requirements.txt
```

To install all the packages on another system run there after setting up the virtual environment and activating it:

```sh
pip install -r requirements.txt
```

## Leave/Deactivate the virtual environment

To leave the virtual environment again just enter

```sh
deactivate
```

## Uninstall packages

To uninstall python packages just run:

```sh
pip uninstall packageName
```
