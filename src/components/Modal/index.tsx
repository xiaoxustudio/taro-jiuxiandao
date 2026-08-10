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
  cancelText: string;
  onOk: () => void;
  onCancel: () => void;
  disableOk: boolean;
  disableCancel: boolean;
  cancleText?: string;
  disableCancle?: boolean;
  controller: ReturnType<typeof useModal>['state'];
}

function JXModal({
  children,
  className,
  visible,
  actions,
  okText = '确认',
  cancelText,
  cancleText,
  disableOk = false,
  disableCancel,
  disableCancle,
  onOk = () => {},
  onCancel = () => {},
  controller,
  ...props
}: PropsWithChildren<Partial<JXModalProps>>) {
  const finalCancelText = cancelText ?? cancleText ?? '取消';
  const finalDisableCancel = disableCancel ?? disableCancle ?? false;
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
    if (!finalDisableCancel) {
      defaultActions.push({
        key: 'cancle',
        text: finalCancelText,
        disabled: false,
        className: styles.MadalCancle,
        onClick: onCancel
      });
    }

    if (Array.isArray(actions)) {
      return [...defaultActions, ...actions];
    }

    return defaultActions;
  }, [
    finalCancelText,
    finalDisableCancel,
    disableOk,
    okText,
    onOk,
    onCancel,
    actions
  ]);

  return (
    <Modal
      className={classNames(styles.JSXButton, className)}
      content={children}
      destroyOnClose
      closeOnMaskClick
      closeOnAction
      actions={action}
      visible={visibleMemo}
      {...props}
    />
  );
}

JXModal.show = (props: Partial<ModalShowProps & JXModalProps>) => {
  const action: Action[] = [];
  const finalCancelText = props.cancelText ?? props.cancleText ?? '取消';
  const finalDisableCancel =
    props.disableCancel ?? props.disableCancle ?? false;

  if (props.disableOk !== true) {
    action.push({
      key: 'confirm',
      text: props.okText || '确认',
      disabled: false,
      className: styles.MadalConfirm,
      onClick: props.onOk
    });
  }
  if (!finalDisableCancel) {
    action.push({
      key: 'cancle',
      text: finalCancelText,
      disabled: false,
      className: styles.MadalCancle,
      onClick: props.onCancel
    });
  }
  return Modal.show({
    closeOnMaskClick: true,
    ...props,
    actions: Array.isArray(props.actions)
      ? [...action, ...props.actions]
      : action
  });
};

JXModal.confirm = (props: ModalConfirmProps) => {
  return Modal.confirm({
    closeOnMaskClick: true,
    ...props
  });
};

JXModal.alert = (props: ModalAlertProps) => {
  return Modal.alert({ closeOnMaskClick: true, ...props });
};

export default JXModal;
