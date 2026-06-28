import type { CardToCardAccount } from '@sadafgold/shared';

interface CheckoutCardInfoProps {
  accounts: CardToCardAccount[];
  className?: string;
}

export function CheckoutCardInfo({ accounts, className = '' }: CheckoutCardInfoProps) {
  return (
    <div className={`checkout-card-info-list${className ? ` ${className}` : ''}`}>
      {accounts.map((account, index) => (
        <div
          key={`${account.cardNumber}-${account.iban}-${index}`}
          className="checkout-card-info"
        >
          {accounts.length > 1 ? (
            <p className="checkout-card-info-heading">حساب {index + 1}</p>
          ) : null}
          <p>
            <span>بانک:</span> {account.bankName}
          </p>
          <p>
            <span>به نام:</span> {account.accountHolder}
          </p>
          <p>
            <span>کارت:</span> {account.cardNumber}
          </p>
          <p>
            <span>شبا:</span> {account.iban}
          </p>
        </div>
      ))}
    </div>
  );
}
