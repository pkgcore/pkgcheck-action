const os = require('os');
const path = require('path');

const cache = require('@actions/cache');
const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');
const setupPython = require('setup-python/lib/find-python')

async function run() {
  try {
    // JSON webhook payload for event triggering workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)

    const pkgcheck_cache_dir = path.join(os.homedir(), '.cache/pkgcheck')
    const pkgcore_cache_dir = path.join(os.homedir(), '.cache/pkgcore')
    const cache_paths = [
      path.join(os.homedir(), '.cache/pip'),
      pkgcheck_cache_dir,
      pkgcore_cache_dir
    ];
    const key = `pkgcheck-${github.context.runId}`;
    const restoreKeys = ['pkgcheck-'];
    await core.group('Restore cache', async () => {
      const cache_key = await cache.restoreCache(cache_paths, key, restoreKeys);
    });

    // https://github.com/actions/setup-python/issues/38
    await core.group('Set up python', async () => {
      const installed = await setupPython.findPythonVersion('3.x', 'x64');
      core.info(`Successfully set up ${installed.impl}-${installed.version}`);
    });

    await core.group('Install pkgcheck', async () => {
      await exec.exec('pip', ['install', '--upgrade', 'pip']);
      await exec.exec('pip', ['install', 'https://github.com/pkgcore/pkgcore/archive/master.tar.gz']);
      await exec.exec('pip', ['install', 'pkgcheck']);
    });

    await core.group('Sync gentoo repo', async () => {
      await exec.exec('pmaint', ['sync', 'gentoo']);
    });

    const options = {ignoreReturnCode: true}
    await core.group('Update repo metadata', async () => {
      // ignore metadata generation errors that will be reported by pkgcheck
      await exec.exec('pmaint', ['regen', '--dir', path.join(pkgcheck_cache_dir, 'repos'), '.'], options);
    });

    const default_args = ['--color', 'y', 'scan', '--exit'];
    const scan_args = core.getInput('args').split(' ');
    const exit_status = await core.group('Run pkgcheck scan', async () => {
      // handle pkgcheck exit status manually so cache can still be saved on failure
      return await exec.exec('pkgcheck', [...default_args, ...scan_args], options);
    });

    await core.group('Save cache', async () => {
      const cacheId = await cache.saveCache(cache_paths, key);
    });

    if (exit_status) {
      core.setFailed(`pkgcheck failed with exit code ${exit_status}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
