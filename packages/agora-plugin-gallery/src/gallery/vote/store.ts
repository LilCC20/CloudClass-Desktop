import { action, observable, computed } from 'mobx';
import {
  AgoraExtAppContext,
  AgoraExtAppHandle,
  AgoraExtAppUserInfo,
  EduRoleTypeEnum,
  EduRole2RteRole,
} from 'agora-edu-core';
import _ from 'lodash';
import dayjs from 'dayjs';

const formatTime = (endTime: number, startTime: number) => {
  const diff = dayjs(endTime).diff(dayjs(startTime));
  return dayjs.duration(diff).format('HH:mm:ss');
};
const getStudentInfo = (info: any) => {
  if (
    info === null ||
    typeof info === 'undefined' ||
    info === 'deleted' ||
    JSON.stringify(info) === '{}'
  ) {
    return null;
  }
  return info;
};

export const c2h = (count: number) => {
  if (count > 60) {
    return 120;
  } else if (count > 40) {
    return 90;
  }
  return 75;
};

export class PluginStore {
  context!: AgoraExtAppContext;
  handle!: AgoraExtAppHandle;

  @observable
  height?: number = 283;
  @observable
  title?: string = '';
  @observable
  answer?: string[] = ['', ''];
  @observable
  selAnswer?: string[] = [];
  @observable
  currentTime?: string = '';
  @observable
  students?: any[];
  @observable
  status: string = 'config'; //config,answer,info,end
  @observable
  answerInfo?: string[] = [];
  @observable
  buttonName?: string = 'vote.start';
  @observable
  ui?: string[] = ['sels']; //'sels','users','infos','subs'
  @observable
  timehandle?: any = null;
  @observable
  mulChoice?: boolean = false;

  @observable
  rosterUserList?: any[];
  @observable
  userList?: any[];

  private _lag = 0;

  resetContextAndHandle(ctx: AgoraExtAppContext, handle: AgoraExtAppHandle) {
    this.context = ctx;
    this.handle = handle;
    this.onReceivedProps(ctx.properties || {}, null);
  }

  @computed
  get studentList() {
    return this.userList?.filter((u: any) => {
      const role2rteRole = EduRole2RteRole(this.context.roomInfo.roomType, u.role);
      return ['broadcaster', 'audience'].includes(role2rteRole);
    });
  }

  @action
  updateTime = () => {
    if (this.status === 'config') {
      this.currentTime = '';
    } else {
      let properties = this.context.properties;
      if (!this._lag) this._lag = Number(properties.startTime) * 1000 - Date.now();
      this.currentTime = formatTime(
        properties.endTime ? Number(properties.endTime) * 1000 : Date.now() + this._lag,
        Number(properties.startTime) * 1000,
      );
    }

    if (this.status === 'config' || this.status === 'end' || this.context.properties.endTime) {
      this.timehandle && clearInterval(this.timehandle);
      this.timehandle = null;
    } else {
      this.timehandle ||
        (this.timehandle = setInterval(() => {
          this.updateTime();
        }, 1000));
    }
  };

  changeRoomProperties = async ({
    state,
    canChange = false,
    mulChoice,
    startTime,
    endTime,
    title,
    items,
    answer,
    replyTime,
    commonState,
  }: {
    state?: string; //config(老师本地配置),start(开始答题/投票),end(答题/投票结束)
    canChange?: boolean; //是否允许修改(投票为false，答题为true)
    mulChoice?: boolean; //是否多选(答题为true，投票可设置)
    startTime?: string;
    endTime?: string;
    title?: string;
    items?: Array<string>; //可选内容
    answer?: Array<string>; //正确答案(答题用，投票忽略)
    replyTime?: string;
    commonState?: number;
  }) => {
    let roomProperties: any = {};
    if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
      ['start', 'end'].includes(state || '') && (roomProperties['state'] = state);
      canChange && (roomProperties['canChange'] = canChange);
      typeof mulChoice !== 'undefined' && (roomProperties['mulChoice'] = mulChoice);
      startTime && (roomProperties['startTime'] = startTime);
      endTime && (roomProperties['endTime'] = endTime);
      items && (roomProperties['items'] = items);
      title && (roomProperties['title'] = title);
      answer && (roomProperties['answer'] = answer);
      if (state === 'start') {
        roomProperties['students'] = [];
        roomProperties['studentNames'] = [];
        this.studentList?.map((user: any) => {
          if (!/^guest[0-9]{10}2$/.test(user.userUuid || '')) {
            roomProperties['students'].push(user.userUuid);
            roomProperties['studentNames'].push(user.userName);
          }
        });
      } else if (state === 'updateStudent') {
        if (this.studentList) {
          let students: any = this.context.properties['students'] || [];
          roomProperties['students'] = [];
          roomProperties['studentNames'] = [];

          students.map((student: any, index: number) => {
            if (getStudentInfo(this.context.properties['student' + student])) {
              roomProperties['students'].push(student);
              roomProperties['studentNames'].push(this.context.properties['studentNames'][index]);
            }
          });

          this.studentList?.map((user: any) => {
            if (
              !/^guest[0-9]{10}2$/.test(user.userUuid || '') &&
              !roomProperties['students'].includes(user.userUuid)
            ) {
              roomProperties['students'].push(user.userUuid);
              roomProperties['studentNames'].push(user.userName);
            }
          });

          // if (JSON.stringify(students.slice().sort()) !== JSON.stringify(roomProperties['students'].slice().sort())) {
          //     // this.context.userList = this.globalContext.rosterUserList
          //     console.log(roomProperties);

          // }else{
          //     return;
          // }
        } else {
          return;
        }
      } else if (state === 'clear') {
        roomProperties['students'] = [];
        roomProperties['studentNames'] = [];
        roomProperties['state'] = '';
        roomProperties['canChange'] = false;
        roomProperties['mulChoice'] = false;
        roomProperties['startTime'] = '';
        roomProperties['endTime'] = '';
        roomProperties['title'] = '';
        roomProperties['items'] = [];
        roomProperties['answer'] = [];
        this.changeRoomProperties({ state: 'clearStudent' });
      } else if (state === 'clearStudent') {
        let propers: string[] = [];
        let keys = Object.keys(this.context.properties);
        keys.map((ele: string) => {
          [
            'answer',
            'canChange',
            'title',
            'endTime',
            'items',
            'mulChoice',
            'startTime',
            'state',
            'studentNames',
            'students',
          ].includes(ele) || propers.push(ele);
        });
        console.log(
          'clearStudent:',
          this.context.properties.students,
          propers,
          this.context.properties,
        );
        await this.handle.deleteRoomProperties(propers, {});
        return;
      }
      await this.handle.updateRoomProperties(roomProperties, { state: commonState || 0 }, {});
    } else {
      if (this.context.properties.state === 'start') {
        roomProperties['student' + this.context.localUserInfo.userUuid] = {
          startTime: this.context.properties.startTime,
          replyTime,
          answer,
        };
        await this.handle.updateRoomProperties(
          roomProperties,
          { state: commonState || 0 },
          { startTime: this.context.properties.startTime },
        );
      }
    }
  };

  onSubClick = async (clear: boolean = false) => {
    if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
      if (clear) {
        await this.changeRoomProperties({ state: 'clear' });
      } else {
        if (this.status === 'config') {
          let sels: string[] = [];
          this.selAnswer?.map((sel: string) => {
            if (this.answer?.includes(sel)) {
              sels.push(sel);
            }
          });
          //this.changeRoomProperties({ state: 'clearStudent' })//删除属性会引起插件被关闭
          await this.changeRoomProperties({
            state: 'start',
            startTime: Math.floor(Date.now() / 1000).toString(),
            title: this.title,
            items: this.answer,
            mulChoice: this.mulChoice,
            answer: [],
            commonState: 1,
          });
        } else if (this.status === 'info') {
          await this.changeRoomProperties({
            state: 'end',
            endTime: Math.floor(Date.now() / 1000).toString(),
            commonState: 1,
          });
        } else {
          await this.changeRoomProperties({ state: 'clear' });
        }
      }
    } else {
      if (this.status === 'answer') {
        await this.changeRoomProperties({
          replyTime: Math.floor(Date.now() / 1000).toString(),
          answer: this.selAnswer,
          commonState: 1,
        });
      }
    }
  };

  @action
  onReceivedProps(properties: any, cause: any) {
    this.context.properties = properties;
    if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
      if (properties.state === 'start' || properties.state === 'end') {
        this.title = properties.title;
        this.answer = properties.items;
        this.mulChoice = properties.mulChoice;
        this.selAnswer = [];
        this.students = [];
        let selNumber = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        properties.students.map((student: string, index: number) => {
          let answer = getStudentInfo(properties['student' + student]);
          if (answer && answer.answer) {
            answer.answer.map((sel: string) => {
              let idx = properties.items.indexOf(sel);
              idx >= 0 && selNumber[idx]++;
            });
          }
        });

        properties.items.map((item: string, index: number) => {
          this.answerInfo &&
            (this.answerInfo[index] = `(${selNumber[index]}) ${Math.floor(
              (selNumber[index] * 100) / (properties.students.length || 1),
            )}%`);
        });
        this.status = properties.state === 'end' ? 'end' : 'info';
        this.height =
          c2h(properties.title?.length || 0) +
          (this.answer?.length || 0) * 50 -
          10 +
          (properties.state === 'end' ? 0 : 116);
        this.buttonName = properties.state === 'end' ? 'vote.restart' : 'vote.over';
        this.ui = properties.state === 'end' ? ['users', 'infos'] : ['users', 'infos', 'subs'];
      } else {
        this.title = '';
        this.answer = ['', ''];
        this.selAnswer = [];
        this.currentTime = '';
        this.students = [];
        this.status = 'config';
        this.height = 283;
        this.buttonName = 'vote.start';
        this.ui = ['sels', 'subs'];
      }
    } else {
      if (
        properties.state === 'start' &&
        !getStudentInfo(properties['student' + this.context.localUserInfo.userUuid])
      ) {
        this.title = properties.title;
        this.answer = properties.items;
        this.mulChoice = properties.mulChoice;
        this.status = 'answer';
        this.height =
          c2h(properties.title?.length || 0) + (this.answer?.length || 0) * 50 - 10 + 116;
        this.buttonName = !getStudentInfo(
          properties['student' + this.context.localUserInfo.userUuid],
        )
          ? 'vote.submit'
          : 'vote.change';
        this.ui = ['sels', 'subs'];
      } else if (properties.state === 'end' || properties.state === 'start') {
        this.title = properties.title;
        this.answer = properties.items;
        this.mulChoice = properties.mulChoice;
        this.selAnswer =
          getStudentInfo(properties['student' + this.context.localUserInfo.userUuid])?.answer || [];
        this.status = 'info';
        this.height =
          c2h(properties.title?.length || 0) + (this.answer?.length || 0) * 50 - 10 + 20;
        this.ui = ['infos'];

        let selNumber = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        properties.students.map((student: string, index: number) => {
          let answer = getStudentInfo(properties['student' + student]);
          if (answer && answer.answer) {
            answer.answer.map((sel: string) => {
              let idx = properties.items.indexOf(sel);
              idx >= 0 && selNumber[idx]++;
            });
          }
        });

        properties.items.map((item: string, index: number) => {
          this.answerInfo &&
            (this.answerInfo[index] = `(${selNumber[index]}) ${Math.floor(
              (selNumber[index] * 100) / (properties.students.length || 1),
            )}%`);
        });
      } else {
        this.status = 'config';
        this.title = '';
        this.answer = ['', ''];
        this.selAnswer = [];
        this.currentTime = '';
        this.students = [];
        this.height = 270;
        this.buttonName = 'vote.submit';
        this.ui = ['infos'];
      }
    }
  }

  @action
  addAnswer() {
    if (this.answer && this.answer.length < 8) {
      this.answer.push('');
      this.height = 433 - (5 - this.answer.length) * 50;
    }
  }

  @action
  subAnswer() {
    if (this.answer && this.answer.length > 2) {
      this.answer.splice(this.answer.length - 1, 1);
      this.height = 433 - (5 - this.answer.length) * 50;
    }
  }

  @action
  changeAnswer(idx: number, answer: string) {
    if (this.status === 'config') {
      if (this.answer && this.answer.length > idx && idx >= 0) {
        this.answer[idx] = answer;
      }
    }
  }

  @action
  changeSelAnswer(sel: string, mul: boolean = true) {
    if (mul) {
      if (this.selAnswer?.includes(sel)) {
        this.selAnswer.splice(this.selAnswer.indexOf(sel), 1);
      } else {
        this.selAnswer?.push(sel);
      }
    } else {
      this.selAnswer = [sel];
    }
  }

  @action
  updateGlobalContext(state: any) {
    if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
      // this.globalContext = state
      if (this.status !== 'config') {
        this.changeRoomProperties({ state: 'updateStudent', commonState: 1 });
      }
    }
  }

  @action
  updateStudents(userList: AgoraExtAppUserInfo[]) {
    if (_.isEqual(userList, this.userList)) {
      return;
    }

    if (this.context.localUserInfo.roleType === EduRoleTypeEnum.teacher) {
      this.userList = userList;
      if (this.status !== 'config' && this.status !== 'end') {
        this.changeRoomProperties({ state: 'updateStudent', commonState: 1 });
      }
    }
  }
  @action.bound
  setTitle(value: string) {
    this.title = value;
  }

  @action.bound
  setMulChoice(value: boolean) {
    this.mulChoice = value;
  }
}
