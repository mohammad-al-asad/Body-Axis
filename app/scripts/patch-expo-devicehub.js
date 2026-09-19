const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');
const expoCliDir = path.join(appRoot, 'node_modules/expo/node_modules/@expo/cli/build/src');

function patchFile(filePath, transforms) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping patch for non-existent file: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { search, replace, name } of transforms) {
    if (typeof search === 'string' && content.includes(search)) {
      content = content.replace(search, replace);
      changed = true;
      console.log(`Applied patch: ${name} in ${path.basename(filePath)}`);
    } else if (search instanceof RegExp && search.test(content)) {
      content = content.replace(search, replace);
      changed = true;
      console.log(`Applied patch: ${name} in ${path.basename(filePath)}`);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// 1. SimulatorAppPrerequisite.js: Support DeviceHub.app bundle ID and AppleScript check
const simPrereqPath = path.join(expoCliDir, 'start/doctor/apple/SimulatorAppPrerequisite.js');
patchFile(simPrereqPath, [
  {
    name: 'Add DeviceHub AppleScript fallback',
    search: `    try {\n        return (await (0, _osascript().execAsync)('id of app "Simulator"')).trim();\n    } catch  {\n    }\n    return null;`,
    replace: `    try {\n        return (await (0, _osascript().execAsync)('id of app "Simulator"')).trim();\n    } catch  {\n    }\n    try {\n        return (await (0, _osascript().execAsync)('id of app "DeviceHub"')).trim();\n    } catch  {\n    }\n    return null;`,
  },
  {
    name: 'Add DeviceHub to bundle search and accepted bundle IDs',
    search: `        const simulatorInfoPlist = _path().default.join(developerDir.trim(), 'Applications', 'Simulator.app', 'Contents', 'Info.plist');\n        const { stdout: bundleId } = await (0, _spawnasync().default)('defaults', [\n            'read',\n            simulatorInfoPlist,\n            'CFBundleIdentifier'\n        ]);\n        return bundleId.trim();`,
    replace: `        for (const rel of [\n            ['Applications', 'Simulator.app', 'Contents', 'Info.plist'],\n            ['..', 'Applications', 'DeviceHub.app', 'Contents', 'Info.plist'],\n            ['Applications', 'DeviceHub.app', 'Contents', 'Info.plist'],\n        ]) {\n            try {\n                const simulatorInfoPlist = _path().default.join(developerDir.trim(), ...rel);\n                const { stdout: bundleId } = await (0, _spawnasync().default)('defaults', [\n                    'read',\n                    simulatorInfoPlist,\n                    'CFBundleIdentifier'\n                ]);\n                if (bundleId.trim()) return bundleId.trim();\n            } catch {}\n        }`,
  },
  {
    name: 'Accept com.apple.dt.Devices as valid simulator app id',
    search: `result !== 'com.apple.iphonesimulator' && result !== 'com.apple.CoreSimulator.SimulatorTrampoline'`,
    replace: `result !== 'com.apple.iphonesimulator' && result !== 'com.apple.CoreSimulator.SimulatorTrampoline' && result !== 'com.apple.dt.Devices'`,
  }
]);

// 2. ensureSimulatorAppRunning.js: Check & launch DeviceHub
const ensureSimRunningPath = path.join(expoCliDir, 'start/platforms/ios/ensureSimulatorAppRunning.js');
patchFile(ensureSimRunningPath, [
  {
    name: 'Check if DeviceHub process is running',
    search: `async function isSimulatorAppRunningAsync() {\n    try {\n        // This is much faster than checking every process with ps.\n        return (await _osascript().execAsync('tell app "System Events" to count processes whose name is "Simulator"')).trim() !== '0';\n    } catch  {\n        return false;\n    }\n}`,
    replace: `async function isSimulatorAppRunningAsync() {\n    try {\n        const simCount = (await _osascript().execAsync('tell app "System Events" to count processes whose name is "Simulator"')).trim();\n        if (simCount !== '0') return true;\n    } catch (error) {}\n    try {\n        const hubCount = (await _osascript().execAsync('tell app "System Events" to count processes whose name is "DeviceHub"')).trim();\n        if (hubCount !== '0') return true;\n    } catch (error) {}\n    return false;\n}`,
  },
  {
    name: 'Launch DeviceHub if Simulator does not exist',
    search: `async function openSimulatorAppAsync(device) {\n    const args = [\n        '-a',\n        'Simulator'\n    ];`,
    replace: `async function openSimulatorAppAsync(device) {\n    let appName = 'Simulator';\n    try {\n        await (0, _osascript().execAsync)('id of app "Simulator"');\n    } catch {\n        appName = 'DeviceHub';\n    }\n    const args = [\n        '-a',\n        appName\n    ];`,
  }
]);

// 3. AppleDeviceManager.js: Activate DeviceHub fallback
const appleDevManagerPath = path.join(expoCliDir, 'start/platforms/ios/AppleDeviceManager.js');
patchFile(appleDevManagerPath, [
  {
    name: 'Activate DeviceHub window',
    search: `    async activateWindowAsync() {\n        await (0, _ensureSimulatorAppRunning.ensureSimulatorAppRunningAsync)(this.device);\n        // TODO: Focus the individual window\n        await _osascript().execAsync(\`tell application "Simulator" to activate\`);\n    }`,
    replace: `    async activateWindowAsync() {\n        await (0, _ensureSimulatorAppRunning.ensureSimulatorAppRunningAsync)(this.device);\n        // TODO: Focus the individual window\n        try {\n            await _osascript().execAsync(\`tell application "Simulator" to activate\`);\n        } catch {\n            await _osascript().execAsync(\`tell application "DeviceHub" to activate\`);\n        }\n    }`,
  }
]);

// 4. resolveDevice.js: Prioritize simctl devices over devicectl connected devices
const resolveDevicePath = path.join(expoCliDir, 'run/ios/options/resolveDevice.js');
patchFile(resolveDevicePath, [
  {
    name: 'Prioritize simctl devices over AppleDevice connected devices',
    search: `    const devices = await (0, _promptAppleDevice.sortDefaultDeviceToBeginningAsync)((0, _array.uniqBy)((await Promise.all([\n        _AppleDevice.getConnectedDevicesAsync(),\n        await (0, _profile.profile)(_simctl.getDevicesAsync)()\n    ])).flat(), (item)=>item.udid), osType);`,
    replace: `    const devices = await (0, _promptAppleDevice.sortDefaultDeviceToBeginningAsync)((0, _array.uniqBy)((await Promise.all([\n        await (0, _profile.profile)(_simctl.getDevicesAsync)(),\n        _AppleDevice.getConnectedDevicesAsync()\n    ])).flat(), (item)=>item.udid), osType);`,
  }
]);

// 5. simulatorCodeSigning.js: Do not require physical signing certificates for simulator
const simCodeSigningPath = path.join(expoCliDir, 'run/ios/codeSigning/simulatorCodeSigning.js');
patchFile(simCodeSigningPath, [
  {
    name: 'Bypass simulator code signing requirement',
    search: `function simulatorBuildRequiresCodeSigning(projectRoot) {\n    const entitlements = getEntitlements(projectRoot);\n    if (!entitlements) {\n        return false;\n    }\n    return ENTITLEMENTS_THAT_REQUIRE_CODE_SIGNING.some((entitlement)=>entitlement in entitlements);\n}`,
    replace: `function simulatorBuildRequiresCodeSigning(projectRoot) {\n    return false;\n}`,
  }
]);

console.log('DeviceHub patches checked/applied.');
