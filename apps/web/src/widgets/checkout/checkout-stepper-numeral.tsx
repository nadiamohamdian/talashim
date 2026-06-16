import type { CheckoutStep } from '@/shared/config/checkout-flow';

const STEPPER_NUMERAL_ASSETS: Record<CheckoutStep, string> = {
  1: '/images/checkout/stepper-num-1.png',
  2: '/images/checkout/stepper-num-2.png',
  3: '/images/checkout/stepper-num-3.png',
};

interface CheckoutStepperNumeralProps {
  step: CheckoutStep;
}

export function CheckoutStepperNumeral({ step }: CheckoutStepperNumeralProps) {
  return (
    <span
      className={`checkout-stepper-dot-num checkout-stepper-dot-num--${step}`}
      style={{
        maskImage: `url(${STEPPER_NUMERAL_ASSETS[step]})`,
        WebkitMaskImage: `url(${STEPPER_NUMERAL_ASSETS[step]})`,
        transform: step === 2 ? 'scaleX(-1)' : undefined,
      }}
      aria-hidden
    />
  );
}
