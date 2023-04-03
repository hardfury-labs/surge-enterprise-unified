import { FieldValues, Path, useController, UseControllerProps } from "react-hook-form";
import {
  FormControl, FormControlProps, FormErrorMessage, FormLabel, Input, InputProps, NumberDecrementStepper,
  NumberIncrementStepper, NumberInput, NumberInputField, NumberInputFieldProps, NumberInputProps, NumberInputStepper,
  Switch, SwitchProps,
} from "@chakra-ui/react";
import { GroupBase, OptionBase, Props as SelectProps, Select } from "chakra-react-select";
import { SetRequired } from "type-fest";

import { PssswordInput, PssswordInputProps } from "./chakra";

interface FormLabelType<TFieldValues> {
  label: string;
  id: Path<TFieldValues>;
  required?: boolean;
  formControlProps?: FormControlProps;
}

export const FormInput = <TFieldValues extends FieldValues>({
  label,
  id,
  control,
  rules,
  required,
  formControlProps,
  ...props
}: FormLabelType<TFieldValues> &
  SetRequired<Omit<UseControllerProps<TFieldValues>, "name">, "control"> &
  InputProps) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController<TFieldValues>({
    name: id,
    control,
    rules: { ...rules, ...(required && { required: `${label} is required` }) },
  });

  return (
    <FormControl id={id} isInvalid={!!error} {...formControlProps}>
      <FormLabel mb={0}>{label}</FormLabel>

      <Input value={value} onChange={onChange} {...props} />

      <FormErrorMessage mt="1px">{error && error.message}</FormErrorMessage>
    </FormControl>
  );
};

export const FormPasswordInput = <TFieldValues extends FieldValues>({
  label,
  id,
  control,
  rules,
  required,
  formControlProps,
  ...props
}: FormLabelType<TFieldValues> &
  SetRequired<Omit<UseControllerProps<TFieldValues>, "name">, "control"> &
  PssswordInputProps) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController<TFieldValues>({
    name: id,
    control,
    rules: { ...rules, ...(required && { required: `${label} is required` }) },
  });

  return (
    <FormControl id={id} isInvalid={!!error} {...formControlProps}>
      <FormLabel mb={0}>{label}</FormLabel>

      <PssswordInput value={value} onChange={onChange} {...props} />

      <FormErrorMessage mt="1px">{error && error.message}</FormErrorMessage>
    </FormControl>
  );
};

export const FormNumberInput = <TFieldValues extends FieldValues>({
  label,
  id,
  control,
  rules,
  required,
  formControlProps,
  numberInputProps,
  ...props
}: FormLabelType<TFieldValues> &
  SetRequired<Omit<UseControllerProps<TFieldValues>, "name">, "control"> &
  NumberInputFieldProps & { numberInputProps?: NumberInputProps }) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController<TFieldValues>({
    name: id,
    control,
    rules: { ...rules, ...(required && { required: `${label} is required` }) },
  });

  return (
    <FormControl id={id} isInvalid={!!error} {...formControlProps}>
      <FormLabel mb={0}>{label}</FormLabel>

      <NumberInput defaultValue={value} {...numberInputProps}>
        <NumberInputField value={value} onChange={onChange} {...props} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>

      <FormErrorMessage mt="1px">{error && error.message}</FormErrorMessage>
    </FormControl>
  );
};

export const FormSwitch = <TFieldValues extends FieldValues>({
  label,
  id,
  control,
  rules,
  required,
  formControlProps = { display: "flex", alignItems: "center" },
  ...props
}: FormLabelType<TFieldValues> &
  SetRequired<Omit<UseControllerProps<TFieldValues>, "name">, "control"> &
  SwitchProps) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController<TFieldValues>({
    name: id,
    control,
    rules: { ...rules, ...(required && { required: `${label} is required` }) },
  });

  return (
    <FormControl id={id} isInvalid={!!error} {...formControlProps}>
      <FormLabel mb={0}>{label}</FormLabel>

      <Switch mt="1px" size="sm" isChecked={value} onChange={onChange} {...props} />

      <FormErrorMessage mt="1px">{error && error.message}</FormErrorMessage>
    </FormControl>
  );
};

// tricky: options are array of strings https://github.com/JedWatson/react-select/issues/5369#issuecomment-1385434021
export const FormSelect = <TFieldValues extends FieldValues, Option extends String>({
  label,
  id,
  control,
  rules,
  required,
  formControlProps,
  ...props
}: FormLabelType<TFieldValues> &
  SetRequired<Omit<UseControllerProps<TFieldValues>, "name">, "control"> &
  SelectProps<Option, false>) => {
  const {
    field: { ref, value, onChange },
    fieldState: { error },
  } = useController<TFieldValues>({
    name: id,
    control,
    rules: { ...rules, ...(required && { required: `${label} is required` }) },
  });

  return (
    <FormControl id={id} isInvalid={!!error} {...formControlProps}>
      <FormLabel mb={0}>{label}</FormLabel>

      <Select<Option, false>
        name={id}
        ref={ref}
        defaultInputValue={value}
        value={value}
        onChange={onChange}
        selectedOptionStyle="check"
        placeholder=""
        isMulti={false}
        useBasicStyles
        closeMenuOnSelect
        getOptionValue={String}
        getOptionLabel={String}
        {...props}
      />

      <FormErrorMessage mt="1px">{error && error.message}</FormErrorMessage>
    </FormControl>
  );
};
