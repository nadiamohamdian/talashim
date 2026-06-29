import {
  ORDER_TRACKING_STEPS,
  type OrderTrackingStage,
} from '@/shared/config/checkout-flow';

interface OrderTrackingStepperProps {
  completedIndex: number;
  activeIndex?: number;
}

function TrackingCheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 6l2.5 2.5 5-5"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OrderTrackingStepper({
  completedIndex,
  activeIndex = completedIndex,
}: OrderTrackingStepperProps) {
  return (
    <nav className="order-tracking-stepper" aria-label="مراحل سفارش">
      <div className="order-tracking-stepper-track">
        {ORDER_TRACKING_STEPS.map((step, index) => {
          const isCompleted = index <= completedIndex;
          const isActive = index === activeIndex;

          return (
            <div key={step.id} className="order-tracking-stepper-item">
              {index > 0 ? (
                <span
                  className={`order-tracking-stepper-line${
                    index <= completedIndex ? ' order-tracking-stepper-line--filled' : ''
                  }`}
                  aria-hidden
                />
              ) : null}
              <span
                className={[
                  'order-tracking-stepper-dot',
                  isCompleted ? 'order-tracking-stepper-dot--completed' : '',
                  isActive && !isCompleted ? 'order-tracking-stepper-dot--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? <TrackingCheckIcon /> : null}
              </span>
              <span className="order-tracking-stepper-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export function getOrderTrackingStatusLabel(stage: OrderTrackingStage): string {
  return ORDER_TRACKING_STEPS.find((step) => step.id === stage)?.label ?? 'ثبت سفارش';
}
