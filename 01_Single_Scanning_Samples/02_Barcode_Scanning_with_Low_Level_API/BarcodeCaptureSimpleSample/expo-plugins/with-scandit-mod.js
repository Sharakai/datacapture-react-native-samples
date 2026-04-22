const { withDangerousMod } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');
const path = require('path');
const fs = require('fs');

const DEFINES_MODULE_SNIPPET = `
    installer.pods_project.targets.each do |t|
      if t.name == 'React-RCTAppDelegate'
        t.build_configurations.each { |c| c.build_settings['DEFINES_MODULE'] = 'YES' }
      end
    end
`;

module.exports = function withScanditMod(config) {
    return withDangerousMod(config, [
        'ios',
        (config) => {
            const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
            let podfile = fs.readFileSync(podfilePath, 'utf8');

            const result = mergeContents({
                tag: 'scandit-defines-module',
                src: podfile,
                newSrc: DEFINES_MODULE_SNIPPET,
                anchor: /post_install do \|installer\|/,
                offset: 1,
                comment: '#',
            });

            fs.writeFileSync(podfilePath, result.contents);
            return config;
        },
    ]);
};
