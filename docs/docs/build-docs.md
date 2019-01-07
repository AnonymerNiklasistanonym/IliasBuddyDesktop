# Build Docs

## Setup

Run the following commands to make your system fit for the upcoming tasks

### Mkdocs

!!! hint "Python virtual environment"
    You probably want to set this up in an virtual environment: [Check here for further instructions](./other-python-virtualenv.md)

Install all the needed packages in one go:

```sh
pip install -r requirements.txt
```

OR install the needed packages step by step:

```sh
# Install mkdocs
pip install mkdocs -U
# Install the mkdocs material theme
pip install mkdocs-material -U
# Use the markdown extension codehilite for code syntax highlighting
pip install pygments -U
# Use the markdown extension pymdown for many thinks, like task lists
pip install pymdown-extensions -U
```

### TypeDoc and TODO page

```sh
# Install typedoc/TODO page dependencies via a global npm install
# (they are npm dev dependencies)
npm install
```

## Build

```sh
npm run docs
```

Now the directory `docs/mkdocs/site` contains the whole documentation.
