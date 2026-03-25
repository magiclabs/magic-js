import { Linking } from 'react-native';
import { openInBrowser } from '../../../src/lib/links';

const mockCanOpenURL = Linking.canOpenURL as jest.Mock;
const mockOpenURL = Linking.openURL as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('openInBrowser', () => {
  it('calls Linking.openURL when the URL is supported', async () => {
    const url = 'https://magic.link';
    mockCanOpenURL.mockResolvedValue(true);
    mockOpenURL.mockResolvedValue(undefined);

    await openInBrowser(url);

    expect(mockCanOpenURL).toHaveBeenCalledWith(url);
    expect(mockOpenURL).toHaveBeenCalledWith(url);
  });

  it('does not call Linking.openURL when the URL is not supported', async () => {
    const url = 'unsupported://scheme';
    mockCanOpenURL.mockResolvedValue(false);

    await openInBrowser(url);

    expect(mockCanOpenURL).toHaveBeenCalledWith(url);
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  it('logs a warning when the URL is not supported', async () => {
    const url = 'unsupported://scheme';
    mockCanOpenURL.mockResolvedValue(false);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await openInBrowser(url);

    expect(warnSpy).toHaveBeenCalledWith(`Cannot open URL: ${url}`);
  });
});
