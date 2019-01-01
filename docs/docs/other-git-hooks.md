# Git hooks

Git hooks help you to automate things to have less work by executing custom scripts at certain Git events.

## Create a hook

Git hooks are located in the directory `.git/hooks` of any Git repository.

From the start there are some sample scripts that you can check out.

### Modify the commit message

Create in this directory the file `prepare-commit-msg` with the follwoing content:

```sh
#!/bin/sh

# Get commit info
COMMIT_MSG_FILE=$1

# Create a text that will be pushed to the commit message file
PREPARE_COMMIT_MSG="# Summarize changes in around 50 characters or less

# More detailed explanatory text, if necessary.
# Wrap it to about 72 characters or so.
# A blank line to the summary is necessary to get a paragraph!
#
# More info if needed (again, don't forget one blank line!)
# - Lists/Bullet points are okay, leave a line between each bullet
#   point and one above the list
#
# For issue trackers, put references to them at the bottom, like:
# (don't forget one blank line!)
# Resolves: #123
# See also: #456, #789
#
# More info at: https://chris.beams.io/posts/git-commit/"

# Every line that begin with "#" will be forgotten when committed
echo "$PREPARE_COMMIT_MSG" > $1
```

(If you are on Linux run `chmod +x prepare-commit-msg` to make the file executable)

If you now try to make a commit (`git commit` or `git commit -S`) this will come always up and your input will result in the commit message.

!!! bug
    If you would run `git commit -m "test"` The commit message results in the commented text!
    This needs to be fixed before it can be used without pain!

### (Safety-)Checks before a commit

With the Git hook file `pre-commit` you can make safety checks before the commit is made.
The pre-commit script is executed every time you run `git commit` before Git asks the developer for a commit message or generates a commit object.

This is really useful when you do not to push code that fails a test for example.

The only thing you need to do is exit the script with `exit 0` if all tests resulted in no failures else return `exit 1` and the commit will not be made.

```sh
#!/bin/sh

# Run tests
npm run test

# If no error (test ran successful) exit with 0 and go on with commit process
exit 0
```

!!! hint
    This example is used by the maintainer of this repository to only let commits through that at least pass all tests.

### Update documentation after any commit

You can use the Git hook file `post-commit` to execute a custom script after a commit is made.

A useful example could be to update to documentation:

```sh
#!/bin/sh

# Create documentation
npm run docs

# Move documentation to custom place
rm -r ../IliasBuddyDesktopDocs/*
cp -r ./docs/site/* ../IliasBuddyDesktopDocs/
```

!!! hint
    This example is used by the maintainer of this repository to automatically update the documentation.
