import { View } from '@tarojs/components';
import {
  JXButton,
  JXDivider,
  JXModal,
  JXSpace,
  Paragraph,
  Text
} from '@/components';
import { navigateTo } from '@/utils';
import styles from './index.module.less';

function Home() {
  const handleJiuXianYear = () => {
    const { close } = JXModal.show({
      title: '九仙团队™',
      content: (
        <>
          <Text>原公告：</Text>
          <Text>
            我们团队拥有丰富的文字游戏开发经验，团队组织人方寸是第一款安卓文字修仙游戏九仙道的作者！开创了安卓文字修仙游戏先河！
          </Text>
          <Text>
            现如今有多位拥有文字游戏开发经验的作者加入了我们，我们希望在来年推出更好的作品，让各位期待已久的道友们满意！
          </Text>
          <Text>
            同时我们也欢迎各位有开发经验的作者加入我们！我们都是文字游戏爱好者…
          </Text>
          <Text>团队人员名单及联系QQ：</Text>
          <Text>方寸：1821075638</Text>
          <Text>星痕：1356465235</Text>
          <Text>相随：86344265</Text>
          <Text>慕容：228240636</Text>
          <Text>荼山：2879700093</Text>
          <Text>流萤：121545406</Text>
          <Text>无痕：1197445965</Text>
          <Text>徐然（小徐）：1783558957</Text>
          <Text>紫痕：804762867</Text>
          <Text>蝶恋花：1763323726</Text>
          <Text>白加黑：1392203534</Text>
          <Text>无痕：1450411269</Text>
          <Text>天真：2404316351</Text>
          <Text>组织-怪物聚集之九仙之家</Text>
          <Text>组织-九仙道灵兽谷</Text>
          <Text>特别鸣谢！</Text>
          <Text>匿名道友：834972577</Text>
          <Text>所有支持我们，帮助过我们的道友！</Text>
          <Text>注：排名不分先后顺序，未署名请联系徐然！</Text>
        </>
      ),
      onOk() {
        close();
      },
      disableCancle: true
    });
  };
  return (
    <View className={styles.container}>
      <View className={styles.homeTitle}>
        上古鸿蒙未分，天地混沌。待到道化万物，炎黄现世，世人便已有追求天道之意。而后，袭明自然，道法天地，修仙之辈皆以己心明悟修道之法。待到日后上古九神君修为大成，修仙界更是步入一大盛世。然则无论人妖，纵使已初悟天道，亦难逃邪念惑心。于是人，鬼，妖，魔四族互相倾轧，以致各方元气大伤，从此修仙界便入沉寂。但如今，各方之斗又现端倪。且灵兽谷之诞生，又为此番争斗增添了几分难料之意。此番风起云涌之际，怎可料是否会有新的大能续写传奇……
      </View>
      <Text style={{ padding: '0 20px' }} size={30} space={4}>
        九仙道
      </Text>
      <JXDivider margin='0 0 16px 0' />
      <JXSpace className={styles.homeContent} direction='vertical' gap={20}>
        <JXSpace
          className={styles.homeContent}
          direction='vertical'
          justify='center'
        >
          <JXButton
            onClick={() => {
              navigateTo('Home/pages/actor-list/index', { replace: true });
            }}
          >
            进入游戏
          </JXButton>
          <JXButton
            onClick={() => {
              navigateTo('Home/pages/create-actor/index');
            }}
          >
            创建角色
          </JXButton>
          <JXButton
            onClick={() => {
              window.JXApi.GoToSetting();
            }}
          >
            设置
          </JXButton>
          <JXButton
            onClick={() => {
              const { close } = JXModal.show({
                title: '关于我们',
                content: (
                  <JXSpace direction='vertical'>
                    <Paragraph>
                      感谢各位道友，一直以来对九仙道的支持与热爱！
                    </Paragraph>
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
                ),
                onOk() {
                  close();
                },
                disableCancle: true
              });
            }}
          >
            关于
          </JXButton>
        </JXSpace>
        <JXSpace
          direction='vertical'
          justify='center'
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
      <View className={styles.copyRight} onClick={handleJiuXianYear}>
        CopyRight&emsp;® 2016-&nbsp;2025
      </View>
    </View>
  );
}
export default Home;
