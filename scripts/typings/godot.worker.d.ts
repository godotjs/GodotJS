
declare module "godot.worker" {
    import { Object as GDObject } from "godot";

    class JSWorker {
        constructor(path: string);

        postMessage(message: any): void;
        terminate(): void;

        onready?: () => void;
        onmessage?: (message: any) => void;

        //TODO not implemented yet
        onerror?: (error: any) => void;

        ontransfer?: (obj: GDObject) => void;
    }

    // only available in worker scripts
    const JSWorkerParent: {
        onmessage?: (message: any) => void,
        
        close(): void,

        transfer(obj: GDObject): void,

        postMessage(message: any): void,

    } | undefined;

}
