import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Textarea,
  TextareaProps,
} from '@chakra-ui/react';

interface TextAreaInputProps extends TextareaProps {
  label?: string;
  errorText?: string;
  helperText?: string;
}

const TextAreaInput = ({
  label,
  errorText,
  helperText,
  ...props
}: TextAreaInputProps) => {
  const errorMsg = Boolean(errorText) && (
    <FormErrorMessage fontSize="sm">{errorText}</FormErrorMessage>
  );

  const helperMsg = Boolean(helperText) && (
    <FormHelperText fontSize="sm">{helperText}</FormHelperText>
  );

  return (
    <FormControl isInvalid={Boolean(errorText)}>
      {Boolean(label) && (
        <FormLabel color="gray.600" htmlFor={props.name}>
          {label}
        </FormLabel>
      )}
      <Textarea id={props.name} size="lg" {...props} />
      {errorText ? errorMsg : helperMsg}
    </FormControl>
  );
};

export default TextAreaInput;
