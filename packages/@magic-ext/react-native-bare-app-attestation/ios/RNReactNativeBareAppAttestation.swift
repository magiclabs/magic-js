import Foundation
import React

@objc(RNReactNativeBareAppAttestation)
class RNReactNativeBareAppAttestation: NSObject {
    static func moduleName() -> String! {
        return "RNReactNativeBareAppAttestation"
    }

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc public func attest() {
        NSLog("Hello World")
    }
}
