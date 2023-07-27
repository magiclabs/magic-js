import {
    Client,
    AccountBalanceQuery,
    AccountInfoQuery,
    AccountRecordsQuery,
    TransactionReceiptQuery,
} from "@hashgraph/sdk";

export class MagicProvider {
    constructor(hedera_network) {
        if (!hedera_network) {
            throw new Error(
                "LocalProvider requires the `HEDERA_NETWORK` environment variable to be set"
            );
        }

        this._client = Client.forName(hedera_network);
    }

    /**
     * @returns {LedgerId?}
     */
    getLedgerId() {
        return this._client.ledgerId;
    }

    /**
     * @returns {{[key: string]: (string | AccountId)}}
     */
    getNetwork() {
        return this._client.network;
    }

    /**
     * @returns {string[]}
     */
    getMirrorNetwork() {
        return this._client.mirrorNetwork;
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {Promise<AccountBalance>}
     */
    getAccountBalance(accountId) {
        return new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(this._client);
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {Promise<AccountInfo>}
     */
    getAccountInfo(accountId) {
        return new AccountInfoQuery()
            .setAccountId(accountId)
            .execute(this._client);
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {Promise<TransactionRecord[]>}
     */
    getAccountRecords(accountId) {
        return new AccountRecordsQuery()
            .setAccountId(accountId)
            .execute(this._client);
    }

    /**
     * @param {TransactionId | string} transactionId
     * @returns {Promise<TransactionReceipt>}
     */
    getTransactionReceipt(transactionId) {
        return new TransactionReceiptQuery()
            .setTransactionId(transactionId)
            .execute(this._client);
    }

    /**
     * @param {TransactionResponse} response
     * @returns {Promise<TransactionReceipt>}
     */
    waitForReceipt(response) {
        return new TransactionReceiptQuery()
            .setNodeAccountIds([response.nodeId])
            .setTransactionId(response.transactionId)
            .execute(this._client);
    }

    /**
     * @template RequestT
     * @template ResponseT
     * @template OutputT
     * @param {Executable<RequestT, ResponseT, OutputT>} request
     * @returns {Promise<OutputT>}
     */
    call(request) {
        return request.execute(this._client);
    }
}