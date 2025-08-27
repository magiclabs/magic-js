import { Extension } from '@magic-sdk/provider';

export class <%= className %> extends Extension.Internal<'<%= extNameCamelCase %>', any> {
  name = '<%= extNameCamelCase %>' as const;
  config: any = {};
}
