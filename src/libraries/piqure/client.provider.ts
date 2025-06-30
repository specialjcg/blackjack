'use client';

import { ReactNode } from 'react';
import { InjectionKey } from 'piqure/src/Providing';
import { provideLazy } from './index';

export const ClientProvider = <TBind, TTo extends TBind>({
  bind,
  to,
  children
}: {
  bind: InjectionKey<TBind>;
  to: TTo;
  children: ReactNode;
}) => {
  provideLazy(bind, () => to);
  return children;
};
