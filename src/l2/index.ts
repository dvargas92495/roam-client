import {RawRoamBlock, RawRoamPage, RoamNode} from "../raw-types"
import {Navigation} from "./common/navigation"

export const Roam = {
    query(query: string, ...params: any[]): any[] {
        return window.roamAlphaAPI.q(query, ...params)
    },
    pull(id: number | string, selector = "[*]"): RawRoamPage | RawRoamBlock | null {
        if (!id) {
            console.log("bad id")
            return null
        }
        //@ts-ignore TODO reconcile types
        return window.roamAlphaAPI.pull(selector, id)
    },
    queryFirst(query: string, ...params: any[]) {
        const results = this.query(query, ...params)
        if (!results?.[0] || results?.[0].lenght < 1) return null

        return this.pull(results[0][0])
    },

    listPageIds() {
        return this.query("[:find ?page :where [?page :node/title ?title] [?page :block/uid ?uid]]").flat()
    },

    listPages(): RawRoamPage[] {
        return this.listPageIds().map((dbId: number) => this.pull(dbId)!)
    },

    getUid(node: RoamNode) {
        return this.pull(node[":db/id"])?.[":block/uid"]
    },
}

export abstract class RoamEntity {
    constructor(readonly rawEntity: RawRoamBlock | RawRoamPage) {
        return new Proxy(this, {
            /**
             * The desired effect is to be able to get child blocks either by content or by order
             * block[number] would give you children by order (block[0] is a first child)
             * block.content or block["content"] would give you a child by content
             *
             * Todo potentially allow accessing the roam attributes without having to specify `::` at the end
             * Todo can i support regex selectors? - maybe. would require custom parsing though, everythign I get is a string =\
             */
            get: (origin, property: keyof RoamEntity | string) => {

                const idx = parseInt(property)
                if (Number.isInteger(idx)) return this.children?.[idx]

                if (property in origin) {
                    return origin[property as keyof RoamEntity]
                } else {
                    //todo check for regex stuff explicitly
                    return this.child(property) ||
                        this.childrenMatching(new RegExp(`^${property}::`))?.[0] ||
                        this.childrenMatching(new RegExp(property))
                }
            },
        })
    }

    abstract get text(): string

    get rawChildren(): RawRoamBlock[] | undefined {
        const children = this.rawEntity[":block/children"]?.map(it => Roam.pull(it[":db/id"])) as RawRoamBlock[]
        /**
         * Sorted because the order of the children returned is ~arbitrary
         */
        return children?.sort((a, b) => a[":block/order"]! - b[":block/order"]!)
    }

    get children(): Block[] | undefined {
        return this.rawChildren?.map(it => new Block(it))
    }

    get uid(): string {
        return this.rawEntity[":block/uid"]
    }

    get url(): string {
        return Navigation.urlForUid(this.uid)
    }

    child(content: string) {
        return this.children?.find(it => it.text === content)
    }

    childrenMatching(regex: RegExp) {
        const result = this.children?.filter(it => regex.test(it.text))
        return result?.length ? result : null
    }

    get linkedEntities(): (RawRoamPage | RawRoamBlock | null)[] | undefined {
        // todo this has a mix of entities, it's not clear what this should return 🤔
        // either figure out if it's a page or block and create & return a mixed array
        // or have to 2 separate methods - one for block and one for pages
        return this.rawEntity[":block/refs"]?.map(it => Roam.pull(it[":db/id"]))
    }
}

export class Page extends RoamEntity {
    constructor(readonly rawPage: RawRoamPage) {
        super(rawPage)
    }

    static fromName(name: string) {
        const rawPage = Roam.queryFirst("[:find ?e :in $ ?a :where [?e :node/title ?a]]", name)
        return rawPage ? new Page(rawPage) : null
    }

    get text(): string {
        return this.rawPage[":node/title"]
    }

    set text(value: string) {
        window.roamAlphaAPI.updatePage({
            page: {
                uid: this.uid,
                title: value
            }
        })
    }
}

export class Block extends RoamEntity {
    constructor(readonly rawBlock: RawRoamBlock) {
        super(rawBlock)
    }

    static fromUid(uid: string) {
        //todo support things wrapped in parens
        const rawBlock = Roam.queryFirst('[:find ?e :in $ ?a :where [?e :block/uid ?a]]', uid)
        return rawBlock ? new Block(rawBlock as RawRoamBlock) : null
    }

    get text(): string {
        return this.rawBlock[":block/string"]
    }

    set text(value: string) {
        window.roamAlphaAPI.updateBlock({
            block: {
                uid: this.uid,
                string: value
            }
        })
    }

    /**
     * Attribute value is weird - can be any of the children or the same-line value
     */
    get attributeValue(): string | undefined {
        return this.text.split("::")[1]?.trim()
    }
}
