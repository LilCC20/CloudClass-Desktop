import React, { FC } from 'react';
import './index.css';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import emptyHistory from './assets/empty-history.png';
import cameraBroken from './assets/camera-broken.png';
import cameraClose from './assets/camera-close.png';
import noBody from './assets/no-body.png';
import noFile from './assets/no-file.png';
import cameraDisabled from './assets/camera-disabled.png';
import noQuestion from './assets/noquestion.svg';
import boardDisconnected from './assets/board-disconnected.png'
import {transI18n} from '~components/i18n'
import { Button } from '~components/button'
import classNames from 'classnames';

type PlaceholderType = 'emptyHistory' | 'cameraBroken' | 'cameraClose' | 'noBody' | 'noFile' | 'cameraDisabled' | 'noQuestion'

const placeholderImgDict = {
  emptyHistory,
  cameraBroken,
  cameraClose,
  noBody,
  noFile,
  cameraDisabled,
  noQuestion,
}

export interface PlaceholderProps extends BaseProps {
  placeholderDesc?: string;
  placeholderType?: PlaceholderType;
  backgroundColor?: string;
}

export const Placeholder: FC<PlaceholderProps> = ({
  placeholderDesc = "",
  placeholderType = "emptyHistory",
  backgroundColor = '#fff',
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`placeholder`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls} {...restProps} style={{backgroundColor}}>
      <div>
        <img src={placeholderImgDict[placeholderType]} alt="no messages" />
      </div>
      {placeholderDesc ? (<div className="placeholder-desc">{placeholderDesc}</div>) : ""}
    </div>
  )
};

export interface CameraPlaceHolderProps extends BaseProps {
  state?: 'loading' | 'broken' | 'muted' | 'disabled',
  children?: React.ReactNode;
}

export const CameraPlaceHolder: React.FC<CameraPlaceHolderProps> = ({
  children,
  state = 'loading',
  className,
}) => {
  const cls = classnames({
    [`camera-placeholder`]: 1,
    [`camera-${state}-placeholder`]: !!state,
    [`${className}`]: !!className,
  });

  return (
    <div className={cls}>
      {children}
    </div>
  )
}

export interface CameraWaveArmPlaceHolderProps extends BaseProps {
  state?: boolean,
  children?: React.ReactNode;
}

export const CameraWaveArmPlaceHolder: React.FC<CameraWaveArmPlaceHolderProps> = ({
  children,
  state = false,
  className,
}) => {
  const cls = classnames({
    ['camera-wave-arm-placeholder']: 1,
    ['camera-wave-arm-ing']: state,
    [`${className}`]: !!className
  });
  return (
    <div className={cls}>
      {children}
    </div>
  )
}

export interface BoardPlaceHolderProps extends BaseProps {
  onReconnectClick: any
}

export const BoardPlaceHolder: React.FC<BoardPlaceHolderProps> = ({
  onReconnectClick,
  className
}) => {
  const cls = classnames({
    [`board-placeholder`]: 1,
    [`${className}`]: !!className,
  });
  return (
    <div className={cls}>
      <img src={boardDisconnected} alt={transI18n('whiteboard.disconnect-img-alt')}/>
      <Button 
        className="reconnect-btn"
        onClick={onReconnectClick}
      >{transI18n('whiteboard.disconnect-btn')}</Button>
    </div>
  )
}