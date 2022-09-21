import ReactModal from "react-modal";
import { Container, RadioBox, TransactionTypeContainer } from "./styles";
import { FormEvent } from "react";
import { TransactionForm } from "../../types";
import { useTransactions } from "../../hooks/useTransactions";
import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useIsMutating } from "react-query";
import { NumberFormatBase, NumberFormatBaseProps } from "react-number-format";

import closeImg from '../../assets/close.svg';
import incomeImg from '../../assets/income.svg';
import outcomeImg from '../../assets/outcome.svg';


type NewTransactionModalProps = {
	isOpen: boolean
	onRequestClose: () => void
}

export function NewTransactionModal(props: NewTransactionModalProps) {
	const schema = yup.object().shape({
		title: yup
			.string()
			.required("Por favor, informe o título."),
		amount: yup
			.string()
			.required("Por favor, informe um valor.")
			.test('valid-value', "Por favor, informe um valor válido.", (value) => {
				if (!value) {
					return false;
				}

				return /^(?!0(?!,))\d{1,3}(\.\d{3})*(,\d+)?$/.test(value);
			}),
		type: yup
			.string()
			.required("Por favor, informe se é uma entrada ou uma saída.")
			.oneOf(["deposit", "withdraw"], "Por favor, informe um tipo válido."),
		category: yup
			.string()
			.required("Por favor, informe a categoria."),
	});

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
				<ModalFormContent {...props} />
			</FormProvider>
		</ReactModal>
	);
}

function ModalFormContent({ onRequestClose }: { onRequestClose: NewTransactionModalProps["onRequestClose"] }) {
	const { createTransaction } = useTransactions();

	const { register, setValue, watch, handleSubmit, reset, formState: { errors }, control } = useFormContext<TransactionForm>()

	const isMutating = useIsMutating() > 0;

	function handleCreateNewTransaction(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		handleSubmit(async (r: TransactionForm) => {
			await createTransaction(r);
			onRequestClose();
			reset();
		} , (e) => null)();
	}

	return (
		<Container onSubmit={handleCreateNewTransaction}>
			<h2>Cadastrar transação</h2>

			<input
				{ ...register("title") }
				type="text"
				placeholder="Título"
				className={errors.title ? 'has-error' : ''} />
			<HelpBlockError input="title" />
			
			<Controller
				control={control}
				name="amount"
				render={({ field: { onChange, name, value } }) => (
					<CurrencyInput
						name={name}
						value={value}
						onChange={onChange}
						placeholder="Valor"
						className={errors.amount ? 'has-error' : ''} />
				)}
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

			<button type="submit" disabled={isMutating}>{ isMutating ? 'Salvando...' : 'Cadastrar' }</button>
		</Container>
	);
}

function HelpBlockError({ input }: { input: keyof TransactionForm }) {
	const { formState: { errors } } = useFormContext<TransactionForm>();

	return <>
		{ errors[input] && <span className="error">{ errors[input]?.message }</span> }
	</>
}

function CurrencyInput(props: Omit<NumberFormatBaseProps, "format" | "getCaretBoundary" | "removeFormatting">) {
	const format = (value: string) => {
		if (!Number(value)) return "";

		const amount = new Intl.NumberFormat("pt-BR", {
			style: "decimal",
			currency: "BRL",
			minimumFractionDigits: 2,
		}).format(parseFloat(value) / 100);
	
		return `${amount}`;
	};

	const getCaretBoundary = (value: string): boolean[] => {
		const boundaryAry = Array.from({ length: value.length + 1 }).map(() => false);
		boundaryAry[boundaryAry.length - 1] = true;
		return boundaryAry;
	}

	const removeFormatting = (inputValue: string)  => {
		return Number(inputValue.replaceAll(".", "").replace(",", "")).toString();
	}

	return <NumberFormatBase
		{...props}
		getCaretBoundary={getCaretBoundary}
		removeFormatting={removeFormatting}
		format={format} />;
}
