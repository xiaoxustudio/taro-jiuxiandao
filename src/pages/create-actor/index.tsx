import { JXInput, JXSpace } from "@/components";
import { View } from "@tarojs/components";
import styles from "./index.module.less";

function Index() {
  return (
    <View className={styles.Container}>
      <JXSpace className={styles.Container} direction="vertical">
        <View className={styles.Title}>创建角色</View>
        <View>
          <JXInput className={styles.Input} placeholder="请输入你的角色名称" />
        </View>
      </JXSpace>
    </View>
  );
}
export default Index;
