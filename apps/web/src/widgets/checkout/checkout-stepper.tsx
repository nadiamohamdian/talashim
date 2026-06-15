import { CHECKOUT_STEPS, type CheckoutStep } from '@/shared/config/checkout-flow';
import { CheckoutStepperNumeral } from '@/widgets/checkout/checkout-stepper-numeral';

interface CheckoutStepperProps {
  activeStep: CheckoutStep;
}

export function CheckoutStepper({ activeStep }: CheckoutStepperProps) {
  return (
    <nav className="checkout-stepper" aria-label="مراحل تسویه حساب">
      <div className="checkout-stepper-track">
        {CHECKOUT_STEPS.map((step, index) => {
          const isActive = step.step === activeStep;
          const isComplete = step.step < activeStep;

          return (
            <div key={step.step} className="checkout-stepper-item">
              {index > 0 ? (
                <span
                  className={`checkout-stepper-line${
                    isComplete || isActive ? ' checkout-stepper-line--filled' : ''
                  }`}
                  aria-hidden
                />
              ) : null}
              <span
                className={`checkout-stepper-dot${
                  isActive || isComplete ? ' checkout-stepper-dot--active' : ''
                }`}
              >
                <CheckoutStepperNumeral step={step.step} />
              </span>
              <span
                className={`checkout-stepper-label${
                  isActive || isComplete ? ' checkout-stepper-label--active' : ''
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
