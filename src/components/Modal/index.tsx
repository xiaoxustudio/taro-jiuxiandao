import {
  Modal,
  ModalAlertProps,
  ModalConfirmProps,
  ModalProps,
  ModalShowProps
} from 'antd-mobile';
import { Action } from 'antd-mobile/es/components/modal';
import classNames from 'classnames';
import { PropsWithChildren, useMemo } from 'react';
import useModal from '@/hooks/useModal';
import styles from './index.module.less';

export interface JXModalProps extends ModalProps {
  className: string;
  okText: string;
  cancleText: string;
  onOk: () => void;
  onCancel: () => void;
  disableOk: boolean;
  disableCancle: boolean;
  controller: ReturnType<typeof useModal>['state'];
}

function JXModal({
  children,
  className,
  visible,
  actions,
  okText = '确认',
  cancleText = '取消',
  disableOk = false,
  disableCancle = false,
  onOk = () => {},
  onCancel = () => {},
  controller,
  ...props
}: PropsWithChildren<Partial<JXModalProps>>) {
  const visibleMemo = useMemo(() => {
    const v =
      controller?.visiableModal !== undefined
        ? controller?.visiableModal
        : visible;
    return v;
  }, [controller?.visiableModal, visible]);

  const action = useMemo(() => {
    const defaultActions: Action[] = [];

    if (!disableOk) {
      defaultActions.push({
        key: 'confirm',
        text: okText,
        disabled: false,
        className: styles.MadalConfirm,
        onClick: onOk
      });
    }
    if (!disableCancle) {
      defaultActions.push({
        key: 'cancle',
        text: cancleText,
        disabled: false,
        className: styles.MadalCancle,
        onClick: onCancel
      });
    }

    if (Array.isArray(actions)) {
      return [...defaultActions, ...actions];
    }

    return defaultActions;
  }, [cancleText, disableCancle, disableOk, okText, onOk, onCancel, actions]);

  return (
    <Modal
      className={classNames(styles.JSXButton, className)}
      content={children}
      destroyOnClose
      closeOnMaskClick
      closeOnAction
      actions={Array.isArray(actions) ? [...action, ...actions] : action}
      visible={visibleMemo}
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
  return Modal.confirm({
    ...props,
    closeOnMaskClick: true
  });
};

JXModal.alert = (props: ModalAlertProps) => {
  return Modal.alert({ ...props, closeOnMaskClick: true });
};

export default JXModal;
