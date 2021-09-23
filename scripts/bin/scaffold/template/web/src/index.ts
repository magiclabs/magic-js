import { Extension } from 'magic-sdk';

export class <%= className %> extends Extension.Internal<'<%= extNameCamelCase %>', any> {
  name = '<%= extNameCamelCase %>' as const;
  config: any = {};
}
