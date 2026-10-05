import { forwardRef } from 'react';
import type { TextInput } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { TextField, type TextFieldProps } from './TextField';

type Props<T extends FieldValues> = Omit<TextFieldProps, 'value' | 'onChangeText' | 'error'> & {
  control: Control<T>;
  name: Path<T>;
};

/** TextField bound to react-hook-form; shows the field's validation (or server) error. */
function FormFieldInner<T extends FieldValues>({ control, name, ...props }: Props<T>, ref: React.Ref<TextInput>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          ref={ref}
          {...props}
          value={field.value == null ? '' : String(field.value)}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export const FormField = forwardRef(FormFieldInner) as <T extends FieldValues>(p: Props<T> & { ref?: React.Ref<TextInput> }) => React.ReactElement;
