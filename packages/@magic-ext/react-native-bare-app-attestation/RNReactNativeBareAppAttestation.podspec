require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))


Pod::Spec.new do |s|
  s.name         = "RNReactNativeBareAppAttestation"
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['repository']['url']
  s.platform     = :ios, "9.0"
  s.ios.deployment_target = '13.0'
  s.source = {
    :git => "https://github.com/magiclabs/magic-js.git",
    :tag => "v#{s.version}" 
    :subdirectory => "packages/@magic-ext/react-native-bare-app-attestation"
  }
  s.source_files  = "ios/*.{swift,m}"
  s.requires_arc = true
  s.swift_versions = '5.0'


  s.dependency "React-Core"

end

  