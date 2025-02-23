import {
  Modal,
  ModalAlertProps,
  ModalConfirmProps,
  ModalProps,
  ModalShowProps,
} from 'antd-mobile';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import styles from './index.module.less';

export interface JXModalProps extends ModalProps {
  className?: string;
  okText?: string;
  cancleText?: string;
  onOk?: () => void;
  onCancle?: () => void;
}

function JXModal({
  children,
  className,
  okText = '确认',
  cancleText = '取消',
  onOk = () => {},
  onCancle = () => {},
  ...props
}: PropsWithChildren<JXModalProps>) {
  return (
    <Modal
      className={classNames(styles.JSXButton, className)}
      content={children}
      destroyOnClose
      closeOnMaskClick
      closeOnAction
      actions={[
        {
          key: 'confirm',
          text: okText,
          disabled: false,
          className: styles.MadalConfirm,
          onClick: onOk,
        },
        {
          key: 'cancle',
          text: cancleText,
          disabled: false,
          className: styles.MadalCancle,
          onClick: onCancle,
        },
      ]}
      {...props}
    />
  );
}

JXModal.show = (props: ModalShowProps & JXModalProps) => {
  return Modal.show({
    ...props,
    closeOnMaskClick: true,
    actions: [
      {
        key: 'confirm',
        text: props.okText || '确认',
        disabled: false,
        className: styles.MadalConfirm,
        onClick: props.onOk || (() => {}),
      },
      {
        key: 'cancle',
        text: props.cancleText || '取消',
        disabled: false,
        className: styles.MadalCancle,
        onClick: props.onCancle || (() => {}),
      },
    ],
  });
};

JXModal.confirm = (props: ModalConfirmProps) => {
  return Modal.confirm({ ...props, closeOnMaskClick: true });
};

JXModal.alert = (props: ModalAlertProps) => {
  return Modal.alert({ ...props, closeOnMaskClick: true });
};

export default JXModal;
