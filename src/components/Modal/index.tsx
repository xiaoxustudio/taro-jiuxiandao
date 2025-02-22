import { Modal, ModalProps } from 'antd-mobile';
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
export default JXModal;
