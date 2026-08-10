import { View, ViewProps } from '@tarojs/components';
import { CSSProperties } from 'react';

export interface BoxProps extends ViewProps {
  shadow?: boolean;
}
function Box({ shadow, children, style, ...props }: Partial<BoxProps>) {
  return (
    <View
      style={
        shadow
          ? {
              ...(style as CSSProperties),
              boxShadow: 'rgb(0, 0, 0, 0.1) 1px 1px 2px 1px'
            }
          : (style as CSSProperties)
      }
      {...props}
    >
      {children}
    </View>
  );
}
export default Box;
