# Instructions

!!! todo "TODO Memo"
    Add later

## Main screens

### Feed

On this screen all the Ilias entries from the current feed and cached can be found.

You can search them, read them, save them for later.

### Saved

On this screen all the saved Ilias entries can be found.

You can search them, read them.

!!! note
    Coming soon

### Links

On this screen you can save links with a comment and name to easily get to specific pages.

You can search them, read them.

!!! note
    Coming soon

## Popup screens

### Settings

On this screen you can configure custom settings.

### Info

On this screen you can find the dependencies, the version and author.

Also there is a button to check for a newer version.

## Search bars

The search bars in this project are custom written which is why they support the following features:

- You can add keywords to further specify what you want:
    - `bears`
    - `red bears`
    - `cool red bears`
- You can search for short sentences to further specify what you want:
    - `red bears "his name was unbearable funny"`
    - `"bees hate him" cool bears`
- You can even search directly any metadata to further specify what you want:
    - `name:"native title bar"` (on the settings screen)
    - `description:feed title:"cron job"` (on the settings screen)

!!! note
    The search bars are currently implemented to ignore any case.
    This means if you search in any case it will make no difference in the results.

!!! hint
    To find the name of the metadata that describes certain text content in each list element look into the code for `const variable = new SearchManager(...)`.

!!! todo
    When the search bar is not a prototype any more add here a metadata table that lists all available keys for initialized search bars.

## Keyboard shortcuts

### Global keyboard shortcut

By pressing `Ctrl` + `Alt` + `I` the app will if it runs in the background be shown and focused or if it runs in the foreground be hidden.

This shortcut is configurable.

### Focus search bar keyboard shortcut

On pages that contain a search bar you can directly focus the bar by pressing `Ctrl` + `F`.
