'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  children?: ReactNode;
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement>, FormFieldProps {}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FormFieldProps {}

export function FormField({ label, error, required, helperText, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
        {label}
        {required && <span className="text-[#D32F2F]">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-[#D32F2F]"
        >
          {error}
        </motion.p>
      )}
      {helperText && <p className="mt-1 text-sm text-[#666666]">{helperText}</p>}
    </div>
  );
}

export function InputField({
  label,
  error,
  required,
  helperText,
  className = '',
  ...props
}: InputFieldProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <input
        {...props}
        className={`w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent transition-all ${
          error ? 'border-[#D32F2F]' : ''
        } ${className}`}
      />
    </FormField>
  );
}

export function TextareaField({
  label,
  error,
  required,
  helperText,
  className = '',
  ...props
}: TextareaFieldProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <textarea
        {...props}
        className={`w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent transition-all resize-vertical ${
          error ? 'border-[#D32F2F]' : ''
        } ${className}`}
      />
    </FormField>
  );
}

export function SelectField({
  label,
  error,
  required,
  helperText,
  options,
  className = '',
  ...props
}: InputFieldProps & { options: Array<{ value: string; label: string }> }) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <select
        {...props}
        className={`w-full px-4 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent transition-all ${
          error ? 'border-[#D32F2F]' : ''
        } ${className}`}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
