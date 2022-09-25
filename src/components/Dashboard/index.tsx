import { Summary } from "../Summary";
import { TransactionsTable } from "../TransactionsTable";
import { Container } from "./styles";

type DashboardProps = {
	onOpenUpdateTransactionModal: (transactionId: number) => void,
}

export function Dashboard(props: DashboardProps) {
	return (
		<Container>
			<Summary />
			<TransactionsTable {...props} />
		</Container>
	);
}
