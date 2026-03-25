require("@testing-library/jest-dom");

/** Stable calendar math for date helpers (formatReviewDate "Today", etc.). */
process.env.TZ = "UTC";

/** jsdom has no Fetch `Response`; Next route handlers use `Response.json`. */
if (typeof globalThis.Response === "undefined") {
  class JsonResponse {
    /**
     * @param {unknown} data
     * @param {number} status
     */
    constructor(data, status) {
      this._data = data;
      this.status = status;
    }

    async json() {
      return this._data;
    }
  }

  globalThis.Response = class Response {
    /**
     * @param {unknown} data
     * @param {{ status?: number }} [init]
     */
    static json(data, init = {}) {
      const status =
        init && typeof init.status === "number" ? init.status : 200;
      return new JsonResponse(data, status);
    }
  };
}
