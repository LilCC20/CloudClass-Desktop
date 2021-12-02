import { eduSDKApi } from "../services/edu-sdk-api"
import { homeApi } from "../services/home-api"
import { StorageCourseWareItem } from "../types"
import { debounce, get, throttle } from "lodash"

import { EduRoleTypeEnum, EduStream, EduUser } from "agora-rte-sdk"
import { useCallback, useState } from "react"
import { useCoreContext, useSceneStore, useBoardStore, useSmallClassStore, usePretestStore, useRoomStore, useMediaStore} from "./core"
import { VideoControlContext, ChatContext, /*StreamContext, */PretestContext,ScreenShareContext, RoomContext, RoomDiagnosisContext, GlobalContext, UserListContext, RecordingContext, HandsUpContext, BoardContext, SmallClassVideoControlContext, StreamListContext, CloudDriveContext, VolumeContext, DeviceErrorCallback, ReportContext, StreamContext, ControlTool, ClassRoomStats } from './type'
import { EduUserRoleEnum2EduUserRole } from "../utilities/typecast"
import { useMemo } from "react"
import { useEffect } from "react"

export {
  ControlTool
} from './type'

export type {
 CoreAppContext,
} from './core'

export {
  CoreContext,
  CoreContextProvider
} from './core'

/**
 * 
 * @returns 聊天能力池返回的内容
 */
export const useChatContext = (): ChatContext=> {
  const core = useCoreContext()
  const { roomStore, sceneStore } = core
  return {
    isHost: sceneStore.isHost,
    messageList: roomStore.chatMessageList,
    conversationList: roomStore.chatConversationList,
    unreadMessageCount: roomStore.unreadMessageCount,
    canChatting: sceneStore.canChatting,
    sendMessage: roomStore.sendMessage,
    sendMessageToConversation: roomStore.sendMessageToConversation,
    muteChat: sceneStore.muteChat,
    unmuteChat: sceneStore.unmuteChat,
    muteUserChat: sceneStore.muteUserChat,
    unmuteUserChat: sceneStore.unmuteUserChat,
    addChatMessage: roomStore.addChatMessage,
    addConversationChatMessage: roomStore.addConversationChatMessage,
    getHistoryChatMessage: roomStore.getHistoryChatMessage,
    getConversationList: roomStore.getConversationList,
    getConversationHistoryChatMessage: roomStore.getConversationHistoryChatMessage,
    // REMOVED v1.1.1
    // chatCollapse: uiStore.chatCollapse,
    // toggleChatMinimize: uiStore.toggleChatMinimize,
  }
}

export const useStreamListContext = (): StreamListContext => {

  const sceneStore = useSceneStore()

  const boardStore = useBoardStore()

  const smallClassStore = useSmallClassStore()

  const {
    muteAudio,
    unmuteAudio,
    muteVideo,
    unmuteVideo,
    teacherStream,
    studentStreams,
    streamList,
    cameraEduStream
  } = sceneStore

  const {
    revokeUserPermission,
    grantUserPermission
  } = boardStore

  const {
    studentStreams: onPodiumStudentStreams,
  } = smallClassStore

  return {
    localStream: cameraEduStream,
    streamList,
    teacherStream,
    studentStreams,
    onPodiumStudentStreams,
    muteAudio,
    unmuteAudio,
    muteVideo,
    unmuteVideo,
    revokeUserPermission,
    grantUserPermission,
  }
}

export const useVolumeContext = (): VolumeContext => {
  const mediaStore = useMediaStore()
  const appCoreContext = useCoreContext()

  // const volume = pretestStore

  return {
    microphoneLevel: mediaStore.totalVolume,
    speakers: mediaStore.speakers,
    getFixAudioVolume: (volume: number) => {
      if (appCoreContext.isElectron) {
        return Math.max(0, +(volume / 255).toFixed(2))
      }

      if (volume > 0.01 && volume < 1) {
        const v = Math.min(+volume * 10, 0.8)
        return v
      }
      const v = Math.min(+(volume / 100).toFixed(2), 0.8)
      return v
    }
  }
}

export const usePretestContext = (): PretestContext => {
  const pretestStore = usePretestStore()
  const appStore = useCoreContext()
  // const uiStore = useUIStore()
  const [isMirror, setMirror] = useState<boolean>(false)

  const [cameraError, setCameraError] = useState<boolean>(false)
  const [microphoneError, setMicrophoneError] = useState<boolean>(false)

  const installPretest = (onError: DeviceErrorCallback, remove: boolean = true) => {
    const removeEffect = pretestStore.onDeviceTestError(onError)
    pretestStore.init({ video: true, audio: true })
    pretestStore.openTestCamera()
    pretestStore.openTestMicrophone({ enableRecording: true })
    return () => {
      if (remove) {
        pretestStore.closeTestCamera()
        pretestStore.closeTestMicrophone()
      }
      removeEffect()
    }
  }

  return {
    cameraError,
    microphoneError,
    cameraList: pretestStore.cameraList,
    microphoneList: pretestStore.microphoneList,
    speakerList: pretestStore.speakerList,
    cameraId: pretestStore.cameraId,
    microphoneId: pretestStore.microphoneId,
    speakerId: pretestStore.speakerId,
    microphoneLevel: 0,
    isMirror: isMirror,
    setMirror,
    installPretest,
    startPretestCamera: pretestStore.openTestCamera,
    stopPretestCamera: pretestStore.closeTestCamera,
    startPretestMicrophone: pretestStore.openTestMicrophone,
    stopPretestMicrophone: pretestStore.closeTestMicrophone,
    changeTestCamera: pretestStore.changeTestCamera,
    changeTestMicrophone: pretestStore.changeTestMicrophone,
    changeTestMicrophoneVolume: pretestStore.changeTestMicrophoneVolume,
    changeTestSpeakerVolume: pretestStore.changeTestSpeakerVolume,
    pretestCameraRenderer: pretestStore.cameraRenderer,
    pretestNoticeChannel: appStore.pretestNotice$,
    closeRecordingTest: pretestStore.closeRecordingTest
  }
}

export const useScreenShareContext = (): ScreenShareContext => {
  const {
    customScreenSharePickerItems,
    customScreenSharePickerType,
    screenShareStream,
    screenEduStream,
    startOrStopSharing,
    startNativeScreenShareBy,
    sharing
  } = useSceneStore()

  const {
    isShareScreen,
    canSharingScreen,
  } = useBoardStore()

  return {
    nativeAppWindowItems: customScreenSharePickerItems,
    screenShareStream,
    screenEduStream,
    startOrStopSharing,
    // ADDED v1.1.1
    isScreenSharing: isShareScreen,
    customScreenSharePickerType,
    startNativeScreenShareBy,
    canSharingScreen,
    isSharing: sharing
  }
}

export const useClassRoomStatsContext = (): ClassRoomStats => {
  const {
    liveClassStatus
  } = useRoomStore()

  return {
    liveClassStatus
  }
}

export const useRoomContext = (): RoomContext => {

  const {
    destroyRoom,
  } = useCoreContext()

  const pretestStore = usePretestStore()

  const sceneStore = useSceneStore()

  const installMediaDevice = async (onError: DeviceErrorCallback) => {
    pretestStore.onDeviceTestError(onError)
    await pretestStore.init({ video: true, audio: true })
    pretestStore.openTestCamera()
    pretestStore.openTestMicrophone({ enableRecording: true })
    // return () => {
    //   pretestStore.closeTestCamera()
    //   pretestStore.closeTestMicrophone()
    //   removeEffect()
    // }
  }

  const {
    roomInfo,
    classState,
    sceneType,
    startNativeScreenShareBy,
    removeScreenShareWindow,
    muteVideo,
    unmuteVideo,
    muteAudio,
    unmuteAudio,
    muteUserChat,
    unmuteUserChat,
    joinRoomRTC,
    leaveRoomRTC,
    prepareStream,
    rtcJoined,
  } = useSceneStore()

  const {
    isJoiningRoom,
    kickOutBan,
    kickOutOnce,
    join,
    // liveClassStatus,
    roomProperties,
    updateFlexProperties,
    flexProperties,
    setCarouselState,
    startCarousel,
    stopCarousel
  } = useRoomStore()

  const {
    handsUpStudentList,
    processUserCount,
    teacherAcceptHandsUp,
    teacherRejectHandsUp
  } = useSmallClassStore()

  return {
    sceneType,
    destroyRoom,
    joinRoom: join,
    // REMOVED v1.1.1
    // removeDialog,
    startNativeScreenShareBy,
    teacherAcceptHandsUp,
    teacherRejectHandsUp,
    handsUpStudentList,
    processUserCount,
    muteVideo,
    unmuteVideo,
    muteAudio,
    unmuteAudio,
    roomInfo,
    isCourseStart: !!classState,
    kickOutBan,
    kickOutOnce,
    // liveClassStatus,
    // TO-REVIEW
    // ui context?
    removeScreenShareWindow,
    roomProperties,
    queryCameraDeviceState: (userList: EduUser[], userUuid: string, streamUuid: string) => {
      return sceneStore.queryCameraDeviceState(userList, userUuid, streamUuid)
    },
    queryMicrophoneDeviceState: (userList: EduUser[], userUuid: string, streamUuid: string) => {
      return sceneStore.queryMicDeviceState(userList, userUuid, streamUuid)
    },
    isJoiningRoom,
    updateFlexRoomProperties: updateFlexProperties,
    flexRoomProperties: flexProperties,
    setCarouselState,
    startCarousel,
    stopCarousel,
    joinRoomRTC,
    leaveRoomRTC,
    rtcJoined,
    prepareStream,
    installMediaDevice,
    classState
  }
}

export const useRoomDiagnosisContext = (): RoomDiagnosisContext => {
  const {
    navigationState
  } = useRoomStore()

  return {
    navigationState
  }
}

export const useGlobalContext = (): GlobalContext => {

  const { isFullScreen } = useBoardStore()
  const appStore = useCoreContext()

  const mainPath = useCoreContext().params.mainPath

  const {
    toast$,
    dialog$,
    seq$
  } = useCoreContext();

  const {
    joined,
    isJoiningRoom,
  } = useRoomStore()

  return {
    // REMOVED v1.1.2
    // addDialog,
    // removeDialog,
    // toast$,
    // fireToast,
    // addToast,
    // checked,
    // dialogQueue,
    // removeToast,
    // toastQueue,
    // updateChecked,
    // fireDialog
    mainPath,
    language: appStore.params.language,
    loading: isJoiningRoom,
    isFullScreen,
    params: appStore.params,
    isJoined: joined,
    toastEventObserver: toast$,
    dialogEventObserver: dialog$,
    sequenceEventObserver: seq$
  }
}

export const useBoardContext = (): BoardContext => {
  const {
    currentColor,
    currentStrokeWidth,
    hasPermission,
    currentSelector,
    lineSelector,
    activeMap,
    zoomValue,
    currentPage,
    totalPage,
    ready,
    changeStroke,
    changeHexColor,
    mount,
    unmount,
    setTool,
    zoomBoard,
    setZoomScale,
    changeFooterMenu,
    updatePen,
    setLaserPoint,
    tools,
    activeSceneName,
    boardPenIsActive,
    changeSceneItem,
    room,
    installTools,
    revokeBoardPermission,
    grantBoardPermission,
    showBoardTool,
    isBoardScreenShare,
    setWhiteGlobalState,
    globalState$,
    boardConnectionState,
    joinBoard
  } = useBoardStore()

  const {
    courseWareList,
    downloadList,
    putSceneByResourceUuid,
    startDownload,
    deleteSingle,
    refreshState,
    resourcesList,
    removeMaterialList,
    cancelUpload,
    closeMaterial,
    personalResources,
    handleUpload,
    publicResources,
    isBoardStateInLoading
  } = useBoardStore()

  const {
    startOrStopSharing
  } = useScreenShareContext()

  const mountToDOM = useCallback((dom: HTMLDivElement | null) => {
    if (dom) {
      mount(dom)
    } else {
      unmount()
    }
  }, [mount, unmount])

  return {
    room,
    zoomValue,
    currentPage,
    totalPage,
    currentColor,
    currentStrokeWidth,
    hasPermission,
    currentSelector,
    lineSelector,
    ready,
    tools,
    changeStroke,
    changeHexColor,
    mountToDOM,
    setTool,
    zoomBoard,
    setZoomScale,
    changeFooterMenu,
    changeSceneItem,
    startOrStopSharing,
    updatePen,
    activeMap,
    boardPenIsActive,
    setLaserPoint,
    activeSceneName,
    installTools,
    revokeBoardPermission,
    grantBoardPermission,
    showBoardTool,
    isCurrentScenePathScreenShare:isBoardScreenShare,
    courseWareList,
    downloadList,
    openCloudResource: putSceneByResourceUuid,
    startDownload,
    deleteSingle,
    refreshCloudResources: refreshState,
    resourcesList,
    removeMaterialList,
    cancelUpload,
    closeMaterial,
    personalResources,
    doUpload: handleUpload,
    publicResources,
    setWhiteGlobalState,
    whiteGlobalState: globalState$,
    boardConnectionState,
    joinBoard,
    isBoardStateInLoading
  }
}

export const useCloudDriveContext = (): CloudDriveContext => {
  const {
    downloadList,
    putSceneByResourceUuid,
    startDownload,
    deleteSingle,
    refreshState,
    resourcesList,
    removeMaterialList,
    cancelUpload,
    closeMaterial,
    // personalResources,
    handleUpload,
    publicResources,
    upsertResources,
    allResources,
    fetchPersonalResources,
    tryOpenCloudResource,
    saveBoardStateToCloudDrive
  } = useBoardStore()


  return {
    downloadList: downloadList.filter((it: StorageCourseWareItem) => it.taskUuid),
    openCloudResource: putSceneByResourceUuid,
    startDownload,
    deleteSingle,
    resourcesList,
    refreshCloudResources: refreshState,
    removeMaterialList,
    cancelUpload,
    closeMaterial,
    personalResources: allResources.filter((item: any) => item.access === 'private'),
    publicResources: allResources.filter((item: any) => item.access === 'public'),
    doUpload: handleUpload,
    allResources,
    upsertResources,
    fetchPersonalResources,
    tryOpenCloudResource,
    saveBoardStateToCloudDrive
  }
}

export const useStreamContext = (): StreamContext => {
  const {streamList} = useSceneStore()
  return {
    streamList
  }
}


export const useUserListContext = (): UserListContext => {
  const appStore = useCoreContext()
  const {
    isHost
  } = useSceneStore()

  const {
    acceptedList:acceptedUserList,
    teacherInfo,
    rosterUserList,
    toggleWhiteboardPermission,
    toggleCamera,
    toggleMic,
    kick,
    roleToString,
    teacherAcceptHandsUp
  } = useSmallClassStore()

  const {roomInfo} = appStore
  const {
    sceneType,
    controlTools
  } = useSceneStore()
  // const localUserUuid = appStore.roomInfo.userUuid
  let localUserInfo:EduUser = {
    userUuid: roomInfo.userUuid,
    userName: roomInfo.userName,
    role: EduUserRoleEnum2EduUserRole(roomInfo.userRole, sceneType),
    // TODO need merge with userlist properties
    userProperties: {}
  }

  const userList = appStore.sceneStore.userList

  return {
    localUserUuid: localUserInfo.userUuid,
    myRole: roleToString(roomInfo.userRole),
    teacherName: teacherInfo?.userName || '',
    teacherAcceptHandsUp,
    userList,
    acceptedUserList,
    rosterUserList,
    //v1.1.1
    localUserInfo,
    teacherInfo,
    toggleWhiteboardPermission,
    toggleCamera,
    toggleMic,
    controlTools,
    kick,
    isHost
  }
}

export const useRecordingContext = (): RecordingContext => {

  const {
    isRecording,
    roomUuid
  } = useSceneStore()

  const appStore = useCoreContext()

  async function startRecording() {
    await eduSDKApi.updateRecordingState({
      roomUuid,
      state: 1,
      url: appStore.params.config.recordUrl
    })
  }

  async function stopRecording() {
    await eduSDKApi.updateRecordingState({
      roomUuid,
      state: 0,
    })
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
  }
}

export const useHandsUpContext = (): HandsUpContext => {
  const {
    teacherUuid,
    handsUpState,
    teacherHandsUpState,
    studentHandsUp,
    studentCancelHandsUp,
    handsUpStudentList,
    acceptedUserList: coVideoUsers,
    onlineUserCount,
    processUserCount,
    teacherAcceptHandsUp,
    teacherRejectHandsUp,
    // revokeCoVideo,
    teacherRevokeCoVideo,
    studentExitCoVideo,
    // studentHandsUping,
    // waveArmStudentList,
  } = useSmallClassStore()

  return {
    teacherUuid,
    handsUpState,
    teacherHandsUpState,
    studentHandsUp,
    studentCancelHandsUp,
    handsUpStudentList,
    coVideoUsers,
    onlineUserCount,
    processUserCount,
    teacherAcceptHandsUp,
    teacherRejectHandsUp,
    //v1.1.1
    teacherRevokeCoVideo,
    studentExitCoVideo,
    // studentHandsUping,
    // waveArmStudentList,
  }
}

export const useVideoControlContext = (): VideoControlContext => {

  const sceneStore = useSceneStore()
  const boardStore = useBoardStore()
  const smallClassStore = useSmallClassStore()
  const isHost = sceneStore.isHost

  const {
    teacherStream,
    studentStreams,
    controlTools
  } = sceneStore

  const userRole = sceneStore.roomInfo.userRole

  const onCameraClick = useCallback(async (userUuid: any) => {
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasVideo) {
        await sceneStore.muteVideo(userUuid, isLocal)
      } else {
        await sceneStore.unmuteVideo(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore, sceneStore.streamList, sceneStore.roomInfo.userUuid])

  const onMicClick = useCallback(async (userUuid: any) => {
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasAudio) {
        await sceneStore.muteAudio(userUuid, isLocal)
      } else {
        await sceneStore.unmuteAudio(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore, sceneStore.streamList, sceneStore.roomInfo.userUuid])

  const onSendStar = useCallback(async (uid: any) => {

  }, [userRole, sceneStore])

  const onWhiteboardClick = useCallback(async (userUuid: any) => {
    const targetUser = boardStore.grantUsers.find((uid: string) => uid === userUuid)
    if (isHost) {
      if (targetUser) {
        await boardStore.revokeUserPermission(userUuid)
      } else {
        await boardStore.grantUserPermission(userUuid)
      }
    }
  }, [isHost, boardStore])

  const onOffPodiumClick = useCallback(async (userUuid: any) => {
    if (isHost) {
      await sceneStore.revokeCoVideo(userUuid)
    }
  }, [isHost, sceneStore])

  const acceptedUserList = smallClassStore.acceptedList

  const onOffAllPodiumClick = useCallback(async () => {
    if (isHost && acceptedUserList.length) {
      await sceneStore.revokeAllCoVideo()
    }
  }, [isHost, sceneStore, acceptedUserList])


  return {
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    onOffAllPodiumClick,
    canHoverHideOffAllPodium: !!acceptedUserList.length as any,
    teacherStream,
    firstStudent:studentStreams[0],
    studentStreams,
    sceneVideoConfig:{
      isHost,
      hideBoardGranted: !controlTools.includes(ControlTool.grantBoard),
      hideOffAllPodium: !controlTools.includes(ControlTool.offPodiumAll),
      hideOffPodium: !controlTools.includes(ControlTool.offPodium)
    },
    isHost,
  }
}

export const useSmallClassVideoControlContext = (): SmallClassVideoControlContext => {

  const sceneStore = useSceneStore()
  const boardStore = useBoardStore()
  const smallClassStore = useSmallClassStore()
  const isHost = sceneStore.isHost
  const teacherStream = sceneStore.teacherStream
  const studentStreams = smallClassStore.studentStreams

  // const firstStudent = studentStreams[0]

  // const sceneVideoConfig = sceneStore.sceneVideoConfig

  const {
    controlTools
  } = sceneStore

  const userRole = sceneStore.roomInfo.userRole

  const onCameraClick = useCallback(async (userUuid: any) => {
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasVideo) {
        await sceneStore.muteVideo(userUuid, isLocal)
      } else {
        await sceneStore.unmuteVideo(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore, sceneStore.streamList, sceneStore.roomInfo.userUuid])

  const onMicClick = useCallback(async (userUuid: any) => {
    const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === userUuid)
    if (targetStream) {
      const isLocal = sceneStore.roomInfo.userUuid === userUuid
      if (targetStream.hasAudio) {
        await sceneStore.muteAudio(userUuid, isLocal)
      } else {
        await sceneStore.unmuteAudio(userUuid, isLocal)
      }
    }
  }, [userRole, sceneStore, sceneStore.streamList, sceneStore.roomInfo.userUuid])

  const onSendStar = useCallback(async (uid: any) => {
    await smallClassStore.sendReward(uid)
  }, [userRole, smallClassStore])

  const onWhiteboardClick = useCallback(async (userUuid: any) => {
    const targetUser = boardStore.grantUsers.find((uid: string) => uid === userUuid)
    if (isHost) {
      if (targetUser) {
        await boardStore.revokeUserPermission(userUuid)
      } else {
        await boardStore.grantUserPermission(userUuid)
      }
    }
  }, [isHost, boardStore])

  const onOffPodiumClick = useCallback(async (userUuid: any) => {
    if (isHost) {
      await sceneStore.revokeCoVideo(userUuid)
    }
  }, [isHost, sceneStore])

  return {
    teacherStream,
    studentStreams,
    onCameraClick,
    onMicClick,
    onSendStar,
    onWhiteboardClick,
    onOffPodiumClick,
    firstStudent: studentStreams[0],
    sceneVideoConfig: {
      isHost,
      hideBoardGranted: !controlTools.includes(ControlTool.grantBoard),
      hideOffAllPodium: !controlTools.includes(ControlTool.offPodiumAll),
      hideOffPodium: !controlTools.includes(ControlTool.offPodium)
    },
  }
}

export const useReportContext = (): ReportContext => {
  const core = useCoreContext()
  return {
    //TODO: why?
    eduManger: core.eduManager
  }
}