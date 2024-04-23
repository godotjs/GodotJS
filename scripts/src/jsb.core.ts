
/**
 *
 */
export function signal(target: any, key: string) {
    jsb.internal.add_script_signal(target, key);
}
