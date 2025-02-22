import { Input, InputProps } from 'antd-mobile';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import styles from './index.module.less';

export interface JXInputProps extends InputProps {
	className?: string;
}

function JXInput({
	children,
	className,
	...props
}: PropsWithChildren<JXInputProps>) {
	return (
		<Input className={classNames(styles.JXInputBox, className)} {...props} />
	);
}
export default JXInput;
