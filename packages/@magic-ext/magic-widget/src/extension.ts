import { Extension } from '@magic-sdk/provider';

export class MagicWidgetExtension extends Extension.Internal<'magicWidget'> {
  name = 'magicWidget' as const;
  config = {};

  constructor() {
    super();
  }
}

