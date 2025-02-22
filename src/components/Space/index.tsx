import { Space, SpaceProps } from "antd-mobile";
import { CSSProperties, PropsWithChildren, useMemo } from "react";

export interface JXSpaceProps extends SpaceProps {
  gap?: number;
}

function JXSpace({
  gap,
  children,
  style,
  ...props
}: PropsWithChildren<JXSpaceProps>) {
  const gapStyle = useMemo(
    () =>
      ({ "--gap": gap ? `${gap}px` : undefined } as CSSProperties & {
        [k: string]: string;
      }),
    [gap]
  );
  return (
    <Space {...props} style={{ ...style, ...gapStyle }}>
      {children}
    </Space>
  );
}
export default JXSpace;
