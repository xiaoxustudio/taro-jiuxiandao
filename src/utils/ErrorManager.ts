import { AutoMapObject } from '.';

export enum ErrorTypeCode {
  法宝错误,
  储物错误,
  角色错误
}

// 自动生成映射
export const ErrorTypeMap = AutoMapObject(ErrorTypeCode);

// 类型转换为中文
export function ErrorTypeTransform(type: ErrorTypeCode): string {
  const result = ErrorTypeCode[type];
  if (!result) {
    throw new Error('未知的错误类型');
  }
  return result;
}

export interface ErrorEventInit extends EventInit {
  content: string; // 事件内容
  type: ErrorTypeCode;
}

class ErrorEvent extends Event {
  content: string;

  code: ErrorTypeCode;

  constructor(type: string, options: ErrorEventInit) {
    super(type, options);
    this.content = options.content || '';
    this.code = options.type;
  }
}

/**
 * @description: 错误控制器
 * @return {*}
 */
class ErrorController {
  tag: ErrorTypeCode; // 错误类型标识

  eventType: string; // 错误类型

  constructor(tag: ErrorTypeCode) {
    this.tag = tag;
    this.eventType = `ErrorController-${this.tag}`;
  }

  emitError(content: string) {
    const e = new ErrorEvent(this.eventType, { content, type: this.tag });
    window.document.dispatchEvent(e);
    // eslint-disable-next-line no-throw-literal
    throw `[${ErrorTypeTransform(this.tag)}]：${content}`;
  }

  addEventListener(
    callback: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ): void {
    window.document.addEventListener(this.eventType, callback, options);
  }

  removeEventListener(
    callback: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ): void {
    window.document.removeEventListener(this.eventType, callback, options);
  }
}
export default ErrorController;
