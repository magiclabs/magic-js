import { MagicExtension } from '@magic-sdk/react-native-bare';

export class <%= className %> extends MagicExtension<'<%= extNameCamelCase %>', any> {
  name = '<%= extNameCamelCase %>' as const;
  config: any = {};
}
