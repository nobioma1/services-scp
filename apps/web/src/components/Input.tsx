import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
} from '@chakra-ui/react';
import { forwardRef } from 'react';

interface InputProps extends ChakraInputProps {
  label?: string;
  errorText?: string | string[];
  helperText?: string;
}

const Input = forwardRef(
  ({ label, errorText, helperText, ...props }: InputProps, ref) => {
    const errorMsg = Boolean(errorText) && (
      <FormErrorMessage>{errorText}</FormErrorMessage>
    );

    const helperMsg = Boolean(helperText) && (
      <FormHelperText>{helperText}</FormHelperText>
    );

    return (
      <FormControl isInvalid={Boolean(errorText)}>
        {Boolean(label) && (
          <FormLabel color="gray.600" htmlFor={props.name}>
            {label}
          </FormLabel>
        )}
        <ChakraInput id={props.name} size="lg" {...props} ref={ref} />
        {errorText ? errorMsg : helperMsg}
      </FormControl>
    );
  }
);

export default Input;
