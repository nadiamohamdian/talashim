'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from '@/shared/ui/icons';

interface AccountLogoutDialogProps {
  open: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AccountLogoutDialog({
  open,
  isPending = false,
  onClose,
  onConfirm,
}: AccountLogoutDialogProps) {
  const [mounted, setMounted] = useState(false);

  const handleClose = useCallback(() => {
    if (isPending) {
      return;
    }
    onClose();
  }, [isPending, onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, handleClose]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="account-logout-dialog-root">
      <button
        type="button"
        className="account-logout-dialog-overlay"
        aria-label="بستن"
        disabled={isPending}
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-logout-dialog-title"
        aria-describedby="account-logout-dialog-description"
        className="account-logout-dialog"
      >
        <button
          type="button"
          className="account-logout-dialog-close"
          aria-label="بستن"
          disabled={isPending}
          onClick={handleClose}
        >
          <IconClose className="account-logout-dialog-close-icon" />
        </button>

        <div className="account-logout-dialog-content">
          <h2 id="account-logout-dialog-title" className="account-logout-dialog-title">
            خروج از حساب کاربری
          </h2>
          <p id="account-logout-dialog-description" className="account-logout-dialog-message">
            آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
          </p>

          <div className="account-logout-dialog-actions">
            <button
              type="button"
              className="account-logout-dialog-btn account-logout-dialog-btn--confirm"
              disabled={isPending}
              onClick={onConfirm}
            >
              {isPending ? 'در حال خروج...' : 'خروج'}
            </button>
            <button
              type="button"
              className="account-logout-dialog-btn account-logout-dialog-btn--cancel"
              disabled={isPending}
              onClick={handleClose}
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
