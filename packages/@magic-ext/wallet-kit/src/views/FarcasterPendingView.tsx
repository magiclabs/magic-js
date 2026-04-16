import React, { useEffect, useState } from 'react';
import { QRCode, Text, Skeleton, Button, IcoCopy, IcoCheckmark } from '@magiclabs/ui-components';
import { WidgetAction, WidgetState } from '../reducer';
import { useFarcasterLogin } from '../hooks/useFarcasterLogin';
import WidgetHeader from '../components/WidgetHeader';
import { Center, VStack } from '../components/Stack';
import { FARCASTER_BRAND_COLOR, FARCASTER_LOGO_URL } from '../constants';
import { copyToClipboard } from '../utils/copy';

interface FarcasterPendingViewProps {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
}

export const FarcasterPendingView = ({ state, dispatch }: FarcasterPendingViewProps) => {
  const { startFarcasterLogin, cancel } = useFarcasterLogin(dispatch);
  const [copied, setCopied] = useState(false);
  const { farcasterUrl } = state;

  useEffect(() => {
    startFarcasterLogin();
  }, []);

  const handleCopyLink = async () => {
    if (!farcasterUrl) return;
    await copyToClipboard(farcasterUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <WidgetHeader onPressBack={cancel} showHeaderText={false} />
      <VStack className="gap-6 pt-4 items-center">
        {farcasterUrl ? (
          <QRCode
            eyeRadius={8}
            value={farcasterUrl}
            qrStyle="dots"
            size={262}
            eyeColor={FARCASTER_BRAND_COLOR}
            logoImage={FARCASTER_LOGO_URL}
            logoHeight={52}
            logoWidth={52}
            logoPadding={12}
            style={{ borderRadius: 16 }}
            quietZone={12}
          />
        ) : (
          <Center className="w-[294px] h-[294px]">
            <Skeleton width={286} height={286} borderRadius={16} backgroundColor="surface.secondary" />
          </Center>
        )}
        <VStack className="gap-2 items-center px-7">
          <Text.H4 styles={{ textAlign: 'center' }}>Sign in with Farcaster</Text.H4>
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center' }}>
            Scan the QR code with your phone or enter the link on a mobile browser
          </Text>
        </VStack>
        {farcasterUrl && (
          <Button variant="neutral" size="sm" onPress={handleCopyLink} label={copied ? 'Copied!' : 'Copy link'}>
            <Button.LeadingIcon>{copied ? <IcoCheckmark /> : <IcoCopy />}</Button.LeadingIcon>
          </Button>
        )}
      </VStack>
    </>
  );
};
