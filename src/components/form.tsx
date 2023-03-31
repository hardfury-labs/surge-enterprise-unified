import { cloneElement } from "react";
import { Path, useController, UseControllerProps } from "react-hook-form";
import { FormControl, FormControlProps, FormErrorMessage, FormLabel } from "@chakra-ui/react";

interface FormLabelType<T> {
  label: string;
  id: Path<T>;
  children: React.ReactElement;
  required?: boolean;
}

export const FormItem = <T extends object>({
  label,
  id,
  control,
  rules,
  children,
  required,
  ...props
}: FormLabelType<T> & Omit<UseControllerProps<T>, "name"> & FormControlProps) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController<T>({
    name: id,
    control,
    rules: { ...rules, ...(required && { required: `${label} is required` }) },
  });

  console.log(label, children, value);

  return (
    <FormControl id={id} isInvalid={!!error} {...props}>
      <FormLabel m={0}>{label}</FormLabel>

      {cloneElement(children, { value, isChecked: value, onChange })}

      <FormErrorMessage mt="1px">{error && error.message}</FormErrorMessage>
    </FormControl>
  );
};
