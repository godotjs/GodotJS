declare module "godot.worker" {
    import { GAny, GArray, Object as GObject } from "godot";

    class JSWorker {
        constructor(path: string);

        postMessage(message: any, transfer?: GArray | ReadonlyArray<NonNullable<GAny>>): void;
        terminate(): void;

        onready?: () => void;
        onmessage?: (message: any) => void;

        //TODO not implemented yet
        onerror?: (error: any) => void;

        /**
         * @deprecated Use onmessage to receive messages sent from postMessage() with transfers included.
         * @param obj
         */
        ontransfer?: (obj: GObject) => void;
    }

    // only available in worker scripts
    const JSWorkerParent:
        | {
              onmessage?: (message: any) => void;

              close(): void;

              /**
               * @deprecated Use the transfer parameter of postMessage instead.
               * @param obj
               */
              transfer(obj: GObject): void;

              postMessage(message: any, transfer?: GArray | ReadonlyArray<NonNullable<GAny>>): void;
          }
        | undefined;
}
