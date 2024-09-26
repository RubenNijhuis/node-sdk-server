type ServiceConfig = {
    code: string;
    secret: string;
    testMode: boolean;
    name: string;
    translations: {
        name: {
            [key: string]: string;
        };
    };
    status: string;
    merchant: {
        code: string;
        name: string;
        status: string;
        incorperationCountry: string;
    };
    category: {
        code: string;
        name: string;
    };
    mcc: number;
    turnoverGroup: {
        code: string;
        name: string;
    };
    layout: null;
    tradeName: {
        code: string;
        name: string;
    };
    createdAt: string;
    createdBy: string;
    modifiedAt: null;
    modifiedBy: null;
    deletedAt: null;
    deletedBy: null;
    checkoutOptions: {
        tag: string;
        name: string;
        translations: {
            name: {
                [key: string]: string;
            };
        };
        image: string;
        paymentMethods: {
            id: number;
            name: string;
            description: string;
            translations: {
                name: {
                    [key: string]: string;
                };
                description: {
                    [key: string]: string;
                };
            };
            image: string;
            options: {
                id: string;
                name: string;
                image: string;
            }[];
            settings: null;
            minAmount: number;
            maxAmount: number;
        }[];
        requiredFields: null;
    }[];
    checkoutSequence: {
        default: {
            primary: string[];
            secondary: string[];
        };
    };
    checkoutTexts: unknown[];
    encryptionKeys: {
        identifier: string;
        publicKey: string;
        createdAt: string;
        expiresAt: string;
    }[];
    tguList: {
        ID: number;
        share: number;
        domain: string;
        status: string;
    }[];
    _links: {
        href: string;
        rel: string;
        type: string;
    }[];
};

/**
 * Configuration options for the V2Client.
 */
type ConfigParams = PayClientConfig;
declare class Config {
    private serviceId;
    private serviceSecret;
    private apiURL;
    private dynamicTGU;
    private tguList;
    private activeTGU;
    private surpressWarnings;
    constructor(config: ConfigParams);
    /**
     * Set the service ID for the client.
     * @param serviceId The service ID to set.
     */
    setServiceId(serviceId: string): void;
    /**
     * Get the service ID of the client.
     * @returns The service ID.
     */
    getServiceId(): string;
    /**
     * Set the service secret for the client.
     * @param serviceSecret The service secret to set.
     */
    setServiceSecret(serviceSecret: string): void;
    /**
     * Get the service secret of the client.
     * @returns The service secret.
     */
    getServiceSecret(): string;
    /**
     * Set the TGU list for the client.
     * @param tguList The TGU list to set.
     */
    setTGUList(tguList: ServiceConfig["tguList"]): void;
    /**
     * Set the currently active TGU.
     * @returns The TGU list.
     */
    setActiveTGU(tgu: ServiceConfig["tguList"][number]): void;
    /**
     * Return the currently active TGU.
     * @returns The active TGU.
     */
    getTGUList(): {
        ID: number;
        share: number;
        domain: string;
        status: string;
    }[] | null;
    /**
     * Return the currently active TGU.
     * @returns The active TGU.
     */
    getTGU(): {
        ID: number;
        share: number;
        domain: string;
        status: string;
    } | null;
    /**
     * Set the API URL for the client.
     * @param apiURL The API URL to set.
     */
    setApiURL(apiURL: string): string;
    /**
     * Get the API URL of the client.
     * @returns The API URL.
     */
    getApiURL(): string;
    /**
     * Return if the TGU should be switched automatically.
     * @returns The value of the dynamicTGU option.
     */
    isDynamicTGU(): boolean;
    /**
     * Set whether the TGU should be switched automatically.
     * @returns The new value of the dynamicTGU option.
     */
    setDynamicTGU(dynamicTGU: boolean): boolean;
}

/**
 * A client for making network requests with basic authentication.
 */
declare class NetworkingClient {
    private config;
    private token;
    private baseUrl;
    private resource;
    private version;
    private requiresTGU;
    /**
     * Initializes a new instance of the networkingClient class.
     * @param config - The configuration object containing the account token, API token, and URL.
     * @throws {Error} Throws an error if the account token, API token, or URL is missing.
     */
    constructor(config: Config);
    /**
     * Creates a base64-encoded token from the provided account token and API token.
     * @param accountToken - The account token.
     * @param apiToken - The API token.
     * @returns A base64-encoded string.
     */
    private createBase64Token;
    /**
     * Parses the error response object based on the content type header.
     * @param response - The response object.
     * @returns A promise that resolves to the parsed error response object, or an empty object if the content type is not recognized.
     */
    private formatResponse;
    /**
     * Gets the configuration object of the network client.
     * @returns The configuration object
     */
    getConfig(): Config;
    /**
     * Sets the version of the API to use.
     */
    setVersion(version: string): void;
    /**
     * Sets the resource URL for the network client.
     * @param resource - The resource URL.
     */
    setResource(resource: string): void;
    /**
     * Sets the requirement for a TGU to be set.
     * @param body
     * @returns
     */
    setRequiresTGU(body: boolean): void;
    isErrorResponseBody(body: unknown): boolean | undefined;
    /**
     * Makes a GET request to the specified endpoint.
     * @param endpoint - The endpoint to make the GET request to.
     * @returns A promise that resolves to the response data.
     */
    get<T>(endpoint: string): Promise<T>;
    /**
     * Makes a POST request to the specified endpoint.
     * @param endpoint - The endpoint to make the POST request to.
     * @param body - The body of the POST request.
     * @returns A promise that resolves to the response data.
     */
    post<U, T>(endpoint: string, body?: U): Promise<T>;
    /**
     * Makes a PATCH request to the specified endpoint.
     * @param endpoint - The endpoint to make the PATCH request to.
     * @param body - The body of the PATCH request.
     * @returns A promise that resolves to the response data.
     */
    patch<U, T>(endpoint: string, body?: U): Promise<T>;
    /**
     * Makes a DELETE request to the specified endpoint.
     * @param endpoint - The endpoint to make the DELETE request to.
     * @returns A promise that resolves to the response data.
     */
    delete<T>(endpoint: string): Promise<T>;
    /**
     * Fetches the TGU from the configuration if required.
     */
    private fetchTGU;
    /**
     * Constructs a URL from the specified parts.
     * @param baseUrl - The base URL.
     * @param version - The version of the API.
     * @param resource - The resource URL.
     * @param endpoint - The endpoint.
     * @returns The constructed URL.
     */
    private urlConstructor;
    /**
     * Makes an HTTP request to the specified endpoint with the specified method and body.
     * @param method - The HTTP method to use for the request.
     * @param endpoint - The endpoint to make the request to.
     * @param body - The body of the request, if applicable.
     * @returns A promise that resolves to the response data.
     * @throws {Error} Throws an error if the response is not OK.
     */
    private request;
}

/**
 * Base class for all resource clients.
 */
type ResourceConfig = {
    config: Config;
};
declare class BaseResourceClient {
    protected networkingClient: NetworkingClient;
    protected config: Config;
    constructor({ config }: ResourceConfig);
}

type OrderCaptureProduct = {
    id: string;
    products: {
        id: string;
        quantity: number;
    }[];
};
type OrderCaptureAmount = {
    id: string;
    amount: number;
};
type Nullable<T> = T | null;
type OrderCreate = {
    description?: Nullable<string>;
    reference?: Nullable<string>;
    expire?: Nullable<string>;
    returnUrl?: Nullable<string>;
    exchangeUrl?: Nullable<string>;
    amount: Amount;
    paymentMethod?: Nullable<PaymentMethod>;
    integration?: Nullable<Integration>;
    optimize?: Nullable<Optimize>;
    customer?: Nullable<Customer>;
    order?: Nullable<OrderObject>;
    notification?: Nullable<Notification>;
    stats?: Nullable<Stats>;
    transferData?: Nullable<Record<string, string>>;
};
type Amount = {
    value: number;
    currency?: Nullable<string>;
};
type PaymentMethod = {
    id?: Nullable<number>;
    input?: Nullable<CardInput | IssuerInput | TerminalInput | AccountInput | CountryCodeInput | EmailInput | IssuerCountryInput | CustomerDataInput>;
};
type CardInput = {
    cardNumber: string;
    pincode?: string;
};
type IssuerInput = {
    issuerId?: Nullable<string>;
};
type TerminalInput = {
    terminalCode: string;
};
type AccountInput = {
    firstName: Nullable<string>;
    lastName: Nullable<string>;
    email: Nullable<string>;
    city: Nullable<string>;
    iban: Nullable<string>;
    bic: Nullable<string>;
    permissionGiven: boolean;
};
type CountryCodeInput = {
    countryCode: "AU" | "AT" | "BE" | "CA" | "CZ" | "DK" | "FI" | "FR" | "DE" | "GR" | "IE" | "IT" | "MX" | "NL" | "NZ" | "NO" | "PL" | "PT" | "RO" | "ES" | "SE" | "CH" | "GB" | "US";
};
type EmailInput = {
    email: string;
};
type IssuerCountryInput = {
    issuer?: Nullable<string>;
    country?: Nullable<string>;
    debtorIban?: Nullable<string>;
    psuId?: Nullable<string>;
};
type CustomerDataInput = {
    initials: string;
    firstName: string;
    lastName: string;
    gender: "FEMALE" | "MALE";
    streetName: string;
    houseNumber: string;
    houseNumberAddition?: Nullable<string>;
    postalCode: string;
    city: string;
    country: "NL" | "BE";
    email: string;
    phoneNumber: string;
};
type Integration = {
    test?: Nullable<boolean>;
};
type Optimize = {
    flow?: Nullable<"fastCheckout">;
    shippingAddress?: Nullable<boolean>;
    billingAddress?: Nullable<boolean>;
    contactDetails?: Nullable<boolean>;
    mcc?: Nullable<string>;
    collectorAccount?: Nullable<CollectorAccount>;
    collectorCompany?: Nullable<CollectorCompany>;
};
type CollectorAccount = {
    method: "iban";
    iban?: Nullable<{
        iban: string;
        bic: string;
        owner: string;
    }>;
};
type CollectorCompany = {
    id: string;
    name: string;
};
type Customer = {
    email?: Nullable<string>;
    firstname?: Nullable<string>;
    lastname?: Nullable<string>;
    birthDate?: Nullable<string>;
    gender?: Nullable<string>;
    phone?: Nullable<string>;
    locale?: Nullable<string>;
    ipAddress?: Nullable<string>;
    trust?: Nullable<number>;
    reference?: Nullable<string>;
    gaClientId?: Nullable<string>;
    company?: Nullable<Company>;
};
type Company = {
    name?: Nullable<string>;
    cocNumber?: Nullable<string>;
    vatNumber?: Nullable<string>;
    country?: Nullable<string>;
};
type OrderObject = {
    countryCode?: Nullable<string>;
    deliveryDate?: Nullable<string>;
    invoiceDate?: Nullable<string>;
    deliveryAddress?: Nullable<Address>;
    invoiceAddress?: Nullable<Address>;
    products?: Nullable<Product[]>;
};
type Address = {
    firstName?: Nullable<string>;
    lastName?: Nullable<string>;
    street: Nullable<string>;
    streetNumber: Nullable<string>;
    streetNumberExtension?: Nullable<string>;
    zipCode: Nullable<string>;
    city: Nullable<string>;
    country: Nullable<string>;
    region?: Nullable<string>;
};
type Product = {
    id?: Nullable<string>;
    description?: Nullable<string>;
    type?: Nullable<string>;
    price?: Nullable<Amount>;
    quantity?: Nullable<number>;
    vatPercentage?: Nullable<number>;
};
type Notification = {
    type?: Nullable<"push" | "email">;
    recipient?: Nullable<string>;
};
type Stats = {
    tool?: Nullable<string>;
    info?: Nullable<string>;
    object?: Nullable<string>;
    extra1?: Nullable<string>;
    extra2?: Nullable<string>;
    extra3?: Nullable<string>;
    domainId?: Nullable<string>;
    promotorId?: Nullable<number>;
};
type Order = {
    id: string;
    serviceId: string;
    description: Nullable<string>;
    reference: Nullable<string>;
    manualTransferCode: string;
    orderId: string;
    uuid: string;
    customerKey?: Nullable<string>;
    status: OrderStatus;
    receipt?: Nullable<string>;
    integration: Integration;
    amount: Amount;
    authorizedAmount: Amount;
    capturedAmount: Amount;
    checkoutData?: Nullable<CheckoutData>;
    payments: Payment[];
    createdAt: string;
    createdBy?: Nullable<string>;
    modifiedAt?: Nullable<string>;
    modifiedBy?: Nullable<string>;
    expiresAt: string;
    completedAt?: Nullable<string>;
    links: Record<string, string>;
};
type OrderStatus = {
    code: Nullable<number>;
    action: Nullable<string>;
};
type CheckoutData = {
    customer: CustomerData;
    billingAddress: Address;
    shippingAddress: Address;
};
type CustomerData = {
    email?: Nullable<string>;
    firstname?: Nullable<string>;
    lastname?: Nullable<string>;
    dateOfBirth?: Nullable<string>;
    gender?: Nullable<string>;
    phone?: Nullable<string>;
    locale?: Nullable<string>;
    ipAddress?: Nullable<string>;
    reference?: Nullable<string>;
    company?: Nullable<Company>;
};
type Payment = {
    id: string;
    paymentMethod: PaymentMethod;
    customerType?: Nullable<string>;
    customerKey: Nullable<string>;
    customerId: Nullable<string>;
    customerName: Nullable<string>;
    ipAddress: Nullable<string>;
    secureStatus: boolean;
    paymentVerificationMethod: Nullable<number>;
    status: OrderStatus;
    currencyAmount: Amount;
    amount: Amount;
    authorizedAmount: Amount;
    capturedAmount: Amount;
    supplierData?: Nullable<string[]>;
};

interface OrdersConfig extends ResourceConfig {
}
/**
 * Client for interacting with the Orders API, providing methods to manage and manipulate orders.
 * This client allows operations such as creating, capturing, approving, and voiding orders.
 */
declare class OrdersClient extends BaseResourceClient {
    /**
     * Constructs an OrdersClient instance with the provided configuration.
     * Initializes the networking client to interact with the Orders API.
     * @param {OrdersConfig} config The configuration for the OrdersClient.
     */
    constructor(config: OrdersConfig);
    /**
     * Retrieves the current status of an order, including its payment attempts.
     * @param {string} id The unique identifier of the order.
     * @returns {Promise<Order>} A promise resolving to the current order status and associated payment attempts.
     */
    status(id: string): Promise<Order>;
    /**
     * Creates a new order in the system based on the provided order details.
     * An order represents the total order as it exists in your shop, which can be fulfilled through one or more payments.
     * @param {OrderCreate} order The details of the order to be created.
     * @returns {Promise<Order>} A promise resolving to the created order.
     */
    create(order: OrderCreate): Promise<Order>;
    /**
     * Captures a specific amount from an order with an active reservation (Status 95).
     * This is commonly used for CreditCard and Buy now, Pay later payments.
     * The reservation remains active after this operation.
     * @param {OrderCaptureAmount} input The details of the amount to capture, including the order ID.
     * @returns {Promise<Order>} A promise resolving to the updated order after the capture.
     */
    captureAmount(input: OrderCaptureAmount): Promise<Order>;
    /**
     * Captures products from an order with an active reservation (Status 95).
     * This is used to capture specific products, rather than a specific amount.
     * @param {OrderCaptureProduct} input The details of the products to capture, including the order ID.
     * @returns {Promise<Order>} A promise resolving to the updated order after capturing the specified products.
     */
    captureProducts(input: OrderCaptureProduct): Promise<Order>;
    /**
     * Captures the entire amount of an order with an active reservation (Status 95).
     * This method finalizes the capture of the total order value.
     * @param {string} id The unique identifier of the order to capture.
     * @returns {Promise<Order>} A promise resolving to the captured order.
     */
    capture(id: string): Promise<Order>;
    /**
     * Approves an order that is flagged for a risk check by the Verify module.
     * This continues the regular order flow after the risk check.
     * @param {string} id The details required to approve the order, including the order ID.
     * @returns {Promise<Order>} A promise resolving to the approved order.
     */
    approve(id: string): Promise<Order>;
    /**
     * Declines an order that is flagged for a risk check by the Verify module.
     * This refunds all payments made on the order and halts further processing.
     * @param {string} id The details required to decline the order, including the order ID.
     * @returns {Promise<Order>} A promise resolving to the declined order.
     */
    decline(id: string): Promise<Order>;
    /**
     * Cancels an order with an active reservation (Status 95), voiding all payments made for that order.
     * This method effectively cancels the order and any associated reservations.
     * @param {string} id The unique identifier of the order to void.
     * @returns {Promise<Order>} A promise resolving to the voided order.
     */
    void(id: string): Promise<Order>;
    /**
     * Aborts an order, halting the regular order flow and voiding any payment attempts made to fulfill this order.
     * This is a more forceful termination of the order process than a simple cancellation.
     * @param {string} id The unique identifier of the order to abort.
     * @returns {Promise<Order>} A promise resolving to the aborted order.
     */
    abort(id: string): Promise<Order>;
}

interface ServicesClientConfig extends ResourceConfig {
}
declare class ServicesClient extends BaseResourceClient {
    constructor(config: ServicesClientConfig);
    getConfig(): Promise<ServiceConfig>;
    getTGU(): Promise<string>;
}

type BaseConfig = {
    serviceId: string;
    serviceSecret: string;
};
type PayClientConfig = BaseConfig | (BaseConfig & {
    dynamicTGU: boolean;
}) | (BaseConfig & {
    surpressWarnings: boolean;
});
/**
 * The PayClient class is responsible for managing communication with the Pay API.
 * It initializes the necessary configuration and resources required for API operations.
 */
declare class PayClient {
    readonly config: Config;
    readonly services: ServicesClient;
    readonly orders: OrdersClient;
    /**
     * Constructor for initializing the PayClient with the given configuration.
     * Validates the required configuration parameters and initializes the resource clients.
     * @param {PayClientConfig} config - The configuration object for the client.
     */
    constructor(config: PayClientConfig);
}

declare const ErrorType: {
    readonly MISSING_CONFIG_KEY: {
        readonly type: "CONFIGURATION_ERROR";
        readonly message: "Missing required configuration key";
    };
    readonly INVALID_INPUT: {
        readonly type: "INPUT_ERROR";
        readonly message: "Invalid input provided";
    };
    readonly INVALID_RESPONSE: {
        readonly type: "RESPONSE_ERROR";
        readonly message: "Invalid response received";
    };
    readonly NETWORK_ERROR: {
        readonly type: "NETWORK_ERROR";
        readonly message: "Network error occurred";
    };
    readonly API_ERROR: {
        readonly type: "API_ERROR";
        readonly message: "API error occurred";
    };
    readonly UNKNOWN_ERROR: {
        readonly type: "UNKNOWN_ERROR";
        readonly message: "An unknown error occurred";
    };
};
type ErrorTypeKey = keyof typeof ErrorType;
declare class PayClientError extends Error {
    readonly errorType: string;
    constructor(errorKey: ErrorTypeKey, details?: string);
}
declare const isPayClientError: (error: unknown) => error is PayClientError;

export { PayClient, type PayClientConfig, isPayClientError };
