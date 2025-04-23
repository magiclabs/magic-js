import { Extension } from '@magic-sdk/react-native-bare';

export class <%= className %> extends Extension.Internal<'<%= extNameCamelCase %>', any> {
  name = '<%= extNameCamelCase %>' as const;
  config: any = {};
}
