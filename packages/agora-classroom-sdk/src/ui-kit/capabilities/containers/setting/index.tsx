import { Button, Modal, Setting, transI18n } from '~ui-kit'
import { observer } from 'mobx-react'
import { useMediaContext } from 'agora-edu-core'

export const SettingContainer = observer(({id}: any) => {

    const {
        cameraList,
        microphoneList,
        speakerList,
        cameraId,
        speakerId,
        microphoneId,
        changeDevice,
        changeAudioVolume,
        removeDialog
    } = useMediaContext()

    return (
        <Modal
            title={transI18n('pretest.settingTitle')}
            width={360}
            footer={[<Button action="ok">{transI18n('toast.confirm')}</Button>]}
            onCancel={() => {
                // uiStore.removeDialog(id)
                removeDialog(id)
            }}
            onOk={() => {
                // uiStore.removeDialog(id)
                removeDialog(id)
            }}
        >
        <Setting
            cameraList={cameraList}
            microphoneList={microphoneList}
            speakerList={speakerList}
            cameraId={cameraId}
            microphoneId={microphoneId}
            speakerId={speakerId}
            onChangeDevice={changeDevice}
            onChangeAudioVolume={changeAudioVolume}
            hasMicrophoneVolume={false}
            hasSpeakerVolume={false}
        />
        </Modal>
    )
})