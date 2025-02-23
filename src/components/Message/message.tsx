import { View } from '@tarojs/components';
import { DotLoading } from 'antd-mobile';

function ContentToast({ content }: { content: string }) {
  return (
    <View>
      <DotLoading />
      {content}
    </View>
  );
}
export default ContentToast;
