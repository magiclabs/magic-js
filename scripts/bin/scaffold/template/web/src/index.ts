import { MagicExtension } from 'magic-sdk';

export class <%= className %> extends MagicExtension<'<%= extNameCamelCase %>', any> {
  name = '<%= extNameCamelCase %>' as const;
  config: any = {};
}
