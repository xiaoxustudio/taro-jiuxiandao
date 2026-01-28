import { Grid, GridItemProps, GridProps } from 'antd-mobile';
import { CSSProperties, PropsWithChildren } from 'react';

export interface JXGridProps extends GridProps {
  height?: number | string;
}

function JXGrid({
  children,
  height,
  style,
  ...props
}: PropsWithChildren<JXGridProps>) {
  const normalizedHeight = typeof height === 'number' ? `${height}px` : height;
  return (
    <Grid
      {...props}
      style={{
        ...style,
        height: normalizedHeight,
        overflowY: normalizedHeight ? 'auto' : style?.overflowY
      }}
    >
      {children}
    </Grid>
  );
}

export interface JXGridItemProps extends GridItemProps {
  align: 'left' | 'right' | 'center';
  style: CSSProperties;
}

JXGrid.Item = function Item({
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
