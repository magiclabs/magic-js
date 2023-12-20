#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(RNAppAttestation, NSObject)
    RCT_EXTERN_METHOD(attest:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end
