import { View, ViewProps } from '@tarojs/components';
import { PropsWithChildren, ReactNode } from 'react';
import JXDivider from '../Divider';
import JXSpace from '../Space';
import Text from '../Text';
import styles from './index.module.less';

interface ContainerProps extends ViewProps {
  title: string | ReactNode;
  desc: string | ReactNode;
}

function Container({
  title,
  desc,
  children,
  ...props
}: PropsWithChildren<Partial<ContainerProps>>) {
  return (
    <View {...props}>
      <JXSpace direction='vertical'>
        <Text className={styles.Title} textShadow size={25}>
          {title}
        </Text>
        {desc && (
          <Text className={styles.Desc} size={14}>
            {desc}
          </Text>
        )}
      </JXSpace>
      <JXDivider />
      <JXSpace direction='vertical' style={{ width: '100%' }}>
        {children}
      </JXSpace>
    </View>
  );
}
export default Container;
