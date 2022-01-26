import type { AgoraNetworkQuality } from 'agora-electron-sdk/types/Api/native_type';
import { QualityCalc } from '../networkutils';
import { NetworkStats } from '../interfaces';
export class RtcNetworkQualityElectron {
  downlinkNetworkQuality: AgoraNetworkQuality = 0;
  uplinkNetworkQuality: AgoraNetworkQuality = 0;
  txVideoPacketLoss: number = 0;
  rxVideoPacketLoss: number = 0;
  private _downlinkNetworkQualityClacInstance = new QualityCalc();
  private _uplinkNetworkQualityClacInstance = new QualityCalc();

  networkStats(): NetworkStats {
    return {
      rxPacketLossRate: this.rxVideoPacketLoss,
      txPacketLossRate:this.txVideoPacketLoss,
      downlinkNetworkQuality: this._downlinkNetworkQualityClacInstance.toAGQuality(
        this.downlinkNetworkQuality,
      ),
      uplinkNetworkQuality: this._uplinkNetworkQualityClacInstance.toAGQuality(
        this.downlinkNetworkQuality,
      ),
    };
  }
}
