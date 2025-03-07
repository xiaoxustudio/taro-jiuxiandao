import { View, ViewProps } from '@tarojs/components';
import { CSSProperties } from 'react';

export interface BoxProps extends ViewProps {
  shadow?: boolean;
}
function Box({ shadow, children, style, ...props }: Partial<BoxProps>) {
  return (
    <View
      style={{
        ...(style as CSSProperties),
        boxShadow: shadow ? 'rgb(0, 0, 0, 0.1) 1px 1px 2px 1px' : undefined,
      }}
      {...props}
    >
      {children}
    </View>
  );
}
export default Box;
