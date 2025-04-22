import { MagicExtension } from '@magic-sdk/commons';

export class <%= className %> extends MagicExtension<'<%= extNameCamelCase %>', any> {
  name = '<%= extNameCamelCase %>' as const;
  config: any = {};
}
