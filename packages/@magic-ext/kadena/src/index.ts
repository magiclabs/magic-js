import { Extension } from '@magic-sdk/commons';
import {
  UnsignedCommand,
  KadenaConfig,
  KadenaPayloadMethod,
  KadenaUserMetadata,
  SpireKeyAccount,
  SignatureWithPublicKey,
  SignedTransactions,
  OptimalTransactionsAccount,
  LoginWithSpireKeyEvents,
} from './types';
import { connect, sign } from '@kadena/spirekey-sdk';
import { addSignatures, Pact } from '@kadena/client';

export class KadenaExtension extends Extension.Internal<'kadena'> {
  name = 'kadena' as const;
  config = {};

  constructor(public kadenaConfig: KadenaConfig) {
    console.log('KadenaExtension constructor2');
    super();

    this.config = {
      chainType: 'KADENA',
      rpcUrl: kadenaConfig.rpcUrl,
      chainId: kadenaConfig.chainId,
      options: {
        networkId: kadenaConfig.networkId,
        createAccountsOnChain: Boolean(kadenaConfig.createAccountsOnChain),
      },
    };
  }

  public signTransaction(hash: string): Promise<SignatureWithPublicKey> {
    return this.request(this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaSignTransaction, [{ hash }]));
  }

  public async signTransactionWithSpireKey(
    transaction: UnsignedCommand,
    accounts?: OptimalTransactionsAccount[],
  ): Promise<SignedTransactions> {
    const signedTransaction = await this.request(
      this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaSignTransactionWithSpireKey, [
        { transaction, accounts: accounts || undefined },
      ]),
    );
    return signedTransaction;
  }

  public async loginWithSpireKey(): Promise<SpireKeyAccount> {
    const promiEvent = this.utils.createPromiEvent<SpireKeyAccount, LoginWithSpireKeyEvents>(
      async (resolve, reject) => {
        try {
          console.log('1. SDK loginWithSpireKey');
          // 1. Sdk sends rpc request to iframe
          // CONTINUE IN SPIREKEY - choose an account
          const requestPayload = this.utils.createJsonRpcRequestPayload(
            KadenaPayloadMethod.KadenaLoginWithSpireKey,
            [],
          );
          const loginRequest = this.request<SpireKeyAccount, any>(requestPayload);

          // 2. ----- Iframe starts listening for a `spirekey-connected` event

          // 3. Sdk triggers spirekey `connect()`
          const connectedAccount = await connect((this.config as any).options.networkId, (this.config as any).chainId);
          console.log('3. SDK connectedAccount', connectedAccount);

          // 5. Sdk emits `spirekey-connected` event to iframe
          this.createIntermediaryEvent(
            // @ts-ignore
            'spirekey-connected',
            requestPayload.id as string,
          )(JSON.stringify(connectedAccount));

          // 4. Sdk listens for `login-signature-prompt` event
          loginRequest.on('login-signature-prompt', async (challenge: string) => {
            console.log('4. SDK payload on login-signature-prompt', challenge);
            // 8. Sdk triggers spirekey `sign(url, account, challenge)`
            const transaction = Pact.builder
              .execution(
                (Pact.modules as any)['n_aaf06a1ea6bb83b56abb6d37362ac1b05a91409a']['login'](
                  window.location.origin,
                  connectedAccount.accountName,
                  challenge,
                ),
              )
              .addSigner(
                {
                  pubKey: connectedAccount.devices[0].guard.keys[0],
                  scheme: 'WebAuthn',
                },
                signFor => [
                  signFor(
                    `n_aaf06a1ea6bb83b56abb6d37362ac1b05a91409a.LOGIN`,
                    window.location.origin,
                    connectedAccount.accountName,
                    challenge,
                  ),
                ],
              )
              .setMeta({
                chainId: (this.config as any).chainId,
                senderAccount: connectedAccount.accountName,
              })
              .setNetworkId((this.config as any).options.networkId)
              .createTransaction();
            console.log('transaction', transaction);

            // const button = document.createElement('button');
            // button.id = `popup-trigger`;
            // button.style.cssText = 'position:fixed; top:-100px; pointer-events:none;';
            // document.body.appendChild(button);
            // console.log('about to click button');
            // button.onclick = async () => await sign(transaction, [connectedAccount]);
            // button.click();

            const signature = await sign(transaction, [connectedAccount]);
            console.log('8. SDK signature', signature);
            const signedTransaction = addSignatures(transaction, ...signature.transactions[0].sigs);
            // 9. Sdk emits `login-signature` event to iframe with signature
            // @ts-ignore
            this.createIntermediaryEvent('login-signature', requestPayload.id as string)(signedTransaction);
          });

          // (user connects to spirekey)

          // CONNECTED

          // 6. ----- Iframe calls `/challenge` endpoint

          // CONTINUE IN SPIREKEY - approve the request

          // 7. ----- Iframe listens for `login-signature` event

          // 7. ----- Iframe emits `login-signature-prompt` event with challenge

          // CONFIRMING LOGIN...

          // ----- 10. Iframe calls `/verify` endpoint with signature

          // CONNECTED

          // ----- 11. Iframe persists auth state

          // 12. Iframe resolves request
          console.log('awaiting loginRequest');
          await loginRequest;
          // 13. Sdk returns `connect()` response
          console.log('resolving connectedAccount');
          resolve(connectedAccount);
        } catch (error) {
          console.log('EEEE', error);
          reject(error);
        }
      },
    );
    return promiEvent;
  }

  public getUserInfo(): Promise<KadenaUserMetadata> {
    const requestPayload = this.utils.createJsonRpcRequestPayload(KadenaPayloadMethod.KadenaGetUserInfo, []);
    return this.request<KadenaUserMetadata>(requestPayload);
  }
}
