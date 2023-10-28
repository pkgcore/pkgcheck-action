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
    const payload = JSON.stringify(github.context.payload, undefined, 2);

    const pkgcheck_cache_dir = path.join(os.homedir(), '.cache', 'pkgcheck');
    const pkgcore_cache_dir = path.join(os.homedir(), '.cache', 'pkgcore');
    const cache_paths = [
      path.join(os.homedir(), '.cache', 'pip'),
      pkgcheck_cache_dir,
      pkgcore_cache_dir
    ];
    // use cache key unique to each run to force cache saves
    const timestamp = Date.now();
    const key = `pkgcheck-${github.context.runId}-${timestamp}`;
    const restoreKeys = [`pkgcheck-${github.context.runId}-`, 'pkgcheck-'];
    await core.group('Restore cache', async () => {
      const cache_key = await cache.restoreCache(cache_paths, key, restoreKeys);
    });

    // use vendored setup-python action
    // https://github.com/actions/setup-python/issues/38
    await core.group('Set up python', async () => {
      // XXX: 3.11 is a temporary hack for https://github.com/pkgcore/pkgcheck-action/issues/13
      const installed = await setupPython.findPythonVersion('3.11', 'x64');
      core.info(`Successfully set up ${installed.impl}-${installed.version}`);
    });

    await core.group('Install pkgcheck', async () => {
      await exec.exec('pip', ['install', '--upgrade', 'pip']);
      const pkgs = core.getInput('pkgs').split(' ');
      await exec.exec('pip', ['install', ...pkgs]);
    });

    await core.group('Sync gentoo repo', async () => {
      await exec.exec('pmaint', ['sync', 'gentoo']);
    });

    const options = {ignoreReturnCode: true};
    await core.group('Update repo metadata', async () => {
      // ignore metadata generation errors that will be reported by pkgcheck
      await exec.exec('pmaint', ['regen', '--dir', path.join(pkgcheck_cache_dir, 'repos'), '.'], options);
    });

    const failures = path.join(os.homedir(), 'failures.json');
    const default_args = ['--color', 'y', 'ci', '--failures', failures, '--exit', 'GentooCI'];
    const scan_args = core.getInput('args').split(' ');
    const exit_status = await core.group('Run pkgcheck', async () => {
      // handle pkgcheck exit status manually so cache can still be saved on failure
      return await exec.exec('pkgcheck', [...default_args, ...scan_args], options);
    });

    await core.group('Save cache', async () => {
      const cacheId = await cache.saveCache(cache_paths, key);
    });

    if (exit_status) {
      core.info('\n\u001b[1m\u001b[38;2;255;0;0mFAILURE RESULTS')
      await exec.exec('pkgcheck', ['replay', '--color', 'y', failures]);
      core.setFailed(`pkgcheck failed with exit code ${exit_status}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
