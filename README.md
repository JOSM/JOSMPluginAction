# JOSMPluginAction
This action / reusable workflow does the following:
1. Builds the appropriate JOSM version for your plugin
2. Builds your plugin
3. Runs your plugin tests
4. Adds a built jar to a GitHub release (triggered on the creation of the GitHub
   release, steps 1-3 are run and must pass)

## Usage
Note that currently only `JOSM/JOSMPluginAction/workflows/ant.yml` should
be used externally.

If you use the cron schedule, use
`awk 'BEGIN { srand(); print int(60 * rand()) " " int(24 * rand()) " * * " int(7 * rand()) ;}'`
to generate a random day and time. Also, replace `$default-branch` with the
actual default branch (GitHub actions doesn't currently allow that variable in
the originating workflow).

We recommend using at least two separate jobs. The first should compile your
plugin with the minimum JOSM version, and the second should compile your plugin
with the current JOSM `svn` head. The job targetting the current `svn` revision
should _not_ be called by a `release` trigger. Use the minimum JOSM version for
that.

### Minimal Sample
```yaml
name: Java CI

on:
  push:
    branches:
      - $default-branch
      - $protected-branches
  pull_request:
    branches:
      - $default-branch
  release:
    types: [created]
  schedule:
  - cron: "0 0 * * 0"
  workflow_dispatch:

jobs:
  call-workflow:
    uses: JOSM/JOSMPluginAction/workflows/ant.yml@v1
```

## Inputs (all optional)
### `josm-revision`
The JOSM revision to use, defaults to an empty string (`''`). This uses the
current `svn` revision. If you want a specific revision, use `r<REVISION>`
(e.g. `r18563`). Alternatively, you can use `latest` or `tested`.

### `operating-system`
Use a specific operating system for running the action.
Defaults to `ubuntu-latest`.

### `java-version`
Use a specific java version for running the action. Defaults to `8`.
See [#17858](https://josm.openstreetmap.de/ticket/17858) for when this may change
to something newer.

### `java-distribution`
Use a specific java distribution for running the action. Defaults to `temurin`.

## Environment variables
### `ANT_HOME`
This sets both the `ant` home, but do note that it is used to download the
specified `ant` version. Defaults to `apache-ant-1.10.12`. You should generally
avoid changing this environment variable. Open a pull request first.

# License
GPL-2.0-or-later
