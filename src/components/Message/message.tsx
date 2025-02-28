import { View } from '@tarojs/components';
import { DotLoading } from 'antd-mobile';
import Text from '../Text';

interface ContentToastProps {
  content: string;
  loading?: boolean;
}

function ContentToast({ content, loading = false }: ContentToastProps) {
  return (
    <View>
      {loading && <DotLoading />}
      <Text noWrap>{content}</Text>
    </View>
  );
}
export default ContentToast;
