'use client';

import { Button, Input, Label } from '@talashim/ui';
import { useFieldArray, type Control, type FieldErrors } from 'react-hook-form';
import type { CommerceSettings } from '../model/schemas';
import { DEFAULT_CARD_TO_CARD_ACCOUNTS } from '../model/defaults';

interface CardToCardAccountsFieldsProps {
  control: Control<CommerceSettings>;
  errors: FieldErrors<CommerceSettings>;
  disabled?: boolean;
}

export function CardToCardAccountsFields({
  control,
  errors,
  disabled = false,
}: CardToCardAccountsFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cardToCardAccounts',
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const accountErrors = errors.cardToCardAccounts?.[index];

        return (
          <div
            key={field.id}
            className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[var(--foreground)]">
                حساب {index + 1}
              </p>
              {fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => remove(index)}
                >
                  حذف
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`cardToCardAccounts.${index}.bankName`}>نام بانک</Label>
                <Input
                  id={`cardToCardAccounts.${index}.bankName`}
                  className="mt-2"
                  disabled={disabled}
                  {...control.register(`cardToCardAccounts.${index}.bankName`)}
                />
                {accountErrors?.bankName ? (
                  <p className="mt-1 text-xs text-[var(--error)]">
                    {accountErrors.bankName.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor={`cardToCardAccounts.${index}.accountHolder`}>به نام</Label>
                <Input
                  id={`cardToCardAccounts.${index}.accountHolder`}
                  className="mt-2"
                  disabled={disabled}
                  {...control.register(`cardToCardAccounts.${index}.accountHolder`)}
                />
                {accountErrors?.accountHolder ? (
                  <p className="mt-1 text-xs text-[var(--error)]">
                    {accountErrors.accountHolder.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor={`cardToCardAccounts.${index}.cardNumber`}>شماره کارت</Label>
                <Input
                  id={`cardToCardAccounts.${index}.cardNumber`}
                  dir="ltr"
                  className="mt-2 text-left font-mono"
                  disabled={disabled}
                  {...control.register(`cardToCardAccounts.${index}.cardNumber`)}
                />
                {accountErrors?.cardNumber ? (
                  <p className="mt-1 text-xs text-[var(--error)]">
                    {accountErrors.cardNumber.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor={`cardToCardAccounts.${index}.iban`}>شماره شبا</Label>
                <Input
                  id={`cardToCardAccounts.${index}.iban`}
                  dir="ltr"
                  className="mt-2 text-left font-mono uppercase"
                  disabled={disabled}
                  {...control.register(`cardToCardAccounts.${index}.iban`)}
                />
                {accountErrors?.iban ? (
                  <p className="mt-1 text-xs text-[var(--error)]">{accountErrors.iban.message}</p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      {errors.cardToCardAccounts?.message ? (
        <p className="text-xs text-[var(--error)]">{errors.cardToCardAccounts.message}</p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => append({ ...DEFAULT_CARD_TO_CARD_ACCOUNTS[0] })}
      >
        افزودن حساب دیگر
      </Button>
    </div>
  );
}
