import { JSXButton, JSXModal, JXSpace, Paragraph } from "@/components";
import { navigateTo } from "@/utils";
import { View } from "@tarojs/components";
import { Divider } from "antd-mobile";
import { useState } from "react";
import styles from "./index.module.less";

function Home() {
  const [showAbout, setShowAbout] = useState(false);
  return (
    <View className={styles.container}>
      <View className={styles.homeTitle}>
        上古鸿蒙未分，天地混沌。待到道化万物，炎黄现世，世人便已有追求天道之意。而后，袭明自然，道法天地，修仙之辈皆以己心明悟修道之法。待到日后上古九神君修为大成，修仙界更是步入一大盛世。然则无论人妖，纵使已初悟天道，亦难逃邪念惑心。于是人，鬼，妖，魔四族互相倾轧，以致各方元气大伤，从此修仙界便入沉寂。但如今，各方之斗又现端倪。且灵兽谷之诞生，又为此番争斗增添了几分难料之意。此番风起云涌之际，怎可料是否会有新的大能续写传奇……
      </View>
      <Divider />
      <JXSpace className={styles.homeContent} direction="vertical" gap={20}>
        <JXSpace
          className={styles.homeContent}
          direction="vertical"
          justify="center"
        >
          <JSXButton>进入游戏</JSXButton>
          <JSXButton
            onClick={() => {
              navigateTo("create-actor/index");
            }}
          >
            创建角色
          </JSXButton>
          <JSXButton>设置</JSXButton>
          <JSXButton onClick={() => setShowAbout(!showAbout)}>关于</JSXButton>
        </JXSpace>
        <JXSpace
          direction="vertical"
          justify="center"
          className={styles.homeContent}
        >
          <View>抵制不良游戏，拒绝盗版游戏</View>
          <View>注意自我保护，预防受骗上当</View>
          <View>适度游戏益脑，沉迷游戏伤身</View>
          <View>合理安排时间，享受健康生活</View>
          <View>测试版不代表最终品质！</View>
        </JXSpace>
      </JXSpace>
      <View className={styles.team}>九仙团队™</View>
      <View className={styles.copyRight}>CopyRight&nbsp;®&nbsp;2025</View>
      <JSXModal
        title="关于我们"
        visible={showAbout}
        onClose={() => setShowAbout(false)}
        content={
          <JXSpace direction="vertical">
            <Paragraph>感谢各位道友，一直以来对九仙道的支持与热爱！</Paragraph>
            <Paragraph>我们也在一直努力把游戏做好做强！</Paragraph>
            <Paragraph>
              从这个版本开始，我们也会逐渐的推出更多玩法，以及更多联网的玩法…
            </Paragraph>
            <Paragraph>
              游戏的维护成本以及服务器及其它开发方面的维护成本越来越高，其实团队成员以及方寸已经投入了不少的资金，用于开发维护方面以及服务器续费以及维护，团队成员并没有发工资…
            </Paragraph>
            <Paragraph>
              但是游戏走向弱联网的提升，如今也是打算投入资金来打造好九仙道，希望各位道友能与我们一起见证九仙道的成长！
            </Paragraph>
            <Paragraph>
              我们现在做的也许还不是最好，但是我们会一直努力把梦想做好！
            </Paragraph>
            <Paragraph>
              在此九仙团队所有成员向所有犒赏过，支持和热爱我们的道友表示衷心的感谢！
            </Paragraph>
            <Paragraph>
              我们团队在此承诺，只要团队还有人在九仙道就一直会更新下去，并且不搞充值！
            </Paragraph>
            <Paragraph>再次感谢打赏过我们的道友…</Paragraph>
          </JXSpace>
        }
      />
    </View>
  );
}
export default Home;
