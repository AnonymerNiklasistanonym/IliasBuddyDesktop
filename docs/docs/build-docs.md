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

Install the needed packages step by step:

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

### TypeDoc

```sh
# Install typedoc
npm install -g typedoc
```

## Build

```sh
# First go into the docs directory
cd docs

# Then build the mkdocs hierarchy
cd mkdocs
mkdocs build
cd ..

# Then build with typedoc the source code documentation
typedoc --tsconfig ../tsconfig.json

# Then copy this documentation into the mkdocs hierarchy
cp -r typedoc mkdocs/site/typedoc
```

Now the directory `docs/mkdocs/site` contains the whole documentation.
