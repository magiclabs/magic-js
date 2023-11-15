// AppAttestation.swift
import Foundation

@objc(AppAttestationModule)
class AppAttestationModule: NSObject {
  @objc
  static func moduleName() -> String! {
    return "AppAttestationModule"
  }

  @objc
  func logHelloWorld() {
    print("************************ Hello World ************************");
  }
  
  // This method is required for React Native to find exported methods
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
