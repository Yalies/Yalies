import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import styles from "./chip.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Chip({
	children,
	primary,
	icon,
	birthday,
}: {
	children: React.ReactNode,
	primary?: boolean,
	birthday?: boolean,
	icon?: IconDefinition,
}) {
	return (
		<button className={`
			${styles.chip}
			${primary ? styles.primary : ""}
			${birthday ? styles.birthday : ""}
		`}>
			{ icon && <FontAwesomeIcon icon={icon} /> }
			{children}
		</button>
	);
}
