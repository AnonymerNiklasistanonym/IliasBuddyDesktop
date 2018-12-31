# Contribute

If you want to help and contribute to this project here are some things for you to find what is currently wanted:

## Check any issues on the GitHub page

If you want a feature just make an issue or pull request for this.

- [Issues](https://github.com/AnonymerNiklasistanonym/IliasBuddyDesktop/issues)
- [Pull-Requests](https://github.com/AnonymerNiklasistanonym/IliasBuddyDesktop/pulls)

## Check comment tags

There will be at least two main tags in the code comments:

- **TODO**: With a following explanation what there is to do
- **FIXME**: Means that this should be fixed and is currently an error/bad solution (has an higher priority than the *TODO* tag)

To find them you can either search for them or use an extension like [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) which automatically highlights the tags for you.

To further customize it you can even configure it in the vscode `settings.json` file:

```json
...
"todo-tree.customHighlight": {
    "TODO": {
        "background": "blue",
        "type": "text"
    },
    "FIXME": {
        "background": "red",
        "type": "line"
    }
},
"todo-tree.expanded": true,
"todo-tree.flat": true,
"todo-tree.grouped": true,
"todo-tree.tags": [
    "TODO",
    "FIXME"
],
...
```
