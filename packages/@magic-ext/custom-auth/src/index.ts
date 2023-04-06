import { Extension } from '@magic-sdk/commons';

export class CustomAuth extends Extension.Internal<'customAuth', any> {
  name = 'customAuth' as const;
  config: any = {};
}
