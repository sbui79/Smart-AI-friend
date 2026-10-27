const { withPodfile } = require('@expo/config-plugins');

const MARKER = '# withMinimumPodDeploymentTarget';
const MINIMUM_TARGET = '15.1';

/**
 * Raise any pod whose iOS deployment target is below what current Xcode supports.
 * Some pods (e.g. RNSVG's filters subspec) still declare 12.4, which Xcode 27 rejects.
 */
module.exports = function withMinimumPodDeploymentTarget(config) {
  return withPodfile(config, podfileConfig => {
    const { contents } = podfileConfig.modResults;
    if (contents.includes(MARKER)) {
      return podfileConfig;
    }

    const hook = [
      `    ${MARKER}`,
      '    installer.pods_project.targets.each do |target|',
      '      target.build_configurations.each do |build_config|',
      "        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']",
      `        if current && Gem::Version.new(current) < Gem::Version.new('${MINIMUM_TARGET}')`,
      `          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${MINIMUM_TARGET}'`,
      '        end',
      '      end',
      '    end',
    ].join('\n');

    podfileConfig.modResults.contents = contents.replace(
      /post_install do \|installer\|\n/,
      match => `${match}${hook}\n`
    );
    return podfileConfig;
  });
};
