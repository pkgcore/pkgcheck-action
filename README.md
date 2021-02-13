# pkgcheck action

This action runs pkgcheck over an ebuild repository.

## Inputs

### `args`

**Optional** arguments to pass to pkgcheck.

By default, pkgcheck is run via:

```
pkgcheck scan --color y scan --exit
```

Custom arguments get appended to the end of the command. For example, using the
following custom args:

```yaml
uses: pkgcore/pkgcheck-action@v1
with:
  args: --keywords=-RedundantVersion
```

Causes pkgcheck to be run as follows:

```
pkgcheck scan --color y scan --exit --keywords=-RedundantVersion
```

## Example workflows

Workflow with no custom arguments:

```yaml
name: pkgcheck

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Run pkgcheck
      uses: pkgcore/pkgcheck-action@v1
```

Workflow with custom pkgcheck arguments:

```yaml
name: pkgcheck

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Run pkgcheck
      uses: pkgcore/pkgcheck-action@v1
      with:
        args: --keywords=-RedundantVersion
```
