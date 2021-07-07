export type RoamNode = { ":db/id": number }
export type RawViewType = ":bullet" | ":document" | ":numbered"
/**
 * looks like [ ":block/uid", "2PQN2a7g8" ] irl
 */
export type RawAttrKeyValue = string[]

export interface RawAttrReferenceKeyValue {
  ":source": RawAttrKeyValue
  ":value": RawAttrKeyValue
}

export interface RawBlockProps {
  ":slider": any
  ":image-size": any
  ":encryption": any
  ":POMO": any
  ":diagram": any
}

export interface RawRoamPage extends RoamNode {
  ":attrs/lookup"?: RoamNode[]
  ":block/children": RoamNode[]
  ":block/open"?: boolean
  ":block/refs"?: RoamNode[]
  ":block/uid": string
  ":children/view-type"?: RawViewType
  ":create/time": number
  ":create/user": RoamNode
  ":edit/seen-by": RoamNode[]
  ":edit/time": number
  ":edit/user": RoamNode
  ":entity/attrs"?: RawAttrReferenceKeyValue
  ":log/id"?: number
  ":node/title": string
  /**
   * TODO: need more examples. one I have is { ":public": "readonly" }
   */
  ":page/permissions": any
  ":page/sidebar"?: number
}

export interface RawRoamBlock extends RoamNode {
  ":attrs/lookup"?: RoamNode[]
  ":block/children": RoamNode[]
  ":block/open"?: boolean
  ":block/refs"?: RoamNode[]
  ":block/uid": string
  ":children/view-type"?: RawViewType
  ":create/time": number
  ":create/user": RoamNode
  ":edit/seen-by": RoamNode[]
  ":edit/time": number
  ":edit/user": RoamNode
  ":entity/attrs"?: RawAttrReferenceKeyValue
  ":log/id"?: number
  ":node/title": string
  /**
   * TODO: need more examples. one I have is { ":public": "readonly" }
   */
  ":page/permissions": any
  ":page/sidebar"?: number

  ":block/heading"?: 0 | 1 | 2 | 3
  ":block/order"?: number
  ":block/page": RoamNode
  ":block/parents"?: RoamNode[]
  ":block/props"?: RawBlockProps
  ":block/string": string
  ":block/text-align"?: "left" | "center" | "right" | "justify"
  ":create/email"?: string
  ":ent/emojis": any[]
  ":vc/blocks"?: RoamNode[]

}

export interface RawUser extends RoamNode {
  ":user/color": string
  ":user/display-name": string
  ":user/email": string
  ":user/photo-url": string
  ":user/settings": any
  ":user/uid": string
  ":block/uid": string
}

export interface RawPageFilter extends RoamNode {
  ":window/filters": string
  ":window/id": string
  ":block/uid": string
}
