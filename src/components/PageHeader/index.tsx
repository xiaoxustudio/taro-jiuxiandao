import { View } from '@tarojs/components';
import { ReactNode } from 'react';

export interface PageHeaderProps {
  left: ReactNode;
  right: ReactNode;
}

function PageHeader({ left, right }: PageHeaderProps) {
  return (
    <View
      style={{
        width: '100%',
        marginBottom: '10px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      {left}
      {right}
    </View>
  );
}

export default PageHeader;
