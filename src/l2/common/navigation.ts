import { getPageTitleByPageUid } from "../../queries"

export const Navigation = {
  get currentPageUid() {
    const parts = new URL(window.location.href).hash.split("/")
    return parts[parts.length - 1]
  },

  get currentPageName() {
    return getPageTitleByPageUid(this.currentPageUid)
  },

  get currentUrl() {
    return new URL(window.location.href)
  },

  get baseUrl() {
    // https://roamresearch.com/#/app/roam-toolkit/page/03-24-2020
    const url = this.currentUrl
    const parts = url.hash.split("/")

    url.hash = parts.slice(0, 3).join("/")
    return url
  },

  get basePageUrl() {
    const url = this.baseUrl
    url.hash = url.hash.concat("/page")
    return url
  },

  urlForUid(uid: string) {
    return this.basePageUrl.toString() + "/" + uid
  },

  goToUid(uid: string) {
    window.location.href = this.urlForUid(uid)
  },
}
