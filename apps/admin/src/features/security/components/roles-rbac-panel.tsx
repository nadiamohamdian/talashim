'use client';

import { useState } from 'react';
import { SecurityPageShell } from './security-page-shell';
import { RolesAssignmentContent } from './roles-management-panel';
import { PermissionsMatrixContent, usePermissionsEditor } from './permissions-panel';

type RbacTab = 'assignment' | 'matrix';

const tabClass = (active: boolean) =>
  `rounded-xl px-4 py-2 text-sm font-medium transition ${
    active
      ? 'bg-stone-900 text-white shadow-sm'
      : 'bg-white text-stone-600 ring-1 ring-border hover:bg-nude-50'
  }`;

export function RolesRbacPanel() {
  const [tab, setTab] = useState<RbacTab>('assignment');
  const permissionsEditor = usePermissionsEditor();

  return (
    <SecurityPageShell
      routeId="security.roles"
      actions={tab === 'matrix' ? permissionsEditor.headerActions : undefined}
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={tabClass(tab === 'assignment')}
          onClick={() => setTab('assignment')}
        >
          تخصیص نقش
        </button>
        <button
          type="button"
          className={tabClass(tab === 'matrix')}
          onClick={() => setTab('matrix')}
        >
          ماتریس دسترسی
        </button>
      </div>

      {tab === 'assignment' ? (
        <RolesAssignmentContent />
      ) : (
        <PermissionsMatrixContent editor={permissionsEditor} />
      )}
    </SecurityPageShell>
  );
}
