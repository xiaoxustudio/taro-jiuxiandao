import { Button, ButtonProps } from 'antd-mobile';
import { PropsWithChildren } from 'react';
import styles from './index.module.less';
import classNames from 'classnames';

export interface JSXButtonProps extends ButtonProps {
	gap?: number;
	className?: string;
}

function JSXButton({
	gap,
	children,
	className,
	...props
}: PropsWithChildren<JSXButtonProps>) {
	return (
		<Button className={classNames(styles.JSXButton, className)} {...props}>
			{children}
		</Button>
	);
}
export default JSXButton;
