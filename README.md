# pkgcheck action

This action runs pkgcheck over an ebuild repository.

## Inputs

### `args` (optional) -- custom arguments for pkgcheck

Custom arguments can be any arguments used with ``pkgcheck scan`` when running
pkgcheck directly on the command line. For example, to ignore RedundantVersion
results use the following setting:

```yaml
uses: pkgcore/pkgcheck-action@v1
with:
  args: --keywords=-RedundantVersion
```

### `pkgs` (optional) -- target package to install

By default, the latest pkgcheck release is installed. This option allows
installing a custom set of packages. Multiple packages can be specified as a
space-separated list if required.

Use of this option targets those who want to pin to a specific release for
whatever reason (e.g. bugs in newer versions) via:

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
