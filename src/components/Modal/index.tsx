import {
  Modal,
  ModalAlertProps,
  ModalConfirmProps,
  ModalProps,
  ModalShowProps,
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
  onCancle: () => void;
  disableConfirm: boolean;
  disableCancle: boolean;
}

function JXModal({
  children,
  className,
  okText = '确认',
  cancleText = '取消',
  disableConfirm = false,
  disableCancle = false,
  onOk = () => {},
  onCancle = () => {},
  ...props
}: PropsWithChildren<Partial<JXModalProps>>) {
  const [action, setAction] = useState<Action[]>([]);
  useEffect(() => {
    if (!disableConfirm) {
      setAction((v) => [
        ...v,
        {
          key: 'confirm',
          text: okText,
          disabled: false,
          className: styles.MadalConfirm,
          onClick: onOk,
        },
      ]);
    }
    if (!disableCancle) {
      setAction((v) => [
        ...v,
        {
          key: 'cancle',
          text: cancleText,
          disabled: false,
          className: styles.MadalCancle,
          onClick: onCancle,
        },
      ]);
    }
  }, [cancleText, disableCancle, disableConfirm, okText]); //eslint-disable-line
  return (
    <Modal
      className={classNames(styles.JSXButton, className)}
      content={children}
      destroyOnClose
      closeOnMaskClick
      closeOnAction
      actions={action}
      {...props}
    />
  );
}

JXModal.show = (props: Partial<ModalShowProps & JXModalProps>) => {
  const actions: Action[] = [];

  if (props.disableConfirm != true) {
    actions.push({
      key: 'confirm',
      text: props.okText || '确认',
      disabled: false,
      className: styles.MadalConfirm,
      onClick: props.onOk,
    });
  }
  if (props.disableCancle != true) {
    actions.push({
      key: 'cancle',
      text: props.cancleText || '取消',
      disabled: false,
      className: styles.MadalCancle,
      onClick: props.onCancle,
    });
  }
  return Modal.show({
    ...props,
    closeOnMaskClick: true,
    actions,
  });
};

JXModal.confirm = (props: ModalConfirmProps) => {
  return Modal.confirm({ ...props, closeOnMaskClick: true });
};

JXModal.alert = (props: ModalAlertProps) => {
  return Modal.alert({ ...props, closeOnMaskClick: true });
};

export default JXModal;
