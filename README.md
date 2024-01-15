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

To enable network checks, you can add ``--net`` to ``args``:

```yaml
uses: pkgcore/pkgcheck-action@v1
with:
  args: --net
```

## Action failures

Failures occur when error level results are found that match Gentoo CI
settings. If any occur they will be displayed again separately from the main
pkgcheck output in order to highlight the cause of the failure.

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
      uses: actions/checkout@v4

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
      uses: actions/checkout@v4

    - name: Run pkgcheck
      uses: pkgcore/pkgcheck-action@v1
      with:
        args: --keywords=-RedundantVersion
```
