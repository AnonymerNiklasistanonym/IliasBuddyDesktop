# Build Docs

## Setup

Run the following commands to make your system fit for the upcoming tasks

```sh
# Install mkdocs
pip install mkdocs
# Install the mkdocs material theme
pip install mkdocs-material

# Use the markdown extension codehilite for code syntax highlighting
pip install pygments
# Use the markdown extension pymdown for many thinks, like task lists
pip install pymdown-extensions
```

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
