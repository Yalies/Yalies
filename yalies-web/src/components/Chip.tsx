import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import styles from "./chip.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Chip({
	children,
	primary,
	icon
}: {
	children: React.ReactNode,
	primary?: boolean,
	icon: IconDefinition
}) {
	return (
		<button className={`${styles.chip} ${primary ? styles.primary : ""}`}>
			{ icon && <FontAwesomeIcon icon={icon} /> }
			{children}
		</button>
	);
}
