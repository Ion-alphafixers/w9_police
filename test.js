let test = {
  headers: {
    "sec-fetch-mode": "navigate",
    "x-amzn-tls-version": "TLSv1.2",
    "sec-fetch-site": "none",
    "accept-language": "en-US,en;q=0.9",
    "x-forwarded-proto": "https",
    "x-forwarded-port": "443",
    "x-forwarded-for": "185.90.171.250",
    "sec-fetch-user": "?1",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "x-amzn-tls-cipher-suite": "ECDHE-RSA-AES128-GCM-SHA256",
    "sec-ch-ua":
      '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "x-amzn-trace-id": "Root=1-65396eab-150237bc27470b480476de34",
    "sec-ch-ua-platform": '"Windows"',
    host: "xubqe6dyx7nkfdurudtt3rn3d40qvooi.lambda-url.us-east-2.on.aws",
    "upgrade-insecure-requests": "1",
    "accept-encoding": "gzip, deflate, br",
    "sec-fetch-dest": "document",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  },
  isBase64Encoded: false,
  rawPath: "/",
  routeKey: "$default",
  requestContext: {
    accountId: "anonymous",
    timeEpoch: 1698262699878,
    routeKey: "$default",
    stage: "$default",
    domainPrefix: "xubqe6dyx7nkfdurudtt3rn3d40qvooi",
    requestId: "768f7fea-8b6e-4504-9ca0-7fec5199e0e7",
    domainName: "xubqe6dyx7nkfdurudtt3rn3d40qvooi.lambda-url.us-east-2.on.aws",
    http: {
      path: "/",
      protocol: "HTTP/1.1",
      method: "GET",
      sourceIp: "185.90.171.250",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    },
    time: "25/Oct/2023:19:38:19 +0000",
    apiId: "xubqe6dyx7nkfdurudtt3rn3d40qvooi",
  },
  queryStringParameters: { tech_name: "Joseph Tannoury" },
  version: "2.0",
  rawQueryString: "tech_name=Joseph%20Tannoury",
};
console.log(test['queryStringParameters'])