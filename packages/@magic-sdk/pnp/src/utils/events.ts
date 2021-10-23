import type { PNPMagicInstance } from './magic-instance';

export function dispatchReadyEvent(magic: PNPMagicInstance, data: any = {}) {
  const evt = new CustomEvent('@magic/ready', { detail: { magic, ...data } });
  window.dispatchEvent(evt);
}
