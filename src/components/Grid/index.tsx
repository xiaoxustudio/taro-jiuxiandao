import { Grid, GridItemProps, GridProps } from 'antd-mobile';
import { CSSProperties, PropsWithChildren } from 'react';

function JXGrid({ children, ...props }: PropsWithChildren<GridProps>) {
  return <Grid {...props}>{children}</Grid>;
}

export interface JXGridItemProps extends GridItemProps {
  align: 'left' | 'right' | 'center';
  style: CSSProperties;
}

JXGrid.Item = function ({
  children,
  align,
  style,
  ...props
}: PropsWithChildren<Partial<JXGridItemProps>>) {
  return (
    <Grid.Item {...props} style={{ ...style, textAlign: align }}>
      {children}
    </Grid.Item>
  );
};

export default JXGrid;
