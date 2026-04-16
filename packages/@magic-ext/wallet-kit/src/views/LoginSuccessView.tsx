import React, { useMemo } from 'react';
import { Text, IcoCheckmarkCircleFill } from '@magiclabs/ui-components';
import { WidgetState } from '../reducer';
import WidgetHeader from '../components/WidgetHeader';
import { VStack } from '../components/Stack';
import parsePhoneNumber from 'libphonenumber-js';

interface LoginSuccessViewProps {
  state: WidgetState;
}

export const LoginSuccessView = ({ state }: LoginSuccessViewProps) => {
  const { identifier, loginMethod } = state;

  const isSms = loginMethod === 'sms';

  const formattedIdentifier = useMemo(() => {
    if (!identifier || !isSms) return identifier;
    try {
      const phoneNumber = parsePhoneNumber(identifier);
      return phoneNumber ? phoneNumber.formatInternational() : identifier;
    } catch {
      return identifier;
    }
  }, [identifier, isSms]);

  return (
    <>
      <WidgetHeader showHeaderText={false} />
      <VStack className="gap-8">
        <IcoCheckmarkCircleFill width={40} height={40} color="var(--color-brand-base)" />

        <VStack className="gap-1">
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            You have successfully logged in
          </Text>
          {identifier && (
            <Text fontWeight="semibold" styles={{ textAlign: 'center' }}>
              {formattedIdentifier}
            </Text>
          )}
        </VStack>
      </VStack>
    </>
  );
};
