import { Extension } from '@magic-sdk/react-native-expo';

export class <%= className %> extends Extension.Internal<'<%= extNameCamelCase %>', any> {
  name = '<%= extNameCamelCase %>' as const;
  config: any = {};
}
