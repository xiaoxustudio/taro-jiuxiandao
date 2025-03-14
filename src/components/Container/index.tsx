import { View, ViewProps } from '@tarojs/components';
import classNames from 'classnames';
import { PropsWithChildren, ReactNode } from 'react';
import JXDivider from '../Divider';
import JXSpace from '../Space';
import Text from '../Text';
import styles from './index.module.less';

interface ContainerProps extends ViewProps {
  title: string | ReactNode;
  desc: string | ReactNode;
  className: string;
}

function Container({
  title,
  desc,
  children,
  className,
  ...props
}: PropsWithChildren<Partial<ContainerProps>>) {
  return (
    <View className={classNames(styles.Container, className)} {...props}>
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
      {children}
    </View>
  );
}
export default Container;
