import {PullBlock} from "../types"
import {Block} from "./index"

export interface WatchBlock {
    ":block/string": string
    ":block/uid": string
    ":block/children"?: WatchBlock[]
}

/**
 * Returns disconnect/stop watching function
 *
 * Todo in order to get reactivity (including watching children getting some inefficiency now
 * 1. watching every value downstream
 * 2. re-fetching the blocks on each change vs using supplied data
 */
export const watchTree = (blockId: string, callback: (before: WatchBlock, after: Block) => void) => {
    // Retrieving after in custom fashion to comply with expected shape of data for Block class
    const wrappedCallback = (before: PullBlock, _: PullBlock) =>
        callback(before as WatchBlock, Block.fromUid(blockId)!)

    /**
     * Todo
     * Right no changes to order/open state are ignored, should I watch for them too?
     */

    const pullPattern = "[:block/children :block/string :block/uid {:block/children ...}]"
    const entityId = `[:block/uid "${blockId}"]`

    window.roamAlphaAPI
        .data
        .addPullWatch(pullPattern, entityId, wrappedCallback)

    return () =>
        window.roamAlphaAPI
            .data
            .removePullWatch(pullPattern, entityId, wrappedCallback)
}
