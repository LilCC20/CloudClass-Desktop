import { useHomeStore } from '@/infra/hooks';
import { AgoraExtAppCountDown, AgoraExtAppAnswer } from 'agora-plugin-gallery';
import { AgoraHXChatWidget } from 'agora-widget-gallery';
import MD5 from 'js-md5';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AgoraEduSDK, AgoraEduClassroomEvent } from '../../api';
import { transI18n } from '~ui-kit';

export const LaunchPage = observer(() => {
  const homeStore = useHomeStore();

  const history = useHistory();

  const launchOption = homeStore.launchOption || {};

  useEffect(() => {
    if (!launchOption || isEmpty(launchOption)) {
      history.push('/');
      return;
    }
  }, []);

  const mountLaunch = useCallback(async (dom: any) => {
    if (dom) {
      AgoraEduSDK.setParameters(
        JSON.stringify({
          host: homeStore.sdkDomain,
        }),
      );

      AgoraEduSDK.config({
        appId: launchOption.appId ?? `${REACT_APP_AGORA_APP_ID}`,
        region: launchOption.region ?? 'CN',
      });

      launchOption.extApps = [
        new AgoraExtAppCountDown(launchOption.language as any),
        new AgoraExtAppAnswer(launchOption.language as any),
      ];

      launchOption.widgets = { chat: new AgoraHXChatWidget() };

      await AgoraEduSDK.launch(dom, {
        ...launchOption,
        // TODO:  Here you need to pass in the address of the recording page posted by the developer himself
        recordUrl: AGORA_APAAS_BRANCH_PATH
          ? `https://webdemo.agora.io/flexible-classroom/${AGORA_APAAS_BRANCH_PATH}/record_page`
          : `https://webdemo.agora.io/flexible-classroom/record_page`,
        courseWareList: [
          {
            isActive: true,
            resourceName: transI18n('whiteboard.test-courseWare'),
            resourceUuid: `h5${MD5(
              'https://agora-apaas.oss-accelerate.aliyuncs.com/cloud-disk/f488493d1886435f963dfb3d95984fd4/mjwrihugyrew4/06546e948fe67f6bf7b161cf5afa4103',
            )}1`,
            ext: 'pptx',
            url: 'https://agora-apaas.oss-accelerate.aliyuncs.com/cloud-disk/f488493d1886435f963dfb3d95984fd4/mjwrihugyrew4/06546e948fe67f6bf7b161cf5afa4103',
            conversion: {
              type: 'static',
            },
            size: 0,
            updateTime: 1623743516439,
            scenes: [
              {
                name: '1',
                ppt: {
                  src: 'pptx://convertcdn.netless.link/dynamicConvert/3361daf0d28011ebae6f1dc0589306eb/1.slide',
                  width: 1280,
                  height: 720,
                },
              },
              {
                name: '2',
                ppt: {
                  src: 'pptx://convertcdn.netless.link/dynamicConvert/3361daf0d28011ebae6f1dc0589306eb/2.slide',
                  width: 1280,
                  height: 720,
                },
              },
              {
                name: '3',
                ppt: {
                  src: 'pptx://convertcdn.netless.link/dynamicConvert/3361daf0d28011ebae6f1dc0589306eb/3.slide',
                  width: 1280,
                  height: 720,
                },
              },
            ],
            convert: false,
            taskUuid: '3361daf0d28011ebae6f1dc0589306eb',
            taskToken: '',
            taskProgress: {
              totalPageSize: 3,
              convertedPageSize: 3,
              convertedPercentage: 100,
              convertedFileList: [],
              status: 'Finished',
              currentStep: '',
            },
          },
        ],
        listener: (evt: AgoraEduClassroomEvent, type) => {
          console.log('launch#listener ', evt);
          if (evt === AgoraEduClassroomEvent.destroyed) {
            history.push(`/?reason=${type}`);
          }
        },
      });
    }
  }, []);

  return (
    <div
      ref={mountLaunch}
      id="app"
      style={{ width: '100%', height: '100%', background: '#F9F9FC' }}></div>
  );
});