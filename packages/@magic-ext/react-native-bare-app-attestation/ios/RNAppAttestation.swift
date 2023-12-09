// RNAppAttestation.swift

import Foundation
import React
import DeviceCheck
import CryptoKit
import Combine

@objc(RNAppAttestation)
class RNAppAttestation: NSObject {

    var cancellables: Set<AnyCancellable> = []

    @objc static func moduleName() -> String! {
        return "RNAppAttestation"
    }

    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc func methodQueue() -> DispatchQueue {
        return DispatchQueue.main
    }

    @objc func attest(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        RNAppAttestation.checkAppAttestation()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        let errorDescription = (error as NSError).localizedDescription
                        reject("RnAppAttestationError", errorDescription, error)
                    }
                },
                receiveValue: { attestationCheckPassed in
                    resolve(attestationCheckPassed)
                }
            )
            .store(in: &cancellables)
    }

    static func checkAppAttestation() -> AnyPublisher<Bool, Error> {
        guard #available(iOS 14.0, *) else {
            return Fail(error: NSError(domain: "RnAppAttestationError", code: 1001, userInfo: [NSLocalizedDescriptionKey: "Magic React Native Bare App Attestation Extension requires iOS 14 and above with App Attestation enabled"]))
                .eraseToAnyPublisher()
        }
        
        let attestationService = DCAppAttestService.shared
        
        guard attestationService.isSupported else {
            return Fail(error: NSError(domain: "RnAppAttestationError", code: 1002, userInfo: [NSLocalizedDescriptionKey: "App Attestation is unavailable for this device"]))
                .eraseToAnyPublisher()
        }
        
        return Future<String, Error> { promise in
            attestationService.generateKey { keyId, error in
                if let keyId = keyId {
                    promise(.success(keyId))
                } else {
                    promise(.failure(error ?? NSError(domain: "RnAppAttestationError", code: 1003, userInfo: nil)))
                }
            }
        }
        .flatMap { keyId in
            return fetchChallengeFromServer()
                .map { challenge in (keyId, challenge) }
        }
        .flatMap { keyId, challenge in
            return Future<(Data, Data, String), Error> { promise in
                attestationService.attestKey(keyId, clientDataHash: Data(SHA256.hash(data: challenge))) { assertion, error in
                    if let assertion = assertion {
                        promise(.success((assertion, challenge, keyId)))
                    } else {
                        promise(.failure(error ?? NSError(domain: "RnAppAttestationError", code: 1005, userInfo: nil)))
                    }
                }
            }
        }
        .map { assertion, challenge, keyId in
            /**
             * TODO: When Formatic Backend portion is complete, this is where we'll be sending the attestation object and a awaiting a response confirming reciept
             */
            print("THE ASSESTION IS: \(assertion)")
            print("THE CHALLENGE IS: \(challenge)")
            print("THE KEYID IS: \(keyId)")
            
            return true
        }
        .eraseToAnyPublisher()
    }

    private static func fetchChallengeFromServer() -> Future<Data, Error> {
        return Future<Data, Error> { promise in
            /**
             * TODO: Update the URL to hit the Fortmatic Backend Endpoint directly for the challenge
             */
            guard let url = URL(string: "https://challenge-server-ngrok-app.ngrok.io/challenge") else {
                promise(.failure(NSError(domain: "RnAppAttestationError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])))
                return
            }

            let task = URLSession.shared.dataTask(with: url) { (data, response, error) in
                if let httpStatus = response as? HTTPURLResponse, httpStatus.statusCode != 200 {
                    promise(.failure(NSError(domain: "RnAppAttestationError", code: httpStatus.statusCode, userInfo: [NSLocalizedDescriptionKey: "Server returned an error"])))
                } else if let data = data {
                    promise(.success(data))
                } else {
                    promise(.failure(error ?? NSError(domain: "RnAppAttestationError", code: -1, userInfo: [NSLocalizedDescriptionKey: "Network error"])))
                }
            }
            task.resume()
        }
    }
}
  