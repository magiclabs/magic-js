import { Extension } from '@magic-sdk/commons';

export class <%= className %> extends Extension.Internal<'<%= extNameCamelCase %>', any> {
  name = '<%= extNameCamelCase %>' as const;
  config: any = {};
}
