import {
    PrivateKey,
    AccountId,
    SignerSignature,
    AccountBalanceQuery,
    AccountInfoQuery,
    AccountRecordsQuery,
    TransactionId,
    PublicKey,
} from "@hashgraph/sdk";
import { shuffle } from '../dist/types'

/**
 * @implements {Signer}
 */
export class MagicWallet {
    /**
     * @param {AccountId | string} accountId
     * @param {Provider=} provider
     * @param {String} publicKey
     * @param {function} magicSign
     * @param {function} signer
     */
    constructor(accountId, provider, publicKey, magicSign, signer) {
    this.publicKey = PublicKey.fromString(publicKey);

    /**
     * @type {(message: Uint8Array) => Promise<Uint8Array>}
     */
    this.signer = magicSign;
    this.provider = provider;
    this.accountId = typeof accountId === 'string' ? AccountId.fromString(accountId) : accountId;
}

    /**
     * @returns {Promise<Wallet>}
     */
    static createRandomED25519() {
        const privateKey = PrivateKey.generateED25519();
        const publicKey = privateKey.publicKey;
        const accountId = publicKey.toAccountId(0, 0);
        return Promise.resolve(new Wallet(accountId, privateKey));
    }

    /**
     * @returns {Promise<Wallet>}
     */
    static createRandomECDSA() {
        const privateKey = PrivateKey.generateECDSA();
        const publicKey = privateKey.publicKey;
        const accountId = publicKey.toAccountId(0, 0);
        return Promise.resolve(new Wallet(accountId, privateKey));
    }

    /**
     * @returns {Provider=}
     */
    getProvider() {
        return this.provider;
    }

    /**
     * @abstract
     * @returns {AccountId}
     */
    getAccountId() {
        return this.accountId;
    }

    /**
     * @returns {Key}
     */
    getAccountKey() {
        return this.publicKey;
    }

    /**
     * @returns {LedgerId?}
     */
    getLedgerId() {
        return this.provider == null ? null : this.provider.getLedgerId();
    }

    /**
     * @abstract
     * @returns {{[key: string]: (string | AccountId)}}
     */
    getNetwork() {
        return this.provider == null ? {} : this.provider.getNetwork();
    }

    /**
     * @abstract
     * @returns {string[]}
     */
    getMirrorNetwork() {
        return this.provider == null ? [] : this.provider.getMirrorNetwork();
    }

    /**
     * @param {Uint8Array[]} messages
     * @returns {Promise<SignerSignature[]>}
     */
    async sign(messages) {
        const sigantures = [];

        for (const message of messages) {
            sigantures.push(
                new SignerSignature({
                    publicKey: this.publicKey,
                    signature: await this.signer(message),
                    accountId: this.accountId,
                })
            );
        }

        return sigantures;
    }

    /**
     * @returns {Promise<AccountBalance>}
     */
    getAccountBalance() {
        return this.call(
            new AccountBalanceQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @abstract
     * @returns {Promise<AccountInfo>}
     */
    getAccountInfo() {
        return this.call(new AccountInfoQuery().setAccountId(this.accountId));
    }

    /**
     * @abstract
     * @returns {Promise<TransactionRecord[]>}
     */
    getAccountRecords() {
        return this.call(
            new AccountRecordsQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @template {Transaction} T
     * @param {T} transaction
     * @returns {Promise<T>}
     */
    signTransaction(transaction) {
        return transaction.signWith(this.publicKey, this.signer);
    }

    /**
     * @template {Transaction} T
     * @param {T} transaction
     * @returns {Promise<T>}
     */
    checkTransaction(transaction) {
        const transactionId = transaction.transactionId;
        if (
            transactionId != null &&
            transactionId.accountId != null &&
            transactionId.accountId.compare(this.accountId) != 0
        ) {
            throw new Error(
                "transaction's ID constructed with a different account ID"
            );
        }

        if (this.provider == null) {
            return Promise.resolve(transaction);
        }

        const nodeAccountIds = (
            transaction.nodeAccountIds != null ? transaction.nodeAccountIds : []
        ).map((nodeAccountId) => nodeAccountId.toString());
        const network = Object.values(this.provider.getNetwork()).map(
            (nodeAccountId) => nodeAccountId.toString()
        );

        if (
            !nodeAccountIds.reduce(
                (previous, current) => previous && network.includes(current),
                true
            )
        ) {
            throw new Error(
                "Transaction already set node account IDs to values not within the current network"
            );
        }

        return Promise.resolve(transaction);
    }

    /**
     * @template {Transaction} T
     * @param {T} transaction
     * @returns {Promise<T>}
     */
    populateTransaction(transaction) {
        transaction._freezeWithAccountId(this.accountId);

        if (transaction.transactionId == null) {
            transaction.setTransactionId(
                TransactionId.generate(this.accountId)
            );
        }

        if (
            transaction.nodeAccountIds != null &&
            transaction.nodeAccountIds.length != 0
        ) {
            return Promise.resolve(transaction.freeze());
        }

        if (this.provider == null) {
            return Promise.resolve(transaction);
        }

        const nodeAccountIds = Object.values(this.provider.getNetwork()).map(
            (id) => (typeof id === "string" ? AccountId.fromString(id) : id)
        );
        shuffle(nodeAccountIds);
        transaction.setNodeAccountIds(
            nodeAccountIds.slice(0, (nodeAccountIds.length + 3 - 1) / 3)
        );

        return Promise.resolve(transaction.freeze());
    }

    /**
     * @template RequestT
     * @template ResponseT
     * @template OutputT
     * @param {Executable<RequestT, ResponseT, OutputT>} request
     * @returns {Promise<OutputT>}
     */
    call(request) {
        if (this.provider == null) {
            throw new Error(
                "cannot send request with an wallet that doesn't contain a provider"
            );
        }

        return this.provider.call(
            request._setOperatorWith(
                this.accountId,
                this.publicKey,
                this.signer
            )
        );
    }
}