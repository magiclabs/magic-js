import ora from 'ora';

type CatchFn<TResult = never> = (reason: any) => TResult | PromiseLike<TResult>;

/**
 * Used to handle errors that occur during script execution.
 *
 * Optionally accepts an Ora spinner instance, which will be set to a failed
 * state with the given `message`. Otherwise, the message is logged to
 * `process.stderr` and the process exits with a non-zero exit code.
 */
export function handleError<TResult = never>(spinner?: ora.Ora, message?: string): CatchFn<TResult>;
export function handleError<TResult = never>(message?: string): CatchFn<TResult>;
export function handleError<TResult = never>(messageOrSpinner?: ora.Ora | string, message?: string): CatchFn<TResult> {
  return (err: any) => {
    if (messageOrSpinner) {
      if (typeof messageOrSpinner === 'string') {
        console.error(messageOrSpinner);
      } else {
        messageOrSpinner.fail(message);
      }
    }

    if (err) console.error(err);
    process.exit(1);
  };
}
