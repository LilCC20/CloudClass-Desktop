import { ITrack } from 'agora-rtc-sdk-ng';
import { v4 as uuidv4 } from 'uuid';
import { AgoraElectronRTCWrapper } from "../electron";
import { MediaService } from '../index';
import { AgoraWebRtcWrapper } from "../web";
import { EduLogger } from './../../logger/index';

type SourceType = 'default' | 'screen';

export interface IMediaRenderer {
  context: MediaService;
  _playing: boolean;
  local: boolean;
  sourceType: SourceType;
  uid: any;
  channel: any;
  videoTrack?: ITrack;

  play(dom: HTMLElement, fit?: boolean): void;
  stop(isPreview?: boolean): void;
}

export interface UserRendererInit {
  context: MediaService
  uid: any
  channel: any
  videoTrack?: ITrack
  sourceType: SourceType;
}

export abstract class UserRenderer implements IMediaRenderer {
  context: MediaService
  _playing: boolean = false;
  local: boolean = false;
  sourceType: SourceType = 'screen';
  uid: any = 0;
  channel: any = 0;
  videoTrack?: ITrack;
  uuid: string;

  constructor(config: UserRendererInit) {
    this.context = config.context
    this.uid = config.uid
    if (config.videoTrack) {
      this.videoTrack = config.videoTrack
    }
    this.uuid = uuidv4()
    this.sourceType = config.sourceType
  }

  play(dom: HTMLElement, fit?: boolean): void {
    throw new Error("Method not implemented.");
  }
  stop(): void {
    throw new Error("Method not implemented.");
  }

  get isWeb (): boolean {
    return this.context.sdkWrapper instanceof AgoraWebRtcWrapper
  }

  get isElectron (): boolean {
    return this.context.sdkWrapper instanceof AgoraElectronRTCWrapper
  }

  get web(): AgoraWebRtcWrapper {
    return this.context.sdkWrapper as AgoraWebRtcWrapper
  }

  get electron(): AgoraElectronRTCWrapper {
    return this.context.sdkWrapper as AgoraElectronRTCWrapper
  }
}

export class LocalUserRenderer extends UserRenderer {

  private el: HTMLCanvasElement | undefined;
  private fpsTimer: any;
  private previousFrame: number = 0;
  renderFrameRate: number = 0;
  freezeCount: number = 0;

  constructor(config: UserRendererInit) {
    super(config)
    this.local = true
  }

  play(dom: HTMLElement, fit?: boolean): void {
    // clear flag when re-play
    clearInterval(this.fpsTimer)
    this.renderFrameRate = 0
    this.previousFrame = 0
    this.freezeCount = 0
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.play(dom)
      }
    }
    if (this.isElectron) {
      // @ts-ignore
      if (this.sourceType === 'default') {
        // TODO: cef
        this.electron.client.setupLocalVideo(dom)
        //@ts-ignore
        this.electron.client.setupViewContentMode(+this.uid, 0);
      } else {
        this.electron.client.setupLocalVideoSource(dom)
        //@ts-ignore
        this.electron.client.setupViewContentMode('videosource', 1);
      }
      this.electron.client.setClientRole(1)
      EduLogger.info('Raw Message: setClientRole(1) in LocalUserRenderer')
      this.electron.client.startPreview();
    }
    this._playing = true
  }

  stop(isPreview?: boolean) {
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.stop()
      }
    }
    if (this.isElectron && this.sourceType === 'default') {
      this.electron.client.stopPreview()
      if (this.el) {
        this.el.parentNode?.removeChild(this.el)
        this.el = undefined
      }
      if (isPreview) {
        this.electron.client.setClientRole(2)
      }
    }
    this._playing = false
  }


  getUuid() {
    return this.uuid
  }
}

export class RemoteUserRenderer extends UserRenderer {

  private el: HTMLCanvasElement | undefined

  constructor(config: UserRendererInit) {
    super(config)
    this.local = false
    this.uid = config.uid
    this.channel = config.channel
  }

  play(dom: HTMLElement, fit?: boolean) {
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.play(dom)
        console.log("played remote this.videoTrack trackId: ", this.videoTrack.getTrackId(), " dom ", dom.id, " videoTrack", this.videoTrack)
      }
    }
    if (this.isElectron) {
      this.electron.client.setupRemoteVideo(+this.uid, dom, this.channel)
      if (!fit) {
        //@ts-ignore
        this.electron.client.setupViewContentMode(+this.uid, 0, this.channel);
      } else {
        //@ts-ignore
        this.electron.client.setupViewContentMode(+this.uid, 1, this.channel);
      }
    }
    this._playing = true
  }

  stop() {
    if (this.isWeb) {
      if (this.videoTrack) {
        this.videoTrack.stop()
      }
    }
    if (this.isElectron) {
      this.electron.client.stopAudioRecordingDeviceTest()
      if (this.el) {
        this.el.parentNode?.removeChild(this.el)
        this.el = undefined
      }
      if (this.electron.client.hasOwnProperty('destroyRender')) {
        //@ts-ignore
        this.electron.client.destroyRender(+this.uid, null)
      }
    }
    this._playing = false
  }


  getUuid() {
    return this.uuid
  }
}