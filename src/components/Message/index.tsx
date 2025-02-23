import { Toast, ToastShowProps } from 'antd-mobile';
import { ToastHandler } from 'antd-mobile/es/components/toast';
import { omit } from 'lodash-es';
import ContentToast from './message';

Toast.config({ duration: 1500, position: 'bottom' });

export type JXToastProps = string | ToastShowProps;

export function JXToast(props?: JXToastProps) {
  let current: ToastHandler | null = null;
  return {
    show: (args?: JXToastProps) => {
      current = Toast.show(args || props || {});
    },
    loading: (args?: JXToastProps) => {
      let target: { content: string } = { content: '' };
      if (typeof args === 'object') {
        target = { ...(args as { content: string }) };
      } else if (typeof props === 'object') {
        target = { ...(props as { content: string }) };
      } else {
        target = { content: args || props || '' };
      }
      current = Toast.show({
        ...omit(target, ['content']),
        content: <ContentToast content={target.content} />,
      });
    },
    close: () => {
      current?.close();
    },
    closeAll: () => {
      Toast.clear();
    },
  };
}

export default Toast;
