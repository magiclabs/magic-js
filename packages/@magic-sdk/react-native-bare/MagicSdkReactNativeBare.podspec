require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "MagicSdkReactNativeBare"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  #{package["description"]}
                  DESC
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.author       = package["author"]
  s.platforms    = { :ios => "13.4" }
  s.source       = { :git => package["repository"]["url"].gsub(/.git$/, ''), :tag => "#{s.version}" }

  # This is a pure JavaScript package
  # Native dependencies (react-native-keychain, @magiclabs/react-native-device-crypto) will be 
  # automatically linked via React Native autolinking when this package is installed
  
  s.dependency "React-Core"
end
