declare interface Window {
  /**
   * @description: 九仙安卓API（H5使用）
   * @return {*}
   */
  JXApi: {
    /**
     * @description: 打开设置页面
     * @return {*}
     */
    GoToSetting: () => void;
  };
  /**
   * @description: H5API（安卓使用）
   * @return {*}
   */
  H5Api: {
    /**
     * @description: 清除存档
     * @return {*}
     */
    clearStore: () => void;
  };
}
