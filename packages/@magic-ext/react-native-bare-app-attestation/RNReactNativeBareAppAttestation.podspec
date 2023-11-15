
Pod::Spec.new do |s|
  s.name         = "RNReactNativeBareAppAttestation"
  s.version      = "1.0.0"
  s.summary      = "RNReactNativeBareAppAttestation"
  s.description  = <<-DESC
                  RNReactNativeBareAppAttestation
                   DESC
  s.homepage     = "https://magic.link"
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/magiclabs/magic-js.git", :tag => "master" }
  s.source_files  = "RNReactNativeBareAppAttestation/**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

  