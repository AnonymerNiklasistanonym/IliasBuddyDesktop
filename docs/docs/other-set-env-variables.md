# Set environmental variables

## Powershell (Windows)

### Set variables

#### Temporary

```powershell
$env:TEMPORARY_VAR = "A temporary test variable"
echo $env:TEMPORARY_VAR
```

#### Forever (run terminal with admin rights)

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

## Remove variables

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

### Update variables without restarting the terminal

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
