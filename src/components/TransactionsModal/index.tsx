import ReactModal from "react-modal";
import { Container, RadioBox, TransactionTypeContainer } from "./styles";
import { FormEvent, useEffect } from "react";
import { Transaction, TransactionForm } from "../../types";
import { TransactionsApiFunction, useTransactions } from "../../hooks/useTransactions";
import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useIsMutating, useQuery } from "react-query";
import { NumberFormatBase, NumberFormatBaseProps } from "react-number-format";
import BigNumber from "bignumber.js";
import { api } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faSpinner } from "@fortawesome/free-solid-svg-icons";

import closeImg from '../../assets/close.svg';
import incomeImg from '../../assets/income.svg';
import outcomeImg from '../../assets/outcome.svg';

type TransactionModalProps = {
	isOpen: boolean
	onRequestClose: () => void
}

type ModalFromContentProps = {
	type: "create" | "update",
	transactionId?: number,
	onRequestClose: TransactionModalProps["onRequestClose"],
	onRequestSubmit: TransactionsApiFunction,
}

const schema = yup.object().shape({
	title: yup
		.string()
		.required("Por favor, informe o título."),
	amount: yup
		.string()
		.required("Por favor, informe um valor.")
		.test('valid-value', "Por favor, informe um valor válido.", (value) => {
			return /^(?!0(?!,))\d{1,3}(\.\d{3})*(,\d+)?$/.test(value ?? "");
		}),
	type: yup
		.string()
		.required("Por favor, informe se é uma entrada ou uma saída.")
		.oneOf(["deposit", "withdraw"], "Por favor, informe um tipo válido."),
	category: yup
		.string()
		.required("Por favor, informe a categoria."),
});

export function NewTransactionModal(props: TransactionModalProps) {
	const { createTransaction } = useTransactions();

	const form = useForm<TransactionForm>({
		defaultValues: {
			title: "",
			amount: undefined,
			type: undefined,
			category: "",
		},
		resolver: yupResolver(schema)
	});

	return (
		<ReactModal
			{ ...props }
			overlayClassName="react-modal-overlay"
			className="react-modal-content">

			<button
				type="button"
				onClick={ () => {
					props.onRequestClose();
					form.reset();
				}}
				className="react-modal-close">
				<img src={ closeImg } alt="Fechar modal"/>
			</button>

			<FormProvider {...form}>
				<Container>
					<ModalFormContent type="create" onRequestSubmit={createTransaction} {...props} />
				</Container>
			</FormProvider>
		</ReactModal>
	);
}

export function UpdateTransactionModal(props: TransactionModalProps & Record<"transactionId", number>) {
	const { updateTransaction, deleteTransaction } = useTransactions();

	const { data, isFetching, error } = useQuery<Record<"transaction", Transaction>, Error>(["getTransaction", props.transactionId], async () => {
		try {
			const { data } = await api.get(`transactions/${props.transactionId}`);
			return data;
		} catch(error) {
			return Promise.reject(error);
		}
	}, {
		enabled: props.transactionId > 0,
	});

	const isMutating = useIsMutating({
		mutationKey: "deleteTransaction",
	}) > 0;

	const form = useForm<TransactionForm>({
		defaultValues: {
			title: "",
			amount: undefined,
			type: undefined,
			category: "",
		},
		resolver: yupResolver(schema)
	});

	useEffect(() => {
		if (data) {	
			Object.entries(data.transaction).forEach(([key, value]) => {
				if (["amount"].includes(key)) {
					const numberObj = new BigNumber(value.toString());

					const number = numberObj.toFormat(2, BigNumber.ROUND_HALF_UP, {
						prefix: '',
						decimalSeparator: ',',
						groupSeparator: '.',
						groupSize: 3,
						secondaryGroupSize: 0,
						fractionGroupSeparator: ' ',
						fractionGroupSize: 0,
						suffix: '',
					});

					form.setValue(key as keyof Omit<Transaction, "id" | "createdAt">, number);
					return;
				}

				form.setValue(key as keyof Transaction, value);
			});
		}
	}, [form, data]);

	async function handleDeleteTransaction() {
		await deleteTransaction(props.transactionId);
		props.onRequestClose();
	}

	return (
		<ReactModal
			{ ...props }
			shouldCloseOnEsc={true}
			shouldCloseOnOverlayClick={true}
			overlayClassName="react-modal-overlay"
			className="react-modal-content">

			<button
				type="button"
				onClick={ () => {
					props.onRequestClose();
					form.reset();
				}}
				className="react-modal-close">
				<img src={ closeImg } alt="Fechar modal"/>
			</button>

			<FormProvider {...form}>
				<Container>
					{ isFetching && <>
						<h2>Editar transação</h2>
						<p><FontAwesomeIcon icon={faSpinner} pulse /> Carregando informações</p>
					</> }
					{ !isFetching && !error && <>
						<ModalFormContent type="update" onRequestSubmit={updateTransaction} {...props} />
						<hr />
						<button className="btn-danger" onClick={handleDeleteTransaction} disabled={isMutating}>
							{ isMutating ? (
								<>
									<FontAwesomeIcon icon={faSpinner} pulse /> Excluindo
								</>
							) : 'Excluir transação' }
						</button>
					</> }
				</Container>
			</FormProvider>
		</ReactModal>
	);
}

function ModalFormContent({ type, transactionId, onRequestClose, onRequestSubmit }: ModalFromContentProps) {
	const { register, setValue, watch, handleSubmit, reset, formState: { errors }, control } = useFormContext<TransactionForm>()

	const isMutating = useIsMutating({
		mutationKey: 'saveTransaction',
	}) > 0;

	function handleCreateNewTransaction(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		handleSubmit(async (r: TransactionForm) => {
			await onRequestSubmit({ id: transactionId, transaction: r });
			onRequestClose();
			reset();
		} , (e) => null)();
	}

	return (
		<>
			{ type === "create" ? <h2>Cadastrar transação</h2> : <h2>Editar transação</h2> }

			<form onSubmit={handleCreateNewTransaction}>
				<input
					{ ...register("title") }
					type="text"
					placeholder="Título"
					className={errors.title ? 'has-error' : ''} />
				<HelpBlockError input="title" />
				
				<Controller
					control={control}
					name="amount"
					render={ ({ field: { onChange, name, value } }) => (
						<CurrencyInput
							name={name}
							value={value ?? ""}
							onChange={onChange}
							placeholder="Valor"
							className={errors.amount ? 'has-error' : ''} />
					) }
				/>
				<HelpBlockError input="amount" />

				<TransactionTypeContainer>
					<RadioBox
						type="button"
						onClick={ () => setValue("type", "deposit", { shouldValidate: true }) }
						isActive={ watch("type") === "deposit" }
						activeColor="green"
						className={errors.type ? 'has-error' : ''} >
						
						<img src={ incomeImg } alt="Entrada" />
						<span>Entrada</span>

					</RadioBox>
					<RadioBox
						type="button"
						onClick={ () => setValue("type", "withdraw", { shouldValidate: true }) }
						isActive={ watch("type") === "withdraw" }
						activeColor="red"
						className={errors.type ? 'has-error' : ''} >

						<img src={ outcomeImg } alt="Saída" />
						<span>Saída</span>

					</RadioBox>
				</TransactionTypeContainer>
				<HelpBlockError input="type" />

				<input
					{ ...register("category") }
					type="text"
					placeholder="Categoria"
					className={errors.category ? 'has-error' : ''} />
				<HelpBlockError input="category" />

				<button type="submit" disabled={isMutating}>
					{ isMutating ? (
						<>
							<FontAwesomeIcon icon={faSpinner} pulse /> Salvando
						</>
					) : ( type === 'create' ? 'Cadastrar' : "Salvar" ) }
				</button>
			</form>
		</>
	);
}

function HelpBlockError({ input }: { input: keyof TransactionForm }) {
	const { formState: { errors } } = useFormContext<TransactionForm>();

	return <>
		{ errors[input] && <span className="error"><FontAwesomeIcon icon={faExclamationTriangle} /> { errors[input]?.message }</span> }
	</>
}

function CurrencyInput(props: Omit<NumberFormatBaseProps, "format" | "getCaretBoundary" | "removeFormatting">) {
	const format = (value: string) => {
		if (!Number(value)) return "";

		if (value.length > 15) {
			value = value.substring(0, 15);
		}

		const numberObj = new BigNumber(value);

		return numberObj.dividedBy(100).toFormat(2, BigNumber.ROUND_HALF_UP, {
			prefix: '',
			decimalSeparator: ',',
			groupSeparator: '.',
			groupSize: 3,
			secondaryGroupSize: 0,
			fractionGroupSeparator: ' ',
			fractionGroupSize: 0,
			suffix: '',
		});

		// const amount = new Intl.NumberFormat("pt-BR", {
		// 	style: "decimal",
		// 	currency: "BRL",
		// 	minimumFractionDigits: 2,
		// }).format(parseFloat(value) / 100);

		// return `${amount}`;
	};

	const getCaretBoundary = (value: string): boolean[] => {
		const boundaryAry = Array.from({ length: value.length + 1 }).map(() => false);
		boundaryAry[boundaryAry.length - 1] = true;
		return boundaryAry;
	}

	const removeFormatting = (inputValue: string)  => {
		return inputValue.replaceAll(".", "").replace(",", "");
	}

	return <NumberFormatBase
		{...props}
		getCaretBoundary={getCaretBoundary}
		removeFormatting={removeFormatting}
		format={format} />;
}
