const snme2json = require('./snme2json');

const snme = `rtcext:RTCUmbrella {
  ocfServCtx  ocf:OCFContext {
    ro  ocf:RoCore {
      roCCR  ocfro:CreditControlRequest {
        sessionID  "OCSP_530.1.OSaccesspoint7.acme.com;1495766580;072541517"
        originHost  "clientrccpp.host"
        originRealm  "clientrccpp.realm"
        destRealm  "ocsRealm"
        authApplicationId  4
        serviceContextId  "zhengcc.32251@hpe.com"
        ccRequestType  2
        ccRequestNumber  1
        subscriptionId  [
          ocfro:SubscriptionId {
            subscriptionIdType  0
            subscriptionIdData  "8615995766579"
          }
        ]
        multipleServicesIndicator  1
        multipleServicesCreditControl  [
          ocfro:MultipleServicesCreditControl {
            requestedServiceUnit  ocfro:RequestedServiceUnit {
              ccTotalOctets  4000000
            }
            usedServiceUnit  [
              ocfro:UsedServiceUnit {
                reportingReason  3
                ccTotalOctets  3000000
              }
            ]
            serviceIdentifier  []
            ratingGroup  400000
          }
        ]
        proxyInfo  [
        ]
        routeRecord  []
        serviceInformation  ocfro:ServiceInformation {
          psInformation  ocfro:PsInformation {
            sgsnAddress  [-35, -79, 0, 0]
          }
        }
        snapInformation  ocfro:SnapInformation {
          snapSubscriberId  2670
          snapDeviceId  2643
        }
      }
    }
    ocfSession  ocf:SessionWithParamUltd {
      action  "1"
    }
  }
}`;

let json = snme2json(snme);
console.log(json);
let obj = JSON.parse(json);
console.dir(obj);
