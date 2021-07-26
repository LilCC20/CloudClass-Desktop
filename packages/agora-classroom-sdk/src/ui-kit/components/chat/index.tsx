import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Affix, AffixProps } from '~components/affix';
import { Button } from '~components/button';
import { Icon } from '~components/icon';
import { Placeholder } from '~components/placeholder';
import './index.css';
import { Message } from './interface';

export interface ChatProps {
  className?:string
  collapse: boolean;
  onCollapse: (collapse:boolean) => void;
  /**
   * 消息列表
   */
  messages?: Message[];
  /**
   * 是否对学生禁言
   */
  canChatting?: boolean;
  /**
   * 是否主持人
   */
  isHost?: boolean;
  /**
   * 当前用户 uid
   */
  uid: string | number;
  /**
   * 输入框内容的值
   */
  chatText?: string;

  showCloseIcon?: boolean;

  unreadCount?: number;
  /**
   * 刷新聊天消息列表
   */

  onPullFresh: () => Promise<void> | void;
  /**
   *  禁言状态改变的回调
   */
  onCanChattingChange: (canChatting: boolean) => void;
  /**
   * 输入框发生变化的回调
   */
  onText: (content: string) => void;
  /**
   * 点击发送按钮的回调
   */
  onSend: () => void | Promise<void>;
  /**
   * 点击最小化的聊天图标
   */
  onClickMiniChat?: () => void | Promise<void>;
}

export const Chat: FC<ChatProps> = ({
  className,
  messages = [],
  canChatting,
  uid,
  isHost,
  chatText = '',
  showCloseIcon = false,
  unreadCount = 0,
  collapse = false,
  onCanChattingChange,
  onText,
  onSend,
  onCollapse,
  onPullFresh,
  ...resetProps
}) => {

  const handleFocus = () => {
    console.log('>>>>>>handleFocus')
    if(collapse && onCollapse){// 已关闭情况下打开
      onCollapse(false)
    }
  };

  const handleBlur = () => {
    if (!!chatText) {
      return;
    }
    if(!collapse && onCollapse){// 已打开情况下关闭
      onCollapse(true)
    }
  };

  const chatHistoryRef = useRef<HTMLDivElement | null>(null)

  const handleScrollDown = (current: HTMLDivElement) => {
    current.scrollTop = current.scrollHeight;
  }

  const currentHeight = useRef<number>(0)

  const scrollDirection = useRef<string>('bottom')

  const handleScroll = (event: any) => {
    const { target } = event
    if (target?.scrollTop === 0) {
      onPullFresh && onPullFresh()
      currentHeight.current = target.scrollHeight
      scrollDirection.current = 'top'
    }
  }

  const handleKeypress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (event.ctrlKey) {
        event.currentTarget.value += '\n'
      } else if (!event.shiftKey && !event.altKey) {
        // send message if enter is hit
        event.preventDefault()
        await handleSend()
      }
    }
  }

  const handleSend = async () => {
    await onSend()
    scrollDirection.current = 'bottom'
  }

  useEffect(() => {
    if (scrollDirection.current === 'bottom') {
      chatHistoryRef.current && handleScrollDown(chatHistoryRef.current);
    }
    if (scrollDirection.current === 'top' && chatHistoryRef.current) {
      const position = chatHistoryRef?.current.scrollHeight - currentHeight.current
      chatHistoryRef.current.scrollTo(0, position)
    }
  }, [canChatting,messages.length, chatHistoryRef.current, scrollDirection.current]);

  return (
    <div className={`chat-wrap ${className}`}>
      <div className="chat-panel" style={{display: collapse ? 'none':'inherit'}} ref={chatHistoryRef} onScroll={handleScroll}>
      {
        messages.map((msg, idx) => {
          return (
            <div className="chat-message" key={idx}>
              <span>{msg.username}：</span>
              <span>{msg.content}</span>
            </div>
          )
        })
      }
      { !canChatting &&
        <div className="muted-tips">老师已开启禁言</div>
      }
      </div>
      <div className="chat-input">
        <input className={canChatting ? unreadCount > 0 ? 'chat-input-unread':'chat-input-read' :'chat-input-read'} value={chatText} onKeyPress={handleKeypress} disabled={!canChatting}  onBlur={handleBlur} onFocus={handleFocus}  onChange={(e) => onText(e.currentTarget.value)} placeholder={canChatting ? (unreadCount > 0 ? `有${unreadCount}条新的消息`:'输入你想说的话'):'老师已开启禁言'}/>
        { isHost &&
          <button onClick={() => onCanChattingChange(!canChatting)} style={{color: canChatting ? '#2D353A':'#FF854B'}}>{canChatting ? '全体禁言':'取消禁言'}</button>
        }
        <button onClick={_ => onCollapse(!collapse)}>{collapse ? '展开':'收起'}</button>
      </div>
    </div>
  );
};
/**
<Affix
      {...resetProps}
      onCollapse={onCollapse}
      collapse={collapse}
      content={<ChatMin unreadCount={unreadCount}
      />}>
      <div className={["chat-panel", showCloseIcon ? 'full-screen-chat' : ''].join(' ')}>
        <div className="chat-header">
          <span className="chat-header-title">{t('message')}</span>
          <span style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {isHost ? (
              <span
                onClick={() => onCanChattingChange(!!canChatting)}
              >
                <i className={canChatting ? 'can-discussion-svg' : 'no-discussion-svg'}></i>
              </span>
            ) : null}
            {showCloseIcon ? (<span style={{ cursor: 'pointer' }} onClick={() => onCollapse && onCollapse()}>
              <img src={chatMinBtn} />
            </span>) : null}

          </span>
        </div>
        {!canChatting ? (
          <div className="chat-notice">
            <span>
              <Icon type="red-caution" />
              <span>{t('placeholder.enable_chat_muted')}</span>
            </span>
          </div>
        ) : null}
        <div className="chat-history" ref={chatHistoryRef} onScroll={handleScroll}>
          {!messages || messages.length === 0 ? (
            <Placeholder placeholderDesc={t('placeholder.empty_chat')} />
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                {...message}
                isOwn={message.isOwn}
              />
            ))
          )}
        </div>
        <div className={`chat-texting ${!!chatText && focused ? 'focus' : ''}`}>
          <textarea
            value={chatText}
            className="chat-texting-message"
            placeholder={t('placeholder.input_message')}
            disabled={!isHost && !canChatting}
            onChange={(e) => onText(e.currentTarget.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyPress={handleKeypress}
          />
          <Button disabled={!isHost && !canChatting} onClick={handleSend} style={{
            position: 'absolute',
            bottom: 10,
            right: 10
          }}>
            {t('send')}
          </Button>
        </div>
      </div>
    </Affix>
 
 */