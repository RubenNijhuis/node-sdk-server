// src/util/createUrlFromDomain.ts
var createUrlFromDomain = (domain) => {
  if (!domain.startsWith("http")) {
    domain = `https://${domain}`;
  }
  return domain;
};

// src/util/error.ts
var ErrorType = {
  MISSING_CONFIG_KEY: {
    type: "CONFIGURATION_ERROR",
    message: "Missing required configuration key"
  },
  INVALID_INPUT: {
    type: "INPUT_ERROR",
    message: "Invalid input provided"
  },
  INVALID_RESPONSE: {
    type: "RESPONSE_ERROR",
    message: "Invalid response received"
  },
  NETWORK_ERROR: {
    type: "NETWORK_ERROR",
    message: "Network error occurred"
  },
  API_ERROR: {
    type: "API_ERROR",
    message: "API error occurred"
  },
  UNKNOWN_ERROR: {
    type: "UNKNOWN_ERROR",
    message: "An unknown error occurred"
  }
};
var Warnings = {
  BROWSER_USAGE_WARNING: "WARNING The Pay NodeJS Client is not intended for use in the browser and may not work as expected. In case you do use it make sure that any secrets like the Service Secret are not exposed. If these get exposed get in contact with us as soon as possible to protect your account.",
  DYNAMIC_TGU_WARNING: "WARNING The Pay NodeJS Client is configured with dynamic TGU switching. In case you want to manually set the TGU turn off the dynamicTGU flag in the configuration. As with every Service Get Config call the active TGU will be dynamically set. Overriding any manual set TGU.",
  TGU_NOT_IN_LIST_WARNING: "WARNING The selected TGU is not in the list of available TGUs. Make sure that before setting a TGU you retrieve the list from the TGU List in the Config object of your client or the Service Get Config call response.",
  TGU_LIST_NOT_SET_WARNING: "WARNING The TGU List is not set in the configuration. Make sure to retrieve the list from the TGU List in the Config object of your client or the Service Get Config call response. The TGU List will also be populated upon creating an order."
};
var CreateWarning = (warningKey, surpressWarning) => {
  if (surpressWarning) return;
  console.warn(Warnings[warningKey]);
};
var PayClientError = class extends Error {
  errorType;
  constructor(errorKey, details) {
    const errorType = ErrorType[errorKey];
    const message = `${errorType.message}${details ? `: ${details}` : ""}`;
    super(message);
    this.errorType = errorType.type;
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var isPayClientError = (error) => {
  return error instanceof PayClientError;
};

// src/networking/NetworkingClient.ts
var NetworkingClient = class {
  config;
  token;
  baseUrl;
  resource = "";
  version = "";
  requiresTGU;
  /**
   * Initializes a new instance of the networkingClient class.
   * @param config - The configuration object containing the account token, API token, and URL.
   * @throws {Error} Throws an error if the account token, API token, or URL is missing.
   */
  constructor(config) {
    this.config = config;
    this.token = this.createBase64Token();
    this.baseUrl = new URL(config.getApiURL());
    this.requiresTGU = false;
  }
  /**
   * Creates a base64-encoded token from the provided account token and API token.
   * @param accountToken - The account token.
   * @param apiToken - The API token.
   * @returns A base64-encoded string.
   */
  createBase64Token() {
    const combined = `${this.config.getServiceId()}:${this.config.getServiceSecret()}`;
    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      return window.btoa(combined);
    } else {
      return Buffer.from(combined).toString("base64");
    }
  }
  /**
   * Parses the error response object based on the content type header.
   * @param response - The response object.
   * @returns A promise that resolves to the parsed error response object, or an empty object if the content type is not recognized.
   */
  async formatResponse(response) {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("json")) {
      try {
        return await response.json();
      } catch (e) {
        return { error: "Failed to parse JSON response" };
      }
    }
    const text = await response.text();
    return {
      error: `Unhandled response format: ${text}`,
      raw: text,
      contentType
    };
  }
  /**
   * Gets the configuration object of the network client.
   * @returns The configuration object
   */
  getConfig() {
    return this.config;
  }
  /**
   * Sets the version of the API to use.
   */
  setVersion(version) {
    this.version = version;
  }
  /**
   * Sets the resource URL for the network client.
   * @param resource - The resource URL.
   */
  setResource(resource) {
    this.resource = resource;
  }
  /**
   * Sets the requirement for a TGU to be set.
   * @param body
   * @returns
   */
  setRequiresTGU(body) {
    this.requiresTGU = body;
  }
  isErrorResponseBody(body) {
    if (typeof body === "object" && body !== null) {
      return "error" in body;
    }
  }
  //////////////////////////
  // API Request Methods ///
  //////////////////////////
  /**
   * Makes a GET request to the specified endpoint.
   * @param endpoint - The endpoint to make the GET request to.
   * @returns A promise that resolves to the response data.
   */
  async get(endpoint) {
    return this.request("GET", endpoint);
  }
  /**
   * Makes a POST request to the specified endpoint.
   * @param endpoint - The endpoint to make the POST request to.
   * @param body - The body of the POST request.
   * @returns A promise that resolves to the response data.
   */
  async post(endpoint, body) {
    return this.request("POST", endpoint, body);
  }
  /**
   * Makes a PATCH request to the specified endpoint.
   * @param endpoint - The endpoint to make the PATCH request to.
   * @param body - The body of the PATCH request.
   * @returns A promise that resolves to the response data.
   */
  async patch(endpoint, body) {
    return this.request("PATCH", endpoint, body);
  }
  /**
   * Makes a DELETE request to the specified endpoint.
   * @param endpoint - The endpoint to make the DELETE request to.
   * @returns A promise that resolves to the response data.
   */
  async delete(endpoint) {
    return this.request("DELETE", endpoint);
  }
  /**
   * Fetches the TGU from the configuration if required.
   */
  async fetchTGU() {
    if (!this.requiresTGU) return;
    const availableTGU = this.config.getTGU();
    if (availableTGU) {
      return availableTGU;
    }
    const res = await fetch(`${this.config.getApiURL()}/v2/services/config`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${this.token}`
      }
    });
    if (!res.ok) {
      throw new PayClientError("API_ERROR", "Failed to fetch TGU");
    }
    const data = await res.json();
    if (!("tguList" in data)) {
      throw new PayClientError("API_ERROR", "No TGU List in response");
    }
    if (!Array.isArray(data.tguList)) {
      throw new PayClientError("API_ERROR", "TGU list is not an array");
    }
    if (data.tguList.length === 0) {
      throw new PayClientError("API_ERROR", "No TGU found in the TGU list");
    }
    const sortedTGUList = data.tguList.sort((a, b) => a.share < b.share ? 1 : -1);
    this.config.setTGUList(sortedTGUList);
    const mainTGU = sortedTGUList[0];
    if (!mainTGU) {
      throw new PayClientError("API_ERROR", "No TGU found in the sorted TGU list");
    }
    this.config.setActiveTGU(mainTGU);
    const url = createUrlFromDomain(mainTGU.domain);
    this.baseUrl = new URL(url);
  }
  /**
   * Constructs a URL from the specified parts.
   * @param baseUrl - The base URL.
   * @param version - The version of the API.
   * @param resource - The resource URL.
   * @param endpoint - The endpoint.
   * @returns The constructed URL.
   */
  urlConstructor(baseUrl, version, resource, endpoint) {
    let url = baseUrl.toString();
    url = url.replace(/^\/|\/$/g, "");
    version = version.replace(/^\/|\/$/g, "");
    resource = resource.replace(/^\/|\/$/g, "");
    url = `${url}/${version}/${resource}/${endpoint}`;
    url = url.replace(/\/+$/, "");
    return url;
  }
  /**
   * Makes an HTTP request to the specified endpoint with the specified method and body.
   * @param method - The HTTP method to use for the request.
   * @param endpoint - The endpoint to make the request to.
   * @param body - The body of the request, if applicable.
   * @returns A promise that resolves to the response data.
   * @throws {Error} Throws an error if the response is not OK.
   */
  async request(method, endpoint, body) {
    if (this.requiresTGU) {
      await this.fetchTGU();
    }
    if (method === "POST" || method === "PATCH") {
      if (body) {
        body = {
          ...body,
          serviceId: this.config.getServiceId()
        };
      }
    }
    const url = this.urlConstructor(this.baseUrl, this.version, this.resource, endpoint);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${this.token}`
    };
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const formattedResponse = await this.formatResponse(response);
    if (this.isErrorResponseBody(formattedResponse) || !response.ok) {
      return Promise.reject(formattedResponse);
    }
    return formattedResponse;
  }
};

// src/resources/BaseResourceClient.ts
var BaseResourceClient = class {
  networkingClient;
  config;
  constructor({ config }) {
    this.networkingClient = new NetworkingClient(config);
    this.config = config;
  }
};

// src/resources/orders/OrdersClients.ts
var OrdersClient = class extends BaseResourceClient {
  /**
   * Constructs an OrdersClient instance with the provided configuration.
   * Initializes the networking client to interact with the Orders API.
   * @param {OrdersConfig} config The configuration for the OrdersClient.
   */
  constructor(config) {
    super(config);
    this.networkingClient.setVersion("v1");
    this.networkingClient.setResource("orders");
    this.networkingClient.setRequiresTGU(true);
  }
  /**
   * Retrieves the current status of an order, including its payment attempts.
   * @param {string} id The unique identifier of the order.
   * @returns {Promise<Order>} A promise resolving to the current order status and associated payment attempts.
   */
  async status(id) {
    return this.networkingClient.get(`${id}/status`);
  }
  /**
   * Creates a new order in the system based on the provided order details.
   * An order represents the total order as it exists in your shop, which can be fulfilled through one or more payments.
   * @param {OrderCreate} order The details of the order to be created.
   * @returns {Promise<Order>} A promise resolving to the created order.
   */
  async create(order) {
    return this.networkingClient.post("/", order);
  }
  /**
   * Captures a specific amount from an order with an active reservation (Status 95).
   * This is commonly used for CreditCard and Buy now, Pay later payments.
   * The reservation remains active after this operation.
   * @param {OrderCaptureAmount} input The details of the amount to capture, including the order ID.
   * @returns {Promise<Order>} A promise resolving to the updated order after the capture.
   */
  async captureAmount(input) {
    return this.networkingClient.patch(
      `${input.id}/capture/amount`,
      input.amount
    );
  }
  /**
   * Captures products from an order with an active reservation (Status 95).
   * This is used to capture specific products, rather than a specific amount.
   * @param {OrderCaptureProduct} input The details of the products to capture, including the order ID.
   * @returns {Promise<Order>} A promise resolving to the updated order after capturing the specified products.
   */
  async captureProducts(input) {
    return this.networkingClient.patch(
      `${input.id}/capture/products`,
      input.products
    );
  }
  /**
   * Captures the entire amount of an order with an active reservation (Status 95).
   * This method finalizes the capture of the total order value.
   * @param {string} id The unique identifier of the order to capture.
   * @returns {Promise<Order>} A promise resolving to the captured order.
   */
  async capture(id) {
    return this.networkingClient.patch(`${id}/capture`);
  }
  /**
   * Approves an order that is flagged for a risk check by the Verify module.
   * This continues the regular order flow after the risk check.
   * @param {string} id The details required to approve the order, including the order ID.
   * @returns {Promise<Order>} A promise resolving to the approved order.
   */
  async approve(id) {
    return this.networkingClient.patch(`${id}/approve`);
  }
  /**
   * Declines an order that is flagged for a risk check by the Verify module.
   * This refunds all payments made on the order and halts further processing.
   * @param {string} id The details required to decline the order, including the order ID.
   * @returns {Promise<Order>} A promise resolving to the declined order.
   */
  async decline(id) {
    return this.networkingClient.patch(`${id}/decline`);
  }
  /**
   * Cancels an order with an active reservation (Status 95), voiding all payments made for that order.
   * This method effectively cancels the order and any associated reservations.
   * @param {string} id The unique identifier of the order to void.
   * @returns {Promise<Order>} A promise resolving to the voided order.
   */
  async void(id) {
    return this.networkingClient.patch(`${id}/void`);
  }
  /**
   * Aborts an order, halting the regular order flow and voiding any payment attempts made to fulfill this order.
   * This is a more forceful termination of the order process than a simple cancellation.
   * @param {string} id The unique identifier of the order to abort.
   * @returns {Promise<Order>} A promise resolving to the aborted order.
   */
  async abort(id) {
    return this.networkingClient.patch(`${id}/abort`);
  }
};

// src/resources/service/Service.ts
var ServicesClient = class extends BaseResourceClient {
  constructor(config) {
    super(config);
    this.networkingClient.setVersion("v2");
    this.networkingClient.setResource("services");
  }
  async getConfig() {
    const serviceId = this.networkingClient.getConfig().getServiceId();
    return this.networkingClient.get(`config?serviceId=${serviceId}`);
  }
  async getTGU() {
    const config = await this.getConfig();
    if (config.tguList.length === 0) {
      throw new PayClientError("API_ERROR", "Retrieved no TGU list from the API");
    }
    const mainTGU = config.tguList.sort((a, b) => a.share < b.share ? 1 : -1);
    if (mainTGU[0]?.domain.includes("https://")) {
      return mainTGU[0]?.domain;
    } else {
      return `https://${mainTGU[0]?.domain}`;
    }
  }
};

// src/config/Config.ts
var Config = class {
  serviceId;
  serviceSecret;
  apiURL;
  dynamicTGU = false;
  tguList;
  activeTGU;
  surpressWarnings = false;
  constructor(config) {
    this.serviceId = config.serviceId;
    this.serviceSecret = config.serviceSecret;
    this.apiURL = "https://rest.pay.nl";
    this.tguList = null;
    this.activeTGU = null;
    if ("dynamicTGU" in config) {
      this.dynamicTGU = config.dynamicTGU;
    } else {
      this.dynamicTGU = true;
    }
    if ("surpressWarnings" in config) {
      this.surpressWarnings = config.surpressWarnings;
    } else {
      this.surpressWarnings = false;
    }
  }
  /**
   * Set the service ID for the client.
   * @param serviceId The service ID to set.
   */
  setServiceId(serviceId) {
    this.serviceId = serviceId;
  }
  /**
   * Get the service ID of the client.
   * @returns The service ID.
   */
  getServiceId() {
    return this.serviceId;
  }
  /**
   * Set the service secret for the client.
   * @param serviceSecret The service secret to set.
   */
  setServiceSecret(serviceSecret) {
    this.serviceSecret = serviceSecret;
  }
  /**
   * Get the service secret of the client.
   * @returns The service secret.
   */
  getServiceSecret() {
    return this.serviceSecret;
  }
  // /**
  //  * Set the TGU (API URL) for the client.
  //  * This should only be called if "dynamicTGU" is set
  //  * to false. Otherwise the Client should handle the TGU switching.
  //  * @param tgu The TGU (API URL) to set.
  //  */
  // setTGU(tgu: string) {
  //     if (this.dynamicTGU) {
  //         CreateWarning("DYNAMIC_TGU_WARNING", this.surpressWarnings);
  //     }
  //     if (!this.tguList) {
  //         CreateWarning("TGU_NOT_IN_LIST_WARNING", this.surpressWarnings);
  //     } else {
  //         const selectedTGU = this.tguList.find((tguItem) => tguItem.domain === tgu);
  //         if (!selectedTGU) {
  //             CreateWarning("TGU_NOT_IN_LIST_WARNING", this.surpressWarnings);
  //         } else {
  //             this.activeTGU = selectedTGU;
  //         }
  //     }
  //     return this.activeTGU;
  // }
  /**
   * Set the TGU list for the client.
   * @param tguList The TGU list to set.
   */
  setTGUList(tguList) {
    this.tguList = tguList;
  }
  /**
   * Set the currently active TGU.
   * @returns The TGU list.
   */
  setActiveTGU(tgu) {
    this.activeTGU = tgu;
  }
  /**
   * Return the currently active TGU.
   * @returns The active TGU.
   */
  getTGUList() {
    return this.tguList;
  }
  /**
   * Return the currently active TGU.
   * @returns The active TGU.
   */
  getTGU() {
    return this.activeTGU;
  }
  /**
   * Set the API URL for the client.
   * @param apiURL The API URL to set.
   */
  setApiURL(apiURL) {
    this.apiURL = apiURL;
    return this.apiURL;
  }
  /**
   * Get the API URL of the client.
   * @returns The API URL.
   */
  getApiURL() {
    return this.apiURL;
  }
  /**
   * Return if the TGU should be switched automatically.
   * @returns The value of the dynamicTGU option.
   */
  isDynamicTGU() {
    return this.dynamicTGU;
  }
  /**
   * Set whether the TGU should be switched automatically.
   * @returns The new value of the dynamicTGU option.
   */
  setDynamicTGU(dynamicTGU) {
    this.dynamicTGU = dynamicTGU;
    return this.dynamicTGU;
  }
};

// src/client/Client.ts
var PayClient = class {
  config;
  services;
  orders;
  /**
   * Constructor for initializing the PayClient with the given configuration.
   * Validates the required configuration parameters and initializes the resource clients.
   * @param {PayClientConfig} config - The configuration object for the client.
   */
  constructor(config) {
    if (typeof window !== "undefined") {
      CreateWarning("BROWSER_USAGE_WARNING", false);
    }
    if (!config.serviceId) {
      throw new PayClientError("MISSING_CONFIG_KEY", "serviceId");
    }
    if (!config.serviceSecret) {
      throw new PayClientError("MISSING_CONFIG_KEY", "serviceSecret");
    }
    this.config = new Config({ ...config });
    this.services = new ServicesClient({ config: this.config });
    this.orders = new OrdersClient({ config: this.config });
  }
};
export {
  PayClient,
  isPayClientError
};
