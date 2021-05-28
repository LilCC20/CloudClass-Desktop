import * as React from 'react';
import type {AgoraWidgetHandle, AgoraWidgetContext, IAgoraWidget} from 'agora-edu-core'
import { observer, Provider } from 'mobx-react';
import ReactDOM from 'react-dom';
import { PluginStore } from './store';
import { usePluginStore } from './hooks';
import { get } from 'lodash';

const App = observer(() => {
  const pluginStore = usePluginStore()
  const {localUserInfo, roomInfo} = pluginStore.context
  const chatroomId = get(pluginStore.props, 'chatroomId')

  const [org, apk] = `${REACT_APP_IM_APP_KEY}`.split('#')

  return (
    <div id="netless-white" style={{display:'flex', width: '100%', height: '100%'}}>
      <iframe style={{width:'100%',height:'100%'}} src={`https://webdemo.agora.io/easemob/?chatRoomId=${chatroomId}&roomUuid=${roomInfo.roomUuid}&roleType=${localUserInfo.roleType}&userUuid=${localUserInfo.userUuid}&avatarUrl=https://img2.baidu.com/it/u=1593081528,1330377059&fm=26&fmt=auto&gp=0.jpg&nickName=${localUserInfo.userName}&org=${org}&apk=${apk}`}></iframe>
    </div>
  )
})


export class AgoraIFrameWidget implements IAgoraWidget {
  widgetId = "io.agora.widget.iframe"
  store?:PluginStore

  constructor(){
  }

  widgetDidLoad(dom: Element, ctx: AgoraWidgetContext, props:any): void {
    this.store = new PluginStore(ctx, props)
    ReactDOM.render((
      <Provider store={this.store}>
        <App/>
      </Provider>
    ),
      dom
    );
  }
  widgetRoomPropertiesDidUpdate(properties:any, cause:any): void {
  }
  widgetWillUnload(): void {
  }
}