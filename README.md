# pkgcheck action

This action runs pkgcheck over an ebuild repository.

## Inputs

### `args` (optional)

Custom arguments to pass to pkgcheck.

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

### `pkgs` (optional)

Target pkgcheck package to install via pip. Multiple packages can also be
specified as a space-separated list if required.

By default, the latest pkgcheck release on pypi is installed. This option makes
pip install a custom set of packages.

Use of this option targets those who want to pin to a specific release for
whatever reason (e.g. bugs in newer versions) via a workflow similar to:

```yaml
uses: pkgcore/pkgcheck-action@v1
with:
  pkgs: pkgcheck==0.9.0
```

or those that want to live on the edge running pkgcheck from git:

```yaml
uses: pkgcore/pkgcheck-action@v1
with:
  pkgs: https://github.com/pkgcore/pkgcheck/archive/master.tar.gz
```

## Action failures

By default, failures occur when any error level results are found. If any occur
they will be displayed again separately from the main pkgcheck output in order
to highlight the cause of the failure.

While it is best to use the default failure settings, they can be changed using
custom arguments to the ``--exit`` option. For example, the following config
setting forces only NonsolvableDeps results to return failures:

```yaml
uses: pkgcore/pkgcheck-action@v1
with:
  args: NonsolvableDeps
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
