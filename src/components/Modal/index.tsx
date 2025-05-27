import {
  Modal,
  ModalAlertProps,
  ModalConfirmProps,
  ModalProps,
  ModalShowProps
} from 'antd-mobile';
import { Action } from 'antd-mobile/es/components/modal';
import classNames from 'classnames';
import { PropsWithChildren, useEffect, useState } from 'react';
import styles from './index.module.less';

export interface JXModalProps extends ModalProps {
  className: string;
  okText: string;
  cancleText: string;
  onOk: () => void;
  onCancel: () => void;
  disableOk: boolean;
  disableCancle: boolean;
}

function JXModal({
  children,
  className,
  actions,
  okText = '确认',
  cancleText = '取消',
  disableOk = false,
  disableCancle = false,
  onOk = () => {},
  onCancel = () => {},
  ...props
}: PropsWithChildren<Partial<JXModalProps>>) {
  const [action, setAction] = useState<Action[]>([]);
  useEffect(() => {
    if (!disableOk) {
      setAction((v) => [
        ...v.filter((a) => a.key !== 'confirm'),
        {
          key: 'confirm',
          text: okText,
          disabled: false,
          className: styles.MadalConfirm,
          onClick: onOk
        }
      ]);
    }
    if (!disableCancle) {
      setAction((v) => [
        ...v.filter((a) => a.key !== 'cancle'),
        {
          key: 'cancle',
          text: cancleText,
          disabled: false,
          className: styles.MadalCancle,
          onClick: onCancel
        }
      ]);
    }
  }, [cancleText, disableCancle, disableOk, okText, onCancel, onOk]); //eslint-disable-line
  return (
    <Modal
      className={classNames(styles.JSXButton, className)}
      content={children}
      destroyOnClose
      closeOnMaskClick
      closeOnAction
      actions={Array.isArray(actions) ? [...action, ...actions] : action}
      {...props}
    />
  );
}

JXModal.show = (props: Partial<ModalShowProps & JXModalProps>) => {
  const action: Action[] = [];

  if (props.disableOk !== true) {
    action.push({
      key: 'confirm',
      text: props.okText || '确认',
      disabled: false,
      className: styles.MadalConfirm,
      onClick: props.onOk
    });
  }
  if (props.disableCancle !== true) {
    action.push({
      key: 'cancle',
      text: props.cancleText || '取消',
      disabled: false,
      className: styles.MadalCancle,
      onClick: props.onCancel
    });
  }
  return Modal.show({
    ...props,
    closeOnMaskClick: true,
    actions: Array.isArray(props.actions)
      ? [...action, ...props.actions]
      : action
  });
};

JXModal.confirm = (props: ModalConfirmProps) => {
  return Modal.confirm({ ...props, closeOnMaskClick: true });
};

JXModal.alert = (props: ModalAlertProps) => {
  return Modal.alert({ ...props, closeOnMaskClick: true });
};

export default JXModal;
