import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./filters.module.scss";
import { faCaretUp, faX } from "@fortawesome/free-solid-svg-icons";

export default function Filters() {
	return (
		<div id={styles.filters}>
			<button className={styles.active}>
				Yale College
				<FontAwesomeIcon icon={faX} />
			</button>
			<button>
				Year
				<FontAwesomeIcon icon={faCaretUp} />
			</button>
			<button>
				College
				<FontAwesomeIcon icon={faCaretUp} />
			</button>
			<button>
				Major
				<FontAwesomeIcon icon={faCaretUp} />
			</button>
			<button className={styles.reset}>Reset</button>
		</div>
	)
};
